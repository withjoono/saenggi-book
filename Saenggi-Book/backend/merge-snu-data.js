/**
 * 서울대 데이터를 V7 크롤링 결과에 병합
 */

const XLSX = require('xlsx');
const path = require('path');

// add-snu-data.js에서 서울대 데이터 가져오기
const snuDataModule = require('./add-snu-data.js');

async function mergeSNUData() {
  console.log('='.repeat(70));
  console.log('서울대 데이터 병합 시작');
  console.log('='.repeat(70));

  // V7 파일 읽기
  const v7FilePath = path.join(__dirname, 'UWAY_수시_경쟁률_V7_2026-01-09.xlsx');
  console.log('\nV7 파일 읽는 중...');
  const wb = XLSX.readFile(v7FilePath);

  // 경쟁률_상세 시트 읽기
  const ws = wb.Sheets['경쟁률_상세'];
  const existingData = XLSX.utils.sheet_to_json(ws);
  console.log(`기존 데이터: ${existingData.length}개`);

  // 서울대 데이터 로드
  const snuDataRaw = snuDataModule.snuData || snuDataModule;

  // 서울대 데이터 포맷 맞추기 (지역 추가)
  const snuData = snuDataRaw.map(item => ({
    대학명: item.대학명,
    지역: '서울',
    전형명: item.전형명,
    모집단위: item.모집단위,
    모집인원: item.모집인원,
    지원인원: item.지원인원,
    경쟁률: typeof item.경쟁률 === 'number' ?
      `${item.경쟁률.toFixed(2)} : 1` : item.경쟁률
  }));

  console.log(`서울대 데이터: ${snuData.length}개`);

  // 데이터 병합
  const mergedData = [...snuData, ...existingData];
  console.log(`병합 후 총 데이터: ${mergedData.length}개`);

  // 새 워크북 생성
  const newWb = XLSX.utils.book_new();

  // 1. 경쟁률_상세 시트
  const wsNew = XLSX.utils.json_to_sheet(mergedData);
  wsNew['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 35 },
    { wch: 10 }, { wch: 10 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(newWb, wsNew, '경쟁률_상세');

  // 2. 대학별 요약 시트 재생성
  const summaryByUni = {};
  mergedData.forEach(row => {
    if (!summaryByUni[row.대학명]) {
      summaryByUni[row.대학명] = {
        대학명: row.대학명,
        지역: row.지역 || '',
        전형수: new Set(),
        모집단위수: 0,
        총모집인원: 0,
        총지원인원: 0
      };
    }
    summaryByUni[row.대학명].전형수.add(row.전형명);
    summaryByUni[row.대학명].모집단위수++;

    const recruitNum = parseInt(String(row.모집인원).replace(/,/g, '')) || 0;
    const applicantNum = parseInt(String(row.지원인원).replace(/,/g, '')) || 0;

    summaryByUni[row.대학명].총모집인원 += recruitNum;
    summaryByUni[row.대학명].총지원인원 += applicantNum;
  });

  const summaryData = Object.values(summaryByUni).map(uni => ({
    대학명: uni.대학명,
    지역: uni.지역,
    전형수: uni.전형수.size,
    모집단위수: uni.모집단위수,
    총모집인원: uni.총모집인원,
    총지원인원: uni.총지원인원,
    평균경쟁률: uni.총모집인원 > 0 ?
      (uni.총지원인원 / uni.총모집인원).toFixed(2) + ' : 1' : '-'
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(newWb, wsSummary, '대학별_요약');

  // 3. 기존 시트들 복사 (크롤링실패_대학, 특이사항)
  if (wb.Sheets['크롤링실패_대학']) {
    XLSX.utils.book_append_sheet(newWb, wb.Sheets['크롤링실패_대학'], '크롤링실패_대학');
  }

  // 특이사항 시트 업데이트 (서울대 상태 변경)
  const specialCases = [
    { 대학명: '서울대학교', 비고: 'PDF 수동 입력 완료', URL: 'https://admission.snu.ac.kr/undergraduate/notice' },
    { 대학명: '순천향대학교', 비고: '데이터 미공개', URL: 'http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=' }
  ];
  const wsSpecial = XLSX.utils.json_to_sheet(specialCases);
  wsSpecial['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(newWb, wsSpecial, '특이사항');

  // 파일 저장
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(__dirname, `UWAY_수시_경쟁률_서울대포함_${timestamp}.xlsx`);
  XLSX.writeFile(newWb, outputPath);

  console.log('\n='.repeat(70));
  console.log('병합 완료!');
  console.log(`파일 저장: ${outputPath}`);
  console.log('\n통계:');
  console.log(`  - 서울대 추가: ${snuData.length}개 데이터`);
  console.log(`  - 기존 데이터: ${existingData.length}개`);
  console.log(`  - 총 데이터: ${mergedData.length}개`);
  console.log(`  - 총 대학 수: ${Object.keys(summaryByUni).length}개`);
  console.log('='.repeat(70));
}

mergeSNUData().catch(console.error);
