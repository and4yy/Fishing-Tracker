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
  
  const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            line-height: 1.6;
            color: #1f2937; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px;
            min-height: 100vh;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
            color: white;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(50%, -50%);
        }
        
        .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .logo-container {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            backdrop-filter: blur(10px);
        }
        
        .company-info h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .company-subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
        }
        
        .invoice-meta {
            text-align: right;
        }
        
        .invoice-number {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .invoice-date {
            font-size: 14px;
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .content {
            padding: 40px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .info-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            border-left: 4px solid #0ea5e9;
            position: relative;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(226, 232, 240, 0.6);
        }
        
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .label {
            font-weight: 500;
            color: #64748b;
            min-width: 100px;
        }
        
        .value {
            font-weight: 600;
            color: #1e293b;
            text-align: right;
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 32px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        }
        
        th {
            padding: 20px 16px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 12px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        td {
            padding: 20px 16px;
            border-bottom: 1px solid #f1f5f9;
            font-weight: 500;
        }
        
        .item-row:hover {
            background: #f8fafc;
        }
        
        .total-section {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
        }
        
        .total-row {
            font-size: 20px;
            font-weight: 700;
        }
        
        .total-row td {
            padding: 24px 16px;
            border-bottom: none;
        }
        
        .payment-status {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .paid {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        
        .unpaid {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        
        .payment-details {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            border: 1px solid #e2e8f0;
        }
        
        .payment-details .section-title {
            margin-bottom: 20px;
        }
        
        .footer {
            text-align: center;
            padding: 32px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            margin-bottom: 8px;
        }
        
        .thank-you {
            font-size: 18px;
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 12px;
        }
        
        .generated-note {
            font-size: 12px;
            color: #64748b;
            font-style: italic;
        }
        
        .amount-highlight {
            color: #059669;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo-container">
                        ${boat.logoUrl ? `<img src="${boat.logoUrl}" alt="Logo" style="width: 40px; height: 40px; object-fit: contain; border-radius: 8px;">` : '⚓'}
                    </div>
                    <div class="company-info">
                        <h1>${boat.boatName}</h1>
                        <div class="company-subtitle">Professional Fishing Services</div>
                    </div>
                </div>
                <div class="invoice-meta">
                    <div class="invoice-number">Invoice #${invoiceNumber}</div>
                    <div class="invoice-date">📅 ${date}</div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="section-title">📍 From</div>
                    <div class="info-item">
                        <span class="label">Boat Name</span>
                        <span class="value">${boat.boatName}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Owner</span>
                        <span class="value">${boat.ownerName}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Contact</span>
                        <span class="value">${boat.contactNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Email</span>
                        <span class="value">${boat.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Address</span>
                        <span class="value">${boat.address}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Registration</span>
                        <span class="value">${boat.registrationNumber}</span>
                    </div>
                </div>

                <div class="info-card">
                    <div class="section-title">👤 Billed To</div>
                    <div class="info-item">
                        <span class="label">Customer</span>
                        <span class="value">${customer.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Contact</span>
                        <span class="value">${customer.contact}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Invoice Date</span>
                        <span class="value">${date}</span>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>🐟 Description</th>
                            <th>⚖️ Weight (kg)</th>
                            <th>💰 Rate (MVR/kg)</th>
                            <th>💵 Amount (MVR)</th>
                            <th>📊 Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="item-row">
                            <td>Fresh Fish Catch</td>
                            <td>${fishSale.weight} kg</td>
                            <td>MVR ${fishSale.ratePrice.toFixed(2)}</td>
                            <td class="amount-highlight">MVR ${fishSale.totalAmount.toFixed(2)}</td>
                            <td>
                                <span class="payment-status ${fishSale.paid ? 'paid' : 'unpaid'}">
                                    ${fishSale.paid ? '✓ PAID' : '⏳ PENDING'}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="total-section">
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right; font-size: 18px;">💳 Total Amount:</td>
                            <td style="font-size: 24px; font-weight: 700;">MVR ${fishSale.totalAmount.toFixed(2)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            ${boat.bankName ? `
            <div class="payment-details">
                <div class="section-title">🏦 Payment Information</div>
                <div class="info-item">
                    <span class="label">Bank Name</span>
                    <span class="value">${boat.bankName}</span>
                </div>
                <div class="info-item">
                    <span class="label">Account Holder</span>
                    <span class="value">${boat.accountName}</span>
                </div>
                <div class="info-item">
                    <span class="label">Account Number</span>
                    <span class="value">${boat.accountNumber}</span>
                </div>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <div class="thank-you">🙏 Thank you for your business!</div>
            <p>We appreciate your trust in our fishing services.</p>
            <p class="generated-note">This is a digitally generated invoice - ${new Date().toLocaleString()}</p>
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