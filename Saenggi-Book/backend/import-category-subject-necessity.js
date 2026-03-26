/**
 * 계열별 필수과목/권장과목 데이터 Import 스크립트
 * Excel 파일: uploads/ss_category_subject_necessity.xlsx
 *
 * 사용법: node import-category-subject-necessity.js
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
      'uploads/ss_category_subject_necessity.xlsx',
    );
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`✅ ${data.length}개 행 로드됨`);

    console.log('🔌 데이터베이스 연결...');
    await client.connect();

    // 기존 데이터 삭제
    await client.query('DELETE FROM ss_category_subject_necessity');
    console.log('🗑️  기존 데이터 삭제 완료');

    // 행 구조 분석
    const headerRow = data[0]; // Row 1: 헤더
    const subjectRow = data[1]; // Row 2: 과목명
    const dataRows = data.slice(2); // Row 3부터: 실제 데이터

    console.log(`📊 헤더 컬럼 수: ${headerRow.length}`);
    console.log(`📊 과목 컬럼 수: ${subjectRow.length}`);

    // 과목명과 타입 매핑 생성
    // 카테고리 컬럼은 처음 7개: id, 대계열, 대계열코드, 중계열, 중계열코드, 소계열, 소계열코드
    const categoryColumnCount = 7;

    // 과목 섹션 구분
    // "핵심권장과목1, 권장과목2" 섹션 찾기
    const inquirySectionStart = categoryColumnCount;
    let inquirySectionEnd = inquirySectionStart;

    // "주요교과" 섹션 찾기 (headerRow에서 "주요교과" 문자열 찾기)
    let majorSectionStart = -1;
    for (let i = categoryColumnCount; i < headerRow.length; i++) {
      if (
        headerRow[i] &&
        typeof headerRow[i] === 'string' &&
        headerRow[i].includes('주요교과')
      ) {
        majorSectionStart = i;
        inquirySectionEnd = i;
        break;
      }
    }

    if (majorSectionStart === -1) {
      console.log('⚠️  주요교과 섹션을 찾을 수 없습니다. 전체를 탐구과목으로 처리합니다.');
      inquirySectionEnd = subjectRow.length;
      majorSectionStart = subjectRow.length;
    }

    console.log(`📊 탐구과목 범위: 컬럼 ${inquirySectionStart}-${inquirySectionEnd - 1}`);
    console.log(`📊 주요교과 범위: 컬럼 ${majorSectionStart}-${subjectRow.length - 1}`);

    // 과목명 추출
    const subjects = [];
    for (let i = inquirySectionStart; i < subjectRow.length; i++) {
      if (subjectRow[i] && typeof subjectRow[i] === 'string') {
        const subjectType = i < inquirySectionEnd ? 'inquiry' : 'major';
        subjects.push({
          columnIndex: i,
          name: subjectRow[i].trim(),
          type: subjectType,
        });
      }
    }

    console.log(`📚 과목 수: ${subjects.length}개`);
    console.log(`   - 탐구과목: ${subjects.filter((s) => s.type === 'inquiry').length}개`);
    console.log(`   - 주요교과: ${subjects.filter((s) => s.type === 'major').length}개`);

    // 데이터 삽입
    let inserted = 0;
    let skipped = 0;
    const batchSize = 500;
    const records = [];

    for (const row of dataRows) {
      // 카테고리 정보 추출
      const categoryId = row[0] ? String(row[0]) : null;
      const majorField = row[1] ? String(row[1]) : null;
      const majorFieldCode = row[2] ? parseInt(row[2]) : null;
      const midField = row[3] ? String(row[3]) : null;
      const midFieldCode = row[4] ? parseInt(row[4]) : null;
      const minorField = row[5] ? String(row[5]) : null;
      const minorFieldCode = row[6] ? parseInt(row[6]) : null;

      // 카테고리 정보가 없는 행은 스킵
      if (
        !categoryId ||
        !majorField ||
        !majorFieldCode ||
        !midField ||
        !midFieldCode ||
        !minorField ||
        !minorFieldCode
      ) {
        skipped++;
        continue;
      }

      // 각 과목에 대해 필수/권장 수준 확인
      for (const subject of subjects) {
        const necessityLevel = row[subject.columnIndex];

        // 값이 1 또는 2인 경우만 레코드 생성
        if (necessityLevel === 1 || necessityLevel === 2) {
          const id = `${categoryId}_${subject.name}`;

          records.push({
            id,
            categoryId,
            majorField,
            majorFieldCode,
            midField,
            midFieldCode,
            minorField,
            minorFieldCode,
            subjectName: subject.name,
            necessityLevel,
            subjectType: subject.type,
          });
        }
      }
    }

    console.log(`📊 생성된 레코드 수: ${records.length}개`);
    console.log(`📊 스킵된 행: ${skipped}개`);

    // 배치 삽입
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const record of batch) {
        values.push(
          `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
        );
        params.push(
          record.id,
          record.categoryId,
          record.majorField,
          record.majorFieldCode,
          record.midField,
          record.midFieldCode,
          record.minorField,
          record.minorFieldCode,
          record.subjectName,
          record.necessityLevel,
          record.subjectType,
        );
      }

      await client.query(
        `
        INSERT INTO ss_category_subject_necessity (
          id, category_id, major_field, major_field_code, mid_field, mid_field_code,
          minor_field, minor_field_code, subject_name, necessity_level, subject_type
        )
        VALUES ${values.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          necessity_level = EXCLUDED.necessity_level,
          subject_type = EXCLUDED.subject_type,
          updated_at = now()
      `,
        params,
      );

      inserted += batch.length;
      process.stdout.write(
        `\r📊 진행률: ${Math.round((inserted / records.length) * 100)}% (${inserted}/${records.length})`,
      );
    }

    console.log('\n✅ Import 완료!');

    // 통계
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT category_id) as categories,
        COUNT(DISTINCT subject_name) as subjects,
        SUM(CASE WHEN necessity_level = 1 THEN 1 ELSE 0 END) as essential,
        SUM(CASE WHEN necessity_level = 2 THEN 1 ELSE 0 END) as recommended,
        SUM(CASE WHEN subject_type = 'inquiry' THEN 1 ELSE 0 END) as inquiry_count,
        SUM(CASE WHEN subject_type = 'major' THEN 1 ELSE 0 END) as major_count
      FROM ss_category_subject_necessity
    `);

    console.log(`\n📊 통계:`);
    console.log(`   - 총 레코드: ${stats.rows[0].total}`);
    console.log(`   - 계열 수: ${stats.rows[0].categories}`);
    console.log(`   - 과목 수: ${stats.rows[0].subjects}`);
    console.log(`   - 필수(1): ${stats.rows[0].essential}`);
    console.log(`   - 권장(2): ${stats.rows[0].recommended}`);
    console.log(`   - 탐구과목: ${stats.rows[0].inquiry_count}`);
    console.log(`   - 주요교과: ${stats.rows[0].major_count}`);

    // 과목별 통계
    const subjectStats = await client.query(`
      SELECT
        subject_name,
        subject_type,
        COUNT(*) as count,
        SUM(CASE WHEN necessity_level = 1 THEN 1 ELSE 0 END) as essential_count,
        SUM(CASE WHEN necessity_level = 2 THEN 1 ELSE 0 END) as recommended_count
      FROM ss_category_subject_necessity
      GROUP BY subject_name, subject_type
      ORDER BY subject_type, subject_name
    `);

    console.log(`\n📚 과목별 통계:`);
    subjectStats.rows.forEach((row) => {
      console.log(
        `   - ${row.subject_name} (${row.subject_type}): ${row.count}개 계열 (필수:${row.essential_count}, 권장:${row.recommended_count})`,
      );
    });
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await client.end();
  }
}

importData().catch(console.error);
