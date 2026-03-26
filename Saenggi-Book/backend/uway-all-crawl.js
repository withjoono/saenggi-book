/**
 * UWAY 수시 경쟁률 전체 크롤링 스크립트
 * jinhakapply.com + uwayapply.com 모든 대학 처리
 */

const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const path = require('path');
const iconv = require('iconv-lite');

// 타임아웃 설정
const TIMEOUT = 15000;
const DELAY_BETWEEN_REQUESTS = 300;

/**
 * UWAY 메인 페이지에서 모든 대학의 경쟁률 링크 수집
 */
async function collectAllUniversityLinks() {
  console.log('UWAY 메인 페이지에서 대학 목록 수집 중...');

  const url = 'https://addon.jinhakapply.com/RatioV1/RatioH/S1000003HJ.html';

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(html);

    const universities = [];

    // 테이블에서 대학 정보 추출
    $('table tr').each((idx, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const nameCell = $(cells[0]);
        const ratioCell = $(cells[1]);

        // 대학명 추출
        let name = nameCell.text().trim();
        if (!name || name === '대학명') return;

        // 경쟁률 링크 추출
        const ratioLink = ratioCell.find('a');
        if (ratioLink.length > 0) {
          const onclick = ratioLink.attr('onclick') || '';
          const href = ratioLink.attr('href') || '';

          let linkUrl = '';
          let linkType = '';

          // onclick에서 URL 추출
          if (onclick.includes('window.open')) {
            const match = onclick.match(/window\.open\(['"]([^'"]+)['"]/);
            if (match) {
              linkUrl = match[1];
            }
          } else if (href && href !== '#' && href !== 'javascript:;') {
            linkUrl = href;
          }

          if (linkUrl) {
            // URL 타입 분류
            if (linkUrl.includes('jinhakapply.com')) {
              linkType = 'jinhakapply';
            } else if (linkUrl.includes('uwayapply.com')) {
              linkType = 'uwayapply';
            } else {
              linkType = 'other';
            }

            universities.push({
              name: name.replace(/\s+/g, ' ').trim(),
              url: linkUrl.startsWith('//') ? 'https:' + linkUrl : linkUrl,
              type: linkType
            });
          }
        }
      }
    });

    console.log(`수집 완료: ${universities.length}개 대학`);
    return universities;

  } catch (error) {
    console.error('대학 목록 수집 실패:', error.message);
    return [];
  }
}

/**
 * jinhakapply.com 페이지 크롤링
 */
async function crawlJinhakapply(university) {
  try {
    const response = await axios.get(university.url, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(html);
    const details = [];

    // 현재 전형명 추적
    let currentAdmissionType = '';

    // 모든 섹션 처리
    $('h2, table').each((idx, element) => {
      if (element.tagName === 'h2') {
        // 전형명 추출
        currentAdmissionType = $(element).text().trim()
          .replace(' 경쟁률 현황', '')
          .replace(/\s+/g, ' ');
      } else if (element.tagName === 'table' && currentAdmissionType) {
        // 테이블 데이터 추출
        $(element).find('tbody tr, tr').each((rowIdx, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 4) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();
            const col5 = cells.length >= 5 ? $(cells[4]).text().trim() : '';

            // 헤더 행과 합계 행 제외
            if (col1 !== '모집단위' && col1 !== '대학' &&
                col1 !== '총계' && col1 !== '구분' &&
                !col1.includes('합계')) {

              // 5컬럼 구조 (대학, 모집단위, 모집인원, 지원인원, 경쟁률)
              if (cells.length >= 5 && col5.includes(':')) {
                details.push({
                  대학명: university.name,
                  전형명: currentAdmissionType,
                  단과대학: col1,
                  모집단위: col2,
                  모집인원: col3,
                  지원인원: col4,
                  경쟁률: col5
                });
              }
              // 4컬럼 구조 (모집단위, 모집인원, 지원인원, 경쟁률)
              else if (col4.includes(':')) {
                details.push({
                  대학명: university.name,
                  전형명: currentAdmissionType,
                  단과대학: '',
                  모집단위: col1,
                  모집인원: col2,
                  지원인원: col3,
                  경쟁률: col4
                });
              }
            }
          }
        });
      }
    });

    return details;
  } catch (error) {
    console.error(`  [jinhakapply] 오류 (${university.name}): ${error.message}`);
    return [];
  }
}

/**
 * uwayapply.com 페이지에서 실제 데이터 URL 추출
 */
async function getUwayapplyDataUrl(framesetUrl) {
  try {
    const response = await axios.get(framesetUrl, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(html);

    // frameset에서 powerMain 프레임의 src 추출
    const mainFrame = $('frame[name="powerMain"]');
    if (mainFrame.length > 0) {
      let src = mainFrame.attr('src');
      if (src) {
        if (src.startsWith('//')) {
          src = 'http:' + src;
        } else if (!src.startsWith('http')) {
          // 상대 경로인 경우
          const baseUrl = new URL(framesetUrl);
          src = baseUrl.origin + (src.startsWith('/') ? src : '/' + src);
        }
        return src;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * uwayapply.com 데이터 페이지 크롤링
 */
async function crawlUwayapply(university) {
  try {
    // 1. frameset URL에서 실제 데이터 URL 추출
    let dataUrl = university.url;

    // power 페이지인 경우 frameset에서 실제 URL 추출
    if (university.url.includes('/power/')) {
      const extractedUrl = await getUwayapplyDataUrl(university.url);
      if (extractedUrl) {
        dataUrl = extractedUrl;
      }
    }

    // 2. 데이터 페이지 크롤링
    const response = await axios.get(dataUrl, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(html);
    const details = [];

    // 전형명 목록 추출
    const admissionTypes = [];
    $('strong, b, h2, h3').each((idx, el) => {
      const text = $(el).text().trim();
      if ((text.includes('전형') || text.includes('학생부') ||
           text.includes('논술') || text.includes('특기자') ||
           text.includes('실기')) && text.includes('경쟁률')) {
        admissionTypes.push({
          text: text.replace(' 경쟁률 현황', '').replace(/\s+/g, ' '),
          element: el
        });
      }
    });

    // 각 테이블 처리
    let currentAdmissionType = '';
    let admissionIdx = 0;

    $('strong, b, h2, h3, table').each((idx, element) => {
      const tagName = element.tagName.toLowerCase();

      if (tagName !== 'table') {
        const text = $(element).text().trim();
        if ((text.includes('전형') || text.includes('학생부') ||
             text.includes('논술') || text.includes('특기자') ||
             text.includes('실기')) && text.includes('경쟁률')) {
          currentAdmissionType = text.replace(' 경쟁률 현황', '').replace(/\s+/g, ' ');
        }
      } else if (currentAdmissionType) {
        // 테이블 데이터 추출
        const rows = $(element).find('tr');

        rows.each((rowIdx, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 5) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();
            const col5 = $(cells[4]).text().trim();

            // 헤더 행과 합계 행 제외
            if (col1 !== '대학' && col1 !== '모집단위' &&
                col1 !== '총계' && col1 !== '구분' &&
                !col1.includes('합계') && col5.includes(':')) {
              details.push({
                대학명: university.name,
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
                col1 !== '구분' && !col1.includes('합계') &&
                col4.includes(':')) {
              details.push({
                대학명: university.name,
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

    return details;
  } catch (error) {
    console.error(`  [uwayapply] 오류 (${university.name}): ${error.message}`);
    return [];
  }
}

/**
 * 대학 크롤링 (타입에 따라 적절한 함수 호출)
 */
async function crawlUniversity(university) {
  if (university.type === 'jinhakapply') {
    return await crawlJinhakapply(university);
  } else if (university.type === 'uwayapply') {
    return await crawlUwayapply(university);
  } else {
    console.log(`  [${university.type}] 지원하지 않는 타입`);
    return [];
  }
}

/**
 * 엑셀 파일 저장
 */
function saveToExcel(data, filename) {
  const filepath = path.join(__dirname, filename);

  const wb = XLSX.utils.book_new();

  // 메인 데이터 시트
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 }, // 대학명
    { wch: 35 }, // 전형명
    { wch: 15 }, // 단과대학
    { wch: 25 }, // 모집단위
    { wch: 10 }, // 모집인원
    { wch: 10 }, // 지원인원
    { wch: 15 }, // 경쟁률
  ];
  XLSX.utils.book_append_sheet(wb, ws, '경쟁률_상세');

  // 대학별 요약 시트
  const summaryByUni = {};
  data.forEach(row => {
    if (!summaryByUni[row.대학명]) {
      summaryByUni[row.대학명] = {
        대학명: row.대학명,
        전형수: new Set(),
        모집단위수: 0,
        총모집인원: 0,
        총지원인원: 0
      };
    }
    summaryByUni[row.대학명].전형수.add(row.전형명);
    summaryByUni[row.대학명].모집단위수++;
    summaryByUni[row.대학명].총모집인원 += parseInt(String(row.모집인원).replace(/,/g, '')) || 0;
    summaryByUni[row.대학명].총지원인원 += parseInt(String(row.지원인원).replace(/,/g, '')) || 0;
  });

  const summaryData = Object.values(summaryByUni).map(uni => ({
    대학명: uni.대학명,
    전형수: uni.전형수.size,
    모집단위수: uni.모집단위수,
    총모집인원: uni.총모집인원,
    총지원인원: uni.총지원인원,
    평균경쟁률: uni.총모집인원 > 0 ?
      (uni.총지원인원 / uni.총모집인원).toFixed(2) + ' : 1' : '-'
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, '대학별_요약');

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 파일 저장됨: ${filepath}`);
  return filepath;
}

/**
 * 기존 데이터와 병합
 */
function mergeWithExistingData(newData, existingFilePath) {
  try {
    const wb = XLSX.readFile(existingFilePath);
    const existingData = XLSX.utils.sheet_to_json(wb.Sheets['경쟁률_상세']);

    // 기존 데이터의 대학명 목록
    const existingUnis = new Set(existingData.map(row => row.대학명));

    // 새 데이터 중 기존에 없는 대학만 추가
    const newUnis = newData.filter(row => !existingUnis.has(row.대학명));

    console.log(`기존 데이터: ${existingData.length}개`);
    console.log(`새로 추가: ${newUnis.length}개`);

    return [...existingData, ...newUnis];
  } catch (error) {
    console.log('기존 파일 없음, 새 데이터만 사용');
    return newData;
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('='.repeat(70));
  console.log('UWAY 수시 경쟁률 전체 크롤링 시작');
  console.log('='.repeat(70));

  // 하드코딩된 uwayapply 대학 목록 (UWAY 페이지에서 확인한 92개)
  const UWAYAPPLY_UNIVERSITIES = [
    { name: "KAIST", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB8YTlKZiVdOkZKLWZbZw%3D%3D", type: "uwayapply" },
    { name: "DGIST", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiUkOkVKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "GIST", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiUjOkJKLWZbZw%3D%3D", type: "uwayapply" },
    { name: "UNIST", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiVYOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "가톨릭관동대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB9YTlKZiUuOkZKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "강릉원주대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiUrOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "강원대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiUrOkNKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "경기대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiUmOkJKLWZbZw%3D%3D", type: "uwayapply" },
    { name: "경북대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiUrOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "경희대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiUlOkNKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "계명대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiUuOkZKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "고려대학교(서울)", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOGB9YTlKZiUmOiZKLWZUZg%3D%3D", type: "uwayapply" },
    { name: "고려대학교(세종)", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiUmOkZKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "고신대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiUmOkdKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "공주교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSllKOGB6YTlKZiUoOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "광운대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiUpOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "광주교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSllKOGB5YTlKZiUpOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "국민대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiUoOkVKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "금오공과대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiUpOkNKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "꽃동네대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB8YTlKZiV1OkNKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "나사렛대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiVyOkZKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "남부대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB8YTlKZiVwOkZKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "남서울대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB7YTlKZiVxOkZKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "대구교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSllKOGB7YTlKZiVwOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "대진대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiVxOkVKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "동덕여자대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiVzOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "동양대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB6YTlKZiVyOkRKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "동의대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB6YTlKZiVzOkNKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "루터대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB5YTlKZiVkOkZKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "백석대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiVlOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "삼육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB6YTlKZiVkOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "상명대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiVkOkVKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "상지대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB9YTlKZiVkOkNKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "서울과학기술대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiVlOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "서울교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSllKOGB5YTlKZiVlOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "서울대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOGB9YTlKZiVlOiZKLWZVZg%3D%3D", type: "uwayapply" },
    { name: "서울시립대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiVlOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "선문대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB6YTlKZiVlOkZKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "세한대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB8YTlKZiViOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "송원대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB7YTlKZiViOkNKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "수원가톨릭대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB7YTlKZiViOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "순복음총회신학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB9YTlKZiViOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "안동대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiVjOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "안양대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB7YTlKZiVjOkFKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "연세대학교(미래)", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiVjOkdKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "영남대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiVjOkZKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "영남신학대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB6YTlKZiVjOkZKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "용인대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiViOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "우송대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB8YTlKZiViOkVKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "울산대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiViOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "원광대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiViOkVKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "유원대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB8YTlKZiViOkFKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "이화여자대학교(의예과)", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB7YTlKZiVaOkFKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "인제대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiVaOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "인하대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiVaOkBKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "전남대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiVbOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "전북대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiVbOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "전주교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSllKOGB6YTlKZiVbOkBKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "전주대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiVbOkVKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "제주국제대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB7YTlKZiVbOkVKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "제주대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB6YTlKZiVbOkZKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "조선이공대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB7YTlKZiVbOkdKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "중앙대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB6YTlKZiVYOkBKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "진주교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSllKOGB8YTlKZiVYOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "차의과학대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiVYOkdKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "청운대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiVYOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "청주대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiVYOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "초당대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB9YTlKZiVYOkFKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "추계예술대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB7YTlKZiVYOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "침례신학대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB9YTlKZiVYOkdKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "칼빈대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB5YTlKZiVYOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "탐라대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiVZOkRKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "평택대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB9YTlKZiVZOkVKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "포스텍", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiVZOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "포항공과대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOGB5YTlKZiVZOkJKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "한국성서대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiVWOkBKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "한국외국어대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB6YTlKZiVWOkBKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "한국침례신학대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB9YTlKZiVWOkNKLWdbZg%3D%3D", type: "uwayapply" },
    { name: "한국항공대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB5YTlKZiVWOkdKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "한라대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB5YTlKZiVWOkFKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "한려대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB8YTlKZiVWOkFKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "한림대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiVWOkRKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "한성대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB6YTlKZiVWOkNKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "한세대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB6YTlKZiVWOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "한양대학교(의예)", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB9YTlKZiVWOkRKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "한일장신대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlhKOWB6YTlKZiVWOkZKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "협성대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB6YTlKZiVXOkNKLWdaZg%3D%3D", type: "uwayapply" },
    { name: "호서대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOGB8YTlKZiVXOkFKLWZaZw%3D%3D", type: "uwayapply" },
    { name: "호원대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSlpKOWB8YTlKZiVXOkFKLWdaZg%3D%3D", type: "uwayapply" },
  ];

  // 기존 jinhakapply 대학 목록
  const JINHAKAPPLY_UNIVERSITIES = [
    { name: "가야대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10010651.html", type: "jinhakapply" },
    { name: "가천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10190551.html", type: "jinhakapply" },
    { name: "가톨릭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10030311.html", type: "jinhakapply" },
    { name: "강서대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10360681.html", type: "jinhakapply" },
    { name: "건국대학교 서울캠퍼스", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10080311.html", type: "jinhakapply" },
    { name: "건국대학교(글로컬)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10091041.html", type: "jinhakapply" },
    { name: "건양대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10100701.html", type: "jinhakapply" },
    { name: "경남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html", type: "jinhakapply" },
    { name: "경상국립대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10170831.html", type: "jinhakapply" },
    { name: "경인교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20060231.html", type: "jinhakapply" },
    { name: "국립공주대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10280871.html", type: "jinhakapply" },
    { name: "국립군산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10350541.html", type: "jinhakapply" },
    { name: "국립목포대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10690211.html", type: "jinhakapply" },
    { name: "국립목포해양대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10700471.html", type: "jinhakapply" },
    { name: "국립부경대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10720321.html", type: "jinhakapply" },
    { name: "국립순천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10990421.html", type: "jinhakapply" },
    { name: "국립창원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11350541.html", type: "jinhakapply" },
    { name: "국립한국교통대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30150561.html", type: "jinhakapply" },
    { name: "국립한밭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30040731.html", type: "jinhakapply" },
    { name: "김천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio40330551.html", type: "jinhakapply" },
    { name: "단국대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10420391.html", type: "jinhakapply" },
    { name: "대구가톨릭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10460911.html", type: "jinhakapply" },
    { name: "대구대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html", type: "jinhakapply" },
    { name: "대구한의대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10160641.html", type: "jinhakapply" },
    { name: "대신대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10480221.html", type: "jinhakapply" },
    { name: "대전대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10500891.html", type: "jinhakapply" },
    { name: "덕성여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10530541.html", type: "jinhakapply" },
    { name: "동국대학교(WISE)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10540571.html", type: "jinhakapply" },
    { name: "동국대학교(서울)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10550451.html", type: "jinhakapply" },
    { name: "동명대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30050601.html", type: "jinhakapply" },
    { name: "동서대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10570621.html", type: "jinhakapply" },
    { name: "동아대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10591111.html", type: "jinhakapply" },
    { name: "명지대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10650631.html", type: "jinhakapply" },
    { name: "목원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10670681.html", type: "jinhakapply" },
    { name: "부산가톨릭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10730511.html", type: "jinhakapply" },
    { name: "부산교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20040241.html", type: "jinhakapply" },
    { name: "부산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio12100541.html", type: "jinhakapply" },
    { name: "부산외국어대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10750451.html", type: "jinhakapply" },
    { name: "서강대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio12050421.html", type: "jinhakapply" },
    { name: "서경대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10810601.html", type: "jinhakapply" },
    { name: "서울기독대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10520511.html", type: "jinhakapply" },
    { name: "서울여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10860591.html", type: "jinhakapply" },
    { name: "서울한영대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11660391.html", type: "jinhakapply" },
    { name: "서원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10880521.html", type: "jinhakapply" },
    { name: "성결대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10900671.html", type: "jinhakapply" },
    { name: "성공회대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10910441.html", type: "jinhakapply" },
    { name: "성균관대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10920451.html", type: "jinhakapply" },
    { name: "성신여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10930101.html", type: "jinhakapply" },
    { name: "세종대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10950621.html", type: "jinhakapply" },
    { name: "수원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10970401.html", type: "jinhakapply" },
    { name: "숙명여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10981151.html", type: "jinhakapply" },
    { name: "숭실대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11010661.html", type: "jinhakapply" },
    { name: "신라대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html", type: "jinhakapply" },
    { name: "아주대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11040601.html", type: "jinhakapply" },
    { name: "연세대학교(서울)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11080671.html", type: "jinhakapply" },
    { name: "영산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html", type: "jinhakapply" },
    { name: "우석대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11150541.html", type: "jinhakapply" },
    { name: "을지대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11190571.html", type: "jinhakapply" },
    { name: "이화여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11201541.html", type: "jinhakapply" },
    { name: "인천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11230591.html", type: "jinhakapply" },
    { name: "조선대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11300471.html", type: "jinhakapply" },
    { name: "중부대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11310831.html", type: "jinhakapply" },
    { name: "중원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11920221.html", type: "jinhakapply" },
    { name: "청주교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20100291.html", type: "jinhakapply" },
    { name: "춘천교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20110281.html", type: "jinhakapply" },
    { name: "충남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11400411.html", type: "jinhakapply" },
    { name: "충북대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11410781.html", type: "jinhakapply" },
    { name: "한경국립대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30160991.html", type: "jinhakapply" },
    { name: "한국공학대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30170591.html", type: "jinhakapply" },
    { name: "한국교원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11480351.html", type: "jinhakapply" },
    { name: "한국체육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11530371.html", type: "jinhakapply" },
    { name: "한남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11560771.html", type: "jinhakapply" },
    { name: "한동대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11570661.html", type: "jinhakapply" },
    { name: "한서대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11600791.html", type: "jinhakapply" },
    { name: "한신대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11630391.html", type: "jinhakapply" },
    { name: "한양대학교(ERICA)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11650631.html", type: "jinhakapply" },
    { name: "한양대학교(서울)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11640461.html", type: "jinhakapply" },
    { name: "호남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11690551.html", type: "jinhakapply" },
    { name: "홍익대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720711.html", type: "jinhakapply" },
    { name: "홍익대학교(세종)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720712.html", type: "jinhakapply" },
    { name: "화성의과학대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11880401.html", type: "jinhakapply" },
  ];

  // 전체 대학 목록
  const ALL_UNIVERSITIES = [...UWAYAPPLY_UNIVERSITIES, ...JINHAKAPPLY_UNIVERSITIES];

  console.log(`\n총 ${ALL_UNIVERSITIES.length}개 대학 크롤링 시작`);
  console.log(`  - uwayapply: ${UWAYAPPLY_UNIVERSITIES.length}개`);
  console.log(`  - jinhakapply: ${JINHAKAPPLY_UNIVERSITIES.length}개`);
  console.log('='.repeat(70));

  const allData = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < ALL_UNIVERSITIES.length; i++) {
    const uni = ALL_UNIVERSITIES[i];
    process.stdout.write(`[${i + 1}/${ALL_UNIVERSITIES.length}] ${uni.name} (${uni.type})... `);

    try {
      const details = await crawlUniversity(uni);

      if (details.length > 0) {
        allData.push(...details);
        console.log(`✓ ${details.length}개 데이터`);
        successCount++;
      } else {
        console.log('✗ 데이터 없음');
        errorCount++;
      }
    } catch (error) {
      console.log(`✗ 오류: ${error.message}`);
      errorCount++;
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }

  console.log('='.repeat(70));
  console.log(`\n크롤링 완료: 성공 ${successCount}, 실패 ${errorCount}`);
  console.log(`총 ${allData.length}개 데이터 수집됨`);

  if (allData.length > 0) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `UWAY_수시_경쟁률_전체_${timestamp}.xlsx`;
    saveToExcel(allData, filename);
  }

  console.log('='.repeat(70));
  console.log('완료');
  console.log('='.repeat(70));
}

// 실행
main().catch(console.error);
