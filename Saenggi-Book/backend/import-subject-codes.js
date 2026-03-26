/**
 * 교과/과목 코드 데이터 Import 스크립트
 * Excel 파일: ss_2015_subject_code.xlsx
 *
 * 사용법: node import-subject-codes.js
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
    const workbook = XLSX.readFile(
      'g:/내 드라이브/거북스쿨 개발 자료/거북스쿨 플랫폼/수시/디비/2027/ss_2015_subject_code.xlsx',
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`✅ ${data.length}개 레코드 로드됨`);

    console.log('🔌 데이터베이스 연결...');
    await client.connect();

    // 테이블 존재 여부 확인 및 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS ss_subject_codes (
        id VARCHAR(20) NOT NULL PRIMARY KEY,
        main_subject_name VARCHAR(50) NOT NULL,
        main_subject_code VARCHAR(20) NOT NULL,
        course_type_name VARCHAR(50) NOT NULL,
        course_type_code INTEGER NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        subject_code INTEGER NOT NULL,
        evaluation_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // 인덱스 생성 (이미 존재하면 무시)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ss_sc_main_subject_code ON ss_subject_codes (main_subject_code)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ss_sc_course_type ON ss_subject_codes (course_type_code)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ss_sc_composite ON ss_subject_codes (main_subject_code, subject_code)
    `);

    // 기존 데이터 삭제
    await client.query('DELETE FROM ss_subject_codes');
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
          row['교과'],
          row['교과코드'],
          row['종류'],
          row['종류코드'],
          String(row['과목']).trim(),
          row['과목코드'],
          row['석차등급,성취'],
        );
      }

      await client.query(
        `
        INSERT INTO ss_subject_codes (
          id, main_subject_name, main_subject_code, course_type_name, course_type_code,
          subject_name, subject_code, evaluation_type
        )
        VALUES ${values.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          main_subject_name = EXCLUDED.main_subject_name,
          main_subject_code = EXCLUDED.main_subject_code,
          course_type_name = EXCLUDED.course_type_name,
          course_type_code = EXCLUDED.course_type_code,
          subject_name = EXCLUDED.subject_name,
          subject_code = EXCLUDED.subject_code,
          evaluation_type = EXCLUDED.evaluation_type,
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
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT main_subject_code) as main_subjects,
        COUNT(DISTINCT course_type_code) as course_types
      FROM ss_subject_codes
    `);
    console.log(
      `📊 총: ${stats.rows[0].total}, 주요교과: ${stats.rows[0].main_subjects}, 종류: ${stats.rows[0].course_types}`,
    );

    // 주요교과별 통계
    const mainSubjectStats = await client.query(`
      SELECT main_subject_code, main_subject_name, COUNT(*) as count
      FROM ss_subject_codes
      GROUP BY main_subject_code, main_subject_name
      ORDER BY main_subject_code
    `);
    console.log('\n📚 주요교과별 과목 수:');
    mainSubjectStats.rows.forEach((row) => {
      console.log(`   - ${row.main_subject_name} (${row.main_subject_code}): ${row.count}개`);
    });

    // 종류별 통계
    const courseTypeStats = await client.query(`
      SELECT course_type_name, course_type_code, COUNT(*) as count
      FROM ss_subject_codes
      GROUP BY course_type_name, course_type_code
      ORDER BY course_type_code
    `);
    console.log('\n📋 종류별 과목 수:');
    courseTypeStats.rows.forEach((row) => {
      console.log(`   - ${row.course_type_name} (${row.course_type_code}): ${row.count}개`);
    });
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await client.end();
  }
}

importData().catch(console.error);
