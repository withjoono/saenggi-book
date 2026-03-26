/**
 * 수시 모집단위 통합 테이블 데이터 Import 스크립트
 * Excel 파일: uploads/ss_yy_univ_jeonhyung_recruit_id.xlsx
 *
 * 사용법: node import-susi-recruitment-units.js
 */

const XLSX = require('xlsx');
const { Client } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_NAME || 'geobukschool_dev',
};

async function importData() {
  const client = new Client(dbConfig);

  try {
    console.log('📁 Excel 파일 읽기...');
    const workbook = XLSX.readFile('uploads/ss_yy_univ_jeonhyung_recruit_id.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`✅ ${data.length}개 레코드 로드됨`);

    console.log('🔌 데이터베이스 연결...');
    await client.connect();

    // 기존 데이터 삭제
    await client.query('DELETE FROM ss_recruitment_units');

    // 배치 삽입
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const row of batch) {
        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        params.push(
          row['ID'],
          row['대학교'],
          row['대학코드'],
          row['전형타입'],
          row['전형타입코드'],
          row['전형명'],
          row['모집단위명'],
          row['지역(광역)'] || null
        );
      }

      await client.query(`
        INSERT INTO ss_recruitment_units (id, university_name, university_code, admission_type, admission_type_code, admission_name, unit_name, region)
        VALUES ${values.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          university_name = EXCLUDED.university_name,
          university_code = EXCLUDED.university_code,
          admission_type = EXCLUDED.admission_type,
          admission_type_code = EXCLUDED.admission_type_code,
          admission_name = EXCLUDED.admission_name,
          unit_name = EXCLUDED.unit_name,
          region = EXCLUDED.region,
          updated_at = now()
      `, params);

      inserted += batch.length;
      process.stdout.write(`\r📊 진행률: ${Math.round((inserted / data.length) * 100)}% (${inserted}/${data.length})`);
    }

    console.log('\n✅ Import 완료!');

    // 통계
    const stats = await client.query(`
      SELECT COUNT(*) as total, COUNT(DISTINCT university_code) as universities,
             COUNT(DISTINCT admission_type) as types, COUNT(DISTINCT region) as regions
      FROM ss_recruitment_units
    `);
    console.log(`📊 총: ${stats.rows[0].total}, 대학: ${stats.rows[0].universities}, 전형타입: ${stats.rows[0].types}, 지역: ${stats.rows[0].regions}`);

  } finally {
    await client.end();
  }
}

importData().catch(console.error);
