// 프로덕션 API 테스트 (native fetch 사용)
const https = require('https');

// const PROD_URL = 'geobukschool-backend-siowqsnsha-du.a.run.app';
const PROD_URL = 'localhost';
const PORT = 4001;
const USE_HTTPS = false;

const mockExamScores = [
  { subjectCategory: 'kor', subjectName: '화법과 작문', standardScore: '130', grade: 1, percentile: 95 },
  { subjectCategory: 'math', subjectName: '미적', standardScore: '135', grade: 1, percentile: 97 },
  { subjectCategory: 'eng', subjectName: '영어', standardScore: '100', grade: 1, percentile: 100 },
  { subjectCategory: 'history', subjectName: '한국사', standardScore: '50', grade: 1, percentile: 100 },
  { subjectCategory: 'science', subjectName: '물리학 Ⅰ', standardScore: '65', grade: 1, percentile: 93 },
  { subjectCategory: 'science', subjectName: '화학 Ⅰ', standardScore: '62', grade: 1, percentile: 90 },
];

const body = JSON.stringify({
  memberId: 1,
  mockExamScores: mockExamScores,
});

const options = {
  hostname: PROD_URL,
  port: 443,
  path: '/jungsi/calculate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'app-api-key': 'geobuk-2024-api-key-secure',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    try {
      const result = JSON.parse(data);
      console.log('Success:', result.success);

      if (result.success && result.data?.results) {
        const filtered = result.data.results.filter(r =>
          r.universityName?.includes('인제') ||
          r.universityName?.includes('전남') ||
          r.universityName?.includes('충북')
        );

        const successResults = filtered.filter(r => r.success);
        const failResults = filtered.filter(r => !r.success);

        console.log(`\n필터링 결과: 성공 ${successResults.length}개, 실패 ${failResults.length}개`);

        console.log('\n[성공 사례 (처음 5개)]');
        successResults.slice(0, 5).forEach(r => {
          console.log(`  ${r.universityName} - ${r.recruitmentName}: ${r.convertedScore}점 (${r.scoreCalculation})`);
        });

        console.log('\n[실패 사례 (처음 15개)]');
        failResults.slice(0, 15).forEach(r => {
          console.log(`  ${r.universityName} - ${r.recruitmentName}: ${r.result || '결과없음'}`);
          console.log(`    scoreCalculation: "${r.scoreCalculation}", code: "${r.scoreCalculationCode}"`);
        });
      } else if (!result.success) {
        console.log('에러:', result.message || result);
      }
    } catch (e) {
      console.log('응답 (raw):', data.slice(0, 500));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
