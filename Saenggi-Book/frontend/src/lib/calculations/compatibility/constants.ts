import { ICompatibilityRange } from "./types";

/**
 * *  [계열 적합성] 대학 레벨별 권장 등급 (1레벨: 의치한약수, 2레벨: 연고서성한, 3: ...)
 */
export const COMPATIBILITY_UNIVERSITY_LEVEL_RECOMMENDED_GRADES = [
  0, 1.3, 1.6, 2.0, 2.5, 3.5, 4.5, 5.5,
];

/**
 * * [계열 적합성] 대학 레벨별 일반 과목 위험도 가중치 (권장 등급과 학생 등급의 차이에 따른 위험도 계산)
 */
export const COMPATIBILITY_SUBJECT_RISK_WEIGHTS: {
  [key: number]: ICompatibilityRange[];
} = {
  1: [
    { min: 2, score: 5 },
    { min: 1.5, score: 4 },
    { min: 1, score: 3 },
    { min: 0.5, score: 2 },
    { min: 0, score: 1 },
    { min: -0.5, score: -1 },
    { min: -1, score: -2 },
    { min: -1.5, score: -3 },
    { min: -2, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  2: [
    { min: 2, score: 5 },
    { min: 1.5, score: 4 },
    { min: 1, score: 3 },
    { min: 0.5, score: 2 },
    { min: 0, score: 1 },
    { min: -0.5, score: -1 },
    { min: -1, score: -2 },
    { min: -1.5, score: -3 },
    { min: -2, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  3: [
    { min: 2, score: 5 },
    { min: 1.5, score: 4 },
    { min: 1, score: 3 },
    { min: 0.5, score: 2 },
    { min: 0, score: 1 },
    { min: -1, score: -1 },
    { min: -2, score: -2 },
    { min: -3, score: -3 },
    { min: -4, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  4: [
    { min: 2, score: 5 },
    { min: 1.5, score: 4 },
    { min: 1, score: 3 },
    { min: 0.5, score: 2 },
    { min: -0.5, score: 1 },
    { min: -1, score: -1 },
    { min: -2, score: -2 },
    { min: -3, score: -3 },
    { min: -4, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  5: [
    { min: 2, score: 5 },
    { min: 1, score: 4 },
    { min: 0.5, score: 3 },
    { min: -0.5, score: 2 },
    { min: -1, score: 1 },
    { min: -2, score: -1 },
    { min: -3, score: -2 },
    { min: -4, score: -3 },
    { min: -5, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  6: [
    { min: 2, score: 5 },
    { min: 1, score: 4 },
    { min: 0, score: 3 },
    { min: -1, score: 2 },
    { min: -2, score: 1 },
    { min: -3, score: -1 },
    { min: -4, score: -2 },
    { min: -5, score: -3 },
    { min: -6, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  7: [
    { min: 1, score: 5 },
    { min: 0.5, score: 4 },
    { min: -0.5, score: 3 },
    { min: -1, score: 2 },
    { min: -Infinity, score: 1 },
  ],
};

/**
 * * [계열 적합성] 대학 레벨별 주요 과목 위험도 가중치 (권장 등급과 학생 등급의 차이에 따른 위험도 계산)
 */
export const COMPATIBILITY_MAIN_SUBJECT_RISK_WEIGHTS: {
  [key: string]: ICompatibilityRange[];
} = {
  default: [
    { min: 2, score: 5 },
    { min: 1.5, score: 4 },
    { min: 1, score: 3 },
    { min: 0.5, score: 2 },
    { min: -0.5, score: 1 },
    { min: -1, score: -1 },
    { min: -1.5, score: -2 },
    { min: -2, score: -3 },
    { min: -2.5, score: -4 },
    { min: -Infinity, score: -5 },
  ],
  7: [
    { min: 1, score: 5 },
    { min: 0.5, score: 4 },
    { min: 0, score: 3 },
    { min: -0.5, score: 2 },
    { min: -1, score: 1 },
    { min: -1.5, score: -1 },
    { min: -2, score: -2 },
    { min: -2.5, score: -3 },
    { min: -3, score: -4 },
    { min: -Infinity, score: -5 },
  ],
};

/**
 * * [계열 적합성] 대학 레벨별 미이수 과목 위험도 점수 (1,2 레벨은 미이수가 치명적이라 -5)
 */
export const COMPATIBILITY_SUBJECT_NOT_TAKEN_RISK_SCORES = [
  0, -5, -5, -4, -4, -2, -1, 1,
];
