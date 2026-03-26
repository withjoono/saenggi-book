import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * 교과 전형 세부내역 데이터 import 스크립트
 * 파일: uploads/26_kyokwa_recruitment.xlsx
 *
 * 데이터 구조: 교과 전형의 모든 세부 사항 (70+ 컬럼)
 */

async function importKyokwaRecruitment() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    entities: [],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    const filePath = path.join(__dirname, '../uploads/ss_26_kyokwa_recruitment.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 총 ${data.length}개의 행 발견`);

    if (data.length > 0) {
      console.log('\n컬럼 개수:', Object.keys(data[0]).length);
      console.log('First Row Keys:', Object.keys(data[0]));
    }

    // 테이블 존재 여부 확인
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'susi_kyokwa_recruitment'
      );
    `;

    const tableExists = await dataSource.query(tableCheckQuery);
    console.log('\n테이블 존재 여부:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('\n⚠️  susi_kyokwa_recruitment 테이블이 존재하지 않습니다.');
      console.log('테이블 생성 중...');

      await dataSource.query(`
        CREATE TABLE susi_kyokwa_recruitment (
          id SERIAL PRIMARY KEY,
          ida_id VARCHAR(50) NOT NULL UNIQUE,

          -- 기본 정보
          university_name VARCHAR(200),
          university_code VARCHAR(20),
          university_type VARCHAR(50),
          admission_type VARCHAR(50),
          admission_name VARCHAR(200),
          category VARCHAR(100),
          recruitment_unit VARCHAR(200),

          -- 지역
          region_major VARCHAR(100),
          region_detail VARCHAR(100),

          -- 전형 구분
          admission_category VARCHAR(20),
          qualification TEXT,

          -- 전형 방법
          admission_method TEXT,
          minimum_standard TEXT,
          career_subject_evaluation TEXT,
          subject_reflection_by_grade TEXT,
          recruitment_count INTEGER,

          -- 계열 분류
          major_field VARCHAR(100),
          mid_field VARCHAR(100),
          minor_field VARCHAR(200),

          -- 기타 정보
          multiple_application VARCHAR(20),
          required_documents TEXT,
          grade_reflection_ratio TEXT,
          reflected_subjects TEXT,
          career_selection_subjects TEXT,

          -- 선발 방식
          selection_model VARCHAR(100),
          selection_ratio INTEGER,
          stage1_method TEXT,
          stage2_method TEXT,

          -- 전형 요소별 비율
          student_record_quantitative INTEGER,
          student_record_qualitative INTEGER,
          interview_ratio INTEGER,
          essay_ratio INTEGER,
          practical_ratio INTEGER,
          document_ratio INTEGER,
          etc_ratio INTEGER,
          etc_details TEXT,

          -- 학생부 활용
          student_record_indicator VARCHAR(100),
          reflected_semester INTEGER,
          grade1_ratio INTEGER,
          grade2_ratio INTEGER,
          grade3_ratio INTEGER,
          grade12_ratio INTEGER,
          grade23_ratio INTEGER,
          grade123_ratio INTEGER,
          grade13_ratio INTEGER,

          -- 교과/비교과
          subject_ratio INTEGER,
          non_subject_ratio INTEGER,
          non_subject_items TEXT,

          -- 등급별 환산점수
          grade1_score INTEGER,
          grade2_score INTEGER,
          grade3_score INTEGER,
          grade4_score INTEGER,
          grade5_score INTEGER,
          grade6_score INTEGER,
          grade7_score INTEGER,
          grade8_score INTEGER,
          grade9_score INTEGER,

          -- 반영 교과 및 기타
          reflected_subjects_detail TEXT,
          career_subject_method TEXT,
          reflection_yn VARCHAR(5),
          all_areas_required VARCHAR(20),
          required_subjects TEXT,
          inquiry_reflection_method TEXT,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_susi_kyokwa_recruitment_ida_id ON susi_kyokwa_recruitment(ida_id);
        CREATE INDEX idx_susi_kyokwa_recruitment_university_code ON susi_kyokwa_recruitment(university_code);
        CREATE INDEX idx_susi_kyokwa_recruitment_admission_type ON susi_kyokwa_recruitment(admission_type);
      `);

      console.log('✅ 테이블 생성 완료');
    }

    const countResult = await dataSource.query('SELECT COUNT(*) as count FROM susi_kyokwa_recruitment');
    console.log(`\n📊 기존 데이터: ${countResult[0].count}개`);

    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      const idaId = String(row['ida_new_id'] || '');
      if (!idaId) continue;

      try {
        await dataSource.query(
          `INSERT INTO susi_kyokwa_recruitment (
            ida_id, university_name, university_code, university_type,
            admission_type, admission_name, category, recruitment_unit,
            region_major, region_detail, admission_category, qualification,
            admission_method, minimum_standard, career_subject_evaluation,
            subject_reflection_by_grade, recruitment_count,
            major_field, mid_field, minor_field,
            multiple_application, required_documents, grade_reflection_ratio,
            reflected_subjects, career_selection_subjects,
            selection_model, selection_ratio, stage1_method, stage2_method,
            student_record_quantitative, student_record_qualitative,
            interview_ratio, essay_ratio, practical_ratio, document_ratio,
            etc_ratio, etc_details,
            student_record_indicator, reflected_semester,
            grade1_ratio, grade2_ratio, grade3_ratio,
            grade12_ratio, grade23_ratio, grade123_ratio, grade13_ratio,
            subject_ratio, non_subject_ratio, non_subject_items,
            grade1_score, grade2_score, grade3_score, grade4_score, grade5_score,
            grade6_score, grade7_score, grade8_score, grade9_score,
            reflected_subjects_detail, career_subject_method,
            reflection_yn, all_areas_required, required_subjects, inquiry_reflection_method
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
            $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
            $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64
          ) ON CONFLICT (ida_id) DO UPDATE SET
            university_name = $2, university_code = $3, university_type = $4,
            admission_type = $5, admission_name = $6, category = $7, recruitment_unit = $8,
            region_major = $9, region_detail = $10, admission_category = $11, qualification = $12,
            admission_method = $13, minimum_standard = $14, career_subject_evaluation = $15,
            subject_reflection_by_grade = $16, recruitment_count = $17,
            major_field = $18, mid_field = $19, minor_field = $20,
            multiple_application = $21, required_documents = $22, grade_reflection_ratio = $23,
            reflected_subjects = $24, career_selection_subjects = $25,
            selection_model = $26, selection_ratio = $27, stage1_method = $28, stage2_method = $29,
            student_record_quantitative = $30, student_record_qualitative = $31,
            interview_ratio = $32, essay_ratio = $33, practical_ratio = $34, document_ratio = $35,
            etc_ratio = $36, etc_details = $37,
            student_record_indicator = $38, reflected_semester = $39,
            grade1_ratio = $40, grade2_ratio = $41, grade3_ratio = $42,
            grade12_ratio = $43, grade23_ratio = $44, grade123_ratio = $45, grade13_ratio = $46,
            subject_ratio = $47, non_subject_ratio = $48, non_subject_items = $49,
            grade1_score = $50, grade2_score = $51, grade3_score = $52, grade4_score = $53,
            grade5_score = $54, grade6_score = $55, grade7_score = $56, grade8_score = $57,
            grade9_score = $58, reflected_subjects_detail = $59, career_subject_method = $60,
            reflection_yn = $61, all_areas_required = $62, required_subjects = $63,
            inquiry_reflection_method = $64, updated_at = CURRENT_TIMESTAMP
          `,
          [
            idaId,
            row['대학'] || null,
            row['대학코드'] || null,
            row['대학설립형태'] || null,
            row['전형타입'] || null,
            row['세부전형'] || null,
            row['계열'] || null,
            row['모집단위'] || null,
            row['지역(광역)'] || null,
            row['지역(세부)'] || null,
            row['일반/특별'] || null,
            row['지원자격'] || null,
            row['전형방법'] || null,
            row['최저학력기준'] || null,
            row['진로 선택 과목 평가 방법'] || null,
            row['학년별 반영과목 비율'] || null,
            row['모집인원'] || null,
            row['대계열'] || null,
            row['중계열'] || null,
            row['소계열'] || null,
            row['복수\r\n지원'] || null,
            row['필요\r\n서류'] || null,
            row['학년별반영비율'] || null,
            row['반영과목'] || null,
            row['진로선택과목'] || null,
            row['선발모형'] || null,
            row['선발비율'] || null,
            row['1단계전형방법'] || null,
            row['2단계전형방법'] || null,
            row['학생부\r\n(정량)'] || null,
            row['학생부\r\n(정성)'] || null,
            row['면접'] || null,
            row['논술'] || null,
            row['실기'] || null,
            row['서류'] || null,
            row['기타'] || null,
            row['기타내역'] || null,
            row['학생부\r\n활용지표'] || null,
            row['반영\r\n학기'] || null,
            row['1학년'] || null,
            row['2학년'] || null,
            row['3학년'] || null,
            row['1〮2학년'] || null,
            row['2〮3학년'] || null,
            row['1〮2〮3학년'] || null,
            row['1〮3학년'] || null,
            row['교과\r\n비율'] || null,
            row['비교과\r\n비율'] || null,
            row['비교과항목'] || null,
            row['1등급'] || null,
            row['2등급'] || null,
            row['3등급'] || null,
            row['4등급'] || null,
            row['5등급'] || null,
            row['6등급'] || null,
            row['7등급'] || null,
            row['8등급'] || null,
            row['9등급'] || null,
            row['반영 교과(진로선택과목포함)'] || null,
            row['진로선택과목 반영 방법'] || null,
            row['반영여부'] || null,
            row['전영역\r\n응시\r\n여부'] || null,
            row['필수\r\n응시\r\n과목'] || null,
            row['탐구\r\n반영\r\n방법'] || null
          ]
        );

        successCount++;
        if (successCount % 500 === 0) {
          console.log(`진행 중: ${successCount}/${data.length}`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.error(`❌ 에러 발생 (ID: ${idaId}):`, error.message);
          console.log('Row Data:', JSON.stringify(row));
        }
      }
    }

    const finalCount = await dataSource.query('SELECT COUNT(*) as count FROM susi_kyokwa_recruitment');
    console.log(`\n✅ Import 완료!`);
    console.log(`   - 성공: ${successCount}개`);
    console.log(`   - 실패: ${errorCount}개`);
    console.log(`   - 총 데이터: ${finalCount[0].count}개`);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ 데이터베이스 연결 종료');
  }
}

importKyokwaRecruitment()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
