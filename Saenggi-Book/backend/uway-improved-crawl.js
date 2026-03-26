/**
 * 개선된 UWAY 크롤러
 * - 문제 대학들의 특수 테이블 구조 처리
 * - "전형별 경쟁률 현황" 요약 테이블 제외
 * - 실제 상세 데이터만 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const path = require('path');
const iconv = require('iconv-lite');

const TIMEOUT = 15000;
const DELAY_BETWEEN_REQUESTS = 300;

// 문제 대학 목록
const PROBLEM_UNIVERSITIES = [
  '경남대학교',
  '대구대학교',
  '신라대학교',
  '영산대학교'
];

/**
 * jinhakapply.com 개선된 크롤링
 */
async function crawlJinhakapplyImproved(university) {
  try {
    const response = await axios.get(university.url, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // 문제 대학은 UTF-8, 일반 대학은 EUC-KR
    const encoding = PROBLEM_UNIVERSITIES.includes(university.name) ? 'utf-8' : 'euc-kr';
    const html = iconv.decode(response.data, encoding);
    const $ = cheerio.load(html);
    const details = [];

    // 문제 대학인지 확인
    const isProblemUniversity = PROBLEM_UNIVERSITIES.includes(university.name);

    if (isProblemUniversity) {
      console.log(`  [특수처리] ${university.name} (UTF-8 인코딩)`);

      // 전형명을 포함하는 제목 찾기 (요약 테이블 제외)
      let currentAdmissionType = '';
      let hasSeenSummary = false; // 요약 테이블을 한 번이라도 봤는지 추적

      $('h2, h3, table').each((idx, element) => {
        if (element.tagName === 'h2' || element.tagName === 'h3') {
          const text = $(element).text().trim();

          // 실제 전형명 추출 (예: "학생부교과(일반전형) 경쟁률 현황")
          const hasAdmissionType = text.includes('학생부교과') || text.includes('학생부종합') ||
                                   text.includes('실기') || text.includes('논술');
          const hasCompetition = text.includes('경쟁률');

          if (hasAdmissionType && hasCompetition) {
            // 전형명 추출
            currentAdmissionType = text
              .replace(' 경쟁률 현황', '')
              .replace(' 경쟁률', '')
              .replace(/\s+/g, ' ')
              .trim();
            hasSeenSummary = true; // 첫 번째 요약 테이블을 지나침
          } else if ((text.includes('전형별 경쟁률') || text === '전형별 경쟁률 현황') && !hasSeenSummary) {
            // 첫 요약 테이블은 건너뛰기
            currentAdmissionType = '';
          }
        } else if (element.tagName === 'table' && currentAdmissionType) {
            // 테이블 데이터 추출
            const rows = $(element).find('tbody tr, tr');

            rows.each((rowIdx, row) => {
              const cells = $(row).find('td');
              if (cells.length === 0) return;

              // 다양한 컬럼 구조 처리 (6~9 컬럼)
              if (cells.length >= 6) {
                const col1 = $(cells[0]).text().trim();
                const col2 = $(cells[1]).text().trim();

                // 경쟁률 셀 찾기 (':'를 포함하는 셀)
                let competitionRateIdx = -1;
                for (let i = cells.length - 1; i >= 2; i--) {
                  const cellText = $(cells[i]).text().trim();
                  if (cellText.includes(':')) {
                    competitionRateIdx = i;
                    break;
                  }
                }

                if (competitionRateIdx === -1) return; // 경쟁률 셀을 찾지 못함

                // 경쟁률 기준으로 모집인원, 지원인원 추출
                const competitionRate = $(cells[competitionRateIdx]).text().trim();
                const applicantNum = $(cells[competitionRateIdx - 1]).text().trim();
                const recruitNum = $(cells[competitionRateIdx - 2]).text().trim();

                // 헤더 행과 합계 행 제외
                if (col1 !== '대학' && col1 !== '모집단위' && col1 !== '총계' &&
                    col1 !== '구분' && !col1.includes('합계') && !col1.includes('소계')) {

                  details.push({
                    대학명: university.name,
                    전형명: currentAdmissionType,
                    단과대학: cells.length >= 7 ? col1 : '',
                    모집단위: cells.length >= 7 ? col2 : col1,
                    모집인원: recruitNum,
                    지원인원: applicantNum,
                    경쟁률: competitionRate
                  });
                }
              }
            });
        }
      });

    } else {
      // 기존 방식 (일반 대학)
      let currentAdmissionType = '';

      $('h2, table').each((idx, element) => {
        if (element.tagName === 'h2') {
          currentAdmissionType = $(element).text().trim()
            .replace(' 경쟁률 현황', '')
            .replace(/\s+/g, ' ');
        } else if (element.tagName === 'table' && currentAdmissionType) {
          $(element).find('tbody tr, tr').each((rowIdx, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 4) {
              const col1 = $(cells[0]).text().trim();
              const col2 = $(cells[1]).text().trim();
              const col3 = $(cells[2]).text().trim();
              const col4 = $(cells[3]).text().trim();
              const col5 = cells.length >= 5 ? $(cells[4]).text().trim() : '';

              if (col1 !== '모집단위' && col1 !== '대학' &&
                  col1 !== '총계' && col1 !== '구분' &&
                  !col1.includes('합계')) {

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
                } else if (col4.includes(':')) {
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
    }

    return details;
  } catch (error) {
    console.error(`  [jinhakapply] 오류 (${university.name}): ${error.message}`);
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

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 파일 저장됨: ${filepath}`);
  return filepath;
}

/**
 * 메인 함수 - 문제 대학만 재크롤링
 */
async function main() {
  console.log('='.repeat(70));
  console.log('문제 대학 재크롤링 시작');
  console.log('='.repeat(70));

  const PROBLEM_UNIS = [
    { name: "경남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html", type: "jinhakapply" },
    { name: "대구대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html", type: "jinhakapply" },
    { name: "신라대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html", type: "jinhakapply" },
    { name: "영산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html", type: "jinhakapply" },
  ];

  console.log(`\n총 ${PROBLEM_UNIS.length}개 대학 재크롤링\n`);

  const allData = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < PROBLEM_UNIS.length; i++) {
    const uni = PROBLEM_UNIS[i];
    process.stdout.write(`[${i + 1}/${PROBLEM_UNIS.length}] ${uni.name}... `);

    try {
      const details = await crawlJinhakapplyImproved(uni);

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
    const filename = `UWAY_문제대학_재크롤링_${timestamp}.xlsx`;
    saveToExcel(allData, filename);
  }

  console.log('='.repeat(70));
  console.log('완료');
  console.log('='.repeat(70));
}

// 실행
main().catch(console.error);
