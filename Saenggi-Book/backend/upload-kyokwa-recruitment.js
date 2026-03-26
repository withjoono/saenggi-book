/**
 * susi_kyokwa_recruitment 테이블에 엑셀 데이터 업로드
 *
 * 사용법:
 * node upload-kyokwa-recruitment.js
 */

const { Pool } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

// PostgreSQL 연결 설정
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

// Excel 파일 경로
const EXCEL_FILE = path.join(__dirname, 'uploads', 'ss_26_kyokwa_recruitment.xlsx');

// Excel 컬럼 → DB 컬럼 매핑
const COLUMN_MAPPING = {
  'ida_new_id': 'ida_id',
  '대학': 'university_name',
  '대학코드': 'university_code',
  '대학설립형태': 'university_type',
  '전형타입': 'admission_type',
  '세부전형': 'admission_name',
  '계열': 'category',  // ← 문과/이과/공통/예체능
  '모집단위': 'recruitment_unit',
  '지역(광역)': 'region_major',
  '지역(세부)': 'region_detail',
  '일반/특별': 'admission_category',
  ' 지원자격': 'qualification',
  '특별전형종류': 'admission_subtype',
  ' 전형요소': 'admission_method',
  ' 최저학력기준': 'minimum_standard',
  ' 진로 선택 과목 평가 방법': 'career_subject_evaluation',
  ' 학년별 반영과목 비율': 'subject_reflection_by_grade',
  '반영과목': 'grade_reflection_ratio',
  '모집인원': 'recruitment_count',
  '대계열': 'major_field',
  '중계열': 'mid_field',
  '소계열': 'minor_field',
  '복수\n지원': 'multiple_application',
  '서류종류': 'required_documents',
  '반영 교과(진로선택과목포함)': 'reflected_subjects',
  '진로선택과목 반영 방법': 'career_selection_subjects',
  '선발모형': 'selection_model',
  '선발비율': 'selection_ratio',
  '1단계전형방법': 'stage1_method',
  '2단계전형방법': 'stage2_method',
  '학생부\n(정량)': 'student_record_quantitative',
  '학생부\n(정성)': 'student_record_qualitative',
  '면접': 'interview_ratio',
  '서류': 'document_ratio',
  '실기': 'practical_ratio',
  '기타': 'etc_ratio',
  '기타내역': 'etc_details',
  '학생부\n활용지표': 'student_record_indicator',
  '반영\n학기': 'reflected_semester',
  '1학년': 'grade1_ratio',
  '2학년': 'grade2_ratio',
  '3학년': 'grade3_ratio',
  '1〮2학년': 'grade12_ratio',
  '2〮3학년': 'grade23_ratio',
  '1〮2〮3학년': 'grade123_ratio',
  '1〮3학년': 'grade13_ratio',
  '교과\n비율': 'subject_ratio',
  '비교과\n비율': 'non_subject_ratio',
  '비교과항목': 'non_subject_items',
  '1등급': 'grade1_score',
  '2등급': 'grade2_score',
  '3등급': 'grade3_score',
  '4등급': 'grade4_score',
  '5등급': 'grade5_score',
  '6등급': 'grade6_score',
  '7등급': 'grade7_score',
  '8등급': 'grade8_score',
  '9등급': 'grade9_score',
  '반영여부': 'reflection_yn',
  '전영역\n응시\n여부': 'all_areas_required',
  '필수\n응시\n과목': 'required_subjects',
  '탐구\n반영\n방법': 'inquiry_reflection_method',
};

// Integer 타입으로 변환해야 하는 컬럼 목록
const INTEGER_COLUMNS = new Set([
  'recruitment_count',
  'selection_ratio',
  'student_record_quantitative',
  'student_record_qualitative',
  'interview_ratio',
  'essay_ratio',
  'practical_ratio',
  'document_ratio',
  'etc_ratio',
  'reflected_semester',
  'grade1_ratio',
  'grade2_ratio',
  'grade3_ratio',
  'grade12_ratio',
  'grade23_ratio',
  'grade123_ratio',
  'grade13_ratio',
  'subject_ratio',
  'non_subject_ratio',
  'grade1_score',
  'grade2_score',
  'grade3_score',
  'grade4_score',
  'grade5_score',
  'grade6_score',
  'grade7_score',
  'grade8_score',
  'grade9_score',
]);

async function uploadData() {
  const client = await pool.connect();

  try {
    console.log('📖 Excel 파일 읽기 중...');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`📊 총 ${data.length}개 행 발견`);

    // 트랜잭션 시작
    await client.query('BEGIN');

    // 기존 데이터 삭제
    console.log('🗑️  기존 데이터 삭제 중...');
    await client.query('DELETE FROM susi_kyokwa_recruitment');
    console.log('✅ 기존 데이터 삭제 완료');

    // ID 시퀀스 리셋
    await client.query('ALTER SEQUENCE susi_kyokwa_recruitment_id_seq RESTART WITH 1');

    // 새 데이터 삽입
    console.log('📥 새 데이터 삽입 중...');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Excel 데이터를 DB 컬럼으로 매핑
        const dbData = {};
        for (const [excelCol, dbCol] of Object.entries(COLUMN_MAPPING)) {
          let value = row[excelCol];

          // 값 정규화
          if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
            value = null;
          } else if (typeof value === 'string') {
            value = value.trim();
          }

          // Integer 컬럼의 경우 소수점 값을 정수로 변환
          if (value !== null && INTEGER_COLUMNS.has(dbCol)) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (!isNaN(numValue)) {
              value = Math.round(numValue);
            }
          }

          dbData[dbCol] = value;
        }

        // SQL 생성
        const columns = Object.keys(dbData).filter(k => dbData[k] !== null);
        const values = columns.map(k => dbData[k]);
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');

        const query = `
          INSERT INTO susi_kyokwa_recruitment (${columns.join(', ')})
          VALUES (${placeholders})
        `;

        await client.query(query, values);
        successCount++;

        if (successCount % 1000 === 0) {
          console.log(`  진행 중... ${successCount}개 삽입 완료`);
        }
      } catch (error) {
        failCount++;
        console.error(`  ❌ 행 ${i + 1} 삽입 실패:`, error.message);
        if (failCount < 5) {
          console.error('     데이터:', JSON.stringify(row, null, 2).substring(0, 200));
        }
      }
    }

    // 커밋
    await client.query('COMMIT');

    console.log('\n✅ 업로드 완료!');
    console.log(`  성공: ${successCount}개`);
    console.log(`  실패: ${failCount}개`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
uploadData().catch(console.error);
