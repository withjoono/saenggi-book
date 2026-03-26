import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import { SusiUnitCategoryEntity } from '../src/database/entities/susi/susi-unit-category.entity';
import * as path from 'path';

/**
 * 수시 모집단위 계열 분류 Excel 데이터 import 스크립트
 * 파일: uploads/26_univ_unit_category.xlsx
 */

async function importUnitCategories() {
  // DataSource 초기화
  const dataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    entities: [SusiUnitCategoryEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // Excel 파일 읽기
    const filePath = path.join(__dirname, '../uploads/26_univ_unit_category.xlsx');
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
    const repository = dataSource.getRepository(SusiUnitCategoryEntity);

    // 기존 데이터 개수 확인
    const existingCount = await repository.count();
    console.log(`\n📊 기존 데이터: ${existingCount}개`);

    // 데이터 변환 및 삽입
    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        // Excel 컬럼명에 맞춰 매핑 (실제 컬럼명은 Excel 파일 확인 필요)
        const entity = repository.create({
          id: row['모집단위ID'] || row['id'] || row['ID'],
          fieldCode: String(row['계열코드'] || row['fieldCode'] || ''),
          majorField: row['대계열'] || row['majorField'] || '',
          majorFieldCode: Number(row['대계열코드'] || row['majorFieldCode'] || 0),
          midField: row['중계열'] || row['midField'] || '',
          midFieldCode: Number(row['중계열코드'] || row['midFieldCode'] || 0),
          minorField: row['소계열'] || row['minorField'] || '',
          minorFieldCode: Number(row['소계열코드'] || row['minorFieldCode'] || 0),
        });

        await repository.save(entity);
        successCount++;

        if (successCount % 100 === 0) {
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
importUnitCategories()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
