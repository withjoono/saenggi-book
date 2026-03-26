/**
 * 수시 모집단위 계열 분류 데이터 Import 스크립트
 * Excel 파일: uploads/26_univ_unit_category.xlsx
 *
 * 사용법: node import-unit-categories.js
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
    const workbook = XLSX.readFile('uploads/26_univ_unit_category.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`✅ ${data.length}개 레코드 로드됨`);

    console.log('🔌 데이터베이스 연결...');
    await client.connect();

    // 기존 데이터 삭제
    await client.query('DELETE FROM ss_unit_categories');
    console.log('🗑️  기존 데이터 삭제 완료');

    // 배치 삽입
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const row of batch) {
        values.push(
          `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
        );
        params.push(
          row['ID'],
          row['계열코드'],
          row['대계열'],
          row['대계열코드'],
          row['중계열'],
          row['중계열코드'],
          row['소계열'],
          row['소계열코드'],
        );
      }

      await client.query(
        `
        INSERT INTO ss_unit_categories (id, field_code, major_field, major_field_code, mid_field, mid_field_code, minor_field, minor_field_code)
        VALUES ${values.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          field_code = EXCLUDED.field_code,
          major_field = EXCLUDED.major_field,
          major_field_code = EXCLUDED.major_field_code,
          mid_field = EXCLUDED.mid_field,
          mid_field_code = EXCLUDED.mid_field_code,
          minor_field = EXCLUDED.minor_field,
          minor_field_code = EXCLUDED.minor_field_code,
          updated_at = now()
      `,
        params,
      );

      inserted += batch.length;
      process.stdout.write(
        `\r📊 진행률: ${Math.round((inserted / data.length) * 100)}% (${inserted}/${data.length})`,
      );
    }

    console.log('\n✅ Import 완료!');

    // 통계
    const stats = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(DISTINCT major_field_code) as major_fields,
             COUNT(DISTINCT mid_field_code) as mid_fields,
             COUNT(DISTINCT minor_field_code) as minor_fields
      FROM ss_unit_categories
    `);
    console.log(
      `📊 총: ${stats.rows[0].total}, 대계열: ${stats.rows[0].major_fields}, 중계열: ${stats.rows[0].mid_fields}, 소계열: ${stats.rows[0].minor_fields}`,
    );
  } finally {
    await client.end();
  }
}

importData().catch(console.error);
