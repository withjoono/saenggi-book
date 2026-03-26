const XLSX = require('xlsx');
const { DataSource } = require('typeorm');

async function uploadJonghapSpecial() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    synchronize: false,
  });

  try {
    console.log('📊 데이터베이스 연결 중...');
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // Excel 파일 읽기
    console.log('\n📖 Excel 파일 읽는 중...');
    const workbook = XLSX.readFile('uploads/ss_jonghap_special_26.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { range: 1 });
    console.log(`✅ ${data.length}개의 행을 읽었습니다.`);

    // 기존 데이터 삭제
    console.log('\n🗑️  기존 데이터 삭제 중...');
    const deleteResult = await dataSource.query('DELETE FROM susi_jonghap_special');
    console.log(`✅ 기존 데이터 삭제 완료 (${deleteResult[1]} 행 삭제됨)`);

    // 새 데이터 삽입
    console.log('\n📥 새 데이터 삽입 중...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        await dataSource.query(
          `INSERT INTO susi_jonghap_special (
            ida_id,
            admission_category,
            special_admission_types,
            qualification_2026,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [
            row['id'] || null,
            row['일반/특별'] || null,
            row['특별전형종류'] || null,
            row[' 지원자격'] || null,
          ]
        );
        successCount++;

        if ((i + 1) % 1000 === 0) {
          console.log(`   진행률: ${i + 1}/${data.length} (${Math.round((i + 1) / data.length * 100)}%)`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          row: i + 2,
          id: row['id'],
          error: error.message,
        });

        if (errorCount <= 5) {
          console.error(`   ❌ 행 ${i + 2} 삽입 실패 (ID: ${row['id']}): ${error.message}`);
        }
      }
    }

    console.log('\n✅ 데이터 업로드 완료!');
    console.log(`   성공: ${successCount}개`);
    console.log(`   실패: ${errorCount}개`);

    if (errorCount > 0) {
      console.log('\n⚠️  에러 발생:');
      errors.slice(0, 10).forEach(err => {
        console.log(`   - 행 ${err.row} (ID: ${err.id}): ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`   ... 그 외 ${errors.length - 10}개의 에러`);
      }
    }

    // 최종 통계
    const countResult = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_special');
    console.log(`\n📊 최종 테이블 행 수: ${countResult[0].count}`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('\n🔌 데이터베이스 연결 종료');
  }
}

uploadJonghapSpecial()
  .then(() => {
    console.log('\n✨ 모든 작업 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 치명적 에러:', error);
    process.exit(1);
  });
