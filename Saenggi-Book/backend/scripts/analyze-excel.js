const XLSX = require('xlsx');
const path = require('path');

const fileName = process.argv[2];
const filePath = path.join(__dirname, '../uploads/', fileName);
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheet => {
  const worksheet = workbook.Sheets[sheet];
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log(`\n=== Sheet: ${sheet} ===`);
  console.log('Total Rows:', data.length);

  if (data.length > 0) {
    console.log('\n첫 번째 행:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\n컬럼명:', Object.keys(data[0]).join(', '));
  }
});
