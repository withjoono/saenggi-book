// analyze-mismatch.ts
// 불일치 항목 상세 분석

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// 점수표 로드
const dataDir = path.join(__dirname, 'src/modules/jungsi/calculation/data');
const 점수표 = JSON.parse(fs.readFileSync(path.join(dataDir, '점수표-26-정시.json'), 'utf-8'));

// Excel 결과 파일 읽기
const workbook = XLSX.readFile('uploads/환산점수_계산결과_수정후.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet) as any[];

// 불일치 항목만 추출 (고유 점수환산 코드)
const mismatchCodes = new Map<string, any>();
data.filter(row => row['일치여부'] === 'X').forEach(row => {
  if (!mismatchCodes.has(row['점수환산'])) {
    mismatchCodes.set(row['점수환산'], row);
  }
});

console.log(`=== 불일치 점수환산 코드 분석 (${mismatchCodes.size}개) ===\n`);

// 차이 크기별 분류
const 큰차이: any[] = [];  // 10점 이상
const 중간차이: any[] = []; // 1~10점
const 작은차이: any[] = []; // 1점 미만

mismatchCodes.forEach((row, code) => {
  const 차이 = row['차이'];
  if (typeof 차이 === 'number') {
    if (차이 >= 10) 큰차이.push({ code, ...row });
    else if (차이 >= 1) 중간차이.push({ code, ...row });
    else 작은차이.push({ code, ...row });
  } else {
    큰차이.push({ code, ...row, 에러: row['에러'] || '계산 실패' });
  }
});

// 점수표 기반 예상값 계산 함수
function calc점수표합계(학교: string): number | null {
  try {
    const 국어 = 점수표['국어']?.['145']?.[학교];
    const 수학 = 점수표['수학(미적)']?.['130']?.[학교];
    const 영어 = 점수표['영어']?.['1']?.[학교];
    const 한국사 = 점수표['한국사']?.['2']?.[학교];
    const 생명 = 점수표['생명과학 Ⅰ']?.['69']?.[학교];
    const 화학 = 점수표['화학 Ⅰ']?.['68']?.[학교];

    if (국어 === undefined && 수학 === undefined) return null;

    return (국어 || 0) + (수학 || 0) + (영어 || 0) + (한국사 || 0) + (생명 || 0) + (화학 || 0);
  } catch {
    return null;
  }
}

console.log('=== 큰 차이 (10점 이상) ===\n');
큰차이.forEach(item => {
  const 점수표합 = calc점수표합계(item.code);
  console.log(`${item.code}:`);
  console.log(`  Excel예상: ${item['Excel예상값']}`);
  console.log(`  계산값: ${item['계산값']}`);
  console.log(`  차이: ${item['차이']}`);
  console.log(`  점수표합: ${점수표합}`);
  if (item['에러']) console.log(`  에러: ${item['에러']}`);
  console.log('');
});

console.log('\n=== 중간 차이 (1~10점) ===\n');
중간차이.forEach(item => {
  const 점수표합 = calc점수표합계(item.code);
  console.log(`${item.code}: Excel=${item['Excel예상값']}, 계산=${item['계산값']}, 차이=${item['차이']?.toFixed(2)}, 점수표합=${점수표합}`);
});

console.log('\n=== 작은 차이 (1점 미만, 반올림 차이) ===\n');
작은차이.forEach(item => {
  console.log(`${item.code}: Excel=${item['Excel예상값']}, 계산=${item['계산값']}, 차이=${item['차이']?.toFixed(4)}`);
});

// 특수 계산 대학 확인
console.log('\n=== 특수 계산 필요 대학 분석 ===\n');

const 특수대학 = ['가천통합백', '가천통합표', '서울간호', '이화간호', '고려세신약', '국민예체능', '지스트', '을지간호2'];
특수대학.forEach(학교 => {
  const row = mismatchCodes.get(학교);
  if (row) {
    const 점수표합 = calc점수표합계(학교);
    console.log(`${학교}:`);
    console.log(`  Excel예상값: ${row['Excel예상값']}`);
    console.log(`  현재계산값: ${row['계산값']}`);
    console.log(`  점수표단순합: ${점수표합}`);

    // 점수표 상세
    console.log(`  점수표 상세:`);
    console.log(`    국어(145): ${점수표['국어']?.['145']?.[학교]}`);
    console.log(`    수학(130): ${점수표['수학(미적)']?.['130']?.[학교]}`);
    console.log(`    영어(1등급): ${점수표['영어']?.['1']?.[학교]}`);
    console.log(`    한국사(2등급): ${점수표['한국사']?.['2']?.[학교]}`);
    console.log(`    생명(69): ${점수표['생명과학 Ⅰ']?.['69']?.[학교]}`);
    console.log(`    화학(68): ${점수표['화학 Ⅰ']?.['68']?.[학교]}`);
    console.log('');
  }
});
