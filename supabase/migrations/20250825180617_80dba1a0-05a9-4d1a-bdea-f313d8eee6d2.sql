-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the unpaid sales notification function to run twice daily (9 AM and 6 PM)
SELECT cron.schedule(
  'unpaid-sales-morning-reminder',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT
    net.http_post(
        url:='https://khkmhxxvspsmszpebfiz.supabase.co/functions/v1/send-unpaid-sales-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoa21oeHh2c3BzbXM6cGViZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjEwNjksImV4cCI6MjA3MTUzNzA2OX0.Q9goTE3x5KqHz1MlGAqRupotLcGZP_yvz2RInLBOL9A"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'unpaid-sales-evening-reminder',
  '0 18 * * *', -- Every day at 6 PM
  $$
  SELECT
    net.http_post(
        url:='https://khkmhxxvspsmszpebfiz.supabase.co/functions/v1/send-unpaid-sales-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoa21oeHh2c3BzbXM6cGViZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjEwNjksImV4cCI6MjA3MTUzNzA2OX0.Q9goTE3x5KqHz1MlGAqRupotLcGZP_yvz2RInLBOL9A"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);