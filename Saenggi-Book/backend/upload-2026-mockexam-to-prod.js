/**
 * 2026 표점 백분 등급 변환표를 운영 DB에 업로드하는 스크립트
 *
 * 사용법:
 * 1. Cloud SQL Proxy 실행: cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-sql --port 5434
 * 2. node upload-2026-mockexam-to-prod.js
 */

const { Client } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

// 운영 DB 설정
const prodConfig = {
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
};

// 로컬 DB 설정 (테스트용)
const localConfig = {
  host: '127.0.0.1',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
};

async function uploadMockExamData(config, isProduction = false) {
  const client = new Client(config);
  const dbName = isProduction ? '운영' : '로컬';

  try {
    console.log(`\n${dbName} DB 연결 중...`);
    await client.connect();
    console.log(`${dbName} DB 연결 성공!`);

    // 엑셀 파일 읽기
    const filePath = path.join(__dirname, 'uploads', '2026 표점 백분 등급 변환표.xlsx');
    console.log(`\n엑셀 파일 읽는 중: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    console.log(`총 ${sheet.length - 1}개 레코드 처리 예정`);

    // 기존 데이터 백업 (카운트)
    const countResult = await client.query('SELECT COUNT(*) FROM mockexam_raw_to_standard_tb');
    console.log(`\n기존 데이터: ${countResult.rows[0].count}개`);

    // 샘플 데이터 확인 (업데이트 전)
    const beforeSample = await client.query(`
      SELECT code, raw_score_common, raw_score_select, standard_score, percentile
      FROM mockexam_raw_to_standard_tb
      WHERE code = '언매' AND raw_score_common = '76' AND raw_score_select = '24'
      LIMIT 1
    `);
    if (beforeSample.rows.length > 0) {
      console.log('업데이트 전 샘플 (언매, 76, 24):', beforeSample.rows[0]);
    }

    // 사용자 확인
    console.log(`\n⚠️  ${dbName} DB의 mockexam_raw_to_standard_tb 테이블을 초기화하고 새 데이터를 입력합니다.`);
    console.log('계속하려면 3초 대기...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 기존 데이터 삭제
    console.log('\n기존 데이터 삭제 중...');
    await client.query('DELETE FROM mockexam_raw_to_standard_tb');
    console.log('기존 데이터 삭제 완료');

    // 새 데이터 삽입
    console.log('\n새 데이터 삽입 중...');
    const CHUNK_SIZE = 500;
    let processCount = 0;

    for (let i = 1; i < sheet.length; i += CHUNK_SIZE) {
      const chunk = sheet.slice(i, Math.min(i + CHUNK_SIZE, sheet.length));

      const values = [];
      const placeholders = [];
      let paramIndex = 1;

      for (const row of chunk) {
        if (!row[1]) continue; // 과목명이 없으면 스킵

        const code = (String(row[1]) || '').trim();
        const rawScoreCommon = (String(row[2]) || '').trim();
        const rawScoreSelect = (String(row[3]) || '').trim();
        const standardScore = (String(row[4]) || '').trim();
        const percentile = row[5] || 0;
        const grade = row[6] || null;
        const topCumulative = row[7] || 0;

        values.push(code, rawScoreCommon, rawScoreSelect, standardScore, percentile, grade, topCumulative);
        placeholders.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6})`);
        paramIndex += 7;
      }

      if (placeholders.length > 0) {
        const query = `
          INSERT INTO mockexam_raw_to_standard_tb
          (code, raw_score_common, raw_score_select, standard_score, percentile, grade, top_cumulative)
          VALUES ${placeholders.join(', ')}
        `;
        await client.query(query, values);
        processCount += placeholders.length;
        console.log(`${processCount}개 처리 완료...`);
      }
    }

    console.log(`\n✅ 총 ${processCount}개 레코드 삽입 완료!`);

    // 샘플 데이터 확인 (업데이트 후)
    const afterSample = await client.query(`
      SELECT code, raw_score_common, raw_score_select, standard_score, percentile
      FROM mockexam_raw_to_standard_tb
      WHERE code = '언매' AND raw_score_common = '76' AND raw_score_select = '24'
      LIMIT 1
    `);
    if (afterSample.rows.length > 0) {
      console.log('\n업데이트 후 샘플 (언매, 76, 24):', afterSample.rows[0]);
    }

    // 최종 카운트 확인
    const finalCount = await client.query('SELECT COUNT(*) FROM mockexam_raw_to_standard_tb');
    console.log(`\n최종 데이터: ${finalCount.rows[0].count}개`);

  } catch (error) {
    console.error('오류 발생:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log(`\n${dbName} DB 연결 종료`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--prod')) {
    console.log('🚀 운영 DB에 업로드합니다...');
    await uploadMockExamData(prodConfig, true);
  } else if (args.includes('--local')) {
    console.log('🔧 로컬 DB에 업로드합니다...');
    await uploadMockExamData(localConfig, false);
  } else {
    console.log('사용법:');
    console.log('  node upload-2026-mockexam-to-prod.js --local   # 로컬 DB 업로드');
    console.log('  node upload-2026-mockexam-to-prod.js --prod    # 운영 DB 업로드 (프록시 필요)');
    console.log('\n운영 DB 업로드 전 Cloud SQL Proxy 실행 필요:');
    console.log('  cloud-sql-proxy ts-back-nest-479305:asia-northeast3:geobuk-sql --port 5434');
  }
}

main().catch(console.error);
