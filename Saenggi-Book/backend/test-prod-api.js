// 프로덕션 API 테스트
const fetch = require('node-fetch');

const PROD_URL = 'https://geobukschool-backend-x6x3yyzbea-du.a.run.app';
// const PROD_URL = 'http://localhost:4001';

// 테스트용 mockExamScores (정상적인 점수)
const mockExamScores = [
  { subjectCategory: 'kor', subjectName: '화법과 작문', standardScore: '130', grade: 1, percentile: 95 },
  { subjectCategory: 'math', subjectName: '미적', standardScore: '135', grade: 1, percentile: 97 },
  { subjectCategory: 'eng', subjectName: '영어', standardScore: '100', grade: 1, percentile: 100 },
  { subjectCategory: 'history', subjectName: '한국사', standardScore: '50', grade: 1, percentile: 100 },
  { subjectCategory: 'science', subjectName: '물리학 Ⅰ', standardScore: '65', grade: 1, percentile: 93 },
  { subjectCategory: 'science', subjectName: '화학 Ⅰ', standardScore: '62', grade: 1, percentile: 90 },
];

// 인제대, 전남대 포함한 테스트
async function testCalculation() {
  const testUniversities = [
    { name: '인제대학교', id: null },  // id 없이 이름으로 검색
    { name: '전남대학교', id: null },
    { name: '충북대학교', id: null },  // 비교용
  ];

  // 먼저 대학 ID 조회
  console.log('=== 1. 정시 대학 목록 조회 ===');
  try {
    const listResponse = await fetch(`${PROD_URL}/api-nest/jungsi/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app-api-key': 'geobuk-2024-api-key-secure',
      },
      body: JSON.stringify({
        memberId: 1,
        mockExamScores: mockExamScores,
      }),
    });

    const result = await listResponse.json();
    console.log('API 응답 status:', listResponse.status);
    console.log('API 응답 success:', result.success);

    if (result.success && result.data?.results) {
      // 인제, 전남, 충북 대학 필터링
      const filtered = result.data.results.filter(r =>
        r.universityName?.includes('인제') ||
        r.universityName?.includes('전남') ||
        r.universityName?.includes('충북')
      );

      console.log(`\n=== 2. 필터링된 결과 (${filtered.length}개) ===`);

      // 성공/실패 분류
      const successResults = filtered.filter(r => r.success);
      const failResults = filtered.filter(r => !r.success);

      console.log(`\n성공: ${successResults.length}개, 실패: ${failResults.length}개`);

      console.log('\n[성공 사례 (처음 5개)]');
      successResults.slice(0, 5).forEach(r => {
        console.log(`  ${r.universityName} - ${r.recruitmentName}: ${r.convertedScore}점`);
      });

      console.log('\n[실패 사례 (처음 10개)]');
      failResults.slice(0, 10).forEach(r => {
        console.log(`  ${r.universityName} - ${r.recruitmentName}: ${r.result || '결과없음'}`);
        console.log(`    scoreCalculation: ${r.scoreCalculation}`);
      });

    } else {
      console.log('응답 데이터:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('에러:', error.message);
  }
}

testCalculation();
