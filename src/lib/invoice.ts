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
                <h2>SALES<br>INVOICE</h2>
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
                        <td>Fresh Fish Catch (${tripType})</td>
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
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
    
    // Company name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175); // Blue color
    pdf.text(boat.boatName || 'Your Boat Name', margin + 5, yPos + 10);
    
    // Contact number
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(boat.contactNumber ? `Contact: ${boat.contactNumber}` : 'Contact: Your Contact Number', margin + 5, yPos + 17);
    
    // Invoice title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('SALES INVOICE', pageWidth - margin - 60, yPos + 15);
    
    yPos += 35;
    
    // Invoice details section
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('BILL TO', margin, yPos);
    
    pdf.text('INVOICE DETAILS', pageWidth - margin - 50, yPos);
    
    yPos += 8;
    
    // Bill to details
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(customer.name, margin, yPos);
    pdf.text(`Contact: ${customer.contact}`, margin, yPos + 5);
    
    // Invoice meta
    pdf.text(`Invoice #: ${invoiceNumber}`, pageWidth - margin - 50, yPos);
    pdf.text(`Invoice date: ${new Date(date).toLocaleDateString()}`, pageWidth - margin - 50, yPos + 5);
    pdf.text(`Due date: ${formattedDueDate}`, pageWidth - margin - 50, yPos + 10);
    
    yPos += 25;
    
    // Items table header
    pdf.setFillColor(219, 234, 254); // Light blue
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('QTY', margin + 5, yPos + 5.5);
    pdf.text('Description', margin + 30, yPos + 5.5);
    pdf.text('Unit Price', margin + 100, yPos + 5.5);
    pdf.text('Amount', pageWidth - margin - 30, yPos + 5.5);
    
    yPos += 8;
    
    // Items table content
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${fishSale.weight} kg`, margin + 5, yPos + 5);
    pdf.text(`Fresh Fish Catch (${tripType})`, margin + 30, yPos + 5);
    pdf.text(`MVR ${fishSale.ratePrice.toFixed(2)}`, margin + 100, yPos + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 30, yPos + 5, { align: 'right' });
    
    // Table borders
    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin, yPos, pageWidth - margin, yPos); // Top line
    pdf.line(margin, yPos + 8, pageWidth - margin, yPos + 8); // Bottom line
    pdf.line(margin, yPos, margin, yPos + 8); // Left line
    pdf.line(pageWidth - margin, yPos, pageWidth - margin, yPos + 8); // Right line
    
    yPos += 20;
    
    // Totals section
    const totalsX = pageWidth - margin - 60;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', totalsX, yPos);
    pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
    
    yPos += 8;
    
    // Total line with background
    pdf.setFillColor(241, 245, 249);
    pdf.rect(totalsX - 5, yPos - 3, 65, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Total (MVR):', totalsX, yPos + 2);
    pdf.text(`MVR ${fishSale.totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos + 2, { align: 'right' });
    
    yPos += 15;
    
    // Payment info (if available)
    if (boat.bankName) {
      pdf.setFillColor(240, 249, 255);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175);
      pdf.text('Payment Information', margin + 5, yPos + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      pdf.text(`Bank: ${boat.bankName}`, margin + 5, yPos + 13);
      pdf.text(`Account Holder: ${boat.accountName}`, margin + 5, yPos + 16);
      pdf.text(`Account Number: ${boat.accountNumber}`, margin + 5, yPos + 19);
      
      yPos += 25;
    }
    
    // Terms and Conditions
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175);
    pdf.text('Terms and Conditions', margin + 5, yPos + 8);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.text('Payment is due on receipt, unless otherwise agreed.', margin + 5, yPos + 13);
    pdf.text('Please check the invoice details carefully.', margin + 5, yPos + 16);
    pdf.text('Any discrepancies must be reported immediately.', margin + 5, yPos + 19);
    
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

export const printInvoice = (invoiceData: InvoiceData): void => {
  const htmlContent = generateInvoicePDF(invoiceData);
  
  // Open a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};