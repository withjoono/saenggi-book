/**
 * 서울대 데이터를 V7 크롤링 결과에 병합 (간단 버전)
 */

const XLSX = require('xlsx');
const path = require('path');

async function mergeSNUData() {
  console.log('='.repeat(70));
  console.log('서울대 데이터 병합 시작');
  console.log('='.repeat(70));

  // 서울대 포함 파일 (이전 크롤링 결과)
  const snuFilePath = path.join(__dirname, 'UWAY_수시_경쟁률_서울대포함_2026-01-08.xlsx');
  console.log('\n서울대 포함 파일 읽는 중...');
  const snuWb = XLSX.readFile(snuFilePath);
  const snuWs = snuWb.Sheets['경쟁률_상세'];
  const snuAllData = XLSX.utils.sheet_to_json(snuWs);

  // 서울대 데이터만 추출
  const snuOnly = snuAllData.filter(row => row.대학명 === '서울대학교');
  console.log(`서울대 데이터 추출: ${snuOnly.length}개`);

  // V7 파일 읽기
  const v7FilePath = path.join(__dirname, 'UWAY_수시_경쟁률_V7_2026-01-09.xlsx');
  console.log('V7 파일 읽는 중...');
  const v7Wb = XLSX.readFile(v7FilePath);
  const v7Ws = v7Wb.Sheets['경쟁률_상세'];
  const v7Data = XLSX.utils.sheet_to_json(v7Ws);
  console.log(`V7 데이터: ${v7Data.length}개`);

  // 서울대 데이터가 V7에 있는지 확인 (제거)
  const v7WithoutSNU = v7Data.filter(row => row.대학명 !== '서울대학교');
  console.log(`서울대 제외 후: ${v7WithoutSNU.length}개`);

  // 데이터 병합 (서울대를 맨 앞에)
  const mergedData = [...snuOnly, ...v7WithoutSNU];
  console.log(`\n병합 후 총 데이터: ${mergedData.length}개`);

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

  const summaryData = Object.values(summaryByUni)
    .sort((a, b) => a.대학명.localeCompare(b.대학명, 'ko'))
    .map(uni => ({
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

  // 3. 특이사항 시트 업데이트 (서울대 상태 변경)
  const specialCases = [
    { 대학명: '서울대학교', 비고: 'PDF 수동 입력 완료 ✓', URL: 'https://admission.snu.ac.kr/undergraduate/notice' },
    { 대학명: '순천향대학교', 비고: '데이터 미공개', URL: 'http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=' }
  ];
  const wsSpecial = XLSX.utils.json_to_sheet(specialCases);
  wsSpecial['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(newWb, wsSpecial, '특이사항');

  // 4. 통계 시트 추가
  const stats = {
    총대학수: Object.keys(summaryByUni).length,
    총데이터수: mergedData.length,
    크롤링성공: '175개 중 174개',
    서울대: '수동입력 완료',
    순천향대: '데이터 미공개',
    평균데이터수: Math.round(mergedData.length / Object.keys(summaryByUni).length),
    생성시간: new Date().toISOString().split('T').join(' ').split('.')[0]
  };
  const wsStats = XLSX.utils.json_to_sheet([stats]);
  wsStats['!cols'] = [
    { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
    { wch: 20 }, { wch: 15 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(newWb, wsStats, '통계');

  // 파일 저장
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(__dirname, `UWAY_수시_경쟁률_최종_서울대포함_${timestamp}.xlsx`);
  XLSX.writeFile(newWb, outputPath);

  console.log('\n='.repeat(70));
  console.log('병합 완료!');
  console.log(`파일 저장: ${outputPath}`);
  console.log('\n📊 통계:');
  console.log(`  ✓ 서울대 추가: ${snuOnly.length}개 데이터`);
  console.log(`  ✓ 기존 데이터: ${v7WithoutSNU.length}개`);
  console.log(`  ✓ 총 데이터: ${mergedData.length}개`);
  console.log(`  ✓ 총 대학 수: ${Object.keys(summaryByUni).length}개 (175개 중)`);
  console.log(`  ✓ 평균 데이터/대학: ${Math.round(mergedData.length / Object.keys(summaryByUni).length)}개`);

  // 서울대 통계 출력
  const snuSummary = summaryByUni['서울대학교'];
  if (snuSummary) {
    console.log('\n📌 서울대학교:');
    console.log(`  - 전형 수: ${snuSummary.전형수.size}개`);
    console.log(`  - 모집단위 수: ${snuSummary.모집단위수}개`);
    console.log(`  - 총 모집인원: ${snuSummary.총모집인원}명`);
    console.log(`  - 총 지원인원: ${snuSummary.총지원인원}명`);
    console.log(`  - 평균 경쟁률: ${(snuSummary.총지원인원 / snuSummary.총모집인원).toFixed(2)} : 1`);
  }

  console.log('='.repeat(70));
}

mergeSNUData().catch(console.error);
