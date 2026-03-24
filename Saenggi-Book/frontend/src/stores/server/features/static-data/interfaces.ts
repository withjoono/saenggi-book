/**
 * 정적 데이터
 */
export interface IStaticData {
  subjectCodes: ISubjectCode[]; // 교과 코드
  generalFields: IGeneralFieldData[]; // 일반 계열(인문,자연,의치한약수 등)
  majorFields: IMajorFieldData[]; // 대계열
  midFields: IMidFieldData[]; // 중계열
  minorFields: IMinorFieldData[]; // 소계열
  admissionSubtypes: IAdmissionSubtype[]; // 특별전형 필터
  admissionSubtypeCategories: IAdmissionSubtypeCategory[]; // 특별전형 카테고리
  // 검색어 추천(대학, 전형, 모집단위)
  universityNames: string[];
  admissionNames: string[];
  recruitmentUnitNames: string[];
}

/**
 * 대계열
 */
export interface IMajorFieldData {
  id: number;
  name: string;
}

/**
 * 중계열
 * Note: humps에 의해 API 응답이 camelCase로 변환됨
 */
export interface IMidFieldData {
  id: number;
  name: string;
  majorFieldId: number;
}

/**
 * 소계열
 * Note: humps에 의해 API 응답이 camelCase로 변환됨
 */
export interface IMinorFieldData {
  id: number;
  name: string;
  midFieldId: number;
}

/**
 * 일반계열 (인문/자연/의치한약수/예체능/통합 등)
 */
export interface IGeneralFieldData {
  id: number;
  name: string;
}

/**
 * 교과 코드
 * Note: humps에 의해 API 응답이 camelCase로 변환됨
 */
export interface ISubjectCode {
  id: string;
  mainSubjectCode: string;
  mainSubjectName: string;
  subjectCode: string;
  subjectName: string;
  type: number | null; // 평가 방식 (0: 석차등급, 1: 성취도)
  courseType: number; // 과목 종류 (0: 공통일반, 1: 일반선택, 2: 진로선택, 3: 전문교과1, 4: 전문교과2)
  isRequired: number; // 필수 과목 여부 (0: 선택, 1: 필수)
}

/**
 * 특별전형 필터
 */
export interface IAdmissionSubtype {
  id: number;
  name: string;
  categoryId: number | null;
}

/**
 * 특별전형 카테고리
 */
export interface IAdmissionSubtypeCategory {
  id: number;
  name: string;
  displayOrder: number;
}
