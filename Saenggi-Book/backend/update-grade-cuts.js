const XLSX = require('xlsx');
const path = require('path');
const { DataSource } = require('typeorm');
require('dotenv').config();

async function updateGradeCuts() {
  // 데이터베이스 연결
  const dbConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'geobukschool_dev',
    entities: [],
    logging: false,
  };

  // 비밀번호가 설정된 경우에만 추가
  if (process.env.DB_PASSWORD) {
    dbConfig.password = process.env.DB_PASSWORD;
  }

  console.log('DB 설정:', {
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    database: dbConfig.database,
    hasPassword: !!dbConfig.password
  });

  const dataSource = new DataSource(dbConfig);

  try {
    console.log('데이터베이스 연결 중...');
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공!\n');

    // Excel 파일 읽기
    const excelPath = path.join(__dirname, 'uploads', '교과 학종 out 240823.xlsx');
    console.log('Excel 파일 읽기:', excelPath);

    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets['교과'];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('총 데이터 행 수:', data.length - 2, '\n');

    // 헤더는 행 1 (행 0은 비어있음)
    // 데이터는 행 2부터 시작
    let successCount = 0;
    let failCount = 0;
    let notFoundCount = 0;

    console.log('업데이트 시작...\n');

    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      const unifiedId = row[0]; // new id (unified_id)
      const gradeCut50 = row[108]; // 최초컷 (50%컷)
      const gradeCut70 = row[109]; // 추합컷 (70%컷)

      // unified_id가 없는 경우 스킵
      if (!unifiedId) {
        continue;
      }

      try {
        // 데이터 업데이트
        const result = await dataSource.query(
          `UPDATE susi_subject_tb
           SET grade_cut = ?,
               grade_cut_70 = ?
           WHERE unified_id = ?`,
          [
            gradeCut50 !== undefined && gradeCut50 !== null ? gradeCut50.toString() : null,
            gradeCut70 !== undefined && gradeCut70 !== null ? gradeCut70.toString() : null,
            unifiedId
          ]
        );

        if (result.affectedRows > 0) {
          successCount++;
          if (successCount % 1000 === 0) {
            console.log(`진행 중... ${successCount}개 업데이트 완료`);
          }
        } else {
          notFoundCount++;
          if (notFoundCount <= 10) {
            console.log(`경고: unified_id '${unifiedId}'를 찾을 수 없습니다.`);
          }
        }
      } catch (error) {
        failCount++;
        if (failCount <= 10) {
          console.error(`에러 (행 ${i}, unified_id: ${unifiedId}):`, error.message);
        }
      }
    }

    console.log('\n\n=== 업데이트 완료 ===');
    console.log('성공:', successCount, '개');
    console.log('실패:', failCount, '개');
    console.log('찾을 수 없음:', notFoundCount, '개');

    // 샘플 데이터 확인
    console.log('\n\n=== 업데이트된 데이터 샘플 ===');
    const samples = await dataSource.query(
      `SELECT unified_id, university_name, recruitment_unit_name,
              grade_cut, grade_cut_70
       FROM susi_subject_tb
       WHERE grade_cut IS NOT NULL
       LIMIT 5`
    );

    samples.forEach(sample => {
      console.log(`${sample.unified_id}: ${sample.university_name} ${sample.recruitment_unit_name}`);
      console.log(`  50%컷: ${sample.grade_cut}, 70%컷: ${sample.grade_cut_70}`);
    });

  } catch (error) {
    console.error('에러 발생:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n데이터베이스 연결 종료');
    }
  }
}

updateGradeCuts();
