// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SchoolRecordSubjectLearningEntity } from '../../../../database/entities/schoolrecord/schoolrecord-subject-learning.entity';
import { SusiUserCalculatedScoreEntity } from '../../../../database/entities/susi/susi-user-calculated-score.entity';
import { SusiUserRecruitmentScoreEntity } from '../../../../database/entities/susi/susi-user-recruitment-score.entity';
import { SuSiSubjectEntity } from '../../../../database/entities/susi/susi-subject.entity';
import { SusiFormulaDataService } from './susi-formula-data.service';
import { SusiGradeCalculationService } from './susi-grade-calculation.service';
import {
  CalculationFormula,
  SubjectGrade,
  MemberGradeData,
  UniversityCalculatedScore,
  RecruitmentScoreResult,
  CalculateScoresResponse,
  getSubjectCategory,
} from '../types';

/**
 * 수시 교과전형 환산점수 계산 메인 서비스
 * - 사용자 내신 데이터 조회
 * - 대학별 환산점수 계산
 * - 모집단위별 환산점수 + 위험도 계산
 * - 결과 DB 저장
 */
@Injectable()
export class SusiCalculationService {
  private readonly logger = new Logger(SusiCalculationService.name);

  constructor(    private readonly formulaDataService: SusiFormulaDataService,
    private readonly gradeCalculationService: SusiGradeCalculationService,
  ) { }

  /**
   * 환산점수 계산 및 저장 (메인 진입점)
   */
  async calculateAndSaveScores(
    memberId: string,
    options?: {
      universityNames?: string[];
      recalculate?: boolean;
      year?: number;
    },
  ): Promise<CalculateScoresResponse> {
    const startTime = Date.now();
    const year = options?.year || 2026;

    this.logger.log(`환산점수 계산 시작 - memberId: ${memberId}, year: ${year}`);

    // 1. 사용자 내신 데이터 조회
    const memberGrades = await this.getMemberGrades(memberId);
    if (!memberGrades || memberGrades.grades.length === 0) {
      return {
        success: false,
        message: '내신 데이터가 없습니다. 학생부를 먼저 등록해주세요.',
        total_universities: 0,
        success_count: 0,
        failure_count: 0,
        university_scores: [],
        calculated_at: new Date(),
      };
    }

    // 2. 환산 공식 로드
    let formulas: CalculationFormula[];
    if (options?.universityNames && options.universityNames.length > 0) {
      formulas = await this.formulaDataService.getFormulas(options.universityNames, year);
    } else {
      formulas = await this.formulaDataService.getAllFormulas(year);
    }

    if (formulas.length === 0) {
      return {
        success: false,
        message: '환산 공식 데이터가 없습니다. 관리자에게 문의하세요.',
        total_universities: 0,
        success_count: 0,
        failure_count: 0,
        university_scores: [],
        calculated_at: new Date(),
      };
    }

    // 3. 기존 데이터 삭제 (재계산 시)
    if (options?.recalculate) {
      await this.deleteScores(memberId, options.universityNames);
    }

    // 4. 대학별 환산점수 계산
    const universityScores: UniversityCalculatedScore[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const formula of formulas) {
      try {
        const score = await this.calculateSingleUniversity(memberGrades, formula);
        universityScores.push(score);
        if (score.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        this.logger.error(`${formula.university_name} 계산 실패:`, error);
        universityScores.push({
          success: false,
          failure_reason: error.message,
          university_name: formula.university_name,
          year: formula.year,
          converted_score: 0,
          max_score: formula.max_score,
          score_percentage: 0,
          average_grade: 0,
          korean_score: 0,
          english_score: 0,
          math_score: 0,
          social_score: 0,
          science_score: 0,
          etc_score: 0,
          reflected_subject_count: 0,
          reflected_subjects: [],
          attendance_score: 0,
          volunteer_score: 0,
        });
        failureCount++;
      }
    }

    // 5. 대학별 환산점수 DB 저장
    await this.saveUniversityScores(memberId, universityScores, year);

    // 6. 모집단위별 점수 계산 및 저장 (선택적)
    const recruitmentScores = await this.calculateAndSaveRecruitmentScores(
      memberId,
      universityScores,
      year,
    );

    const elapsed = Date.now() - startTime;
    this.logger.log(
      `환산점수 계산 완료 - memberId: ${memberId}, 성공: ${successCount}, 실패: ${failureCount}, 소요시간: ${elapsed}ms`,
    );

    return {
      success: true,
      message: `${successCount}개 대학 환산점수 계산 완료`,
      total_universities: formulas.length,
      success_count: successCount,
      failure_count: failureCount,
      university_scores: universityScores,
      recruitment_scores: recruitmentScores,
      calculated_at: new Date(),
    };
  }

  /**
   * 사용자 내신 데이터 조회
   */
  async getMemberGrades(memberId: string | number): Promise<MemberGradeData | null> {
    const entities = await this.subjectLearningRepository.find({
      where: { member: { id: String(memberId) } },
    });

    if (!entities || entities.length === 0) {
      return null;
    }

    // Entity → SubjectGrade 변환
    const grades: SubjectGrade[] = entities.map((e) => ({
      id: e.id,
      subject_name: e.subject_name || '',
      main_subject_name: e.main_subject_name || '',
      semester: e.semester || '',
      grade: e.grade || '',
      unit: e.unit || '1',
      raw_score: e.raw_score,
      ranking: e.ranking,
      students_num: e.students_num,
      standard_deviation: e.standard_deviation,
      sub_subject_average: e.sub_subject_average,
      achievement: e.achievement,
    }));

    // 그룹화
    const byYear = this.gradeCalculationService.groupGradesByYear(grades);
    const bySubject = this.gradeCalculationService.groupGradesBySubject(grades);

    return {
      memberId: String(memberId),
      grades,
      byYear,
      bySubject,
    };
  }

  /**
   * 단일 대학 환산점수 계산
   */
  async calculateSingleUniversity(
    memberGrades: MemberGradeData,
    formula: CalculationFormula,
  ): Promise<UniversityCalculatedScore> {
    const { bySubject, byYear, grades } = memberGrades;

    // 교과별 환산점수 계산
    const korean = this.gradeCalculationService.calculateSubjectScore(
      bySubject.korean,
      formula,
      formula.korean_ratio,
    );
    const english = this.gradeCalculationService.calculateSubjectScore(
      bySubject.english,
      formula,
      formula.english_ratio,
    );
    const math = this.gradeCalculationService.calculateSubjectScore(
      bySubject.math,
      formula,
      formula.math_ratio,
    );
    const social = this.gradeCalculationService.calculateSubjectScore(
      bySubject.social,
      formula,
      formula.social_ratio,
    );
    const science = this.gradeCalculationService.calculateSubjectScore(
      bySubject.science,
      formula,
      formula.science_ratio,
    );
    const etc = this.gradeCalculationService.calculateSubjectScore(
      bySubject.etc,
      formula,
      formula.etc_ratio,
    );

    // 학년별 가중 점수 계산 (학년별 반영비율이 있는 경우)
    const yearWeighted = this.gradeCalculationService.calculateYearWeightedScore(byYear, formula);

    // 총 교과 점수 합산
    const totalSubjectScore =
      korean.score + english.score + math.score + social.score + science.score + etc.score;

    // 출결/봉사 점수 (만점 적용)
    const attendanceScore = formula.attendance_score;
    const volunteerScore = formula.volunteer_score;

    // 최종 환산점수
    const convertedScore = totalSubjectScore + attendanceScore + volunteerScore;

    // 환산점수 비율 계산
    const scorePercentage =
      formula.max_score > 0 ? (convertedScore / formula.max_score) * 100 : 0;

    // 전체 평균 등급 계산
    const allReflectedSubjects = [
      ...korean.reflectedSubjects,
      ...english.reflectedSubjects,
      ...math.reflectedSubjects,
      ...social.reflectedSubjects,
      ...science.reflectedSubjects,
      ...etc.reflectedSubjects,
    ];

    const averageGrade = this.gradeCalculationService.calculateAverageGrade(grades) || 0;

    return {
      success: true,
      university_name: formula.university_name,
      year: formula.year,
      converted_score: Math.round(convertedScore * 100) / 100,
      max_score: formula.max_score,
      score_percentage: Math.round(scorePercentage * 100) / 100,
      average_grade: averageGrade,
      grade_1_average: yearWeighted.year1Average,
      grade_2_average: yearWeighted.year2Average,
      grade_3_average: yearWeighted.year3Average,
      korean_score: korean.score,
      korean_average_grade: korean.averageGrade,
      english_score: english.score,
      english_average_grade: english.averageGrade,
      math_score: math.score,
      math_average_grade: math.averageGrade,
      social_score: social.score,
      social_average_grade: social.averageGrade,
      science_score: science.score,
      science_average_grade: science.averageGrade,
      etc_score: etc.score,
      reflected_subject_count: allReflectedSubjects.length,
      reflected_subjects: allReflectedSubjects,
      attendance_score: attendanceScore,
      volunteer_score: volunteerScore,
    };
  }

  /**
   * 대학별 환산점수 DB 저장
   */
  private async saveUniversityScores(
    memberId: string,
    scores: UniversityCalculatedScore[],
    year: number,
  ): Promise<void> {
    const entities: Partial<SusiUserCalculatedScoreEntity>[] = scores.map((score) => ({
      member_id: String(memberId),
      university_name: score.university_name,
      year,
      converted_score: score.converted_score,
      max_score: score.max_score,
      score_percentage: score.score_percentage,
      average_grade: score.average_grade,
      grade_1_average: score.grade_1_average,
      grade_2_average: score.grade_2_average,
      grade_3_average: score.grade_3_average,
      korean_score: score.korean_score,
      korean_average_grade: score.korean_average_grade,
      english_score: score.english_score,
      english_average_grade: score.english_average_grade,
      math_score: score.math_score,
      math_average_grade: score.math_average_grade,
      social_score: score.social_score,
      social_average_grade: score.social_average_grade,
      science_score: score.science_score,
      science_average_grade: score.science_average_grade,
      etc_score: score.etc_score,
      reflected_subject_count: score.reflected_subject_count,
      reflected_subjects: score.reflected_subjects,
      attendance_score: score.attendance_score,
      volunteer_score: score.volunteer_score,
      success: score.success,
      failure_reason: score.failure_reason,
      calculated_at: new Date(),
    }));

    // UPSERT (ON CONFLICT UPDATE)
    for (const entity of entities) {
      const existing = await this.calculatedScoreRepository.findOne({
        where: {
          member_id: String(memberId),
          university_name: entity.university_name,
        },
      });

      if (existing) {
        await this.calculatedScoreRepository.update(existing.id, entity);
      } else {
        await this.calculatedScoreRepository.save(
          this.calculatedScoreRepository.create(entity),
        );
      }
    }
  }

  /**
   * 모집단위별 환산점수 계산 및 저장
   */
  private async calculateAndSaveRecruitmentScores(
    memberId: string,
    universityScores: UniversityCalculatedScore[],
    year: number,
  ): Promise<RecruitmentScoreResult[]> {
    const results: RecruitmentScoreResult[] = [];

    // 대학명으로 모집단위 조회
    const universityNames = universityScores
      .filter((s) => s.success)
      .map((s) => s.university_name);

    if (universityNames.length === 0) return results;

    // 교과전형 모집단위 조회
    const susiSubjects = await this.susiSubjectRepository.find({
      where: {
        university_name: In(universityNames),
        year,
        basic_type: '교과', // 교과전형만
      },
    });

    for (const subject of susiSubjects) {
      const universityScore = universityScores.find(
        (s) => s.university_name === subject.university_name,
      );

      if (!universityScore) continue;

      // 등급컷 정보 조회 (susi_subject에 있다면)
      const gradeCut50 = this.parseGradeCut(subject['admission_cutoff_50_grade']);
      const gradeCut70 = this.parseGradeCut(subject['admission_cutoff_70_grade']);

      // 위험도 계산
      const riskScore = this.gradeCalculationService.calculateRiskScore(
        universityScore.average_grade,
        gradeCut50,
        gradeCut70,
      );

      const gradeDifference =
        gradeCut50 != null ? universityScore.average_grade - gradeCut50 : null;

      const result: RecruitmentScoreResult = {
        success: true,
        susi_subject_id: subject.id,
        university_name: subject.university_name,
        recruitment_name: subject.recruitment_unit_name || '',
        type_name: subject.type_name,
        basic_type: subject.basic_type,
        detailed_type: subject.detailed_type,
        department: subject.department,
        year: subject.year,
        converted_score: universityScore.converted_score,
        max_score: universityScore.max_score,
        score_percentage: universityScore.score_percentage,
        average_grade: universityScore.average_grade,
        risk_score: riskScore,
        grade_cut_50: gradeCut50,
        grade_cut_70: gradeCut70,
        grade_difference: gradeDifference,
        last_year_avg_grade: this.parseGradeCut(subject['admission_avg_grade']),
        last_year_min_grade: this.parseGradeCut(subject['admission_min_grade']),
        last_year_competition_rate: this.parseNumber(subject['competition_rate_2024']),
      };

      results.push(result);

      // DB 저장
      await this.saveRecruitmentScore(memberId, result);
    }

    return results;
  }

  /**
   * 모집단위별 환산점수 저장
   */
  private async saveRecruitmentScore(
    memberId: string,
    score: RecruitmentScoreResult,
  ): Promise<void> {
    const entity: Partial<SusiUserRecruitmentScoreEntity> = {
      member_id: String(memberId),
      susi_subject_id: score.susi_subject_id,
      university_name: score.university_name,
      recruitment_name: score.recruitment_name,
      type_name: score.type_name,
      basic_type: score.basic_type,
      detailed_type: score.detailed_type,
      department: score.department,
      year: score.year,
      converted_score: score.converted_score,
      max_score: score.max_score,
      score_percentage: score.score_percentage,
      average_grade: score.average_grade,
      risk_score: score.risk_score,
      grade_cut_50: score.grade_cut_50,
      grade_cut_70: score.grade_cut_70,
      grade_difference: score.grade_difference,
      last_year_avg_grade: score.last_year_avg_grade,
      last_year_min_grade: score.last_year_min_grade,
      last_year_competition_rate: score.last_year_competition_rate,
      success: score.success,
      failure_reason: score.failure_reason,
      calculated_at: new Date(),
    };

    const existing = await this.recruitmentScoreRepository.findOne({
      where: {
        member_id: String(memberId),
        susi_subject_id: score.susi_subject_id,
      },
    });

    if (existing) {
      await this.recruitmentScoreRepository.update(existing.id, entity);
    } else {
      await this.recruitmentScoreRepository.save(
        this.recruitmentScoreRepository.create(entity),
      );
    }
  }

  /**
   * 저장된 환산점수 조회
   */
  async getSavedScores(memberId: string): Promise<SusiUserCalculatedScoreEntity[]> {
    return this.calculatedScoreRepository.find({
      where: { member_id: String(memberId) },
      order: { university_name: 'ASC' },
    });
  }

  /**
   * 특정 대학 환산점수 조회
   */
  async getSavedScoreByUniversity(
    memberId: string,
    universityName: string,
  ): Promise<SusiUserCalculatedScoreEntity | null> {
    return this.calculatedScoreRepository.findOne({
      where: {
        member_id: String(memberId),
        university_name: universityName,
      },
    });
  }

  /**
   * 모집단위별 환산점수 조회
   */
  async getSavedRecruitmentScores(memberId: string): Promise<SusiUserRecruitmentScoreEntity[]> {
    return this.recruitmentScoreRepository.find({
      where: { member_id: String(memberId) },
      order: { risk_score: 'DESC', university_name: 'ASC' },
    });
  }

  /**
   * 환산점수 삭제
   */
  async deleteScores(memberId: string, universityNames?: string[]): Promise<void> {
    if (universityNames && universityNames.length > 0) {
      await this.calculatedScoreRepository.delete({
        member_id: String(memberId),
        university_name: In(universityNames),
      });
      // 모집단위 점수도 삭제
      await this.recruitmentScoreRepository.delete({
        member_id: String(memberId),
        university_name: In(universityNames),
      });
    } else {
      await this.calculatedScoreRepository.delete({ member_id: String(memberId) });
      await this.recruitmentScoreRepository.delete({ member_id: String(memberId) });
    }
  }

  /**
   * 유틸: 등급컷 파싱
   */
  private parseGradeCut(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(String(value));
    return isNaN(num) ? null : num;
  }

  /**
   * 유틸: 숫자 파싱
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(String(value));
    return isNaN(num) ? null : num;
  }
}
