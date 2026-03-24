import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Grade = "0" | "1" | "2" | "2N" | "3";

export interface GradeTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  gradient: string;
  gradientSubtle: string;
  border: string;
  text: string;
  accent: string;
}

export const gradeThemes: Record<Grade, GradeTheme> = {
  "3": {
    // 네이비 블루 - 수능 임박, 집중
    primary: "#2563eb",
    primaryLight: "#dbeafe",
    primaryDark: "#1e40af",
    secondary: "#3b82f6",
    gradient: "from-[#1e40af] via-[#2563eb] to-[#3b82f6]",
    gradientSubtle: "from-white to-white",
    border: "border-gray-200",
    text: "text-gray-900",
    accent: "bg-[#2563eb]",
  },
  "2": {
    // 코랄 + 골드 - 성장기, 열정
    primary: "#fe5e41",
    primaryLight: "#fef3f2",
    primaryDark: "#dc2626",
    secondary: "#f3c178",
    gradient: "from-[#fe5e41] via-[#f97316] to-[#f3c178]",
    gradientSubtle: "from-white to-white",
    border: "border-gray-200",
    text: "text-gray-900",
    accent: "bg-[#fe5e41]",
  },
  "2N": {
    // 겨자색 - N수생, 재도전의 의지
    primary: "#b8860b",
    primaryLight: "#fef9e7",
    primaryDark: "#8b6914",
    secondary: "#daa520",
    gradient: "from-[#8b6914] via-[#b8860b] to-[#daa520]",
    gradientSubtle: "from-white to-white",
    border: "border-gray-200",
    text: "text-gray-900",
    accent: "bg-[#b8860b]",
  },
  "1": {
    // 청록 + 라임 - 시작점, 신선함
    primary: "#00a878",
    primaryLight: "#ecfdf5",
    primaryDark: "#047857",
    secondary: "#d8f1a0",
    gradient: "from-[#047857] via-[#00a878] to-[#34d399]",
    gradientSubtle: "from-white to-white",
    border: "border-gray-200",
    text: "text-gray-900",
    accent: "bg-[#00a878]",
  },
  "0": {
    // 퍼플 - 예비고1, 새로운 시작
    primary: "#8b5cf6",
    primaryLight: "#f5f3ff",
    primaryDark: "#7c3aed",
    secondary: "#c4b5fd",
    gradient: "from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa]",
    gradientSubtle: "from-white to-white",
    border: "border-gray-200",
    text: "text-gray-900",
    accent: "bg-[#8b5cf6]",
  },
};

// 메인 라벨 (입시년도)
export const gradeLabels: Record<Grade, string> = {
  "3": "2026 정시",
  "2N": "2027 입시",
  "2": "2027 입시",
  "1": "2028 입시",
  "0": "2029 입시",
};

// 서브 라벨 (현재 학년)
export const gradeSubLabels: Record<Grade, string> = {
  "3": "",
  "2N": "(N수생)",
  "2": "(현 고2)",
  "1": "(현 고1)",
  "0": "(현 예비고1)",
};

// URL 경로 매핑
export const gradeRoutes: Record<Grade, string> = {
  "3": "/j",      // 2026 정시
  "2N": "/h4",    // 2027 입시 (N수생)
  "2": "/h3",     // 2027 입시 (현 고2)
  "1": "/h2",     // 2028 입시 (현 고1)
  "0": "/h1",     // 2029 입시 (예비고1)
};

// URL 경로에서 Grade로 역매핑
export const routeToGrade: Record<string, Grade> = {
  "/j": "3",
  "/h4": "2N",
  "/h3": "2",
  "/h2": "1",
  "/h1": "0",
  "/": "3",  // 기본값
};

export const gradeDescriptions: Record<Grade, { title: string; subtitle: string }> = {
  "3": {
    title: "정시 집중 모드",
    subtitle: "수능 기반 정시 지원 전략",
  },
  "2N": {
    title: "N수생 입시 준비",
    subtitle: "모의고사 · 수시 · 정시",
  },
  "2": {
    title: "입시 본격 준비",
    subtitle: "모의고사 · 수시 · 정시",
  },
  "1": {
    title: "탐색과 준비",
    subtitle: "모의고사 · 수시 · 정시",
  },
  "0": {
    title: "입시 탐색",
    subtitle: "입시 정보 · 진로 탐색",
  },
};

interface GradeState {
  grade: Grade;
  hasSelectedGrade: boolean; // 사용자가 명시적으로 학년을 선택했는지
  setGrade: (grade: Grade) => void;
  selectGrade: (grade: Grade) => void; // 명시적 선택 (hasSelectedGrade = true)
  resetSelection: () => void; // 선택 초기화 (학년 선택 화면으로 돌아갈 때)
  getTheme: () => GradeTheme;
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set, get) => ({
      grade: "3",
      hasSelectedGrade: false,
      setGrade: (grade) => set({ grade }),
      selectGrade: (grade) => set({ grade, hasSelectedGrade: true }),
      resetSelection: () => set({ hasSelectedGrade: false }),
      getTheme: () => gradeThemes[get().grade],
    }),
    {
      name: "grade-storage",
    }
  )
);
