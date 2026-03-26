import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * 종합전형 세부내역 데이터 import 스크립트
 * 파일: uploads/26_jonghap_recruitment.xlsx
 *
 * 데이터 구조:
 * - ida_id, 대학, 대학코드, 전형타입, 전형명, 계열, 모집단위
 * - 지역, 일반/특별, 특별전형종류, 지원자격
 * - 전형방법, 최저학력기준, 모집인원
 * - 대계열, 중계열, 소계열, 대학설립형태
 */

async function importJonghapRecruitment() {
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

    const filePath = path.join(__dirname, '../uploads/ss_26_jonghap_recruitment.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 총 ${data.length}개의 행 발견`);

    if (data.length > 0) {
      console.log('\n첫 번째 행:', data[0]);
      console.log('컬럼명:', Object.keys(data[0]));
    }

    // 테이블 존재 여부 확인
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'susi_jonghap_recruitment'
      );
    `;

    const tableExists = await dataSource.query(tableCheckQuery);
    console.log('\n테이블 존재 여부:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('\n⚠️  susi_jonghap_recruitment 테이블이 존재하지 않습니다.');
      console.log('테이블 생성 중...');

      await dataSource.query(`
        CREATE TABLE susi_jonghap_recruitment (
          id SERIAL PRIMARY KEY,
          ida_id VARCHAR(50) NOT NULL UNIQUE,

          -- 대학 정보
          university_name VARCHAR(200),
          university_code VARCHAR(20),
          university_type VARCHAR(50),

          -- 전형 정보
          admission_type VARCHAR(50),
          admission_name VARCHAR(200),

          -- 모집단위 정보
          category VARCHAR(100),
          recruitment_unit VARCHAR(200),

          -- 지역 정보
          region_major VARCHAR(100),
          region_detail VARCHAR(100),

          -- 전형 구분
          admission_category VARCHAR(20),
          special_admission_types VARCHAR(200),
          qualification TEXT,

          -- 전형 방법
          admission_method TEXT,
          minimum_standard TEXT,
          recruitment_count INTEGER,

          -- 계열 분류
          major_field VARCHAR(100),
          mid_field VARCHAR(100),
          minor_field VARCHAR(200),

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_susi_jonghap_recruitment_ida_id ON susi_jonghap_recruitment(ida_id);
        CREATE INDEX idx_susi_jonghap_recruitment_university_code ON susi_jonghap_recruitment(university_code);
        CREATE INDEX idx_susi_jonghap_recruitment_admission_type ON susi_jonghap_recruitment(admission_type);
        CREATE INDEX idx_susi_jonghap_recruitment_category ON susi_jonghap_recruitment(category);
      `);

      console.log('✅ 테이블 생성 완료');
    }

    const countResult = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_recruitment');
    console.log(`\n📊 기존 데이터: ${countResult[0].count}개`);

    let successCount = 0;
    let errorCount = 0;

    for (const rawRow of data as any[]) {
      // Normalize keys by trimming whitespace
      const row: any = {};
      Object.keys(rawRow).forEach(key => {
        row[key.trim()] = rawRow[key];
      });

      const idaId = String(row['id'] || row['ida_id'] || '');
      if (!idaId) continue;

      try {
        await dataSource.query(
          `INSERT INTO susi_jonghap_recruitment (
            ida_id, university_name, university_code, university_type,
            admission_type, admission_name, category, recruitment_unit,
            region_major, region_detail, admission_category, special_admission_types,
            qualification, admission_method, minimum_standard, recruitment_count,
            major_field, mid_field, minor_field
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          ) ON CONFLICT (ida_id) DO UPDATE SET
            university_name = $2, university_code = $3, university_type = $4,
            admission_type = $5, admission_name = $6, category = $7, recruitment_unit = $8,
            region_major = $9, region_detail = $10, admission_category = $11,
            special_admission_types = $12, qualification = $13, admission_method = $14,
            minimum_standard = $15, recruitment_count = $16, major_field = $17,
            mid_field = $18, minor_field = $19, updated_at = CURRENT_TIMESTAMP
          `,
          [
            idaId,
            row['대학'] || null,
            row['대학코드'] || null,
            row['대학설립형태'] || null,
            row['전형타입'] || null,
            row['세부전형'] || row['전형명'] || null,
            row['계열'] || null,
            row['모집단위'] || null,
            row['지역(광역)'] || null,
            row['지역(세부)'] || null,
            row['일반/특별'] || null,
            row['특별전형종류'] || null,
            row['지원자격'] || null,
            row['전형방법'] || null,
            row['최저학력기준'] || null,
            row['모집인원'] || null,
            row['대계열'] || null,
            row['중계열'] || null,
            row['소계열'] || null
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
        }
      }
    }

    const finalCount = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_recruitment');
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

importJonghapRecruitment()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
