/**
 * middle_series_subject_requirements 테이블 생성 스크립트
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

async function createTable() {
  const client = await pool.connect();

  try {
    console.log('📋 middle_series_subject_requirements 테이블 생성 중...\n');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS middle_series_subject_requirements (
        id SERIAL PRIMARY KEY,
        grand_series VARCHAR(50) NOT NULL,
        middle_series VARCHAR(100) NOT NULL,
        series_type VARCHAR(20) NOT NULL,
        required_subjects JSON,
        recommended_subjects JSON,
        description TEXT,
        UNIQUE(middle_series, series_type)
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ 테이블 생성 완료!\n');

    // 테이블 확인
    const checkQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'middle_series_subject_requirements'
      ORDER BY ordinal_position;
    `;

    const result = await client.query(checkQuery);
    console.log('📊 테이블 구조:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTable();
