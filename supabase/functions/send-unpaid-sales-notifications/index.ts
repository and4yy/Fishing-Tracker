import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  user_id: string;
  subscription_data: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

interface UnpaidSale {
  id: string;
  name: string;
  totalAmount: number;
  tripDate: string;
  paid: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting unpaid sales notification check...');

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get VAPID keys for push notifications
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Get all users with push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription_data');

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    console.log(`Found ${subscriptions?.length || 0} push subscriptions`);

    let notificationsSent = 0;

    // For each user with push subscription, check for unpaid sales
    for (const subscription of subscriptions || []) {
      try {
        console.log(`Checking unpaid sales for user: ${subscription.user_id}`);

        // Get user's fishing trips
        const { data: trips, error: tripsError } = await supabase
          .from('fishing_trips')
          .select('*')
          .eq('user_id', subscription.user_id);

        if (tripsError) {
          console.error(`Error fetching trips for user ${subscription.user_id}:`, tripsError);
          continue;
        }

        // Find unpaid sales across all trips
        const unpaidSales: UnpaidSale[] = [];
        let totalUnpaidAmount = 0;

        for (const trip of trips || []) {
          if (trip.fish_sales && Array.isArray(trip.fish_sales)) {
            for (const sale of trip.fish_sales) {
              if (!sale.paid) {
                unpaidSales.push({
                  id: sale.id,
                  name: sale.name,
                  totalAmount: sale.totalAmount,
                  tripDate: trip.date,
                  paid: false
                });
                totalUnpaidAmount += sale.totalAmount;
              }
            }
          }
        }

        console.log(`User ${subscription.user_id} has ${unpaidSales.length} unpaid sales totaling MVR ${totalUnpaidAmount}`);

        // Send notification if there are unpaid sales
        if (unpaidSales.length > 0) {
          const notificationPayload = {
            title: 'Unpaid Sales Reminder',
            body: `You have ${unpaidSales.length} unpaid sales totaling MVR ${totalUnpaidAmount.toFixed(2)}`,
            data: {
              unpaidCount: unpaidSales.length,
              totalAmount: totalUnpaidAmount,
              url: '/history'
            }
          };

          await sendPushNotification(
            subscription.subscription_data,
            notificationPayload,
            vapidPublicKey,
            vapidPrivateKey
          );

          notificationsSent++;
          console.log(`Notification sent to user ${subscription.user_id}`);
        }
      } catch (error) {
        console.error(`Error processing user ${subscription.user_id}:`, error);
      }
    }

    console.log(`Notification check complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${notificationsSent} notifications`,
        subscriptionsChecked: subscriptions?.length || 0
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-unpaid-sales-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendPushNotification(
  subscription: any,
  payload: any,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<void> {
  try {
    // Convert VAPID keys to Uint8Array
    const publicKey = urlBase64ToUint8Array(vapidPublicKey);
    const privateKey = urlBase64ToUint8Array(vapidPrivateKey);

    // Create JWT token for VAPID authentication
    const jwtHeader = { typ: 'JWT', alg: 'ES256' };
    const jwtPayload = {
      aud: new URL(subscription.endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      sub: 'mailto:admin@fishinglogbook.com'
    };

    // For simplicity, we'll use a basic fetch request
    // In a production environment, you'd want to use a proper Web Push library
    const notificationData = JSON.stringify(payload);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Authorization': `vapid t=${await createJWT(jwtHeader, jwtPayload, privateKey)}, k=${vapidPublicKey}`,
      },
      body: notificationData,
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.status} ${response.statusText}`);
    }

    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function createJWT(header: any, payload: any, privateKey: Uint8Array): Promise<string> {
  // This is a simplified JWT creation - in production, use a proper JWT library
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // For demo purposes, return a basic token
  // In production, you'd need proper ECDSA signing
  return `${encodedHeader}.${encodedPayload}.signature`;
}

serve(handler);