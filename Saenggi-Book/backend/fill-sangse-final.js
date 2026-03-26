const XLSX = require('xlsx');

// 수정된 파일 읽기
const wb = XLSX.readFile('uploads/26 정시 db 1209_fixed.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const sangseIdx = 5;  // 상세계열
const mojipIdx = 6;   // 모집단위명
const gyeyeolIdx = 4; // 계열

// 확장된 키워드 매핑
const extendedMapping = {
    // IT/공학 계열
    'IT': '공학', 'ICT': '공학', 'SW': '공학', '소프트웨어': '공학', '게임': '공학',
    '로봇': '공학', '드론': '공학', '메카트로닉스': '공학', '반도체': '공학', '배터리': '공학',
    '철도': '공학', '모빌리티': '공학', '인프라': '공학', '시스템공학': '공학', '융합공학': '공학',
    '디지털': '공학', '빅데이터': '공학', '클라우드': '공학', '정보보안': '공학',
    '조선': '공학', '선박': '공학', '해양공학': '공학', '양자': '공학', '나노': '공학',
    '냉동': '공학', '용접': '공학', '금형': '공학', '펄프': '공학', '임산': '공학',
    '의공': '공학', '지구자원': '공학', '광공학': '공학', '광기술': '공학',
    '고분자': '공학', '첨단소재': '공학', '제어': '공학', '기관시스템': '공학',

    // 예체능 계열
    '뷰티': '예체능', '미용': '예체능', '스타일리스트': '예체능', '화장품': '예체능',
    '영상': '예체능', '애니메이션': '예체능', '웹툰': '예체능', '콘텐츠': '예체능',
    '영화': '예체능', '사진': '예체능', '만화': '예체능',
    '도예': '예체능', '조소': '예체능', '회화': '예체능', '판화': '예체능', '동양화': '예체능',
    '공연': '예체능', '연극': '예체능', '연기': '예체능', '음향': '예체능',
    '엔터테인먼트': '예체능', 'KPOP': '예체능', 'K뷰티': '예체능', 'K스타일': '예체능',
    '문예창작': '예체능', '예술': '예체능', '크리에이티브': '예체능',
    '공간연출': '예체능', '트랜스아트': '예체능', '큐레이터': '예체능',
    '골프': '예체능', '운동': '예체능', '레저': '예체능', '무도': '예체능', '태권도': '예체능',
    '귀금속': '예체능', '보석': '예체능', '목조형': '예체능', '한복': '예체능',
    '조리': '예체능', '제과': '예체능', '외식': '예체능', '카페': '예체능', '베이커리': '예체능',

    // 상경 계열
    '물류': '상경', '유통': '상경', '통상': '상경', '마케팅': '상경', '비즈니스': '상경',
    '무역': '상경', '재무': '상경', '부동산': '상경', '경상': '상경', '산업유통': '상경',
    'MICE': '상경', '창업': '상경',

    // 사회 계열
    '경찰': '사회', '경호': '사회', '소방': '사회', '안전': '사회', '재난': '사회',
    '국방': '사회', '군사': '사회', '보안학': '사회', '국가안보': '사회', '밀리터리': '사회',
    '해양경찰': '사회', '자치경찰': '사회', '해군사관': '사회',

    // 인문 계열
    '언어': '인문', '외국어': '인문', '글로벌': '인문', '국제': '인문', '통번역': '인문',
    '영어': '인문', '일본어': '인문', '중국어': '인문', '독일': '인문', '프랑스': '인문',
    '러시아': '인문', '스페인': '인문', '한국어': '인문', '한국학': '인문',
    '루마니아': '인문', '우크라이나': '인문', '체코': '인문', '폴란드': '인문', '헝가리': '인문',
    '태국': '인문', '튀르키예': '인문', '아제르바이잔': '인문', '아시아': '인문',
    '인문학': '인문', '문헌정보': '인문', '인류학': '인문', '문화재': '인문', '고고학': '인문',
    '문화인류': '인문', '문학': '인문',
    '신학': '인문', '원불교': '인문', '선교': '인문',

    // 자연 계열
    '동물': '자연', '축산': '자연', '반려동물': '자연', '농학': '자연', '식물': '자연',
    '농산업': '자연', '스마트팜': '자연', '지질': '자연', '생태': '자연', '조경': '자연',
    '생활과학': '자연', '과학기술': '자연', '자연과학': '자연', '도시계획': '자연',
    '지적': '자연', '공간정보': '자연', '지역시스템': '자연',

    // 의약 계열
    '의료': '의약', '재활': '의약', '헬스케어': '의약', '치료': '의약',
    '언어재활': '의약', '언어치료': '의약', '한방': '의약', '메디컬': '의약',

    // 교육 계열
    '아동': '교육', '보육': '교육', '인재개발': '교육',

    // 자율전공 - 계열로 분류
    '자율전공': '자율전공', '자유전공': '자율전공', '융합학부': '자율전공', '광역': '자율전공',
    '통합선발': '자율전공', '통합모집': '자율전공', '칼리지': '자율전공', '학부대학': '자율전공',
    '아너스': '자율전공', '트리니티': '자율전공', '리버럴아츠': '자율전공',
    '수능우수자': '자율전공', '뇌인지': '자연', '프라마나': '인문',
    '융합대학': '자율전공', '공대자유': '공학', '공학분야': '공학', '인문분야': '인문',
    '예체능분야': '예체능', '헬리콥터': '공학', '혁신신약': '의약', '약손명가': '예체능',
    '공공수요': '사회'
};

let filledCount = 0;
let stillNull = 0;

for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[sangseIdx] || row[sangseIdx] === '') {
        const mojip = (row[mojipIdx] || '').toString();
        const gyeyeol = (row[gyeyeolIdx] || '').toString();

        // 확장 키워드 매핑 시도
        let matched = false;
        for (const [keyword, sangse] of Object.entries(extendedMapping)) {
            if (mojip.includes(keyword)) {
                row[sangseIdx] = sangse;
                filledCount++;
                matched = true;
                break;
            }
        }

        // 아직 매칭 안됐으면 계열 기반으로 설정
        if (!matched) {
            if (gyeyeol.includes('인문')) {
                row[sangseIdx] = '인문';
                filledCount++;
            } else if (gyeyeol.includes('자연') || gyeyeol.includes('이과')) {
                row[sangseIdx] = '자연';
                filledCount++;
            } else if (gyeyeol.includes('예체능') || gyeyeol.includes('예술') || gyeyeol.includes('체육')) {
                row[sangseIdx] = '예체능';
                filledCount++;
            } else if (gyeyeol.includes('공학')) {
                row[sangseIdx] = '공학';
                filledCount++;
            } else if (gyeyeol.includes('상경') || gyeyeol.includes('경상')) {
                row[sangseIdx] = '상경';
                filledCount++;
            } else if (gyeyeol.includes('사회')) {
                row[sangseIdx] = '사회';
                filledCount++;
            } else if (gyeyeol.includes('의약') || gyeyeol.includes('의학')) {
                row[sangseIdx] = '의약';
                filledCount++;
            } else if (gyeyeol.includes('교육')) {
                row[sangseIdx] = '교육';
                filledCount++;
            } else {
                stillNull++;
            }
        }
    }
}

console.log('=== 확장 키워드 + 계열 매핑 결과 ===');
console.log('추가로 채워진 행:', filledCount);
console.log('여전히 null:', stillNull);

// 저장
const newWs = XLSX.utils.aoa_to_sheet(data);
wb.Sheets[wb.SheetNames[0]] = newWs;
XLSX.writeFile(wb, 'uploads/26 정시 db 1209_fixed.xlsx');

console.log('\n파일 저장 완료: 26 정시 db 1209_fixed.xlsx');

// 최종 null 확인
let finalNullCount = 0;
const remaining = [];
for (let i = 1; i < data.length; i++) {
    if (!data[i][sangseIdx] || data[i][sangseIdx] === '') {
        finalNullCount++;
        if (remaining.length < 20) {
            remaining.push({
                mojip: data[i][mojipIdx],
                gyeyeol: data[i][gyeyeolIdx]
            });
        }
    }
}

console.log('\n=== 최종 상세계열 null 확인 ===');
console.log('총 null 행:', finalNullCount);
if (remaining.length > 0) {
    console.log('\n남은 null 샘플 (20개):');
    remaining.forEach(r => console.log(`  ${r.mojip} (계열: ${r.gyeyeol})`));
}
