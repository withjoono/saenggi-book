const XLSX = require('xlsx');
const path = require('path');
const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

const excelPath = path.join(__dirname, 'uploads', 'ss_jonghap_ipkyul_26.xlsx');

// 소수점 값을 정수로 반올림하는 함수
function toInt(value) {
  if (value === null || value === undefined || value === 0) return null;
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? null : Math.round(num);
}

// 소수점 값을 그대로 유지하는 함수
function toDecimal(value) {
  if (value === null || value === undefined || value === 0) return null;
  return value;
}

async function uploadData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_DATABASE || 'geobukschool_dev',
  });

  try {
    console.log('🔌 데이터베이스 연결 중...');
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공!\n');

    console.log('🗑️  기존 데이터 삭제 중...');
    await dataSource.query('DELETE FROM susi_jonghap_ipkyul');
    console.log('✅ 기존 데이터 삭제 완료!\n');

    console.log('📖 엑셀 파일 읽는 중...');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`✅ 총 ${data.length}개 행 읽기 완료!\n`);

    console.log('🔧 데이터 정제 및 삽입 중...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        await dataSource.query(`
          INSERT INTO susi_jonghap_ipkyul (
            ida_id,
            grade_avg, grade_70p_cut, grade_90p_cut,
            recruitment_2023, competition_rate_2023, additional_pass_rank_2023,
            actual_competition_rate_2023, grade_50p_2023, grade_70p_2023,
            recruitment_2024, competition_rate_2024, additional_pass_rank_2024,
            actual_competition_rate_2024, grade_50p_2024, grade_70p_2024,
            recruitment_2025, competition_rate_2025, additional_pass_rank_2025,
            actual_competition_rate_2025, grade_50p_2025, grade_70p_2025,
            recruitment_2026, competition_rate_2026, additional_pass_rank_2026,
            actual_competition_rate_2026, grade_50p_2026, grade_70p_2026
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22,
            $23, $24, $25, $26, $27, $28
          )
        `, [
          row.id,
          // 평균 등급
          toDecimal(row['등급평균']),
          toDecimal(row['등급최초합컷']),
          toDecimal(row['등급추합컷']),
          // 2023 - 모집인원과 충원합격은 정수로 반올림
          toInt(row['2023모집인원']), 
          toDecimal(row['2023경쟁률']), 
          toInt(row['2023충원합격']),
          toDecimal(row['2023실질경쟁율']), 
          toDecimal(row['2023등급_50%']), 
          toDecimal(row['2023등급_70%']),
          // 2024
          toInt(row['2024모집인원']), 
          toDecimal(row['2024경쟁률']), 
          toInt(row['2024충원합격']),
          toDecimal(row['2024실질경쟁율']), 
          toDecimal(row['2024등급_50%']), 
          toDecimal(row['2024등급_70%']),
          // 2025
          toInt(row['2025모집인원']), 
          toDecimal(row['2025경쟁률']), 
          toInt(row['2025충원합격']),
          toDecimal(row['2025실질경쟁율']), 
          toDecimal(row['2025등급_50%']), 
          toDecimal(row['2025등급_70%']),
          // 2026
          toInt(row['2026모집인원']), 
          toDecimal(row['2026경쟁률']), 
          toInt(row['2026충원합격']),
          toDecimal(row['2026실질경쟁율']), 
          toDecimal(row['2026등급_50%']), 
          toDecimal(row['2026등급_70%'])
        ]);
        
        successCount++;
        
        if ((i + 1) % 1000 === 0) {
          console.log(`  진행: ${i + 1}/${data.length} (${((i + 1) / data.length * 100).toFixed(1)}%)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ 에러 (행 ${i + 1}, ID: ${row.id}):`, error.message);
      }
    }

    console.log('\n✅ 데이터 삽입 완료!');
    console.log(`  성공: ${successCount}개`);
    console.log(`  실패: ${errorCount}개`);

    const result = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_ipkyul');
    console.log(`\n📊 최종 DB 레코드 수: ${result[0].count}개`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 데이터베이스 연결 종료');
    }
  }
}

uploadData();