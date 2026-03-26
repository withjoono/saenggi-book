/**
 * 개선된 UWAY 크롤러 (오류 추적 기능 포함)
 * - 문제 대학들의 특수 테이블 구조 처리
 * - "전형별 경쟁률 현황" 요약 테이블 제외
 * - 실제 상세 데이터만 수집
 * - 오류 상세 정보를 별도 시트로 저장
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

// 크롤링 결과 추적
const crawlResults = [];

/**
 * jinhakapply.com 개선된 크롤링
 */
async function crawlJinhakapplyImproved(university) {
  const startTime = Date.now();
  const result = {
    대학명: university.name,
    URL: university.url,
    시작시간: new Date().toISOString(),
    상태: '성공',
    데이터수: 0,
    오류메시지: '',
    소요시간: 0,
    인코딩: '',
  };

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
    result.인코딩 = encoding;
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

    result.데이터수 = details.length;
    result.소요시간 = `${((Date.now() - startTime) / 1000).toFixed(2)}초`;

    if (details.length === 0) {
      result.상태 = '경고';
      result.오류메시지 = '데이터를 찾을 수 없음';
    }

    crawlResults.push(result);
    return details;

  } catch (error) {
    result.상태 = '실패';
    result.오류메시지 = error.message;
    result.소요시간 = `${((Date.now() - startTime) / 1000).toFixed(2)}초`;
    crawlResults.push(result);

    console.error(`  [jinhakapply] 오류 (${university.name}): ${error.message}`);
    return [];
  }
}

/**
 * 엑셀 파일 저장 (오류 추적 시트 포함)
 */
function saveToExcel(data, filename) {
  const filepath = path.join(__dirname, 'uploads', filename);

  const wb = XLSX.utils.book_new();

  // 1. 메인 데이터 시트
  if (data.length > 0) {
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
  }

  // 2. 크롤링 결과 요약 시트
  const summaryWs = XLSX.utils.json_to_sheet(crawlResults);
  summaryWs['!cols'] = [
    { wch: 25 }, // 대학명
    { wch: 60 }, // URL
    { wch: 20 }, // 시작시간
    { wch: 10 }, // 상태
    { wch: 10 }, // 데이터수
    { wch: 50 }, // 오류메시지
    { wch: 12 }, // 소요시간
    { wch: 10 }, // 인코딩
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, '크롤링_결과');

  // 3. 통계 시트
  const stats = {
    총대학수: crawlResults.length,
    성공: crawlResults.filter(r => r.상태 === '성공').length,
    경고: crawlResults.filter(r => r.상태 === '경고').length,
    실패: crawlResults.filter(r => r.상태 === '실패').length,
    총데이터수: data.length,
    평균데이터수: data.length > 0 ? (data.length / crawlResults.length).toFixed(1) : 0,
    생성시간: new Date().toISOString(),
  };
  const statsWs = XLSX.utils.json_to_sheet([stats]);
  statsWs['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, statsWs, '통계');

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 파일 저장됨: ${filepath}`);
  console.log(`\n통계:`);
  console.log(`  - 총 대학 수: ${stats.총대학수}`);
  console.log(`  - 성공: ${stats.성공}`);
  console.log(`  - 경고: ${stats.경고}`);
  console.log(`  - 실패: ${stats.실패}`);
  console.log(`  - 총 데이터 수: ${stats.총데이터수}`);
  console.log(`  - 평균 데이터 수/대학: ${stats.평균데이터수}`);

  return filepath;
}

/**
 * 메인 함수 - 문제 대학만 재크롤링
 */
async function main() {
  console.log('='.repeat(70));
  console.log('문제 대학 재크롤링 시작 (오류 추적 포함)');
  console.log('='.repeat(70));

  const PROBLEM_UNIS = [
    { name: "경남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html", type: "jinhakapply" },
    { name: "대구대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html", type: "jinhakapply" },
    { name: "신라대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html", type: "jinhakapply" },
    { name: "영산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html", type: "jinhakapply" },
  ];

  console.log(`\n총 ${PROBLEM_UNIS.length}개 대학 재크롤링\n`);

  const allData = [];

  for (let i = 0; i < PROBLEM_UNIS.length; i++) {
    const uni = PROBLEM_UNIS[i];
    process.stdout.write(`[${i + 1}/${PROBLEM_UNIS.length}] ${uni.name}... `);

    try {
      const details = await crawlJinhakapplyImproved(uni);

      if (details.length > 0) {
        allData.push(...details);
        console.log(`✓ ${details.length}개 데이터`);
      } else {
        console.log('✗ 데이터 없음');
      }
    } catch (error) {
      console.log(`✗ 오류: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }

  console.log('='.repeat(70));

  if (allData.length > 0 || crawlResults.length > 0) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `UWAY_문제대학_재크롤링_${timestamp}.xlsx`;
    saveToExcel(allData, filename);
  } else {
    console.log('\n❌ 크롤링된 데이터가 없습니다.');
  }

  console.log('='.repeat(70));
  console.log('완료');
  console.log('='.repeat(70));
}

// 실행
main().catch(console.error);
