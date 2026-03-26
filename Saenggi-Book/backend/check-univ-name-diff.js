const XLSX = require('xlsx');
const { Client } = require('pg');

async function main() {
  // 엑셀에서 대학명 추출
  const path = 'E:/Dev/github/GB-Back-Nest/uploads/26 정시 db 1209_채움완료.xlsx';
  const wb = XLSX.readFile(path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rawData.slice(2);

  const excelUnivs = new Set();
  dataRows.forEach(row => {
    if (row[1]) excelUnivs.add(row[1].toString().trim());
  });

  console.log('=== 엑셀 대학 수:', excelUnivs.size);

  // DB에서 대학명 조회
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
  });

  await client.connect();
  const result = await client.query('SELECT id, name FROM ts_universities ORDER BY name');
  await client.end();

  const dbUnivs = new Map();
  result.rows.forEach(row => {
    dbUnivs.set(row.name, row.id);
  });

  console.log('=== DB 대학 수:', dbUnivs.size);

  // 매핑 안 되는 대학 찾기
  const unmapped = [];
  excelUnivs.forEach(excelName => {
    if (!dbUnivs.has(excelName)) {
      unmapped.push(excelName);
    }
  });

  console.log('\n=== 매핑 안 되는 대학 (' + unmapped.length + '개) ===');

  // 유사한 DB 대학명 찾기
  unmapped.sort().forEach(excelName => {
    // 유사 이름 찾기
    const similar = [];
    dbUnivs.forEach((id, dbName) => {
      // 핵심 단어 비교
      const excelCore = excelName.replace(/대학교|대학|여자|가톨릭|교육|외국어|기술|글로벌|\(.*\)/g, '');
      const dbCore = dbName.replace(/대학교|대학|여자|가톨릭|교육|외국어|기술|글로벌|\(.*\)/g, '');

      if (excelCore && dbCore && (excelCore.includes(dbCore) || dbCore.includes(excelCore))) {
        similar.push(dbName);
      }
    });

    console.log(`\n엑셀: "${excelName}"`);
    if (similar.length > 0) {
      console.log(`  → DB 유사: ${similar.join(', ')}`);
    } else {
      console.log(`  → DB에 없음`);
    }
  });

  // DB 대학명 전체 목록
  console.log('\n\n=== DB 대학 전체 목록 ===');
  [...dbUnivs.keys()].sort().forEach(name => console.log(`  ${name}`));
}

main().catch(console.error);
