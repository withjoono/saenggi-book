/**
 * 프로덕션 사용자 환산점수 일괄 재계산 스크립트
 */
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// ts-node 등록
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.json'),
  compilerOptions: { module: 'commonjs', esModuleInterop: true },
  transpileOnly: true,
});

// 계산 모듈 로드
const { calc정시환산점수2026 } = require('./src/modules/jungsi/calculation/calculations/calc-2026');

// 코드 매핑 로드
const scoreCalculationCodes = JSON.parse(
  fs.readFileSync('./src/modules/jungsi/calculation/data/score-calculation-codes.json', 'utf-8')
);

const client = new Client({
  host: '127.0.0.1',
  port: 5434,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_prod',
});

// 수학 과목명 정규화
function normalizeMathSubjectName(subjectName) {
  if (!subjectName) return '';
  const name = subjectName.toLowerCase().replace(/\s+/g, '');
  if (name.includes('미적') || name.includes('calculus')) return '미적';
  if (name.includes('기하') || name.includes('geometry')) return '기하';
  if (name.includes('확통') || name.includes('확률') || name.includes('통계')) return '확통';
  return subjectName;
}

// 탐구 과목 카테고리 판별
function getResearchCategory(subjectName) {
  const scienceSubjects = ['물리학', '화학', '생명과학', '지구과학'];
  for (const sci of scienceSubjects) {
    if (subjectName.includes(sci)) return 'science';
  }
  return 'society';
}

async function batchRecalculate() {
  try {
    await client.connect();
    console.log('✅ 프로덕션 DB 연결 성공\n');

    // 1. 기존 점수가 있는 회원 목록 조회
    const memberResult = await client.query(
      'SELECT DISTINCT member_id FROM ts_member_jungsi_calculated_scores ORDER BY member_id'
    );
    const memberIds = memberResult.rows.map(r => r.member_id);
    console.log('📋 재계산 대상 회원: ' + memberIds.length + '명 (' + memberIds.join(', ') + ')\n');

    // 2. 모든 2026년 정시 모집단위 조회
    const admissionsResult = await client.query(`
      SELECT
        ra.id,
        ra.university_id,
        u.name as university_name,
        ra.recruitment_name,
        ra.admission_type,
        ra.admission_name,
        ra.score_calculation,
        ra.general_field_name,
        ra.min_cut,
        ra.max_cut
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE ra.year = 2026
        AND ra.score_calculation IS NOT NULL
      ORDER BY u.name, ra.recruitment_name
    `);
    console.log('📋 계산 대상 모집단위: ' + admissionsResult.rows.length + '개\n');

    // 각 회원별 재계산
    for (const memberId of memberIds) {
      console.log('\n' + '='.repeat(60));
      console.log('👤 회원 ' + memberId + ' 재계산 시작');
      console.log('='.repeat(60));

      // 3. 회원의 입력 점수 조회
      const inputResult = await client.query(
        'SELECT * FROM ts_member_jungsi_input_scores WHERE member_id = $1',
        [memberId]
      );

      if (inputResult.rows.length === 0) {
        console.log('⚠️ 회원 ' + memberId + '의 입력 점수가 없습니다. 건너뜁니다.');
        continue;
      }

      const input = inputResult.rows[0];
      console.log('📊 입력 점수: 국어=' + input.korean_standard_score +
        ', 수학=' + input.math_standard_score +
        ', 영어=' + input.english_grade + '등급');

      // 점수 파라미터 구성
      const mockExamScores = [];

      if (input.korean_standard_score) {
        mockExamScores.push({
          subjectCategory: 'kor',
          subjectName: input.korean_elective || '국어',
          standardScore: String(input.korean_standard_score),
          grade: input.korean_grade || 0,
          percentile: Number(input.korean_percentile) || 0,
        });
      }

      if (input.math_standard_score) {
        mockExamScores.push({
          subjectCategory: 'math',
          subjectName: input.math_elective || '수학',
          standardScore: String(input.math_standard_score),
          grade: input.math_grade || 0,
          percentile: Number(input.math_percentile) || 0,
        });
      }

      if (input.english_grade) {
        mockExamScores.push({
          subjectCategory: 'eng',
          subjectName: '영어',
          standardScore: String(input.english_grade),
          grade: input.english_grade,
          percentile: 0,
        });
      }

      if (input.korean_history_grade) {
        mockExamScores.push({
          subjectCategory: 'history',
          subjectName: '한국사',
          standardScore: String(input.korean_history_grade),
          grade: input.korean_history_grade,
          percentile: 0,
        });
      }

      if (input.research1_subject && input.research1_standard_score) {
        mockExamScores.push({
          subjectCategory: getResearchCategory(input.research1_subject),
          subjectName: input.research1_subject,
          standardScore: String(input.research1_standard_score),
          grade: input.research1_grade || 0,
          percentile: Number(input.research1_percentile) || 0,
        });
      }

      if (input.research2_subject && input.research2_standard_score) {
        mockExamScores.push({
          subjectCategory: getResearchCategory(input.research2_subject),
          subjectName: input.research2_subject,
          standardScore: String(input.research2_standard_score),
          grade: input.research2_grade || 0,
          percentile: Number(input.research2_percentile) || 0,
        });
      }

      if (input.second_foreign_subject && input.second_foreign_standard_score) {
        mockExamScores.push({
          subjectCategory: 'lang',
          subjectName: input.second_foreign_subject,
          standardScore: String(input.second_foreign_standard_score),
          grade: input.second_foreign_grade || 0,
          percentile: Number(input.second_foreign_percentile) || 0,
        });
      }

      // 4. 각 대학별 환산점수 계산
      const successScores = [];
      let successCount = 0;
      let failCount = 0;

      for (const admission of admissionsResult.rows) {
        const scoreCalculation = admission.score_calculation;
        const major = admission.general_field_name || '인문';

        // 파라미터 구성
        const params = {
          학교: scoreCalculation,
          이문과: major,
          국어: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
          수학: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
          영어: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
          한국사: { 과목: '', 표준점수: 0, 등급: 0, 백분위: 0 },
          과탐1: undefined,
          과탐2: undefined,
          사탐1: undefined,
          사탐2: undefined,
          제2외국어: undefined,
        };

        for (const score of mockExamScores) {
          const subjectScore = {
            과목: score.subjectName,
            표준점수: parseInt(score.standardScore),
            등급: score.grade,
            백분위: score.percentile,
          };

          switch (score.subjectCategory) {
            case 'kor':
              subjectScore.과목 = '국어';
              params.국어 = subjectScore;
              break;
            case 'math':
              const normalizedMathName = normalizeMathSubjectName(score.subjectName);
              subjectScore.과목 = '수학(' + normalizedMathName + ')';
              params.수학 = subjectScore;
              break;
            case 'eng':
              params.영어 = subjectScore;
              break;
            case 'history':
              params.한국사 = subjectScore;
              break;
            case 'society':
              if (!params.사탐1) params.사탐1 = subjectScore;
              else if (!params.사탐2) params.사탐2 = subjectScore;
              break;
            case 'science':
              if (!params.과탐1) params.과탐1 = subjectScore;
              else if (!params.과탐2) params.과탐2 = subjectScore;
              break;
            case 'lang':
              params.제2외국어 = subjectScore;
              break;
          }
        }

        try {
          const calcResult = await calc정시환산점수2026(params);

          if (calcResult.success) {
            successCount++;
            const scoreCalcCode = scoreCalculationCodes.nameToCode[scoreCalculation] || '';
            successScores.push({
              universityId: admission.university_id,
              universityName: admission.university_name,
              scoreCalculation: scoreCalculation,
              scoreCalculationCode: scoreCalcCode,
              major: major,
              convertedScore: calcResult.내점수 || 0,
              standardScoreSum: calcResult.표점합 || 0,
              optimalScore: 0,
              scoreDifference: 0,
            });
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      console.log('📊 계산 결과: 성공 ' + successCount + '개, 실패 ' + failCount + '개');

      // 5. 기존 점수 삭제 후 새로 저장
      await client.query(
        'DELETE FROM ts_member_jungsi_calculated_scores WHERE member_id = $1',
        [memberId]
      );

      // 중복 제거 (university_id, score_calculation_code 조합)
      const uniqueMap = new Map();
      for (const score of successScores) {
        const key = score.universityId + '_' + score.scoreCalculationCode;
        const existing = uniqueMap.get(key);
        if (!existing || score.convertedScore > existing.convertedScore) {
          uniqueMap.set(key, score);
        }
      }
      const uniqueScores = Array.from(uniqueMap.values());

      console.log('📊 중복 제거: ' + successScores.length + '개 → ' + uniqueScores.length + '개');

      // 저장
      for (const score of uniqueScores) {
        await client.query(`
          INSERT INTO ts_member_jungsi_calculated_scores (
            member_id, university_id, university_name, score_calculation,
            score_calculation_code, major, converted_score, standard_score_sum,
            optimal_score, score_difference, calculated_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
        `, [
          memberId,
          score.universityId,
          score.universityName,
          score.scoreCalculation,
          score.scoreCalculationCode,
          score.major,
          score.convertedScore,
          score.standardScoreSum,
          score.optimalScore,
          score.scoreDifference,
        ]);
      }

      console.log('✅ 회원 ' + memberId + ' 저장 완료: ' + uniqueScores.length + '개 점수');
    }

    // 결과 확인
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 재계산 완료 - 결과 확인');
    console.log('='.repeat(60));

    const finalResult = await client.query(`
      SELECT
        score_calculation,
        COUNT(*) as count,
        AVG(converted_score) as avg_score
      FROM ts_member_jungsi_calculated_scores
      WHERE score_calculation IN ('대전통합', '대전간호', '대전한의', '조선예능', '조선사회', '조선자연')
      GROUP BY score_calculation
      ORDER BY score_calculation
    `);

    console.log('\n문제 대학 점수 현황:');
    for (const row of finalResult.rows) {
      const avgScore = row.avg_score ? Number(row.avg_score).toFixed(2) : 'N/A';
      console.log('  ' + row.score_calculation + ': ' + row.count + '명, 평균 ' + avgScore + '점');
    }

    console.log('\n✅ 일괄 재계산 완료!');

  } catch (error) {
    console.error('❌ 에러:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

batchRecalculate();
