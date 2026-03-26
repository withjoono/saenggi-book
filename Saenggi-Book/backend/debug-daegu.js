const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function debugDaegu() {
  const url = 'https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html';

  const response = await axios.get(url, {
    timeout: 15000,
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = iconv.decode(response.data, 'utf-8');
  const $ = cheerio.load(html);

  console.log('=== 대구대학교 디버깅 ===\n');

  // h2 태그 분석
  console.log('[h2 태그들]:');
  $('h2').each((idx, el) => {
    const text = $(el).text().trim();
    console.log(`${idx + 1}. "${text}"`);
    console.log(`   - "전형별 경쟁률" 포함: ${text.includes('전형별 경쟁률')}`);
    console.log(`   - "학생부교과" 포함: ${text.includes('학생부교과')}`);
    console.log(`   - "학생부종합" 포함: ${text.includes('학생부종합')}`);
    console.log(`   - "실기" 포함: ${text.includes('실기')}`);
    console.log(`   - "경쟁률" 포함: ${text.includes('경쟁률')}`);
  });

  console.log('\n[테이블 개수]:', $('table').length, '개');

  // 첫 3개 테이블 구조 확인
  console.log('\n[테이블 구조 확인]:');
  $('table').slice(0, 5).each((idx, table) => {
    const rows = $(table).find('tr');
    console.log(`\n테이블 ${idx + 1}:`);
    console.log(`  행 개수: ${rows.length}`);

    const firstRow = rows.first();
    const firstCells = firstRow.find('td, th');
    console.log(`  첫 행 셀 개수: ${firstCells.length}`);
    console.log(`  첫 행 내용: [${firstCells.map((i, cell) => $(cell).text().trim()).get().join(' | ')}]`);
  });
}

debugDaegu().catch(console.error);
