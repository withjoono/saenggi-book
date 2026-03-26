import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * 생기부 평가 요소별 코드와 질문번호 데이터 import 스크립트
 * 파일: uploads/sanggibu_evaluation_items.xlsx
 *
 * Note: 이 데이터를 저장할 엔티티가 아직 정의되지 않았을 수 있습니다.
 * 필요시 간단한 테이블을 생성하여 저장합니다.
 */

// 임시 엔티티 정의 (실제 엔티티가 없는 경우를 대비)
interface EvaluationItem {
  code: string;
  evaluation_element: string;
  question_numbers: string;
}

async function importEvaluationItems() {
  // DataSource 초기화
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

    // Excel 파일 읽기
    const filePath = path.join(__dirname, '../uploads/sanggibu_evaluation_items.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log(`📊 총 ${data.length}개의 행 발견`);

    console.log('\n첫 5개 행:');
    data.slice(0, 5).forEach((row, i) => {
      console.log(`Row ${i}:`, row);
    });

    // 테이블 존재 여부 확인
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'officer_evaluation_items'
      );
    `;

    const tableExists = await dataSource.query(tableCheckQuery);
    console.log('\n테이블 존재 여부:', tableExists[0].exists);

    // 테이블이 없으면 생성
    if (!tableExists[0].exists) {
      console.log('\n⚠️  officer_evaluation_items 테이블이 존재하지 않습니다.');
      console.log('테이블 생성 중...');

      await dataSource.query(`
        CREATE TABLE officer_evaluation_items (
          id SERIAL PRIMARY KEY,
          code VARCHAR(10) NOT NULL UNIQUE,
          evaluation_element VARCHAR(200) NOT NULL,
          question_numbers TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ 테이블 생성 완료');
    }

    // 기존 데이터 개수 확인
    const countResult = await dataSource.query('SELECT COUNT(*) as count FROM officer_evaluation_items');
    console.log(`\n📊 기존 데이터: ${countResult[0].count}개`);

    // 데이터 변환 및 삽입
    let successCount = 0;
    let errorCount = 0;

    // Row 1부터 실제 데이터 처리 (Row 0은 헤더)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const code = String(row[0] || '');
      const evaluationElement = String(row[1] || '');
      const questionNumbers = String(row[2] || '');

      if (!code || !evaluationElement) {
        continue; // 빈 행 스킵
      }

      try {
        await dataSource.query(
          `INSERT INTO officer_evaluation_items (code, evaluation_element, question_numbers)
           VALUES ($1, $2, $3)
           ON CONFLICT (code) DO UPDATE
           SET evaluation_element = $2, question_numbers = $3, updated_at = CURRENT_TIMESTAMP`,
          [code, evaluationElement, questionNumbers]
        );

        successCount++;

        if (successCount % 20 === 0) {
          console.log(`진행 중: ${successCount}/${data.length - 1}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ 에러 발생 (행 ${i}, 코드: ${code}):`, error.message);
      }
    }

    const finalCount = await dataSource.query('SELECT COUNT(*) as count FROM officer_evaluation_items');
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

// 실행
importEvaluationItems()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
