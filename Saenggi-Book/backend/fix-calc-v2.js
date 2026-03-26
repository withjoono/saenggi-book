const fs = require('fs');
const path = require('path');

const calcPath = path.join(__dirname, 'src/modules/jungsi/calculation/calculations/calc-2026.ts');
let content = fs.readFileSync(calcPath, 'utf-8');

// 현재 버전 확인
if (content.includes('// 가장 가까운 점수 찾기')) {
  console.log('Already has v2 fix');
  process.exit(0);
}

// 기존 범위 초과 처리 코드를 더 완전한 버전으로 교체
const oldCode = `  // 점수 데이터가 없으면 점수표 범위 초과 여부 확인 후 최대/최소값 사용
  if (!점수데이터 && 과목.과목 !== '영어' && 과목.과목 !== '한국사') {
    const 표준점수 = 과목.표준점수 || 0;
    const 점수표키들 = Object.keys(과목데이터)
      .map(Number)
      .filter((k) => !isNaN(k))
      .sort((a, b) => a - b);

    if (점수표키들.length > 0) {
      const 최대점수 = 점수표키들[점수표키들.length - 1];
      const 최소점수 = 점수표키들[0];

      if (표준점수 > 최대점수) {
        // 입력 점수가 점수표 최대값보다 높으면 최대값 데이터 사용
        점수데이터 = 과목데이터[String(최대점수)];
      } else if (표준점수 < 최소점수) {
        // 입력 점수가 점수표 최소값보다 낮으면 최소값 데이터 사용
        점수데이터 = 과목데이터[String(최소점수)];
      }
    }
  }`;

const newCode = `  // 점수 데이터가 없으면 가장 가까운 점수 데이터 사용 (범위 초과 또는 중간값 누락 처리)
  if (!점수데이터 && 과목.과목 !== '영어' && 과목.과목 !== '한국사') {
    const 표준점수 = 과목.표준점수 || 0;
    const 점수표키들 = Object.keys(과목데이터)
      .map(Number)
      .filter((k) => !isNaN(k))
      .sort((a, b) => a - b);

    if (점수표키들.length > 0) {
      // 가장 가까운 점수 찾기
      let 가까운점수 = 점수표키들[0];
      let 최소차이 = Math.abs(표준점수 - 가까운점수);

      for (const 키 of 점수표키들) {
        const 차이 = Math.abs(표준점수 - 키);
        if (차이 < 최소차이) {
          최소차이 = 차이;
          가까운점수 = 키;
        }
      }

      점수데이터 = 과목데이터[String(가까운점수)];
    }
  }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(calcPath, content, 'utf-8');
  console.log('Applied v2 fix - now handles missing intermediate scores');
} else {
  console.log('Could not find the code to replace. Checking current state...');
  if (content.includes('가장 가까운 점수 찾기')) {
    console.log('Already fixed to v2');
  } else if (content.includes('점수표 범위 초과 여부 확인')) {
    console.log('Has v1 fix, need manual update');
  } else {
    console.log('Unknown state');
  }
}
