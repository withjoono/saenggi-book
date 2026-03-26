import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import { SusiCategorySubjectNecessityEntity } from '../src/database/entities/susi/susi-category-subject-necessity.entity';
import * as path from 'path';

/**
 * 계열별 필수과목/권장과목 데이터 import 스크립트
 * 파일: uploads/ss_category_subject_necessity.xlsx
 */

async function importCategorySubjectNecessity() {
  // DataSource 초기화
  const dataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    entities: [SusiCategorySubjectNecessityEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // Excel 파일 읽기 (원본 배열 형식으로)
    const filePath = path.join(__dirname, '../uploads/ss_category_subject_necessity.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log(`📊 총 ${data.length}개의 행 발견`);

    // Row 0: 헤더 (컬럼 인덱스 확인)
    // Row 1: 과목명
    // Row 2부터: 실제 데이터

    if (data.length < 3) {
      throw new Error('데이터가 충분하지 않습니다 (최소 3행 필요)');
    }

    const headerRow = data[0];
    const subjectNameRow = data[1];

    console.log('\n첫 번째 행 (헤더):', headerRow.slice(0, 10));
    console.log('두 번째 행 (과목명):', subjectNameRow.slice(7, 22));

    // 과목명 매핑 생성 (인덱스 7부터 시작, 앞 7개는 계열 정보)
    const subjectStartIndex = 7;
    const inquirySubjects = subjectNameRow.slice(7, 20).filter(s => s); // 탐구과목 (7-19)
    const majorSubjects = subjectNameRow.slice(20).filter(s => s); // 주요교과 (20-)

    console.log('\n탐구과목:', inquirySubjects);
    console.log('주요교과:', majorSubjects);

    // 테이블 존재 여부 확인
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'ss_category_subject_necessity'
      );
    `;

    const tableExists = await dataSource.query(tableCheckQuery);
    console.log('\n테이블 존재 여부:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('\n⚠️  ss_category_subject_necessity 테이블이 존재하지 않습니다.');
      console.log('테이블 생성 중...');

      await dataSource.query(`
        CREATE TABLE ss_category_subject_necessity (
          id VARCHAR(100) PRIMARY KEY,
          category_id VARCHAR(20) NOT NULL,
          major_field VARCHAR(50) NOT NULL,
          major_field_code INTEGER NOT NULL,
          mid_field VARCHAR(50) NOT NULL,
          mid_field_code INTEGER NOT NULL,
          minor_field VARCHAR(100) NOT NULL,
          minor_field_code INTEGER NOT NULL,
          subject_name VARCHAR(50) NOT NULL,
          necessity_level INTEGER NOT NULL,
          subject_type VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_ss_category_subject_necessity_category_subject ON ss_category_subject_necessity(category_id, subject_name);
        CREATE INDEX idx_ss_category_subject_necessity_major_subject ON ss_category_subject_necessity(major_field_code, subject_name);
        CREATE INDEX idx_ss_category_subject_necessity_mid_subject ON ss_category_subject_necessity(mid_field_code, subject_name);
        CREATE INDEX idx_ss_category_subject_necessity_minor_subject ON ss_category_subject_necessity(minor_field_code, subject_name);
        CREATE INDEX idx_ss_category_subject_necessity_category_id ON ss_category_subject_necessity(category_id);
      `);

      console.log('✅ 테이블 생성 완료');
    }

    // Repository 가져오기
    const repository = dataSource.getRepository(SusiCategorySubjectNecessityEntity);

    // 기존 데이터 개수 확인
    const existingCount = await repository.count();
    console.log(`\n📊 기존 데이터: ${existingCount}개`);

    // 데이터 변환 및 삽입
    let successCount = 0;
    let errorCount = 0;
    let totalRecords = 0;

    // Row 2부터 실제 데이터 처리
    for (let rowIndex = 2; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      // 계열 정보 추출
      const categoryId = String(row[0] || '');
      const majorField = String(row[1] || '');
      const majorFieldCode = Number(row[2] || 0);
      const midField = String(row[3] || '');
      const midFieldCode = Number(row[4] || 0);
      const minorField = String(row[5] || '');
      const minorFieldCode = Number(row[6] || 0);

      if (!categoryId || !majorField) {
        continue; // 빈 행 스킵
      }

      // 각 과목에 대해 필수/권장 수준 확인 및 저장
      for (let colIndex = subjectStartIndex; colIndex < row.length; colIndex++) {
        const necessityLevel = Number(row[colIndex]);

        // 값이 없거나 0이면 스킵 (해당 과목이 이 계열과 관련 없음)
        if (!necessityLevel || necessityLevel === 0) {
          continue;
        }

        // 과목명 가져오기
        const subjectName = subjectNameRow[colIndex];
        if (!subjectName) {
          continue;
        }

        // 과목 유형 결정 (7-19: inquiry, 20-: major)
        const subjectType = colIndex < 20 ? 'inquiry' : 'major';

        try {
          const id = `${categoryId}_${subjectName}`;

          const entity = repository.create({
            id,
            categoryId,
            majorField,
            majorFieldCode,
            midField,
            midFieldCode,
            minorField,
            minorFieldCode,
            subjectName,
            necessityLevel,
            subjectType,
          });

          await repository.save(entity);
          totalRecords++;

          if (totalRecords % 100 === 0) {
            console.log(`진행 중: ${totalRecords} 레코드 생성됨 (Row ${rowIndex}/${data.length})`);
          }
        } catch (error) {
          errorCount++;
          if (errorCount <= 5) {
            console.error(`❌ 에러 발생 (Row ${rowIndex}, 과목: ${subjectName}):`, error.message);
          }
        }
      }

      successCount++;
    }

    console.log(`\n✅ Import 완료!`);
    console.log(`   - 처리된 계열: ${successCount}개`);
    console.log(`   - 생성된 레코드: ${totalRecords}개`);
    console.log(`   - 실패: ${errorCount}개`);
    console.log(`   - 총 DB 데이터: ${await repository.count()}개`);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ 데이터베이스 연결 종료');
  }
}

// 실행
importCategorySubjectNecessity()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
