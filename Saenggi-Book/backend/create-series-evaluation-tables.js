const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function createTables() {
  try {
    console.log('🚀 계열 적합성 테이블 생성 시작');
    console.log('='.repeat(80));

    // 1. 대학 레벨 테이블
    console.log('\n📄 1. university_level 테이블 생성...');
    await pool.query(`
      DROP TABLE IF EXISTS university_level CASCADE;

      CREATE TABLE university_level (
        id SERIAL NOT NULL,
        university_name VARCHAR(100) NOT NULL,
        university_code VARCHAR(10) NOT NULL,
        level INTEGER NOT NULL,
        CONSTRAINT PK_university_level PRIMARY KEY (id)
      );

      CREATE INDEX idx_university_level_code ON university_level (university_code);
      CREATE INDEX idx_university_level_name ON university_level (university_name);

      COMMENT ON TABLE university_level IS '대학별 레벨 정보 (계열 적합성 진단용)';
    `);
    console.log('✅ university_level 테이블 생성 완료');

    // 2. 문과 계열 평가 기준 테이블
    console.log('\n📄 2. series_evaluation_criteria_humanities 테이블 생성...');
    await pool.query(`
      DROP TABLE IF EXISTS series_evaluation_criteria_humanities CASCADE;

      CREATE TABLE series_evaluation_criteria_humanities (
        id SERIAL NOT NULL,
        level INTEGER NOT NULL,
        university_category VARCHAR(100) NOT NULL,
        korean DECIMAL(3,1) NOT NULL,
        english DECIMAL(3,1) NOT NULL,
        math DECIMAL(3,1) NOT NULL,
        social DECIMAL(3,1) NOT NULL,
        second_foreign_language DECIMAL(3,1) NOT NULL,
        overall_grade_range VARCHAR(20),
        CONSTRAINT PK_series_evaluation_criteria_humanities PRIMARY KEY (id)
      );

      CREATE INDEX idx_sec_humanities_level ON series_evaluation_criteria_humanities (level);

      COMMENT ON TABLE series_evaluation_criteria_humanities IS '문과 계열 적합성 평가 기준';
    `);
    console.log('✅ series_evaluation_criteria_humanities 테이블 생성 완료');

    // 3. 이과 계열 평가 기준 테이블
    console.log('\n📄 3. series_evaluation_criteria_science 테이블 생성...');
    await pool.query(`
      DROP TABLE IF EXISTS series_evaluation_criteria_science CASCADE;

      CREATE TABLE series_evaluation_criteria_science (
        id SERIAL NOT NULL,
        level INTEGER NOT NULL,
        university_category VARCHAR(100) NOT NULL,
        statistics DECIMAL(3,1) NOT NULL,
        calculus DECIMAL(3,1) NOT NULL,
        geometry DECIMAL(3,1) NOT NULL,
        ai_math DECIMAL(3,1) NOT NULL,
        physics1 DECIMAL(3,1) NOT NULL,
        physics2 DECIMAL(3,1) NOT NULL,
        chemistry1 DECIMAL(3,1) NOT NULL,
        chemistry2 DECIMAL(3,1) NOT NULL,
        biology1 DECIMAL(3,1) NOT NULL,
        biology2 DECIMAL(3,1) NOT NULL,
        earth_science1 DECIMAL(3,1) NOT NULL,
        earth_science2 DECIMAL(3,1) NOT NULL,
        CONSTRAINT PK_series_evaluation_criteria_science PRIMARY KEY (id)
      );

      CREATE INDEX idx_sec_science_level ON series_evaluation_criteria_science (level);

      COMMENT ON TABLE series_evaluation_criteria_science IS '이과 계열 적합성 평가 기준';
    `);
    console.log('✅ series_evaluation_criteria_science 테이블 생성 완료');

    console.log('\n' + '='.repeat(80));
    console.log('✅ 모든 테이블 생성 완료!');
  } catch (error) {
    console.error('❌ 테이블 생성 중 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

createTables();
