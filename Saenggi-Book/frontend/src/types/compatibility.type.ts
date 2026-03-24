import { IMainSubject, ISubject } from "./subject.type";

// 계열 정보 타입
export interface ISeries {
  grandSeries: string;
  middleSeries: string;
  rowSeries: string;
}

// 계열 적합성 점수 타입
export interface ICompatibilityScores {
  requiredSubjects: ISubject[];
  encouragedSubjects: ISubject[];
  mainSubjects: IMainSubject[];
  referenceSubjects: IMainSubject[];
}

// 계산된 주요 과목 정보 타입
export interface ICalculatedMainSubject extends IMainSubject {
  myGradeAvg?: number;
  risk: number;
}

// 계산된 과목 정보 타입
export interface ICalculatedSubject extends ISubject {
  myGradeAvg?: number;
  risk: number;
}

// 계산된 계열 적합성 결과 타입
export interface ICalculatedCompatibility {
  requiredSubjects: ICalculatedSubject[];
  encouragedSubjects: ICalculatedSubject[];
  mainSubjects: ICalculatedMainSubject[];
  referenceSubjects: ICalculatedMainSubject[];
  totalRisk: number;
  isEmpty: boolean;
}
