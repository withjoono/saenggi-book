// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import {
  CalculationFormula,
  SubjectGrade,
  GradesBySubject,
  GradesByYear,
  ReflectedSubjectInfo,
  getSubjectCategory,
  getSemesterYear,
} from '../types';

/**
 * 등급 → 환산점수 변환 및 평균 등급 계산 서비스
 */
@Injectable()
export class SusiGradeCalculationService {
  private readonly logger = new Logger(SusiGradeCalculationService.name);

  /**
   * 기본 등급별 환산점수 테이블 (1000점 만점 기준)
   * 대학별 공식이 없을 경우 사용
   */
  private readonly DEFAULT_GRADE_CONVERSION: Record<string, number> = {
    '1': 100,
    '2': 96,
    '3': 89,
    '4': 77,
    '5': 60,
    '6': 40,
    '7': 23,
    '8': 11,
    '9': 4,
  };

  /**
   * 진로선택과목 기본 성취도 환산 (등급 환산)
   */
  private readonly DEFAULT_CAREER_CONVERSION: Record<string, number> = {
    A: 1, // A → 1등급
    B: 3, // B → 3등급
    C: 5, // C → 5등급
  };

  /**
   * 등급을 숫자로 변환
   */
  parseGrade(gradeStr: string | null | undefined): number | null {
    if (!gradeStr) return null;

    // 숫자 형식인 경우
    const numGrade = parseInt(gradeStr, 10);
    if (!isNaN(numGrade) && numGrade >= 1 && numGrade <= 9) {
      return numGrade;
    }

    // A/B/C 형식인 경우 (진로선택과목)
    const upperGrade = gradeStr.toUpperCase();
    if (this.DEFAULT_CAREER_CONVERSION[upperGrade]) {
      return this.DEFAULT_CAREER_CONVERSION[upperGrade];
    }

    return null;
  }

  /**
   * 등급을 환산점수로 변환
   */
  gradeToScore(
    grade: number,
    formula: CalculationFormula,
    isCareerSubject: boolean = false,
  ): number {
    // 1-9 등급 범위 확인
    if (grade < 1 || grade > 9) {
      this.logger.warn(`유효하지 않은 등급: ${grade}`);
      return 0;
    }

    // 대학별 환산 테이블 사용
    const conversionTable = formula.grade_conversion_table || this.DEFAULT_GRADE_CONVERSION;
    const score = conversionTable[String(grade)];

    if (score === undefined) {
      this.logger.warn(`등급 ${grade}에 대한 환산점수가 없음, 기본값 사용`);
      return this.DEFAULT_GRADE_CONVERSION[String(grade)] || 0;
    }

    return score;
  }

  /**
   * 진로선택과목 성취도를 등급으로 변환
   */
  careerAchievementToGrade(achievement: string, formula: CalculationFormula): number {
    if (!achievement) return 5; // 기본값

    const upperAchievement = achievement.toUpperCase();

    // 대학별 환산 방식이 있으면 사용
    if (formula.career_grade_conversion_table) {
      const score = formula.career_grade_conversion_table[upperAchievement];
      if (score !== undefined) {
        // 점수를 등급으로 역변환 (간단히 처리)
        // 실제로는 대학별로 다르게 처리해야 할 수 있음
        return this.DEFAULT_CAREER_CONVERSION[upperAchievement] || 5;
      }
    }

    return this.DEFAULT_CAREER_CONVERSION[upperAchievement] || 5;
  }

  /**
   * 성적 데이터를 학년별로 그룹화
   */
  groupGradesByYear(grades: SubjectGrade[]): GradesByYear {
    const byYear: GradesByYear = {
      year1: [],
      year2: [],
      year3: [],
    };

    for (const grade of grades) {
      const year = getSemesterYear(grade.semester);
      if (year === 1) byYear.year1.push(grade);
      else if (year === 2) byYear.year2.push(grade);
      else if (year === 3) byYear.year3.push(grade);
    }

    return byYear;
  }

  /**
   * 성적 데이터를 교과별로 그룹화
   */
  groupGradesBySubject(grades: SubjectGrade[]): GradesBySubject {
    const bySubject: GradesBySubject = {
      korean: [],
      english: [],
      math: [],
      social: [],
      science: [],
      etc: [],
    };

    for (const grade of grades) {
      const category = getSubjectCategory(grade.main_subject_name);
      bySubject[category].push(grade);
    }

    return bySubject;
  }

  /**
   * 평균 등급 계산 (단위수 가중 평균)
   */
  calculateAverageGrade(grades: SubjectGrade[]): number | null {
    if (!grades || grades.length === 0) return null;

    let totalWeightedGrade = 0;
    let totalUnits = 0;

    for (const grade of grades) {
      const gradeNum = this.parseGrade(grade.grade);
      if (gradeNum === null) continue;

      const unit = parseFloat(grade.unit) || 1;
      totalWeightedGrade += gradeNum * unit;
      totalUnits += unit;
    }

    if (totalUnits === 0) return null;

    return Math.round((totalWeightedGrade / totalUnits) * 100) / 100;
  }

  /**
   * 교과별 환산점수 계산
   */
  calculateSubjectScore(
    grades: SubjectGrade[],
    formula: CalculationFormula,
    subjectRatio: number,
  ): { score: number; averageGrade: number | null; reflectedSubjects: ReflectedSubjectInfo[] } {
    if (!grades || grades.length === 0 || subjectRatio === 0) {
      return { score: 0, averageGrade: null, reflectedSubjects: [] };
    }

    const reflectedSubjects: ReflectedSubjectInfo[] = [];
    let totalWeightedScore = 0;
    let totalUnits = 0;

    for (const grade of grades) {
      const gradeNum = this.parseGrade(grade.grade);
      if (gradeNum === null) continue;

      // 진로선택과목인 경우 성취도 변환
      let effectiveGrade = gradeNum;
      if (grade.achievement) {
        effectiveGrade = this.careerAchievementToGrade(grade.achievement, formula);
      }

      const unit = parseFloat(grade.unit) || 1;
      const convertedScore = this.gradeToScore(effectiveGrade, formula);

      totalWeightedScore += convertedScore * unit;
      totalUnits += unit;

      reflectedSubjects.push({
        subject_name: grade.subject_name,
        main_subject_name: grade.main_subject_name,
        semester: grade.semester,
        grade: effectiveGrade,
        converted_score: convertedScore,
        unit,
      });
    }

    if (totalUnits === 0) {
      return { score: 0, averageGrade: null, reflectedSubjects };
    }

    // 교과 평균 환산점수
    const avgConvertedScore = totalWeightedScore / totalUnits;

    // 교과 반영비율 적용 (만점 기준)
    const maxSubjectScore = (formula.max_score * subjectRatio) / 100;
    const score = (avgConvertedScore / 100) * maxSubjectScore;

    const averageGrade = this.calculateAverageGrade(grades);

    return {
      score: Math.round(score * 100) / 100,
      averageGrade,
      reflectedSubjects,
    };
  }

  /**
   * 학년별 가중 점수 계산
   */
  calculateYearWeightedScore(
    gradesByYear: GradesByYear,
    formula: CalculationFormula,
  ): {
    totalScore: number;
    year1Score: number;
    year2Score: number;
    year3Score: number;
    year1Average: number | null;
    year2Average: number | null;
    year3Average: number | null;
  } {
    const results = {
      totalScore: 0,
      year1Score: 0,
      year2Score: 0,
      year3Score: 0,
      year1Average: null as number | null,
      year2Average: null as number | null,
      year3Average: null as number | null,
    };

    // 학년별 평균 등급 계산
    results.year1Average = this.calculateAverageGrade(gradesByYear.year1);
    results.year2Average = this.calculateAverageGrade(gradesByYear.year2);
    results.year3Average = this.calculateAverageGrade(gradesByYear.year3);

    // 학년별 환산점수 계산
    if (results.year1Average !== null && formula.grade_1_ratio > 0) {
      const score = this.gradeToScore(Math.round(results.year1Average), formula);
      results.year1Score = (score * formula.grade_1_ratio) / 100;
    }

    if (results.year2Average !== null && formula.grade_2_ratio > 0) {
      const score = this.gradeToScore(Math.round(results.year2Average), formula);
      results.year2Score = (score * formula.grade_2_ratio) / 100;
    }

    if (results.year3Average !== null && formula.grade_3_ratio > 0) {
      const score = this.gradeToScore(Math.round(results.year3Average), formula);
      results.year3Score = (score * formula.grade_3_ratio) / 100;
    }

    results.totalScore = results.year1Score + results.year2Score + results.year3Score;

    return results;
  }

  /**
   * 위험도 점수 계산 (-5 ~ +5 단계, 총 11단계)
   * 방식: 50%컷과 70%컷 사이의 간격(Spread)을 기준으로 내 위치를 비율로 환산
   * 
   * [계산 공식]
   * 1. 기준 구간(Ref Gap) = 70%컷 - 50%컷 (이 구간을 "3점 차이"로 정의)
   * 방식: 50%컷과 70%컷을 이용해 정규분포 상의 백분위를 추정하고, 지정된 구간표에 매핑
   * 
   * [계산 로직]
   * 1. Sigma 추정: (70%컷 - 50%컷) / 0.5244 (Z(0.7) - Z(0.5))
   * 2. Z-Score 산출: (내등급 - 50%컷) / Sigma
   * 3. 백분위(Percentile) 추정: StandardNormalCDF(Z)
   * 4. 구간표 매핑 (User Defined Lookup Table)
   * 
   * [구간표 (Percentile -> Score)]
   * -  ~30% : +5 (매우 안정)
   * - 30~50%: +4 (안정)
   * - 50~60%: +3 (적정)
   * - 60~70%: +2 (약간 적정)
   * - 70~73%: +1 (소신)
   * - 74~76%:  0 (경계)
   * - 77~79%: -1 (약간 위험)
   * - 80~84%: -2 (위험)
   * - 85~90%: -3 (매우 위험)
   * - 91~97%: -4 (광탈 주의)
   * - 98%~ : -5 (지원 불가)
   * @param averageGrade 사용자 평균 등급
   * @param gradeCut50 50% 등급컷 (작년 합격자 평균)
   * @param gradeCut70 70% 등급컷 (작년 합격자 상위)
   * @returns Stage
   */
  calculateRiskScore(
    averageGrade: number,
    gradeCut50?: number | null,
    gradeCut70?: number | null,
  ): number | null {
    if (!gradeCut50 || !gradeCut70) return null;

    // 1. Sigma 추정
    // 70% Cut의 Z-Score = 0.5244 (상위 70% 누적확률, 즉 하위 30% 성적? -> 아니오, 1등급이 상위. Z값은 평균보다 등급값이 클수록(나쁠수록) 양수)
    // 평균(50%컷) -> Z=0
    // 70%컷(평균보다 나쁜 등급) -> Z=0.5244 (누적확률 0.7)
    let gap = gradeCut70 - gradeCut50;
    if (gap < 0.1) gap = 0.1;

    // Sigma = (X - Mu) / Z
    const sigma = gap / 0.5244;

    // 2. 내 Z-Score 산출
    // 내 등급이 50%컷보다 높으면(나쁘면) Z > 0, 낮으면(좋으면) Z < 0
    const zScore = (averageGrade - gradeCut50) / sigma;

    // 3. 백분위 추정 (Cumulative Probability, 0.0 ~ 1.0)
    // Z가 -1.0이면 상위 ~16%, Z가 0이면 상위 50%, Z가 +0.5244면 상위 70%
    const percentile = this.standardNormalCDF(zScore) * 100;

    // 4. 구간표 매핑 (User Table)
    if (percentile < 30) return 5;
    if (percentile < 50) return 4;
    if (percentile < 60) return 3;
    if (percentile < 70) return 2;
    if (percentile <= 73) return 1;
    if (percentile <= 76) return 0;
    if (percentile <= 79) return -1;
    if (percentile <= 84) return -2;
    if (percentile <= 90) return -3;
    if (percentile <= 97) return -4;
    return -5;
  }

  /**
   * 표준정규분포 누적확률함수 (CDF) 근사식 (Error Function 사용)
   * @param z Z-Score
   * @returns 0.0 ~ 1.0 (누적확률)
   */
  private standardNormalCDF(z: number): number {
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
  }

  /**
   * Error Function (erf) 근사식
   * (Abramowitz and Stegun 7.1.26)
   */
  private erf(x: number): number {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }
}
