const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function debugHtmlStructure() {
  const url = 'https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html';

  const response = await axios.get(url, {
    timeout: 15000,
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = iconv.decode(response.data, 'euc-kr');
  const $ = cheerio.load(html);

  console.log('=== HTML 구조 분석 ===\n');

  // 모든 h2, h3 태그 찾기
  console.log('[제목 태그들]');
  $('h2, h3').each((idx, el) => {
    const text = $(el).text().trim();
    console.log(`${el.tagName}: "${text}"`);
  });

  console.log('\n[테이블 개수]');
  console.log('총 테이블:', $('table').length, '개');

  // 첫 번째 테이블 분석
  console.log('\n[첫 번째 테이블]');
  const firstTable = $('table').first();
  const firstRows = firstTable.find('tr');
  console.log('행 개수:', firstRows.length);
  console.log('첫 3행:');
  firstRows.slice(0, 3).each((idx, row) => {
    const cells = $(row).find('td, th');
    const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
    console.log(`  행 ${idx + 1}: [${cellTexts.join(' | ')}]`);
  });

  // 두 번째 테이블 분석
  console.log('\n[두 번째 테이블]');
  const secondTable = $('table').eq(1);
  if (secondTable.length > 0) {
    const secondRows = secondTable.find('tr');
    console.log('행 개수:', secondRows.length);
    console.log('첫 3행:');
    secondRows.slice(0, 3).each((idx, row) => {
      const cells = $(row).find('td, th');
      const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
      console.log(`  행 ${idx + 1}: [${cellTexts.join(' | ')}]`);
    });
  }

  // 특정 텍스트를 포함하는 요소 찾기
  console.log('\n[경쟁률 관련 제목 찾기]');
  $('*').each((idx, el) => {
    const text = $(el).text().trim();
    if (text.includes('경쟁률 현황') && text.length < 100) {
      console.log(`${el.tagName}: "${text}"`);
    }
  });
}

debugHtmlStructure().catch(console.error);
