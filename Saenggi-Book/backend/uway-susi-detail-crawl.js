/**
 * UWAY 수시 경쟁률 상세 크롤링 스크립트
 * 전형명, 모집단위, 모집인원, 지원인원, 경쟁률 데이터 수집
 */

const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const path = require('path');

// 81개 대학 URL 목록 (UWAY 페이지에서 추출)
const UNIVERSITIES = [
  { name: "가야대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10010651.html" },
  { name: "가천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10190551.html" },
  { name: "가톨릭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10030311.html" },
  { name: "강서대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10360681.html" },
  { name: "건국대학교 서울캠퍼스", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10080311.html" },
  { name: "건국대학교(글로컬)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10091041.html" },
  { name: "건양대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10100701.html" },
  { name: "경남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html" },
  { name: "경상국립대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10170831.html" },
  { name: "경인교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20060231.html" },
  { name: "국립공주대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10280871.html" },
  { name: "국립군산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10350541.html" },
  { name: "국립목포대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10690211.html" },
  { name: "국립목포해양대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10700471.html" },
  { name: "국립부경대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10720321.html" },
  { name: "국립순천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10990421.html" },
  { name: "국립창원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11350541.html" },
  { name: "국립한국교통대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30150561.html" },
  { name: "국립한밭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30040731.html" },
  { name: "김천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio40330551.html" },
  { name: "단국대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10420391.html" },
  { name: "대구가톨릭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10460911.html" },
  { name: "대구대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html" },
  { name: "대구한의대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10160641.html" },
  { name: "대신대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10480221.html" },
  { name: "대전대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10500891.html" },
  { name: "덕성여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10530541.html" },
  { name: "동국대학교(WISE)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10540571.html" },
  { name: "동국대학교(서울)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10550451.html" },
  { name: "동명대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30050601.html" },
  { name: "동서대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10570621.html" },
  { name: "동아대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10591111.html" },
  { name: "명지대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10650631.html" },
  { name: "목원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10670681.html" },
  { name: "부산가톨릭대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10730511.html" },
  { name: "부산교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20040241.html" },
  { name: "부산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio12100541.html" },
  { name: "부산외국어대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10750451.html" },
  { name: "서강대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio12050421.html" },
  { name: "서경대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10810601.html" },
  { name: "서울기독대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10520511.html" },
  { name: "서울여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10860591.html" },
  { name: "서울한영대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11660391.html" },
  { name: "서원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10880521.html" },
  { name: "성결대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10900671.html" },
  { name: "성공회대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10910441.html" },
  { name: "성균관대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10920451.html" },
  { name: "성신여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10930101.html" },
  { name: "세종대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10950621.html" },
  { name: "수원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10970401.html" },
  { name: "숙명여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10981151.html" },
  { name: "숭실대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11010661.html" },
  { name: "신라대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html" },
  { name: "아주대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11040601.html" },
  { name: "연세대학교(서울)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11080671.html" },
  { name: "영산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html" },
  { name: "우석대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11150541.html" },
  { name: "을지대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11190571.html" },
  { name: "이화여자대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11201541.html" },
  { name: "인천대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11230591.html" },
  { name: "조선대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11300471.html" },
  { name: "중부대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11310831.html" },
  { name: "중원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11920221.html" },
  { name: "청주교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20100291.html" },
  { name: "춘천교육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio20110281.html" },
  { name: "충남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11400411.html" },
  { name: "충북대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11410781.html" },
  { name: "한경국립대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30160991.html" },
  { name: "한국공학대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30170591.html" },
  { name: "한국교원대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11480351.html" },
  { name: "한국체육대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11530371.html" },
  { name: "한남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11560771.html" },
  { name: "한동대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11570661.html" },
  { name: "한서대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11600791.html" },
  { name: "한신대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11630391.html" },
  { name: "한양대학교(ERICA)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11650631.html" },
  { name: "한양대학교(서울)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11640461.html" },
  { name: "호남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11690551.html" },
  { name: "홍익대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720711.html" },
  { name: "홍익대학교(세종)", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720712.html" },
  { name: "화성의과학대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11880401.html" }
];

async function fetchDetailData(university) {
  try {
    const response = await axios.get(university.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const details = [];

    // Find all tables with detail data (skip first summary table)
    $('table').each((tableIdx, table) => {
      if (tableIdx === 0) return; // Skip summary table

      // Find the heading for this table
      const heading = $(table).closest('div').find('h2').text().trim();
      const admissionType = heading.replace(' 경쟁률 현황', '');

      $(table).find('tbody tr').each((rowIdx, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 4) {
          const col1 = $(cells[0]).text().trim();
          const col2 = $(cells[1]).text().trim();
          const col3 = $(cells[2]).text().trim();
          const col4 = $(cells[3]).text().trim();

          // Skip header and summary rows
          if (col1 !== '모집단위' && col1 !== '총계') {
            details.push({
              대학명: university.name,
              전형명: admissionType,
              모집단위: col1,
              모집인원: col2,
              지원인원: col3,
              경쟁률: col4
            });
          }
        }
      });
    });

    return details;
  } catch (error) {
    console.error(`  오류 (${university.name}): ${error.message}`);
    return [];
  }
}

function saveToExcel(data) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `UWAY_수시_경쟁률_상세_${timestamp}.xlsx`;
  const filepath = path.join(__dirname, filename);

  const wb = XLSX.utils.book_new();

  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 }, // 대학명
    { wch: 25 }, // 전형명
    { wch: 25 }, // 모집단위
    { wch: 10 }, // 모집인원
    { wch: 10 }, // 지원인원
    { wch: 12 }, // 경쟁률
  ];
  XLSX.utils.book_append_sheet(wb, ws, '경쟁률_상세');

  // Summary by university
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
    summaryByUni[row.대학명].총모집인원 += parseInt(row.모집인원.replace(/,/g, '')) || 0;
    summaryByUni[row.대학명].총지원인원 += parseInt(row.지원인원.replace(/,/g, '')) || 0;
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

async function main() {
  console.log('='.repeat(60));
  console.log('UWAY 수시 경쟁률 상세 크롤링 시작');
  console.log(`총 ${UNIVERSITIES.length}개 대학`);
  console.log('='.repeat(60));

  const allData = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const uni = UNIVERSITIES[i];
    process.stdout.write(`[${i + 1}/${UNIVERSITIES.length}] ${uni.name}... `);

    const details = await fetchDetailData(uni);

    if (details.length > 0) {
      allData.push(...details);
      console.log(`✓ ${details.length}개 데이터`);
      successCount++;
    } else {
      console.log('✗ 데이터 없음');
      errorCount++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n크롤링 완료: 성공 ${successCount}, 실패 ${errorCount}`);
  console.log(`총 ${allData.length}개 데이터 수집됨`);

  if (allData.length > 0) {
    saveToExcel(allData);
  }

  console.log('='.repeat(60));
  console.log('완료');
  console.log('='.repeat(60));
}

main().catch(console.error);
