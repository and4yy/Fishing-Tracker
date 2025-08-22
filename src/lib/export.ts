import * as XLSX from 'xlsx';
import { FishingTrip } from '@/types/fishing';

export const exportToExcel = (trips: FishingTrip[]) => {
  // Prepare data for Excel
  const excelData = trips.map(trip => ({
    'Date': new Date(trip.date).toLocaleDateString(),
    'Trip Type': trip.tripType,
    'Crew Members': trip.crew.join(', '),
    'Fuel Expense (MVR)': trip.expenses.fuel,
    'Food Expense (MVR)': trip.expenses.food,
    'Other Expenses (MVR)': trip.expenses.other,
    'Total Expenses (MVR)': trip.expenses.fuel + trip.expenses.food + trip.expenses.other,
    'Total Catch (kg)': trip.totalCatch,
    'Total Sales (MVR)': trip.totalSales,
    'Profit (MVR)': trip.profit,
    'Owner Share %': trip.ownerSharePercent,
    'Owner Profit (MVR)': trip.ownerProfit,
    'Profit per Crew (MVR)': trip.profitPerCrew
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-width columns
  const colWidths = Object.keys(excelData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fishing Trips');

  // Generate filename with current date
  const filename = `fishing-trips-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, filename);
};