/**
 * 표준점수 -> 등급/백분위 변환 API 테스트
 */

const http = require('http');

// 테스트 데이터
const testData = JSON.stringify({
  scores: [
    { subjectName: '국어', standardScore: 120 },
    { subjectName: '미적', standardScore: 120 },
    { subjectName: '영어', standardScore: 2 },       // 영어는 등급 입력
    { subjectName: '한국사', standardScore: 2 },     // 한국사도 등급 입력
    { subjectName: '물리학 Ⅰ', standardScore: 60 },
    { subjectName: '생명과학 Ⅰ', standardScore: 60 }
  ]
});

console.log('=== 표준점수 -> 등급/백분위 변환 API 테스트 ===\n');
console.log('입력 데이터:');
console.log(JSON.parse(testData));
console.log('');

// API 호출 (인증 없이)
const req = http.request({
  hostname: 'localhost',
  port: 4001,
  path: '/jungsi/convert',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('응답 상태:', res.statusCode);
    console.log('');
    try {
      const result = JSON.parse(body);
      console.log('변환 결과:');
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('응답:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('요청 에러:', e.message);
});

req.write(testData);
req.end();
