// DB score_calculation 매핑 확인 스크립트
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// .env.development에서 DB 연결 정보 읽기
const envPath = path.join(__dirname, '.env.development');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

async function checkDBMapping() {
  const client = new Client({
    host: envVars.DB_HOST || 'localhost',
    port: parseInt(envVars.DB_PORT || '5432'),
    user: envVars.DB_USERNAME || 'tsuser',
    password: envVars.DB_PASSWORD || 'tsuser1234',
    database: envVars.DB_DATABASE || 'geobukschool_dev',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // 문제가 되는 대학들의 score_calculation 값 조회
    const targetUnivs = ['전남대', '울산대', '대전대', '동신대', '조선대', '전북대'];

    const query = `
      SELECT
        u.name as university_name,
        ra.recruitment_name,
        ra.admission_name,
        ra.score_calculation,
        ra.general_field_name
      FROM regular_admission_tb ra
      JOIN university_tb u ON ra.university_id = u.id
      WHERE u.name LIKE ANY(ARRAY['%전남대%', '%울산대%', '%대전대%', '%동신대%', '%조선대%', '%전북대%'])
      ORDER BY u.name, ra.recruitment_name
    `;

    const result = await client.query(query);

    console.log(`=== 문제 대학들의 DB score_calculation 값 (${result.rows.length}개 레코드) ===\n`);

    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.university_name]) {
        grouped[row.university_name] = [];
      }
      grouped[row.university_name].push({
        recruitment: row.recruitment_name,
        admission: row.admission_name,
        score_calculation: row.score_calculation,
        field: row.general_field_name
      });
    }

    // calc-2026.ts의 학교조건2026 키들 로드
    const calc2026Path = path.join(__dirname, 'src/modules/jungsi/calculation/calculations/calc-2026.ts');
    const calc2026Content = fs.readFileSync(calc2026Path, 'utf-8');
    const schoolConditionKeys = new Set();
    const regex = /^\s+([가-힣A-Za-z0-9]+):\s*\{/gm;
    const startIdx = calc2026Content.indexOf('const 학교조건2026: Record<string, 학교조건2026Type> = {');
    const endIdx = calc2026Content.indexOf('};', startIdx) + 2;
    const schoolConditionBlock = calc2026Content.substring(startIdx, endIdx);
    let match;
    while ((match = regex.exec(schoolConditionBlock)) !== null) {
      schoolConditionKeys.add(match[1]);
    }

    for (const [univName, records] of Object.entries(grouped)) {
      console.log(`\n📍 ${univName} (${records.length}개 모집단위)`);
      console.log('-'.repeat(80));

      const noScoreCalc = records.filter(r => !r.score_calculation);
      const hasScoreCalc = records.filter(r => r.score_calculation);

      if (noScoreCalc.length > 0) {
        console.log(`  ❌ score_calculation이 NULL인 모집단위: ${noScoreCalc.length}개`);
        noScoreCalc.slice(0, 5).forEach(r => {
          console.log(`     - ${r.recruitment} (${r.field})`);
        });
        if (noScoreCalc.length > 5) console.log(`     ... 외 ${noScoreCalc.length - 5}개`);
      }

      if (hasScoreCalc.length > 0) {
        const uniqueCalcs = [...new Set(hasScoreCalc.map(r => r.score_calculation))];
        console.log(`  ✅ score_calculation 값: ${uniqueCalcs.join(', ')}`);

        // 학교조건2026에 있는지 확인
        uniqueCalcs.forEach(calc => {
          const exists = schoolConditionKeys.has(calc);
          console.log(`     - "${calc}": ${exists ? '✅ 학교조건2026에 있음' : '❌ 학교조건2026에 없음!'}`);
        });
      }
    }

    // NULL인 레코드 수 전체 통계
    const nullCount = await client.query(`
      SELECT COUNT(*) as count FROM regular_admission_tb
      WHERE score_calculation IS NULL OR score_calculation = ''
    `);
    const totalCount = await client.query(`
      SELECT COUNT(*) as count FROM regular_admission_tb
    `);

    console.log(`\n\n=== 전체 통계 ===`);
    console.log(`총 모집단위: ${totalCount.rows[0].count}개`);
    console.log(`score_calculation이 NULL/빈값인 모집단위: ${nullCount.rows[0].count}개`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDBMapping();
