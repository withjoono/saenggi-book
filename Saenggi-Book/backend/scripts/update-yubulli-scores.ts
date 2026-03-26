/**
 * 기존 환산점수 데이터에 유불리(optimal_score, score_difference) 업데이트
 *
 * 실행: npx ts-node scripts/update-yubulli-scores.ts
 */

import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: '.env.development' });

interface YubulliRow {
  점수환산: number;
  [key: string]: number;
}

async function main() {
  // 1. 유불리 데이터 로드
  const yubulliPath = path.join(__dirname, '../src/modules/jungsi/calculation/data/2025정시유불리.json');
  const yubulliData = JSON.parse(fs.readFileSync(yubulliPath, 'utf-8'));
  const sheet: YubulliRow[] = yubulliData.Sheet1;

  console.log(`유불리 데이터 로드: ${sheet.length}개 행`);

  // 2. DB 연결
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  await dataSource.initialize();
  console.log('DB 연결 성공');

  // 3. 기존 환산점수 데이터 조회
  const scores = await dataSource.query(`
    SELECT id, score_calculation, converted_score, standard_score_sum
    FROM ts_member_calculated_scores
    WHERE optimal_score = 0 OR optimal_score IS NULL
  `);

  console.log(`업데이트 대상: ${scores.length}개`);

  // 4. 각 점수에 대해 유불리 계산 및 업데이트
  let updatedCount = 0;
  let skippedCount = 0;

  for (const score of scores) {
    const { id, score_calculation, converted_score, standard_score_sum } = score;

    // 가장 가까운 점수환산 찾기
    let closestRow: YubulliRow | null = null;
    let minDiff = Infinity;

    for (const row of sheet) {
      const diff = Math.abs(row['점수환산'] - standard_score_sum);
      if (diff < minDiff) {
        minDiff = diff;
        closestRow = row;
      }
    }

    if (!closestRow) {
      skippedCount++;
      continue;
    }

    // 해당 학교의 동점수 평균 환산점수 조회
    const optimalScore = closestRow[score_calculation];

    if (optimalScore === undefined || optimalScore === null) {
      // 학교 코드가 유불리 데이터에 없음
      skippedCount++;
      continue;
    }

    const scoreDifference = optimalScore - converted_score;

    // DB 업데이트
    await dataSource.query(`
      UPDATE ts_member_calculated_scores
      SET optimal_score = $1, score_difference = $2
      WHERE id = $3
    `, [optimalScore, scoreDifference, id]);

    updatedCount++;

    if (updatedCount % 100 === 0) {
      console.log(`진행: ${updatedCount}개 업데이트됨`);
    }
  }

  console.log('');
  console.log('=== 완료 ===');
  console.log(`업데이트: ${updatedCount}개`);
  console.log(`스킵 (유불리 데이터 없음): ${skippedCount}개`);

  // 5. 결과 확인
  const sample = await dataSource.query(`
    SELECT university_name, score_calculation,
           ROUND(converted_score::numeric, 2) as 환산점수,
           standard_score_sum as 표점합,
           ROUND(optimal_score::numeric, 2) as 동점수평균,
           ROUND(score_difference::numeric, 2) as 유불리
    FROM ts_member_calculated_scores
    WHERE optimal_score != 0
    ORDER BY ABS(score_difference) DESC
    LIMIT 10
  `);

  console.log('');
  console.log('=== 샘플 결과 (유불리 차이 큰 순) ===');
  console.table(sample);

  await dataSource.destroy();
}

main().catch(console.error);
