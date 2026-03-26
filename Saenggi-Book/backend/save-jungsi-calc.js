/**
 * 정시 환산점수 계산 결과를 JSON 파일로 저장
 */

const http = require('http');
const fs = require('fs');

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
      standardScore: '0',
      grade: 2,
      percentile: 0
    },
    {
      subjectCategory: 'history',
      subjectName: '한국사',
      standardScore: '0',
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

const loginData = JSON.stringify({
  email: 'test@test.com',
  password: 'test1234'
});

console.log('정시 환산점수 계산 및 JSON 파일 저장');
console.log('입력 점수:');
console.log('- 국어 표점: 120');
console.log('- 수학(미적분) 표점: 120');
console.log('- 영어: 2등급');
console.log('- 한국사: 2등급');
console.log('- 물리학 Ⅰ 표점: 60');
console.log('- 생명과학 Ⅰ 표점: 60');
console.log('');

// 로그인 후 계산 요청
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

              // 파일명에 날짜 포함
              const now = new Date();
              const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
              const filename = `jungsi-calc-result-${dateStr}.json`;

              // JSON 파일로 저장
              fs.writeFileSync(filename, JSON.stringify(result, null, 2), 'utf8');

              console.log(`✅ 계산 완료!`);
              console.log(`- 전체 대학/학과: ${result.data?.totalUniversities || 0}개`);
              console.log(`- 성공: ${result.data?.successCount || 0}개`);
              console.log(`- 실패: ${result.data?.failedCount || 0}개`);
              console.log(`\n📁 파일 저장됨: ${filename}`);

            } catch (e) {
              console.error('응답 파싱 실패:', e.message);
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
      }
    } catch (e) {
      console.error('로그인 응답 파싱 실패:', e.message);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('로그인 요청 에러:', e.message);
});

loginReq.write(loginData);
loginReq.end();
