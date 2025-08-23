import { FishSale } from '@/types/fishing';
import { BoatSettings } from '@/types/settings';

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
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #0ea5e9; }
        .invoice-number { font-size: 18px; font-weight: bold; }
        .boat-info, .customer-info { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #0ea5e9; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item { margin-bottom: 8px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8fafc; font-weight: bold; }
        .total-row { font-weight: bold; font-size: 18px; background-color: #f0f9ff; }
        .payment-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .paid { background-color: #dcfce7; color: #166534; }
        .unpaid { background-color: #fef3c7; color: #92400e; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${boat.logoUrl ? `<img src="${boat.logoUrl}" alt="Boat logo" style="height: 40px; width: 40px; object-fit: contain;">` : '🚢'}
                <div>
                    <div class="logo">${boat.boatName}</div>
                    <div style="margin-top: 5px; color: #666;">Fishing Invoice</div>
                </div>
            </div>
        </div>
        <div class="invoice-number">Invoice #${invoiceNumber}</div>
    </div>

    <div class="info-grid">
        <div class="boat-info">
            <div class="section-title">From:</div>
            <div class="info-item"><span class="label">Boat:</span> ${boat.boatName}</div>
            <div class="info-item"><span class="label">Owner:</span> ${boat.ownerName}</div>
            <div class="info-item"><span class="label">Contact:</span> ${boat.contactNumber}</div>
            <div class="info-item"><span class="label">Email:</span> ${boat.email}</div>
            <div class="info-item"><span class="label">Address:</span> ${boat.address}</div>
            <div class="info-item"><span class="label">Registration:</span> ${boat.registrationNumber}</div>
        </div>

        <div class="customer-info">
            <div class="section-title">To:</div>
            <div class="info-item"><span class="label">Customer:</span> ${customer.name}</div>
            <div class="info-item"><span class="label">Contact:</span> ${customer.contact}</div>
            <div class="info-item"><span class="label">Date:</span> ${date}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Weight (kg)</th>
                <th>Rate (MVR/kg)</th>
                <th>Amount (MVR)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Fresh Fish</td>
                <td>${fishSale.weight}</td>
                <td>${fishSale.ratePrice.toFixed(2)}</td>
                <td>${fishSale.totalAmount.toFixed(2)}</td>
                <td><span class="payment-status ${fishSale.paid ? 'paid' : 'unpaid'}">${fishSale.paid ? 'PAID' : 'UNPAID'}</span></td>
            </tr>
            <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total:</td>
                <td>MVR ${fishSale.totalAmount.toFixed(2)}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p style="font-size: 12px;">This is a computer generated invoice.</p>
    </div>
</body>
</html>
  `;

  return invoiceHTML;
};

export const downloadInvoiceAsPDF = (invoiceData: InvoiceData): void => {
  const htmlContent = generateInvoicePDF(invoiceData);
  
  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link to download
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoiceData.invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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