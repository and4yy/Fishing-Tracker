import { FishSale } from '@/types/fishing';
import { BoatSettings } from '@/types/settings';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: {
    name: string;
    contact: string;
  };
  boat: BoatSettings;
  fishSale: FishSale;
  tripType: string;
}

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(Date.now()).slice(-4);
  return `INV-${year}${month}${day}-${time}`;
};

export const generateInvoicePDF = (invoiceData: InvoiceData): string => {
  const { invoiceNumber, date, customer, boat, fishSale, tripType } = invoiceData;
  
  // Calculate due date (same as invoice date)
  const dueDate = new Date(date);
  const formattedDueDate = dueDate.toLocaleDateString();
  
  const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 0.5in 0.75in;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: white;
            max-width: 100%;
            margin: 0;
            padding: 0.5in 0.75in;
        }
        
        .invoice-container {
            background: white;
            max-width: 7.5in;
            margin: 0 auto;
            padding: 0;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .company-section {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        
        .logo-container {
            width: 80px;
            height: 60px;
            border: 1px solid #ccc;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9pt;
            color: #666;
            flex-shrink: 0;
        }
        
        .company-info h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
            line-height: 1.2;
        }
        
        .company-details {
            font-size: 10pt;
            color: #000;
            line-height: 1.3;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h2 {
            font-size: 32pt;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
            letter-spacing: 2px;
        }
        
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            gap: 40px;
        }
        
        .bill-to,
        .invoice-meta {
            flex: 1;
        }
        
        .bill-to h3,
        .invoice-meta h3 {
            font-size: 12pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .bill-to-details {
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
        }
        
        .bill-to-details strong {
            font-weight: bold;
        }
        
        .invoice-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .invoice-meta-table td {
            padding: 4px 0;
            font-size: 11pt;
            vertical-align: top;
        }
        
        .invoice-meta-table .label {
            font-weight: bold;
            color: #000;
            width: 100px;
            padding-right: 15px;
        }
        
        .invoice-meta-table .value {
            color: #000;
        }
        
        .items-section {
            margin-bottom: 30px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .items-table th {
            background-color: #dbeafe;
            border: 1px solid #3b82f6;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11pt;
            color: #1e40af;
        }
        
        .items-table th:nth-child(1) { width: 15%; }
        .items-table th:nth-child(2) { width: 45%; }
        .items-table th:nth-child(3) { width: 20%; }
        .items-table th:nth-child(4) { width: 20%; text-align: right; }
        
        .items-table td {
            border: 1px solid #cbd5e1;
            padding: 12px 8px;
            font-size: 11pt;
            color: #000;
            vertical-align: top;
        }
        
        .items-table td:last-child {
            text-align: right;
            font-weight: bold;
        }
        
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }
        
        .totals {
            width: 300px;
        }
        
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals td {
            padding: 8px 0;
            font-size: 11pt;
            border-bottom: 1px solid #ddd;
        }
        
        .totals .label {
            text-align: right;
            padding-right: 20px;
            font-weight: normal;
            color: #000;
        }
        
        .totals .value {
            text-align: right;
            font-weight: bold;
            color: #000;
            width: 120px;
        }
        
        .total-line td {
            border-bottom: none;
            border-top: 2px solid #2563eb;
            padding-top: 12px;
            font-size: 12pt;
            font-weight: bold;
            background-color: #f1f5f9;
        }
        
        .payment-info {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
        }
        
        .payment-info h4 {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
        }
        
        .payment-info div {
            font-size: 10pt;
            color: #000;
            line-height: 1.4;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #cbd5e1;
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
        }
        
        .terms h4 {
            font-size: 12pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .terms p {
            font-size: 10pt;
            color: #000;
            line-height: 1.4;
            margin-bottom: 4px;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0.5in 0.75in;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .invoice-container {
                page-break-inside: avoid;
                box-shadow: none;
            }
            
            .header {
                page-break-after: avoid;
            }
            
            .items-table {
                page-break-inside: avoid;
            }
        }
        
        @media screen {
            body {
                background: #f5f5f5;
                padding: 20px;
            }
            
            .invoice-container {
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 0.5in 0.75in;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-section">
                ${boat.logoUrl ? `
                <img src="${boat.logoUrl}" alt="Company Logo" style="width: 70px; height: 50px; object-fit: contain; margin-bottom: 8px; border-radius: 4px;">
                ` : `
                <div class="logo-container">
                    ⚓ Upload Logo
                </div>
                `}
                <div class="company-info">
                    <h1>${boat.boatName || 'Your Boat Name'}</h1>
                    <div class="company-details">
                        ${boat.contactNumber ? `Contact: ${boat.contactNumber}` : 'Contact: Your Contact Number'}
                    </div>
                </div>
            </div>
            <div class="invoice-title">
                <h2>INVOICE</h2>
            </div>
        </div>

        <div class="invoice-details">
            <div class="bill-to">
                <h3>Bill To</h3>
                <div class="bill-to-details">
                    <strong>${customer.name}</strong><br>
                    Contact: ${customer.contact}
                </div>
            </div>
            <div class="invoice-meta">
                <table class="invoice-meta-table">
                    <tr>
                        <td class="label">Invoice #</td>
                        <td class="value">${invoiceNumber}</td>
                    </tr>
                    <tr>
                        <td class="label">Invoice date</td>
                        <td class="value">${new Date(date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td class="label">Due date</td>
                        <td class="value">${formattedDueDate}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th>QTY</th>
                        <th>Description</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${fishSale.weight} kg</td>
                        <td>${tripType} - ${fishSale.fishType === 'Iced' ? 'Iced Fish' : 'Freshly Caught'}${fishSale.remarks ? ` (${fishSale.remarks})` : ''}</td>
                        <td>MVR ${fishSale.ratePrice.toFixed(2)}</td>
                        <td>MVR ${fishSale.totalAmount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <div class="totals">
                <table>
                    <tr>
                        <td class="label">Subtotal:</td>
                        <td class="value">MVR ${fishSale.totalAmount.toFixed(2)}</td>
                    </tr>
                    <tr class="total-line">
                        <td class="label">Total (MVR):</td>
                        <td class="value">MVR ${fishSale.totalAmount.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        </div>

        ${boat.bankName ? `
        <div class="payment-info">
            <h4>Payment Information</h4>
            <div>
                Bank: ${boat.bankName}<br>
                Account Holder: ${boat.accountName}<br>
                Account Number: ${boat.accountNumber}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <div class="terms">
                <h4>Terms and Conditions</h4>
                <p>Payment is due on receipt, unless otherwise agreed.</p>
                <p>Please check the invoice details carefully.</p>
                <p>Any discrepancies must be reported immediately.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  return invoiceHTML;
};

export const downloadInvoiceAsPDF = async (invoiceData: InvoiceData): Promise<void> => {
  const { invoiceNumber, date, customer, boat, fishSale, tripType } = invoiceData;
  
  // Calculate due date (same as invoice date)
  const dueDate = new Date(date);
  const formattedDueDate = dueDate.toLocaleDateString();
  
  try {
    // Create PDF with optimized settings
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set margins
    const margin = 15;
    let yPos = margin;
    
    // Header section with light blue background
    pdf.setFillColor(248, 250, 252); // Light blue background
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
    
    // Logo section (if available)
    if (boat.logoUrl) {
      try {
        // Add logo - you might need to handle this differently based on logo format
        pdf.addImage(boat.logoUrl, 'JPEG', margin + 5, yPos + 5, 20, 15);
      } catch (error) {
        console.log('Logo could not be loaded:', error);
        // Draw placeholder box
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin + 5, yPos + 5, 20, 15);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('LOGO', margin + 13, yPos + 13);
      }
    }
    
    // Company name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175); // Blue color
    pdf.text(boat.boatName || 'Your Boat Name', margin + (boat.logoUrl ? 30 : 5), yPos + 12);
    
    // Contact number
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(boat.contactNumber ? `Contact: ${boat.contactNumber}` : 'Contact: Your Contact Number', margin + (boat.logoUrl ? 30 : 5), yPos + 20);
    
    // Invoice title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('INVOICE', pageWidth - margin - 40, yPos + 18);
    
    yPos += 40;
    
    // Invoice details section
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('BILL TO', margin, yPos);
    
    pdf.text('INVOICE DETAILS', pageWidth - margin - 50, yPos);
    
    yPos += 10;
    
    // Bill to details
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(customer.name, margin, yPos);
    pdf.text(`Contact: ${customer.contact}`, margin, yPos + 6);
    
    // Invoice meta
    pdf.text(`Invoice #: ${invoiceNumber}`, pageWidth - margin - 50, yPos);
    pdf.text(`Invoice date: ${new Date(date).toLocaleDateString()}`, pageWidth - margin - 50, yPos + 6);
    pdf.text(`Due date: ${formattedDueDate}`, pageWidth - margin - 50, yPos + 12);
    
    yPos += 25;
    
    // Items table header
    pdf.setFillColor(219, 234, 254); // Light blue
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('QTY', margin + 5, yPos + 6.5);
    pdf.text('Description', margin + 30, yPos + 6.5);
    pdf.text('Unit Price', margin + 100, yPos + 6.5);
    pdf.text('Amount', pageWidth - margin - 30, yPos + 6.5);
    
    yPos += 10;
    
    // Items table content
    const fishDescription = `${tripType} - ${fishSale.fishType === 'Iced' ? 'Iced Fish' : 'Freshly Caught'}${fishSale.remarks ? ` (${fishSale.remarks})` : ''}`;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${fishSale.weight} kg`, margin + 5, yPos + 6);
    pdf.text(fishDescription, margin + 30, yPos + 6);
    pdf.text(`MVR ${fishSale.ratePrice.toFixed(2)}`, margin + 100, yPos + 6);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 30, yPos + 6, { align: 'right' });
    
    // Table borders
    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin, yPos, pageWidth - margin, yPos); // Top line
    pdf.line(margin, yPos + 10, pageWidth - margin, yPos + 10); // Bottom line
    pdf.line(margin, yPos, margin, yPos + 10); // Left line
    pdf.line(pageWidth - margin, yPos, pageWidth - margin, yPos + 10); // Right line
    
    yPos += 20;
    
    // Totals section
    const totalsX = pageWidth - margin - 60;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', totalsX, yPos);
    pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
    
    yPos += 10;
    
    // Total line with background
    pdf.setFillColor(241, 245, 249);
    pdf.rect(totalsX - 5, yPos - 3, 65, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Total (MVR):', totalsX, yPos + 2);
    pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos + 2, { align: 'right' });
    
    yPos += 20;
    
    // Payment info (if available)
    if (boat.bankName) {
      pdf.setFillColor(240, 249, 255);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175);
      pdf.text('Payment Information', margin + 5, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(`Bank: ${boat.bankName}`, margin + 5, yPos + 14);
      pdf.text(`Account Holder: ${boat.accountName}`, margin + 5, yPos + 18);
      pdf.text(`Account Number: ${boat.accountNumber}`, margin + 5, yPos + 22);
      
      yPos += 30;
    }
    
    // Terms and Conditions
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('Terms and Conditions', margin + 5, yPos + 10);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text('Payment is due on receipt, unless otherwise agreed.', margin + 5, yPos + 16);
    pdf.text('Please check the invoice details carefully.', margin + 5, yPos + 20);
    pdf.text('Any discrepancies must be reported immediately.', margin + 5, yPos + 24);
    
    // Save PDF
    pdf.save(`invoice-${invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to HTML download if PDF generation fails
    const htmlContent = generateInvoicePDF(invoiceData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const shareInvoiceWhatsApp = async (invoiceData: InvoiceData): Promise<void> => {
  const { customer, fishSale } = invoiceData;
  
  // Create invoice message
  const message = `Hi ${customer.name}! 🧾\n\nYour fish purchase invoice is ready:\n📄 Invoice: ${invoiceData.invoiceNumber}\n🐟 ${fishSale.weight}kg - ${invoiceData.tripType}\n💰 Total: MVR ${fishSale.totalAmount.toFixed(2)}\n\nThank you for your business!`;
  
  // Detect if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile && navigator.share && navigator.canShare) {
    // Try native sharing with PDF on mobile
    try {
      // Generate PDF as blob for sharing
      await generatePDFBlob(invoiceData).then(async (pdfBlob) => {
        const file = new File([pdfBlob], `invoice-${invoiceData.invoiceNumber}.pdf`, { type: 'application/pdf' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Invoice ${invoiceData.invoiceNumber}`,
            text: message,
            files: [file]
          });
        } else {
          throw new Error('File sharing not supported');
        }
      });
      return;
    } catch (error) {
      // Fallback to WhatsApp URL if native sharing fails
    }
  }
  
  // Use WhatsApp URL (works on both mobile and desktop)
  const phoneNumber = customer.contact.replace(/\D/g, ''); // Remove non-digits
  const encodedMessage = encodeURIComponent(message);
  
  if (isMobile) {
    // For mobile devices, try WhatsApp app first
    const whatsappScheme = `whatsapp://send?phone=960${phoneNumber}&text=${encodedMessage}`;
    const whatsappWeb = `https://wa.me/960${phoneNumber}?text=${encodedMessage}`;
    
    try {
      window.location.href = whatsappScheme;
      
      // Fallback to web version if app doesn't open
      setTimeout(() => {
        window.open(whatsappWeb, '_blank', 'noopener,noreferrer');
      }, 500);
    } catch (error) {
      window.open(whatsappWeb, '_blank', 'noopener,noreferrer');
    }
  } else {
    // For desktop, use WhatsApp Web
    const whatsappUrl = `https://wa.me/960${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
};

// Helper function to generate PDF as blob
const generatePDFBlob = async (invoiceData: InvoiceData): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  
  const { invoiceNumber, date, customer, boat, fishSale, tripType } = invoiceData;
  const dueDate = new Date(date);
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  
  // Header
  pdf.setFillColor(41, 128, 185);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text('INVOICE', margin, 25);
  
  // Invoice details
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Invoice #: ${invoiceNumber}`, margin, 60);
  pdf.text(`Date: ${new Date(date).toLocaleDateString()}`, margin, 70);
  pdf.text(`Due Date: ${dueDate.toLocaleDateString()}`, margin, 80);
  
  // Bill to section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('BILL TO:', margin, 100);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(customer.name, margin, 115);
  pdf.text(`Contact: ${customer.contact}`, margin, 125);
  
  // From section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('FROM:', pageWidth - margin - 80, 100);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(boat.boatName, pageWidth - margin - 80, 115);
  pdf.text(boat.ownerName, pageWidth - margin - 80, 125);
  
  // Item details
  const yPos = 160;
  const blobFishDescription = `${tripType} - ${fishSale.fishType === 'Iced' ? 'Iced Fish' : 'Freshly Caught'}${fishSale.remarks ? ` (${fishSale.remarks})` : ''}`;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${fishSale.weight} kg`, margin + 5, yPos + 6);
  pdf.text(blobFishDescription, margin + 30, yPos + 6);
  pdf.text(`MVR ${fishSale.ratePrice.toFixed(2)}`, margin + 100, yPos + 6);
  pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 30, yPos + 6, { align: 'right' });
  
  return pdf.output('blob');
};