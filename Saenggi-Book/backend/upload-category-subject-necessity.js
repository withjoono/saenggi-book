/**
 * ss_category_subject_necessity.xlsx 파일 업로드 스크립트
 */
const XLSX = require('xlsx');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

async function uploadData() {
  const client = await pool.connect();

  try {
    console.log('📥 ss_category_subject_necessity.xlsx 파일 로드 중...\n');

    // 엑셀 파일 읽기
    const workbook = XLSX.readFile('uploads/ss_category_subject_necessity.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`총 ${data.length}개 행 로드\n`);

    // 헤더 확인
    const headers = data[1];
    console.log('📋 컬럼 헤더:', headers.slice(0, 22));

    // 탐구과목 컬럼 (인덱스 7-18)
    const inquirySubjects = [
      '수학_확률과통계', '수학_미적', '수학_기하',
      '물리학1', '물리학2', '생명과학1', '생명과학2',
      '화학1', '화학2', '지구과학1', '지구과학2'
    ];

    // 주요교과 컬럼 (인덱스 19-25)
    const majorSubjects = ['국어', '수학', '영어', '사회', '과학', '한국사', '제2외'];

    // 기존 데이터 삭제
    await client.query('DELETE FROM ss_category_subject_necessity');
    console.log('✅ 기존 데이터 삭제 완료\n');

    let insertCount = 0;
    let skipCount = 0;

    // 데이터 행 처리 (2번째 행부터 시작, 헤더 제외)
    for (let i = 2; i < data.length; i++) {
      const row = data[i];

      // 빈 행 스킵
      if (!row[0]) {
        skipCount++;
        continue;
      }

      const categoryId = String(row[0]);
      const majorField = row[1];
      const majorFieldCode = row[2];
      const midField = row[3];
      const midFieldCode = row[4];
      const minorField = row[5];
      const minorFieldCode = row[6];

      // 탐구과목 처리 (inquiry)
      for (let j = 0; j < inquirySubjects.length; j++) {
        const necessityLevel = row[7 + j];

        if (necessityLevel === 1 || necessityLevel === 2) {
          const id = `${categoryId}_${inquirySubjects[j]}`;

          await client.query(`
            INSERT INTO ss_category_subject_necessity
            (id, category_id, major_field, major_field_code, mid_field, mid_field_code,
             minor_field, minor_field_code, subject_name, necessity_level, subject_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            id, categoryId, majorField, majorFieldCode, midField, midFieldCode,
            minorField, minorFieldCode, inquirySubjects[j], necessityLevel, 'inquiry'
          ]);
          insertCount++;
        }
      }

      // 주요교과 처리 (major) - 인덱스 19부터 시작
      for (let j = 0; j < majorSubjects.length; j++) {
        const necessityLevel = row[19 + j];

        if (necessityLevel === 1 || necessityLevel === 2) {
          const id = `${categoryId}_${majorSubjects[j]}`;

          await client.query(`
            INSERT INTO ss_category_subject_necessity
            (id, category_id, major_field, major_field_code, mid_field, mid_field_code,
             minor_field, minor_field_code, subject_name, necessity_level, subject_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            id, categoryId, majorField, majorFieldCode, midField, midFieldCode,
            minorField, minorFieldCode, majorSubjects[j], necessityLevel, 'major'
          ]);
          insertCount++;
        }
      }

      if (i % 100 === 0) {
        console.log(`진행 중... ${i}/${data.length} (삽입: ${insertCount})`);
      }
    }

    console.log(`\n✅ 업로드 완료!`);
    console.log(`   - 총 행: ${data.length - 2}`);
    console.log(`   - 스킵: ${skipCount}`);
    console.log(`   - 삽입: ${insertCount}`);

    // 통계 조회
    const stats = await client.query(`
      SELECT subject_type, necessity_level, COUNT(*) as count
      FROM ss_category_subject_necessity
      GROUP BY subject_type, necessity_level
      ORDER BY subject_type, necessity_level
    `);

    console.log('\n📊 업로드 통계:');
    stats.rows.forEach(row => {
      const type = row.subject_type === 'inquiry' ? '탐구과목' : '주요교과';
      const level = row.necessity_level === 1 ? '필수' : '권장';
      console.log(`   ${type} ${level}: ${row.count}개`);
    });

  } catch (error) {
    console.error('❌ 업로드 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

uploadData();
