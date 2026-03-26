const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function debugSilla() {
  const url = 'https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html';

  const response = await axios.get(url, {
    timeout: 15000,
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = iconv.decode(response.data, 'utf-8');
  const $ = cheerio.load(html);

  console.log('=== 신라대학교 디버깅 ===\n');

  let currentAdmissionType = '';
  let hasSeenSummary = false;
  let dataCount = 0;

  $('h2, h3, table').each((idx, element) => {
    if (element.tagName === 'h2' || element.tagName === 'h3') {
      const text = $(element).text().trim();
      console.log(`h2/h3: "${text.substring(0, 60)}"`);

      const hasAdmissionType = text.includes('학생부교과') || text.includes('학생부종합') ||
                               text.includes('실기') || text.includes('논술');
      const hasCompetition = text.includes('경쟁률');

      console.log(`  전형명 키워드: ${hasAdmissionType}, 경쟁률 키워드: ${hasCompetition}`);

      if (hasAdmissionType && hasCompetition) {
        currentAdmissionType = text
          .replace(' 경쟁률 현황', '')
          .replace(' 경쟁률', '')
          .replace(/\s+/g, ' ')
          .trim();
        hasSeenSummary = true;
        console.log(`  → 전형명 설정: "${currentAdmissionType}"`);
      }
    } else if (element.tagName === 'table' && currentAdmissionType) {
      const rows = $(element).find('tbody tr, tr');
      const rowsWithData = rows.filter((i, row) => $(row).find('td').length > 0).length;
      console.log(`테이블 (${rowsWithData}개 데이터 행), currentAdmissionType="${currentAdmissionType.substring(0, 40)}"`);

      if (rowsWithData > 1) {
        const firstDataRow = rows.eq(1);
        const cells = firstDataRow.find('td');
        console.log(`  첫 데이터 행: ${cells.length}개 셀`);
        console.log(`  셀 내용: [${cells.map((i, c) => $(c).text().trim()).get().join(' | ')}]`);

        // 테스트: 첫 행이 수집 조건을 만족하는지 확인
        if (cells.length >= 6) {
          const col1 = $(cells[0]).text().trim();
          let competitionRate;
          if (cells.length >= 8) {
            competitionRate = $(cells[7]).text().trim();
          } else if (cells.length === 7) {
            competitionRate = $(cells[6]).text().trim();
          } else {
            competitionRate = $(cells[4]).text().trim();
          }

          console.log(`  첫 행 검증: col1="${col1}", 경쟁률="${competitionRate}", ':' 포함=${competitionRate.includes(':')}`);
          if (competitionRate.includes(':')) {
            dataCount++;
            console.log(`  ✓ 데이터 수집 가능`);
          } else {
            console.log(`  ✗ 경쟁률 형식 불일치`);
          }
        }
      }
    }
  });

  console.log(`\n총 수집 가능 데이터: ~${dataCount}개`);
}

debugSilla().catch(console.error);
