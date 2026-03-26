/**
 * 프로덕션 사용자 환산점수 일괄 재계산 스크립트 v2
 * mockexam_standard_score_tb 테이블 사용
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

// subject_code 매핑 (jungsi-calculation.service.ts와 동일)
const subjectCodeMap = {
  'S1': { category: 'kor', name: '화법과 작문' },
  'S2': { category: 'kor', name: '언어와 매체' },
  'S3': { category: 'kor', name: '국어' },
  'S4': { category: 'math', name: '확통' },
  'S5': { category: 'math', name: '미적' },
  'S6': { category: 'math', name: '기하' },
  'S7': { category: 'math', name: '수학' },
  'S8': { category: 'eng', name: '영어' },
  'S9': { category: 'history', name: '한국사' },
  // 탐구 과목
  'S10': { category: 'society', name: '생활과 윤리' },
  'S11': { category: 'society', name: '윤리와 사상' },
  'S12': { category: 'science', name: '물리학 Ⅰ' },
  'S13': { category: 'science', name: '화학 Ⅰ' },
  'S14': { category: 'science', name: '생명과학 Ⅰ' },
  'S15': { category: 'science', name: '지구과학 Ⅰ' },
  'S16': { category: 'science', name: '물리학 Ⅱ' },
  'S17': { category: 'science', name: '화학 Ⅱ' },
  'S18': { category: 'science', name: '생명과학 Ⅱ' },
  'S19': { category: 'science', name: '지구과학 Ⅱ' },
  'S20': { category: 'society', name: '한국지리' },
  'S21': { category: 'society', name: '세계지리' },
  'S22': { category: 'society', name: '동아시아사' },
  'S23': { category: 'society', name: '세계사' },
  'S24': { category: 'society', name: '경제' },
  'S25': { category: 'society', name: '정치와 법' },
  'S26': { category: 'society', name: '사회·문화' },
  'S27': { category: 'lang', name: '제2외국어' },
};

/**
 * mockexam_standard_score_tb에서 회원의 점수를 조회하여 MockExamScoreInput[] 형식으로 변환
 */
async function getMockexamScores(memberId) {
  const result = await client.query(
    'SELECT subject_code, standard_score, grade, percentile FROM mockexam_standard_score_tb WHERE member_id = $1',
    [memberId]
  );
  const scores = result.rows;

  if (!scores || scores.length === 0) {
    return null;
  }

  const mockExamScores = [];

  // 국어: S3(공통) + S1 or S2(선택)을 합쳐서 하나로 처리
  const korElective = scores.find(s => s.subject_code === 'S1' || s.subject_code === 'S2');
  const korCommon = scores.find(s => s.subject_code === 'S3');
  if (korElective) {
    const electiveName = subjectCodeMap[korElective.subject_code]?.name || '국어';
    mockExamScores.push({
      subjectCategory: 'kor',
      subjectName: electiveName,
      standardScore: String(korElective.standard_score),
      grade: korElective.grade,
      percentile: korElective.percentile || 0,
    });
  } else if (korCommon) {
    mockExamScores.push({
      subjectCategory: 'kor',
      subjectName: '국어',
      standardScore: String(korCommon.standard_score),
      grade: korCommon.grade,
      percentile: korCommon.percentile || 0,
    });
  }

  // 수학: S7(공통) + S4/S5/S6(선택)을 합쳐서 하나로 처리
  const mathElective = scores.find(s => ['S4', 'S5', 'S6'].includes(s.subject_code));
  const mathCommon = scores.find(s => s.subject_code === 'S7');
  if (mathElective) {
    const electiveName = subjectCodeMap[mathElective.subject_code]?.name || '수학';
    mockExamScores.push({
      subjectCategory: 'math',
      subjectName: electiveName,
      standardScore: String(mathElective.standard_score),
      grade: mathElective.grade,
      percentile: mathElective.percentile || 0,
    });
  } else if (mathCommon) {
    mockExamScores.push({
      subjectCategory: 'math',
      subjectName: '수학',
      standardScore: String(mathCommon.standard_score),
      grade: mathCommon.grade,
      percentile: mathCommon.percentile || 0,
    });
  }

  // 영어 (S8)
  const english = scores.find(s => s.subject_code === 'S8');
  if (english) {
    mockExamScores.push({
      subjectCategory: 'eng',
      subjectName: '영어',
      standardScore: String(english.grade), // 영어는 등급이 곧 점수
      grade: english.grade,
      percentile: 0,
    });
  }

  // 한국사 (S9)
  const history = scores.find(s => s.subject_code === 'S9');
  if (history) {
    mockExamScores.push({
      subjectCategory: 'history',
      subjectName: '한국사',
      standardScore: String(history.grade), // 한국사도 등급이 곧 점수
      grade: history.grade,
      percentile: 0,
    });
  }

  // 탐구 과목 (S10~S26 중 처음 2개)
  const researchCodes = ['S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S23', 'S24', 'S25', 'S26'];
  const researchScores = scores.filter(s => researchCodes.includes(s.subject_code));
  researchScores.slice(0, 2).forEach(score => {
    const mapping = subjectCodeMap[score.subject_code];
    if (mapping) {
      mockExamScores.push({
        subjectCategory: mapping.category,
        subjectName: mapping.name,
        standardScore: String(score.standard_score),
        grade: score.grade,
        percentile: score.percentile || 0,
      });
    }
  });

  // 제2외국어 (S27)
  const secondForeign = scores.find(s => s.subject_code === 'S27');
  if (secondForeign) {
    mockExamScores.push({
      subjectCategory: 'lang',
      subjectName: '제2외국어',
      standardScore: String(secondForeign.standard_score),
      grade: secondForeign.grade,
      percentile: secondForeign.percentile || 0,
    });
  }

  return mockExamScores;
}

/**
 * 점수 배열을 계산 파라미터로 변환
 */
function buildCalcParams(mockExamScores, scoreCalculation, major) {
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
        subjectScore.과목 = '수학(' + score.subjectName + ')';
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

  return params;
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

      // 3. 회원의 mockexam 점수 조회
      const mockExamScores = await getMockexamScores(memberId);

      if (!mockExamScores || mockExamScores.length === 0) {
        console.log('⚠️ 회원 ' + memberId + '의 점수가 없습니다. 건너뜁니다.');
        continue;
      }

      console.log('📊 조회된 점수: ' + mockExamScores.length + '개');
      mockExamScores.forEach(s => {
        console.log('   - ' + s.subjectCategory + '(' + s.subjectName + '): ' + s.standardScore);
      });

      // 4. 각 대학별 환산점수 계산
      const successScores = [];
      let successCount = 0;
      let failCount = 0;

      for (const admission of admissionsResult.rows) {
        const scoreCalculation = admission.score_calculation;
        const major = admission.general_field_name || '인문';

        // 파라미터 구성
        const params = buildCalcParams(mockExamScores, scoreCalculation, major);

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
    console.log('📊 재계산 완료 - 문제 대학 결과 확인');
    console.log('='.repeat(60));

    const finalResult = await client.query(`
      SELECT
        score_calculation,
        COUNT(*) as count,
        AVG(converted_score) as avg_score
      FROM ts_member_jungsi_calculated_scores
      WHERE score_calculation IN ('대전통합', '대전간호', '대전한의', '조선예능', '조선사회', '조선자연', '전남통합', '울산통합', '전북통합', '동신통합')
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
