const XLSX = require('xlsx');
const path = require('path');

const fileName = process.argv[2];
const filePath = path.join(__dirname, '../uploads/', fileName);
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheet => {
  const worksheet = workbook.Sheets[sheet];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get as array of arrays

  console.log(`\n=== Sheet: ${sheet} ===`);
  console.log('Total Rows:', data.length);

  console.log('\n첫 5개 행 (원본 데이터):');
  data.slice(0, 5).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
  });
});
