import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import { OfficerEvaluationSurveyEntity } from '../src/database/entities/officer-evaluation/officer-evaluation-survey.entity';
import * as path from 'path';

/**
 * 생기부 평가 공통질문지 데이터 import 스크립트
 * 파일: uploads/sanggibu_evaluation_question.xlsx
 */

async function importEvaluationQuestions() {
  // DataSource 초기화
  const dataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    entities: [OfficerEvaluationSurveyEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // Excel 파일 읽기
    const filePath = path.join(__dirname, '../uploads/sanggibu_evaluation_question.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 총 ${data.length}개의 행 발견`);

    // 첫 번째 행 출력 (데이터 구조 확인)
    if (data.length > 0) {
      console.log('\n첫 번째 행 데이터:');
      console.log(data[0]);
      console.log('\n컬럼명:', Object.keys(data[0]));
    }

    // Repository 가져오기
    const repository = dataSource.getRepository(OfficerEvaluationSurveyEntity);

    // 기존 데이터 개수 확인
    const existingCount = await repository.count();
    console.log(`\n📊 기존 데이터: ${existingCount}개`);

    // 데이터 변환 및 삽입
    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        // 대분류(텍스트만) 매핑
        const categoryText = row['대분류_1'] || row['__EMPTY'] || '';
        let mainSurveyType = '';

        // 카테고리 매핑 로직
        if (categoryText.includes('진로')) {
          mainSurveyType = 'JINRO';
        } else if (categoryText.includes('학업')) {
          mainSurveyType = 'HAKUP';
        } else if (categoryText.includes('공동체')) {
          mainSurveyType = 'GONGDONG';
        } else {
          mainSurveyType = 'ETC';
        }

        const entity = repository.create({
          evaluate_content: row['소분류'] || '',
          order_num: Number(row['질문번호'] || 0),
          main_survey_type: mainSurveyType,
        });

        await repository.save(entity);
        successCount++;

        if (successCount % 20 === 0) {
          console.log(`진행 중: ${successCount}/${data.length}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ 에러 발생 (행 ${successCount + errorCount}):`, error.message);
      }
    }

    console.log(`\n✅ Import 완료!`);
    console.log(`   - 성공: ${successCount}개`);
    console.log(`   - 실패: ${errorCount}개`);
    console.log(`   - 총 데이터: ${await repository.count()}개`);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ 데이터베이스 연결 종료');
  }
}

// 실행
importEvaluationQuestions()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
