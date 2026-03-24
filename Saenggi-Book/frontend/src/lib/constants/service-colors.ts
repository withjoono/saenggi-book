/**
 * 서비스별 고유 색상 정의
 * 각 서비스는 일관된 브랜드 색상을 사용합니다.
 */

export type ServiceColorKey =
  | "jungsi"      // 정시 예측
  | "susi"        // 수시 예측
  | "planner"     // 플래너
  | "mockExam"    // 모의고사 관리
  | "schoolRecord"// 생기부 관리
  | "classStatus" // 수업 현황
  | "explore"     // 전형 검색/입시 상담
  | "myGroup"     // 마이 그룹
  | "groupStudy"  // 그룹 스터디
  | "accountLink" // 계정 연동
  | "admissionInfo"; // 입시 정보 딜리버리

export interface ServiceColor {
  name: string;
  primary: string;      // 메인 색상 (예: blue-600)
  light: string;        // 밝은 버전 (예: blue-100)
  bg: string;           // 배경 그라디언트 (예: from-blue-500 to-blue-600)
  text: string;         // 텍스트 색상 (예: text-blue-600)
  border: string;       // 테두리 색상 (예: border-blue-200)
  hover: string;        // 호버 색상 (예: hover:bg-blue-700)
  ring: string;         // 링 색상 (예: ring-blue-500)
}

export const SERVICE_COLORS: Record<ServiceColorKey, ServiceColor> = {
  // 1. 정시 예측 - Orange (목표 지향, 결단력, 따뜻한 주황)
  jungsi: {
    name: "정시 예측 분석",
    primary: "orange-500",
    light: "orange-100",
    bg: "from-orange-500 to-orange-600",
    text: "text-orange-500",
    border: "border-orange-200",
    hover: "hover:bg-orange-600",
    ring: "ring-orange-500",
  },

  // 2. 수시 예측 - Olive Leaf (#3e5622, 자연스러운 성장, 전략적 준비)
  susi: {
    name: "수시 예측 분석",
    primary: "olive-500",
    light: "olive-100",
    bg: "from-olive-500 to-olive-600",
    text: "text-olive-500",
    border: "border-olive-200",
    hover: "hover:bg-olive-600",
    ring: "ring-olive-500",
  },

  // 3. 플래너 - Ultrasonic Blue (#3b28cc, 집중력과 계획의 전문성)
  planner: {
    name: "플래너",
    primary: "ultrasonic-500",
    light: "ultrasonic-100",
    bg: "from-ultrasonic-500 to-ultrasonic-600",
    text: "text-ultrasonic-500",
    border: "border-ultrasonic-200",
    hover: "hover:bg-ultrasonic-600",
    ring: "ring-ultrasonic-500",
  },

  // 4. 모의고사 관리 - Purple (#7b1e7a, 분석적이고 학술적인 느낌)
  mockExam: {
    name: "모의고사 관리",
    primary: "grape-500",
    light: "grape-100",
    bg: "from-grape-500 to-grape-600",
    text: "text-grape-500",
    border: "border-grape-200",
    hover: "hover:bg-grape-600",
    ring: "ring-grape-500",
  },

  // 5. 생기부 관리 - Deep Ocean (#007c77, 신뢰감 있는 기록 관리)
  schoolRecord: {
    name: "생기부 관리",
    primary: "ocean-500",
    light: "ocean-100",
    bg: "from-ocean-500 to-ocean-600",
    text: "text-ocean-500",
    border: "border-ocean-200",
    hover: "hover:bg-ocean-600",
    ring: "ring-ocean-500",
  },

  // 6. 수업 현황 - Inferno (#a40606, 중요한 수업 일정 강조)
  classStatus: {
    name: "수업 현황",
    primary: "inferno-500",
    light: "inferno-100",
    bg: "from-inferno-500 to-inferno-600",
    text: "text-inferno-500",
    border: "border-inferno-200",
    hover: "hover:bg-inferno-600",
    ring: "ring-inferno-500",
  },

  // 7. 전형 검색/입시 상담 - Blue Energy (#3f8efc, 활발한 탐색과 검색)
  explore: {
    name: "전형 검색 및 입시 상담",
    primary: "energy-500",
    light: "energy-100",
    bg: "from-energy-500 to-energy-600",
    text: "text-energy-500",
    border: "border-energy-200",
    hover: "hover:bg-energy-600",
    ring: "ring-energy-500",
  },

  // 8. 마이 그룹 - Fuchsia Pop (#ff3cc7, 소셜/그룹 활동의 활기)
  myGroup: {
    name: "마이 그룹",
    primary: "pop-500",
    light: "pop-100",
    bg: "from-pop-500 to-pop-600",
    text: "text-pop-500",
    border: "border-pop-200",
    hover: "hover:bg-pop-600",
    ring: "ring-pop-500",
  },

  // 9. 그룹 스터디 - Neon Ice (#00e5e8, 협업과 소통의 신선함)
  groupStudy: {
    name: "그룹 스터디",
    primary: "ice-500",
    light: "ice-100",
    bg: "from-ice-500 to-ice-600",
    text: "text-ice-500",
    border: "border-ice-200",
    hover: "hover:bg-ice-600",
    ring: "ring-ice-500",
  },

  // 10. 계정 연동 - Dark Amethyst (#4c1a57, 보안과 연결의 깊이감)
  accountLink: {
    name: "계정 연동",
    primary: "amethyst-500",
    light: "amethyst-100",
    bg: "from-amethyst-500 to-amethyst-600",
    text: "text-amethyst-500",
    border: "border-amethyst-200",
    hover: "hover:bg-amethyst-600",
    ring: "ring-amethyst-500",
  },

  // 11. 입시 정보 딜리버리 - Golden Glow (#d7cf07, 프리미엄 정보의 가치)
  admissionInfo: {
    name: "맞춤 입시 정보 딜리버리",
    primary: "golden-500",
    light: "golden-100",
    bg: "from-golden-500 to-golden-600",
    text: "text-golden-500",
    border: "border-golden-200",
    hover: "hover:bg-golden-600",
    ring: "ring-golden-500",
  },
};

/**
 * 서비스 키로 색상 가져오기
 */
export function getServiceColor(key: ServiceColorKey): ServiceColor {
  return SERVICE_COLORS[key];
}

/**
 * Tailwind 클래스 헬퍼 함수들
 */
export const serviceColorClasses = {
  // 버튼 스타일
  button: (key: ServiceColorKey) => {
    const color = SERVICE_COLORS[key];
    return `bg-${color.primary} ${color.hover} text-white`;
  },

  // 아웃라인 버튼
  buttonOutline: (key: ServiceColorKey) => {
    const color = SERVICE_COLORS[key];
    return `${color.text} ${color.border} border hover:bg-${color.light}`;
  },

  // 배지/태그 스타일
  badge: (key: ServiceColorKey) => {
    const color = SERVICE_COLORS[key];
    return `bg-${color.light} ${color.text}`;
  },

  // 카드 헤더 그라디언트
  cardHeader: (key: ServiceColorKey) => {
    const color = SERVICE_COLORS[key];
    return `bg-gradient-to-r ${color.bg} text-white`;
  },
};
