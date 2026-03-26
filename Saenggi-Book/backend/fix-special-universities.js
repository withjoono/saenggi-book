const fs = require('fs');
const filePath = 'src/modules/jungsi/calculation/calculations/calc-2026.ts';
let content = fs.readFileSync(filePath, 'utf8');

// calc가중택2026 함수에서 default 전에 새로운 케이스 추가
const defaultCase = `    default:
      return 0;
  }
};

const calcPattern2026`;

const newCases = `    // 국수영탐(2)中가중택4 - 성균관: MAX(4*국어+3*수학+1*영어+2*탐구합, 3*국어+4*수학+1*영어+2*탐구합)
    case '국수영탐(2)中가중택4':
      // 대학별로 다른 가중치 사용
      if (params.학교?.startsWith('성균')) {
        return Math.max(
          4 * 국어 + 3 * 수학 + 1 * 영어 + 2 * 탐구합,
          3 * 국어 + 4 * 수학 + 1 * 영어 + 2 * 탐구합
        );
      }
      // 서울간호, 이화간호 등은 특수 처리 필요 (다른 대학 참조)
      // 기본값: 가중택 없음으로 처리
      return 4 * LARGE([국어, 수학, 영어, 탐구합], 1) +
             3 * LARGE([국어, 수학, 영어, 탐구합], 2) +
             2 * LARGE([국어, 수학, 영어, 탐구합], 3) +
             1 * LARGE([국어, 수학, 영어, 탐구합], 4);

    // 국수영탐(1)中가중택4 - 대학별로 다른 가중치
    case '국수영탐(1)中가중택4': {
      const 항목들 = [국어, 수학, 영어, 탐구합];

      // 삼육: 3.5*LARGE(1) + 2.5*LARGE(2) + 2.5*LARGE(3) + 1.5*LARGE(4)
      if (params.학교?.startsWith('삼육')) {
        return 3.5 * LARGE(항목들, 1) + 2.5 * LARGE(항목들, 2) +
               2.5 * LARGE(항목들, 3) + 1.5 * LARGE(항목들, 4);
      }

      // 덕성: 3.5*LARGE(1) + 3.5*LARGE(2) + 2*LARGE(3) + 1*LARGE(4)
      if (params.학교?.startsWith('덕성')) {
        return 3.5 * LARGE(항목들, 1) + 3.5 * LARGE(항목들, 2) +
               2 * LARGE(항목들, 3) + 1 * LARGE(항목들, 4);
      }

      // 한성: 4*LARGE(1) + 3*LARGE(2) + 2*LARGE(3) + 1*LARGE(4)
      if (params.학교?.startsWith('한성')) {
        return 4 * LARGE(항목들, 1) + 3 * LARGE(항목들, 2) +
               2 * LARGE(항목들, 3) + 1 * LARGE(항목들, 4);
      }

      // 서울여: 3.5*LARGE(1) + 3*LARGE(2) + 2*LARGE(3) + 1.5*LARGE(4)
      if (params.학교?.startsWith('서울여')) {
        return 3.5 * LARGE(항목들, 1) + 3 * LARGE(항목들, 2) +
               2 * LARGE(항목들, 3) + 1.5 * LARGE(항목들, 4);
      }

      // 성균글: MAX(4*국어+3*수학+1*영어+2*탐구합, 3*국어+4*수학+1*영어+2*탐구합)
      if (params.학교?.startsWith('성균글')) {
        return Math.max(
          4 * 국어 + 3 * 수학 + 1 * 영어 + 2 * 탐구합,
          3 * 국어 + 4 * 수학 + 1 * 영어 + 2 * 탐구합
        );
      }

      // 기본값: 4*LARGE(1) + 3*LARGE(2) + 2*LARGE(3) + 1*LARGE(4)
      return 4 * LARGE(항목들, 1) + 3 * LARGE(항목들, 2) +
             2 * LARGE(항목들, 3) + 1 * LARGE(항목들, 4);
    }

    default:
      return 0;
  }
};

const calcPattern2026`;

if (content.includes(defaultCase)) {
  content = content.replace(defaultCase, newCases);
  console.log('✅ 국수영탐 가중택4 케이스 추가 완료');
} else {
  console.log('❌ default case를 찾을 수 없음');
}

fs.writeFileSync(filePath, content);
console.log('\n파일 저장 완료');
