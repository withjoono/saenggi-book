import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import { SusiRecruitmentUnitEntity } from '../src/database/entities/susi/susi-recruitment-unit.entity';
import * as path from 'path';

/**
 * 수시 모집단위 통합 데이터 import 스크립트
 * 파일: uploads/ss_yy_univ_jeonhyung_recruit_id.xlsx
 */

async function importRecruitmentUnits() {
  // DataSource 초기화
  const dataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    entities: [SusiRecruitmentUnitEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // Excel 파일 읽기
    const filePath = path.join(__dirname, '../uploads/ss_yy_univ_jeonhyung_recruit_id.xlsx');
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
    const repository = dataSource.getRepository(SusiRecruitmentUnitEntity);

    // 기존 데이터 개수 확인
    const existingCount = await repository.count();
    console.log(`\n📊 기존 데이터: ${existingCount}개`);

    // 데이터 변환 및 삽입
    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        const entity = repository.create({
          id: row['iid'] || row['id'],
          universityName: row['대학'] || row['universityName'] || '',
          universityCode: row['대학코드'] || row['universityCode'] || '',
          admissionType: row['전형타입'] || row['admissionType'] || '',
          admissionTypeCode: Number(row['전형타입코드'] || row['admissionTypeCode'] || 0),
          admissionName: (row['세부전형'] || row['admissionName'] || '').trim(),
          unitName: row['모집단위'] || row['unitName'] || '',
          region: row['지역(광역)'] || row['region'] || null,
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
importRecruitmentUnits()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
