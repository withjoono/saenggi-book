// 기본 과목 타입
export interface ISubject {
  id: number;
  code: string;
  name: string;
  type: number; // 0: 등급, 1: 성취도
  courseType: number; // 과목 종류 (0: 공통일반, 1: 일반선택, 2: 진로선택, 3: 전문교과1, 4: 전문교과2)
  isRequired: number; // 필수 과목 여부 (0: 선택, 1: 필수)
}

// 주요 과목 타입
export interface IMainSubject {
  code: string;
  name: string;
  subjectList: string[];
}
