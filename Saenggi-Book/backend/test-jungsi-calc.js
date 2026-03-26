/**
 * 정시 환산점수 계산 테스트 스크립트
 * 국어 120, 수학 120, 영어 2등급, 한국사 2등급, 물리1 60, 생물1 60
 *
 * 수정: 영어/한국사는 표준점수가 아닌 등급으로 조회됨
 */

const http = require('http');

// 테스트용 점수 데이터
const requestData = JSON.stringify({
  mockExamScores: [
    {
      subjectCategory: 'kor',
      subjectName: '국어',
      standardScore: '120',
      grade: 2,
      percentile: 88
    },
    {
      subjectCategory: 'math',
      subjectName: '미적',
      standardScore: '120',
      grade: 2,
      percentile: 88
    },
    {
      subjectCategory: 'eng',
      subjectName: '영어',
      standardScore: '0',  // 영어는 표준점수 없음, 등급(2)으로 조회
      grade: 2,
      percentile: 0
    },
    {
      subjectCategory: 'history',
      subjectName: '한국사',
      standardScore: '0',  // 한국사는 표준점수 없음, 등급(2)으로 조회
      grade: 2,
      percentile: 0
    },
    {
      subjectCategory: 'science',
      subjectName: '물리학 Ⅰ',
      standardScore: '60',
      grade: 3,
      percentile: 75
    },
    {
      subjectCategory: 'science',
      subjectName: '생명과학 Ⅰ',
      standardScore: '60',
      grade: 3,
      percentile: 75
    }
  ]
});

// 먼저 테스트 로그인으로 토큰 받기
const loginData = JSON.stringify({
  email: 'test@test.com',
  password: 'test1234'
});

console.log('정시 환산점수 계산 테스트');
console.log('입력 점수:');
console.log('- 국어 표점: 120');
console.log('- 수학(미적분) 표점: 120');
console.log('- 영어: 2등급');
console.log('- 한국사: 2등급');
console.log('- 물리학 Ⅰ 표점: 60');
console.log('- 생명과학 Ⅰ 표점: 60');
console.log('');

// 먼저 로그인 시도
const loginReq = http.request({
  hostname: 'localhost',
  port: 4001,
  path: '/auth/login/email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', chunk => loginBody += chunk);
  loginRes.on('end', () => {
    try {
      const loginResult = JSON.parse(loginBody);
      if (loginResult.success && loginResult.data?.accessToken) {
        console.log('로그인 성공! 환산점수 계산 요청 중...\n');

        // 환산점수 계산 요청
        const calcReq = http.request({
          hostname: 'localhost',
          port: 4001,
          path: '/jungsi/calculate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestData),
            'Authorization': `Bearer ${loginResult.data.accessToken}`
          }
        }, (calcRes) => {
          let calcBody = '';
          calcRes.on('data', chunk => calcBody += chunk);
          calcRes.on('end', () => {
            try {
              const result = JSON.parse(calcBody);
              console.log(JSON.stringify(result, null, 2));
            } catch (e) {
              console.log('응답:', calcBody);
            }
          });
        });

        calcReq.on('error', (e) => {
          console.error('계산 요청 에러:', e.message);
        });

        calcReq.write(requestData);
        calcReq.end();
      } else {
        console.log('로그인 실패:', loginResult.message || '알 수 없는 오류');
        console.log('테스트 계정이 필요합니다. 다른 방법으로 계산해보겠습니다...');

        // 인증 없이 직접 계산 로직 테스트
        testWithoutAuth();
      }
    } catch (e) {
      console.log('로그인 응답 파싱 실패, 인증 없이 테스트...');
      testWithoutAuth();
    }
  });
});

loginReq.on('error', (e) => {
  console.error('로그인 요청 에러:', e.message);
  testWithoutAuth();
});

loginReq.write(loginData);
loginReq.end();

function testWithoutAuth() {
  console.log('\n인증 없이 계산 로직을 직접 실행할 수 없습니다.');
  console.log('Swagger UI에서 테스트하거나, 유효한 계정으로 로그인해주세요.');
  console.log('\nSwagger UI: http://localhost:4001/swagger');
  console.log('\nPOST /jungsi/calculate 엔드포인트에 다음 데이터를 전송하세요:');
  console.log(JSON.stringify(JSON.parse(requestData), null, 2));
}
