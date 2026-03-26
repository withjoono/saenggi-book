const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'uploads', 'sanggibu_evaluation_question.xlsx');
console.log('Reading file:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  console.log('\n📊 Sheets:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log('\n' + '='.repeat(80));
    console.log(`📄 Sheet: ${sheetName}`);
    console.log('='.repeat(80));

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    // Show first 30 rows
    data.slice(0, 30).forEach((row, idx) => {
      if (row.some(cell => cell !== '')) {
        console.log(`Row ${idx + 1}:`, row);
      }
    });

    console.log(`\n... (showing first 30 rows, total: ${data.length} rows)`);
  });
} catch (error) {
  console.error('Error reading file:', error.message);
}
