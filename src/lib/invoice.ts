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
  const { invoiceNumber, date, customer, boat, fishSale } = invoiceData;
  
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 15mm;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 0;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 15px;
        }
        
        .company-info h1 {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        
        .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.3;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h2 {
            font-size: 32px;
            font-weight: 700;
            color: #333;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .logo-container {
            width: 80px;
            height: 60px;
            border: 2px dashed #ddd;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .bill-to h3,
        .invoice-meta h3 {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .bill-to-details {
            font-size: 13px;
            color: #333;
            line-height: 1.4;
        }
        
        .invoice-meta-table {
            width: 100%;
        }
        
        .invoice-meta-table td {
            padding: 4px 0;
            font-size: 13px;
        }
        
        .invoice-meta-table .label {
            font-weight: 600;
            color: #333;
            width: 100px;
        }
        
        .invoice-meta-table .value {
            color: #333;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .items-table thead {
            background-color: #4a5568;
            color: white;
        }
        
        .items-table th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table th:last-child {
            text-align: right;
        }
        
        .items-table tbody td {
            padding: 12px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
        }
        
        .items-table tbody td:last-child {
            text-align: right;
            font-weight: 600;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
            margin-bottom: 30px;
        }
        
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals td {
            padding: 6px 0;
            font-size: 13px;
        }
        
        .totals .label {
            text-align: right;
            padding-right: 20px;
            font-weight: 500;
        }
        
        .totals .value {
            text-align: right;
            font-weight: 600;
        }
        
        .total-line {
            border-top: 2px solid #333;
        }
        
        .total-line .label,
        .total-line .value {
            font-size: 16px;
            font-weight: 700;
            padding-top: 10px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        .terms h4 {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        
        .terms p {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
            margin-bottom: 4px;
        }
        
        .payment-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .paid {
            background-color: #10b981;
            color: white;
        }
        
        .unpaid {
            background-color: #f59e0b;
            color: white;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .invoice-container {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-section">
                ${boat.logoUrl ? `
                <img src="${boat.logoUrl}" alt="Company Logo" style="width: 80px; height: 60px; object-fit: contain; margin-bottom: 10px; border-radius: 4px;">
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
                    <td>Fresh Fish Catch</td>
                    <td>MVR ${fishSale.ratePrice.toFixed(2)}</td>
                    <td>MVR ${fishSale.totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td class="label">Subtotal</td>
                    <td class="value">MVR ${fishSale.totalAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-line">
                    <td class="label">Total (MVR)</td>
                    <td class="value">MVR ${fishSale.totalAmount.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        ${boat.bankName ? `
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Payment Information</h4>
            <div style="font-size: 12px; color: #666; line-height: 1.4;">
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