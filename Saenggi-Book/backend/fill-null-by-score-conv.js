const XLSX = require('xlsx');

const wb = XLSX.readFile('uploads/26 정시 db 1209_fixed.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// null을 채울 컬럼들
const fillCols = [
    {idx: 9, name: '수능'},
    {idx: 10, name: '학생부'},
    {idx: 11, name: '면접'},
    {idx: 12, name: '기타'},
    {idx: 20, name: '영어비율'},
    {idx: 22, name: '한국사비율'}
];

const SCORE_CONV_IDX = 81; // 점수환산 컬럼

// 1단계: 점수환산별 값 맵 생성
const scoreConvMap = {}; // { "경상이공": { 9: "100", 10: "0", ... }, ... }

for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const scoreConv = row[SCORE_CONV_IDX];
    if (!scoreConv) continue;

    if (!scoreConvMap[scoreConv]) {
        scoreConvMap[scoreConv] = {};
    }

    // 각 컬럼에서 값이 있으면 저장
    fillCols.forEach(col => {
        const val = row[col.idx];
        if (val !== undefined && val !== null && val !== '') {
            // 기존 값이 없거나, 현재 값이 더 의미있는 경우 업데이트
            if (!scoreConvMap[scoreConv][col.idx]) {
                scoreConvMap[scoreConv][col.idx] = val;
            }
        }
    });
}

console.log('=== 점수환산별 참조 데이터 생성 완료 ===');
console.log('총 점수환산 종류:', Object.keys(scoreConvMap).length);

// 몇 개 샘플 확인
console.log('\n=== 샘플 데이터 ===');
const sampleKeys = Object.keys(scoreConvMap).slice(0, 5);
sampleKeys.forEach(key => {
    console.log(key + ':', JSON.stringify(scoreConvMap[key]));
});

// 2단계: null 값 채우기
let filled = {};
fillCols.forEach(col => filled[col.name] = 0);

for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const scoreConv = row[SCORE_CONV_IDX];
    if (!scoreConv) continue;

    const refData = scoreConvMap[scoreConv];
    if (!refData) continue;

    fillCols.forEach(col => {
        const val = row[col.idx];
        if (val === undefined || val === null || val === '') {
            // 참조 데이터가 있으면 채움
            if (refData[col.idx] !== undefined) {
                row[col.idx] = refData[col.idx];
                filled[col.name]++;
            }
            // 없으면 비워둠 (아무 작업 안함)
        }
    });
}

console.log('\n=== 채워진 null 개수 ===');
Object.entries(filled).forEach(([name, count]) => {
    console.log(name + ': ' + count + '개 채움');
});

// 3단계: 남은 null 확인
console.log('\n=== 남은 null 개수 ===');
fillCols.forEach(col => {
    let nullCount = 0;
    for (let i = 2; i < data.length; i++) {
        const val = data[i][col.idx];
        if (val === undefined || val === null || val === '') {
            nullCount++;
        }
    }
    console.log(col.name + ': ' + nullCount + '개 null');
});

// 저장
const newWs = XLSX.utils.aoa_to_sheet(data);
wb.Sheets[wb.SheetNames[0]] = newWs;
XLSX.writeFile(wb, 'uploads/26 정시 db 1209_fixed.xlsx');

console.log('\n파일 저장 완료: 26 정시 db 1209_fixed.xlsx');
