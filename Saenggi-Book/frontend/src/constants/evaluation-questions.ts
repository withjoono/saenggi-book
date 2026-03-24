import { CompetencyCategory } from '@/types/evaluation.type';

// ==================== 40개 평가 질문 ====================

export interface EvalQuestion {
    id: number;
    category: CompetencyCategory;
    subCategory: string;
    question: string;
}

export const EVAL_QUESTIONS: EvalQuestion[] = [
    // ── 진로역량 (Q1~Q7) ──
    { id: 1, category: 'career', subCategory: '전공관련 교과이수 노력', question: '전공(계열)과 관련된 과목을 적절하게 선택하고, 이수한 과목은 얼마나 되는가?' },
    { id: 2, category: 'career', subCategory: '전공관련 교과이수 노력', question: '전공(계열)과 관련된 과목을 이수하기 위하여 추가적인 노력을 하였는가? (예: 공동교육과정, 온라인수업 소인수과목 등)' },
    { id: 3, category: 'career', subCategory: '전공관련 교과이수 노력', question: '전공(계열)과 관련된 교과의 성취수준은 적절한가?' },
    { id: 4, category: 'career', subCategory: '전공관련 교과이수 노력', question: '진로와학(반)지도/선택과목 교육 학습단계(위계)에 따른 이수현황는가?' },
    { id: 5, category: 'career', subCategory: '전공관련 교과이수 노력', question: '전공(계열)관련 과목에서 전공에 대한 관심과 이해가 드러나 있는가?' },
    { id: 6, category: 'career', subCategory: '전공관련 활동과 경험', question: '전공 분야에 대한 궁금증이나 학업 관련 관심이 있는가?' },
    { id: 7, category: 'career', subCategory: '전공관련 활동과 경험', question: '전공 분야나 관련 과목에서 적극적이고 구체적인 노력과 활동을 하였는가? 포트폴리오를 통을 종합적으로 고려한 성취수준은 적절한가?' },

    // ── 학업역량 (Q8~Q15) ──
    { id: 8, category: 'academic', subCategory: '학업성취도', question: '대학 수학에 필요한 기본 교과목(예: 국어, 수학, 영어, 사회/과학)의 교과성적은 적절한가? 그 외 교과목(예: 예술·체육, 기술·가정/정보, 제2외국어/한문, 교양 등)의 교과성적은 어느 정도인가? 유난히 소홀한 과목이 있는가?' },
    { id: 9, category: 'academic', subCategory: '학업성취도', question: '학기별/학년별 성적의 추이는 어떠한가?' },
    { id: 10, category: 'academic', subCategory: '학업태도', question: '성취동기와 목표의식을 가지고 자발적으로 학습하려는 의지가 있는가?' },
    { id: 11, category: 'academic', subCategory: '학업태도', question: '새로운 지식을 회득하기 위해 자기주도적으로 노력하고 있는가?' },
    { id: 12, category: 'academic', subCategory: '학업태도', question: '교과 수업에 적극적으로 참여해 수업 내용을 이해하려는 태도와 열정이 있는가?' },
    { id: 13, category: 'academic', subCategory: '탐구력', question: '교과와 각종 탐구활동 등을 통해 지식을 확장하려고 노력하고 있는가?' },
    { id: 14, category: 'academic', subCategory: '탐구력', question: '교과와 각종 탐구활동에서 구체적인 성과를 보이고 있는가?' },
    { id: 15, category: 'academic', subCategory: '탐구력', question: '교내 활동에서 학문에 대한 열의와 지적 관심이 드러나고 있는가?' },

    // ── 공동체역량 (Q16~Q25) ──
    { id: 16, category: 'community', subCategory: '협업과 소통능력', question: '단체 활동 과정에서 서로 돕고 함께 행동하는 모습이 보이는가?' },
    { id: 17, category: 'community', subCategory: '협업과 소통능력', question: '구성원들과 협력을 통하여 공동의 과제를 수행하고 완성한 경험이 있는가?' },
    { id: 18, category: 'community', subCategory: '협업과 소통능력', question: '타인의 의견에 공감하고 수용하는 태도를 보이며, 자신의 정보와 생각을 잘 전달하는가?' },
    { id: 19, category: 'community', subCategory: '나눔과 배려', question: '학교생활 속에서 나눔을 생활화한 경험이 있는가?' },
    { id: 20, category: 'community', subCategory: '나눔과 배려', question: '타인을 위하여 양보하거나 배려를 실천한 구체적 경험이 있는가?' },
    { id: 21, category: 'community', subCategory: '나눔과 배려', question: '상대를 이해하고 존중하는 노력을 기울이고 있는가?' },
    { id: 22, category: 'community', subCategory: '성실성과 규칙준수', question: '교내 활동에서 자신이 맡은 역할에 최선을 다하려고 노력한 경험이 있는가?' },
    { id: 23, category: 'community', subCategory: '성실성과 규칙준수', question: '자신이 속한 공동체가 정한 규칙과 규정을 준수하고 있는가?' },
    { id: 24, category: 'community', subCategory: '리더십', question: '공동체의 목표를 달성하기 위해 계획하고 실행을 주도한 경험이 있는가?' },
    { id: 25, category: 'community', subCategory: '리더십', question: '구성원들의 인정과 신뢰를 바탕으로 참여를 이끌어내고 조율한 경험이 있는가?' },

    // ── 기타역량 (Q26~Q40) ──
    { id: 26, category: 'other', subCategory: '자기주도성', question: '교내 다양한 활동에서 주도적, 적극적으로 활동을 수행하는가?' },
    { id: 27, category: 'other', subCategory: '자기주도성', question: '새로운 과제를 주도적으로 만들고 성과를 내었는가?' },
    { id: 28, category: 'other', subCategory: '자기주도성', question: '기존에 경험한 내용을 바탕으로 스스로 외연을 확장하려고 노력하였는가?' },
    { id: 29, category: 'other', subCategory: '경험의 다양성', question: '자율, 동아리, 봉사, 진로활동 등 체험활동을 통해 다양한 경험을 쌓았는가?' },
    { id: 30, category: 'other', subCategory: '경험의 다양성', question: '독서활동을 통해 다양한 영역에서 지식과 문화적 소양을 쌓았는가?' },
    { id: 31, category: 'other', subCategory: '경험의 다양성', question: '예체능 영역에서 적극적이고 성실하게 참여하였는가?' },
    { id: 32, category: 'other', subCategory: '경험의 다양성', question: '자신의 목표를 위해 도전한 경험을 통해 성취한 적이 있는가?' },
    { id: 33, category: 'other', subCategory: '창의적 문제해결력', question: '교내 행동 과정에서 창의적인 발상을 통해 일을 진행한 경험이 있는가?' },
    { id: 34, category: 'other', subCategory: '창의적 문제해결력', question: '교내 활동 과정에서 나타나는 문제점을 적극적으로 해결하기 위해 노력 하였는가?' },
    { id: 35, category: 'other', subCategory: '창의적 문제해결력', question: '주어진 교육환경을 극복하거나 충분히 활용한 경험이 있는가?' },
    { id: 36, category: 'other', subCategory: '교직 적합성 및 잠재력', question: '교직에 대한 흥미와 관심: 교직에 대한 적극적인 모습과 알고 있는 정도 및 교원양성기관 진학을 위한 노력 정도' },
    { id: 37, category: 'other', subCategory: '교직 적합성 및 잠재력', question: '교직 수행을 위한 다양한 경험: 교직에 대한 관심을 갖고 본인이 참여한 활동, 과정을 통해 얻은 다양한 경험' },
    { id: 38, category: 'other', subCategory: '교직 적합성 및 잠재력', question: '교직 활동을 위한 리더십 및 자기주도성: 공동체 활동에 참여하여, 구성원을 긍정적인 방향으로 변화시킨 경험과 교직 관련 활동에서 능동적으로 주도하려는 태도, 가치관, 역량' },
    { id: 39, category: 'other', subCategory: '다문화글로벌 역량', question: '다문화 역량, 글로벌 역량' },
    { id: 40, category: 'other', subCategory: '다문화글로벌 역량', question: '지역 및 세계 속 공동체의 일원으로서 환경, 기아, 빈곤, 인권과 같은 범지구적 공동체 문제에 관심을 가지고 문제 해결에 참여하고자 하는가?' },
];

// ==================== 소분류 그룹 ====================

export interface SubCategoryGroup {
    name: string;
    category: CompetencyCategory;
    questionIds: number[];
}

export const SUB_CATEGORY_GROUPS: SubCategoryGroup[] = [
    { name: '전공관련 교과이수 노력', category: 'career', questionIds: [1, 2, 3, 4, 5] },
    { name: '전공관련 활동과 경험', category: 'career', questionIds: [6, 7] },
    { name: '학업성취도', category: 'academic', questionIds: [8, 9] },
    { name: '학업태도', category: 'academic', questionIds: [10, 11, 12] },
    { name: '탐구력', category: 'academic', questionIds: [13, 14, 15] },
    { name: '협업과 소통능력', category: 'community', questionIds: [16, 17, 18] },
    { name: '나눔과 배려', category: 'community', questionIds: [19, 20, 21] },
    { name: '성실성과 규칙준수', category: 'community', questionIds: [22, 23] },
    { name: '리더십', category: 'community', questionIds: [24, 25] },
    { name: '자기주도성', category: 'other', questionIds: [26, 27, 28] },
    { name: '경험의 다양성', category: 'other', questionIds: [29, 30, 31, 32] },
    { name: '창의적 문제해결력', category: 'other', questionIds: [33, 34, 35] },
    { name: '교직 적합성 및 잠재력', category: 'other', questionIds: [36, 37, 38] },
    { name: '다문화글로벌 역량', category: 'other', questionIds: [39, 40] },
];

// ==================== 대학 평가요소 → 질문 매핑 ====================
// 2026 시트의 일부 주요 평가요소

export interface UnivEvalFactor {
    code: string;
    name: string;
    questionIds: number[];
}

export const UNIV_EVAL_FACTORS: UnivEvalFactor[] = [
    { code: 'E2', name: '계열(전공)적합성', questionIds: [1, 2, 3, 4, 5] },
    { code: 'E3', name: '계열적합성', questionIds: [1, 2, 3, 4, 5] },
    { code: 'E8', name: '공동체역량', questionIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
    { code: 'E11', name: '교과', questionIds: [1, 2, 3, 4, 8, 9] },
    { code: 'E24', name: '기초학습역량', questionIds: [10, 11, 12, 13, 14, 15] },
    { code: 'E25', name: '기초학업역량', questionIds: [10, 11, 12, 13, 14, 15] },
    { code: 'E28', name: '대인관계/품성', questionIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
    { code: 'E32', name: '문제해결역량', questionIds: [33, 34, 35] },
    { code: 'E33', name: '미래성장가능성', questionIds: [26, 27, 28, 29, 30, 31, 32] },
    { code: 'E34', name: '발전가능성', questionIds: [16, 17, 18, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35] },
    { code: 'E36', name: '비교과', questionIds: [6, 7, 13, 14, 15, 29, 30, 31, 32] },
    { code: 'E38', name: '비판적사고역량', questionIds: [13, 14, 15] },
    { code: 'E52', name: '학업역량', questionIds: [8, 9, 10, 11, 12, 13, 14, 15] },
    { code: 'E53', name: '진로역량', questionIds: [1, 2, 3, 4, 5, 6, 7] },
    { code: 'E54', name: '성장잠재력', questionIds: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35] },
    { code: 'E55', name: '전공적합성 및 잠재역량', questionIds: [1, 2, 3, 4, 5, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35] },
    { code: 'E56', name: '종합역량평가', questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    { code: 'E57', name: '창의성', questionIds: [33, 34, 35] },
    { code: 'E58', name: '학교생활충실도', questionIds: [10, 11, 12, 13, 14, 15, 22, 23] },
    { code: 'E59', name: '핵심역량', questionIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
    { code: 'E60', name: '교직적성', questionIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 36, 37, 38] },
    { code: 'E61', name: '교직소양', questionIds: [36, 37, 38] },
    { code: 'E62', name: '인성', questionIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] },
    { code: 'E63', name: '다문화/글로벌역량', questionIds: [39, 40] },
];

// ==================== 개선 가이드 메시지 ====================

export const IMPROVEMENT_TIPS: Record<string, string[]> = {
    '전공관련 교과이수 노력': [
        '전공 관련 과목을 적극적으로 선택하고 이수한 이력을 구체적으로 기록하세요.',
        '공동교육과정, 온라인 수업 등 추가적인 교과 이수 노력을 보여주세요.',
        '전공 관련 교과에서 높은 성취수준을 유지하세요.',
    ],
    '전공관련 활동과 경험': [
        '전공 분야에 대한 궁금증을 구체적인 탐구활동으로 표현하세요.',
        '전공 관련 동아리, 프로젝트, 독서 활동 등의 경험을 쌓으세요.',
    ],
    '학업성취도': [
        '기본 교과목(국·수·영·사/과)의 성적을 꾸준히 관리하세요.',
        '학기별/학년별 성적이 상승하는 추이를 보여주세요.',
    ],
    '학업태도': [
        '자발적 학습 의지와 목표의식을 세특에 드러나도록 활동하세요.',
        '자기주도적 학습 노력(독서, 심화탐구 등)을 구체적으로 기록하세요.',
        '수업 참여 태도와 열정을 보여주는 사례를 남기세요.',
    ],
    '탐구력': [
        '교과 연계 실험, 보고서, 발표 등으로 탐구 성과를 보여주세요.',
        '학문적 호기심과 지적 관심을 구체적 활동으로 연결하세요.',
    ],
    '협업과 소통능력': [
        '모둠 활동, 프로젝트에서 협업한 구체적 경험을 기록하세요.',
        '타인의 의견을 경청하고 자신의 생각을 전달한 사례를 남기세요.',
    ],
    '나눔과 배려': [
        '학교생활에서 나눔을 실천한 구체적 사례를 기록하세요.',
        '타인에 대한 배려와 존중을 실천한 경험을 남기세요.',
    ],
    '성실성과 규칙준수': [
        '맡은 역할에 최선을 다한 과정과 결과를 기록하세요.',
        '출결, 봉사 등 기본적인 학교생활 성실도를 유지하세요.',
    ],
    '리더십': [
        '반장, 동아리장 등 리더로서 공동체를 이끈 경험을 기록하세요.',
        '공식적 직책이 아니더라도 주도적으로 참여한 사례를 남기세요.',
    ],
    '자기주도성': [
        '수업 외에 자발적으로 시작한 프로젝트나 활동을 기록하세요.',
        '기존 경험을 확장하여 새로운 도전을 한 사례를 남기세요.',
    ],
    '경험의 다양성': [
        '자율·동아리·봉사·진로 활동을 골고루 경험하세요.',
        '독서 활동에서 다양한 분야의 책을 읽은 내용을 기록하세요.',
    ],
    '창의적 문제해결력': [
        '문제를 인식하고 창의적으로 해결한 과정을 기록하세요.',
        '주어진 교육환경을 활용하여 새로운 가치를 만든 경험을 남기세요.',
    ],
    '교직 적합성 및 잠재력': [
        '교직에 대한 관심과 진학 의지를 보여주는 활동을 하세요.',
        '멘토링, 또래 tutor 등 교육 관련 경험을 기록하세요.',
    ],
    '다문화글로벌 역량': [
        '다문화 이해, 글로벌 이슈에 대한 관심 활동을 기록하세요.',
        '환경, 인권 등 범지구적 문제에 참여한 경험을 남기세요.',
    ],
};
