const XLSX = require('xlsx');
const { Client } = require('pg');

async function uploadKyokwaSpecialData() {
  // 1. Excel 파일 읽기
  console.log('📖 Reading Excel file...');
  const workbook = XLSX.readFile('uploads/ss_kyokwa_special_26.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

  // 헤더 행 제거 및 데이터 정리
  const rows = data.slice(1); // 첫 번째 행은 헤더
  console.log(`Total rows: ${rows.length}`);

  // 2. PostgreSQL 연결
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'geobukschool_dev',
    user: 'tsuser',
    password: 'tsuser1234',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    let updateCount = 0;
    let notFoundCount = 0;

    // 3. 각 행을 처리
    for (const row of rows) {
      const idaId = row.__EMPTY;
      const basicType = row.ida; // 일반 or 특별
      const specialCode = row.ida_1; // 특별전형 코드 (21, 40, 26 등)

      if (!idaId) continue;

      // 특별전형인 경우에만 처리
      if (basicType === '특별' && specialCode) {
        try {
          const result = await client.query(
            `UPDATE susi_kyokwa_recruitment
             SET admission_subtype = $1
             WHERE ida_id = $2`,
            [specialCode, idaId]
          );

          if (result.rowCount > 0) {
            updateCount++;
            if (updateCount % 100 === 0) {
              console.log(`  Updated ${updateCount} rows...`);
            }
          } else {
            notFoundCount++;
          }
        } catch (error) {
          console.error(`Error updating ${idaId}:`, error.message);
        }
      }
    }

    console.log('\\n✅ Upload completed!');
    console.log(`  - Updated: ${updateCount} rows`);
    console.log(`  - Not found in DB: ${notFoundCount} rows`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

uploadKyokwaSpecialData();
