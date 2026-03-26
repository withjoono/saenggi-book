const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function testEncoding() {
  const url = 'https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html';

  const response = await axios.get(url, {
    timeout: 15000,
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  console.log('=== 인코딩 테스트 ===\n');

  // EUC-KR 디코딩 테스트
  const htmlEucKr = iconv.decode(response.data, 'euc-kr');
  const $1 = cheerio.load(htmlEucKr);
  const firstH2EucKr = $1('h2').first().text().trim();

  console.log('EUC-KR 디코딩:');
  console.log('  첫 번째 h2:', firstH2EucKr);
  console.log('  "전형별" 포함?', firstH2EucKr.includes('전형별'));
  console.log('  "경쟁률" 포함?', firstH2EucKr.includes('경쟁률'));
  console.log('  Buffer 길이:', firstH2EucKr.length);
  console.log('  Character codes:', [...firstH2EucKr.substring(0, 10)].map(c => c.charCodeAt(0)));

  // UTF-8 디코딩 테스트
  const htmlUtf8 = iconv.decode(response.data, 'utf-8');
  const $2 = cheerio.load(htmlUtf8);
  const firstH2Utf8 = $2('h2').first().text().trim();

  console.log('\nUTF-8 디코딩:');
  console.log('  첫 번째 h2:', firstH2Utf8);
  console.log('  "전형별" 포함?', firstH2Utf8.includes('전형별'));
  console.log('  "경쟁률" 포함?', firstH2Utf8.includes('경쟁률'));
  console.log('  Buffer 길이:', firstH2Utf8.length);
  console.log('  Character codes:', [...firstH2Utf8.substring(0, 10)].map(c => c.charCodeAt(0)));

  // 원본 버퍼 확인
  console.log('\n원본 응답:');
  console.log('  Content-Type:', response.headers['content-type']);
  console.log('  데이터 길이:', response.data.length);
  console.log('  첫 100 바이트:', Buffer.from(response.data).toString('hex').substring(0, 200));
}

testEncoding().catch(console.error);
