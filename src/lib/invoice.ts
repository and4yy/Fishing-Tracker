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
  
  // Calculate due date (14 days from invoice date)
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + 14);
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
            border-bottom: 2px solid #000;
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
            color: #000;
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
            color: #000;
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
            color: #000;
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
            background-color: #f8f9fa;
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11pt;
            color: #000;
        }
        
        .items-table th:nth-child(1) { width: 15%; }
        .items-table th:nth-child(2) { width: 45%; }
        .items-table th:nth-child(3) { width: 20%; }
        .items-table th:nth-child(4) { width: 20%; text-align: right; }
        
        .items-table td {
            border: 1px solid #000;
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
            border-top: 2px solid #000;
            padding-top: 12px;
            font-size: 12pt;
            font-weight: bold;
        }
        
        .payment-info {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
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
            border-top: 1px solid #ccc;
        }
        
        .terms h4 {
            font-size: 12pt;
            font-weight: bold;
            color: #000;
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
                    <h1>${boat.boatName || 'Your Company Inc.'}</h1>
                    <div class="company-details">
                        ${boat.address || '1234 Company St,'}<br>
                        ${boat.ownerName ? `Owner: ${boat.ownerName}` : 'Company Town, ST 12345'}<br>
                        ${boat.contactNumber ? `Tel: ${boat.contactNumber}` : ''}<br>
                        ${boat.email ? `Email: ${boat.email}` : ''}
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
                <p>Payment is due in 14 days</p>
                <p>Please make checks payable to: ${boat.boatName || 'Your Company Inc.'}</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  return invoiceHTML;
};

export const downloadInvoiceAsPDF = async (invoiceData: InvoiceData): Promise<void> => {
  const htmlContent = generateInvoicePDF(invoiceData);
  
  // Create a temporary div to render the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.backgroundColor = 'white';
  document.body.appendChild(tempDiv);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to HTML download if PDF generation fails
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } finally {
    // Clean up temporary div
    document.body.removeChild(tempDiv);
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