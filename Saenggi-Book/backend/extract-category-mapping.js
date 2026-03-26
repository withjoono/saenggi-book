const XLSX = require('xlsx');

const wb = XLSX.readFile('uploads/ss_kyokwa_special_26.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('Total rows:', data.length);

// Get unique 특별전형종류 values
const categories = new Set();
data.forEach(row => {
  if (row['ida_1']) {
    categories.add(row['ida_1']);
  }
});

console.log('\nUnique 특별전형종류 values:');
Array.from(categories).sort().forEach(cat => {
  console.log(`  - ${cat}`);
});
