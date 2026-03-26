/**
 * 인코딩 문제 해결을 위한 재크롤링 스크립트
 * UTF-8 우선 시도, 실패시 EUC-KR 시도
 */

const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const iconv = require('iconv-lite');

const TIMEOUT = 20000;

// 5개 대학 URL (uwayapply에만 있는 대학들)
const TARGET_URLS = [
  {
    name: "고려대학교(서울)",
    url: "http://ratio.uwayapply.com/Sl5KOGB9YTlKZiUmOiZKLWZUZg=="
  },
  {
    name: "대신대학교",
    powerUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KJWFYaEpmJSY6JkotZlRm&ratioNM=%EB%8C%80%EC%8B%A0%EB%8C%80%ED%95%99%EA%B5%90"
  },
  {
    name: "부산교육대학교",
    powerUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXOUpKZiUmOiZKLWZUZg%3D%3D&ratioNM=%EB%B6%80%EC%82%B0%EA%B5%90%EC%9C%A1%EB%8C%80%ED%95%99%EA%B5%90"
  },
  {
    name: "청주교육대학교",
    powerUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXOFdKZiUmOiZKLWZUZg%3D%3D&ratioNM=%EC%B2%AD%EC%A3%BC%EA%B5%90%EC%9C%A1%EB%8C%80%ED%95%99%EA%B5%90"
  },
  {
    name: "춘천교육대학교",
    powerUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXYThNSmYlJjomSi1mVGY%3D&ratioNM=%EC%B6%98%EC%B2%9C%EA%B5%90%EC%9C%A1%EB%8C%80%ED%95%99%EA%B5%90"
  }
];

/**
 * power URL에서 실제 데이터 URL 추출
 */
function extractDataUrl(powerUrl) {
  const match = powerUrl.match(/ratioURL=([^&]+)/);
  if (match) {
    try {
      let dataUrl = decodeURIComponent(match[1]);
      if (dataUrl.startsWith('//')) {
        dataUrl = 'http:' + dataUrl;
      }
      return dataUrl;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * HTML을 적절한 인코딩으로 디코딩
 */
function decodeHtml(buffer) {
  // 먼저 UTF-8로 시도
  let html = buffer.toString('utf8');

  // 깨진 문자 패턴 체크
  if (html.includes('�') || /[\x80-\x9F]/.test(html)) {
    // EUC-KR로 다시 시도
    html = iconv.decode(buffer, 'euc-kr');
  }

  return html;
}

/**
 * 페이지 크롤링
 */
async function crawlPage(url, universityName) {
  try {
    console.log(`  크롤링: ${url}`);

    const response = await axios.get(url, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = decodeHtml(response.data);
    const $ = cheerio.load(html);
    const details = [];

    // 전형명 추출
    let currentAdmissionType = '';

    $('strong, b, h2, h3, table').each((idx, element) => {
      const tagName = element.tagName.toLowerCase();

      if (tagName !== 'table') {
        const text = $(element).text().trim();
        if ((text.includes('전형') || text.includes('학생부') ||
             text.includes('논술') || text.includes('특기자') ||
             text.includes('실기')) && text.includes('경쟁률')) {
          currentAdmissionType = text.replace(' 경쟁률 현황', '').replace(/\s+/g, ' ').trim();
        }
      } else if (currentAdmissionType) {
        const rows = $(element).find('tr');

        rows.each((rowIdx, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 5) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();
            const col5 = $(cells[4]).text().trim();

            if (col1 !== '대학' && col1 !== '모집단위' &&
                col1 !== '총계' && col1 !== '구분' &&
                !col1.includes('합계') && col5.includes(':')) {
              details.push({
                대학명: universityName,
                전형명: currentAdmissionType,
                단과대학: col1,
                모집단위: col2,
                모집인원: col3,
                지원인원: col4,
                경쟁률: col5
              });
            }
          } else if (cells.length >= 4) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();

            if (col1 !== '모집단위' && col1 !== '총계' &&
                !col1.includes('합계') && col4.includes(':')) {
              details.push({
                대학명: universityName,
                전형명: currentAdmissionType,
                단과대학: '',
                모집단위: col1,
                모집인원: col2,
                지원인원: col3,
                경쟁률: col4
              });
            }
          }
        });
      }
    });

    // 전형별 경쟁률 현황 테이블도 추출
    if (details.length === 0) {
      $('table').each((idx, table) => {
        const rows = $(table).find('tr');
        rows.each((rowIdx, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 4) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();

            // 전형별 경쟁률 현황 형식
            if (col1.includes('전형') && col4.includes(':')) {
              details.push({
                대학명: universityName,
                전형명: '전형별 경쟁률 현황',
                단과대학: '',
                모집단위: col1,
                모집인원: col2,
                지원인원: col3,
                경쟁률: col4
              });
            }
          }
        });
      });
    }

    return details;
  } catch (error) {
    console.error(`  오류 (${universityName}): ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('=== 인코딩 수정 크롤링 시작 ===\n');

  const allData = [];

  for (const target of TARGET_URLS) {
    console.log(`\n[${target.name}]`);

    let url = target.url;
    if (!url && target.powerUrl) {
      url = extractDataUrl(target.powerUrl);
    }

    if (!url) {
      console.log('  URL 추출 실패');
      continue;
    }

    const data = await crawlPage(url, target.name);
    console.log(`  결과: ${data.length}개 데이터`);

    if (data.length > 0) {
      // 샘플 출력
      console.log(`  샘플: ${JSON.stringify(data[0])}`);
    }

    allData.push(...data);

    // 딜레이
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n=== 크롤링 완료 ===`);
  console.log(`총 데이터: ${allData.length}개`);

  if (allData.length > 0) {
    // 엑셀 저장
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, '경쟁률');
    XLSX.writeFile(wb, 'UWAY_수시_추가5대학_2026-01-06.xlsx');
    console.log('저장: UWAY_수시_추가5대학_2026-01-06.xlsx');
  }

  return allData;
}

main().catch(console.error);
