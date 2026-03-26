/**
 * 2024년 정시 DB의 "강원대 - 건축토목환경공학부"에 2024/2025년 입결 데이터 추가
 *
 * 문제:
 * - 2024년 정시 DB: "강원대 - 건축토목환경공학부" (통합)
 * - 2025년 정시 DB: "강원대(춘천) - 토목공학과/환경공학과/건축공학과" (분리)
 * - 엑셀 데이터는 2025년 DB에만 업데이트됨
 */

const XLSX = require('xlsx');
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1', port: 5432, user: 'tsuser',
    password: 'tsuser1234', database: 'geobukschool_dev'
  });
  await client.connect();

  // 1. 엑셀에서 강원대 건축토목환경공학부 데이터 찾기
  console.log('=== 2025년 엑셀 데이터 확인 ===');
  const wb2025 = XLSX.readFile('uploads/2025정시-실제컷-정리.xlsx');
  const data2025 = XLSX.utils.sheet_to_json(wb2025.Sheets[wb2025.SheetNames[0]]);

  const kangwon2025 = data2025.filter(row =>
    row['대학코드'] === 'U504' &&
    (row['모집단위']?.includes('건축') || row['모집단위']?.includes('토목') || row['모집단위']?.includes('환경'))
  );

  console.log('2025년 엑셀 - 강원대 관련 학과:');
  kangwon2025.forEach(row => {
    console.log(`  ${row['모집단위']}: 70%컷=${row['백분위70%컷']}, 50%컷=${row['백분위50%컷']}, 경쟁률=${row['경쟁률']}`);
  });

  console.log('\n=== 2024년 엑셀 데이터 확인 ===');
  const wb2024 = XLSX.readFile('uploads/2024정시-실제컷-정리.xlsx');
  const data2024 = XLSX.utils.sheet_to_json(wb2024.Sheets[wb2024.SheetNames[0]]);

  const kangwon2024 = data2024.filter(row =>
    row['대학코드'] === 'U504' &&
    (row['모집단위']?.includes('건축') || row['모집단위']?.includes('토목') || row['모집단위']?.includes('환경'))
  );

  console.log('2024년 엑셀 - 강원대 관련 학과:');
  kangwon2024.forEach(row => {
    console.log(`  ${row['모집단위']}: 70%컷=${row['백분위70%컷']}, 환산70%=${row['환산점수 70%컷']}, 경쟁률=${row['경쟁률']}`);
  });

  // 2. 2024년 정시 DB에 입결 데이터 추가
  const admissionId = 132; // 강원대 - 건축토목환경공학부

  // 엑셀에서 건축·토목·환경공학부 데이터 사용 (평균값 또는 대표값)
  const excel2024Row = kangwon2024.find(row => row['모집단위']?.includes('건축') && row['모집단위']?.includes('토목'));
  const excel2025Row = kangwon2025.find(row => row['모집단위']?.includes('건축') && row['모집단위']?.includes('토목'));

  if (excel2024Row) {
    console.log('\n=== 2024년 입결 데이터 INSERT ===');
    console.log('사용할 데이터:', excel2024Row);

    // 2024년 입결 레코드 추가 (year=2024)
    const insertResult = await client.query(`
      INSERT INTO ts_regular_admission_previous_results
        (regular_admission_id, year, recruitment_number, competition_ratio, additional_pass_rank, max_cut, converted_score_total, percentile_70)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      admissionId,
      2024,
      excel2024Row['모집인원(최종)'] ? parseInt(excel2024Row['모집인원(최종)']) : null,
      excel2024Row['경쟁률'] ? parseFloat(excel2024Row['경쟁률']) : null,
      excel2024Row['충원합격순위'] ? parseInt(excel2024Row['충원합격순위']) : null,
      excel2024Row['환산점수 70%컷'] ? parseFloat(excel2024Row['환산점수 70%컷']) : null,
      excel2024Row['총점(수능)'] ? parseFloat(excel2024Row['총점(수능)']) : null,
      excel2024Row['백분위70%컷'] ? parseFloat(excel2024Row['백분위70%컷']) : null,
    ]);
    console.log('INSERT 완료: result_id =', insertResult.rows[0].id);
  } else {
    console.log('\n2024년 엑셀에서 건축토목환경공학부 데이터를 찾을 수 없습니다.');
  }

  if (excel2025Row) {
    console.log('\n=== 2025년 입결 데이터 INSERT ===');
    console.log('사용할 데이터:', excel2025Row);

    // 2025년 입결 레코드 추가 (year=2025)
    const insertResult = await client.query(`
      INSERT INTO ts_regular_admission_previous_results
        (regular_admission_id, year, recruitment_number, competition_ratio, additional_pass_rank, min_cut, max_cut, converted_score_total, percentile_50, percentile_70)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      admissionId,
      2025,
      excel2025Row['모집인원(최종)'] ? parseInt(excel2025Row['모집인원(최종)']) : null,
      excel2025Row['경쟁률'] ? parseFloat(excel2025Row['경쟁률']) : null,
      excel2025Row['충원합격순위'] ? parseInt(excel2025Row['충원합격순위']) : null,
      excel2025Row['환산점수 50%컷'] ? parseFloat(excel2025Row['환산점수 50%컷']) : null,
      excel2025Row['환산점수 70%컷'] ? parseFloat(excel2025Row['환산점수 70%컷']) : null,
      excel2025Row['총점(수능)'] ? parseFloat(excel2025Row['총점(수능)']) : null,
      excel2025Row['백분위50%컷'] ? parseFloat(excel2025Row['백분위50%컷']) : null,
      excel2025Row['백분위70%컷'] ? parseFloat(excel2025Row['백분위70%컷']) : null,
    ]);
    console.log('INSERT 완료: result_id =', insertResult.rows[0].id);
  } else {
    console.log('\n2025년 엑셀에서 건축토목환경공학부 데이터를 찾을 수 없습니다.');
  }

  // 3. 결과 확인
  console.log('\n=== 최종 결과 확인 ===');
  const verifyResult = await client.query(`
    SELECT pr.year, pr.percentile_70, pr.percentile_50, pr.max_cut, pr.competition_ratio
    FROM ts_regular_admission_previous_results pr
    WHERE pr.regular_admission_id = $1
    ORDER BY pr.year DESC
  `, [admissionId]);

  console.log('강원대 - 건축토목환경공학부 입결 현황:');
  verifyResult.rows.forEach(row => {
    console.log(`  ${row.year}년: 70%컷=${row.percentile_70}, 50%컷=${row.percentile_50}, 환산=${row.max_cut}, 경쟁률=${row.competition_ratio}`);
  });

  await client.end();
  console.log('\n완료!');
}

main().catch(console.error);
