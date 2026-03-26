// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SusiCalculationFormulaEntity } from '../../../../database/entities/susi/susi-calculation-formula.entity';
import { CalculationFormula } from '../types';

/**
 * 수시 교과전형 환산 공식 데이터를 로드하고 캐싱하는 서비스
 * 싱글톤으로 관리되어 애플리케이션 시작 시 DB에서 로드하여 메모리에 캐싱
 */
@Injectable()
export class SusiFormulaDataService implements OnModuleInit {
  private readonly logger = new Logger(SusiFormulaDataService.name);

  // 대학명 → 환산 공식 매핑 (캐시)
  private formulaCache: Map<string, CalculationFormula> = new Map();

  // 데이터 로드 상태
  private dataLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor(  ) {}

  async onModuleInit(): Promise<void> {
    // 모듈 초기화 시 데이터 프리로드
    try {
      await this.ensureDataLoaded();
      this.logger.log(`수시 환산 공식 데이터 로드 완료: ${this.formulaCache.size}개 대학`);
    } catch (error) {
      // 데이터가 없어도 에러가 아님 (테이블이 비어있을 수 있음)
      this.logger.warn('수시 환산 공식 데이터 로드 실패 (데이터가 없을 수 있음):', error.message);
      this.dataLoaded = true; // 빈 상태로 초기화 완료 처리
    }
  }

  /**
   * 데이터가 로드되었는지 확인하고, 로드되지 않았으면 로드
   */
  async ensureDataLoaded(): Promise<void> {
    if (this.dataLoaded) return;

    // 이미 로딩 중이면 기존 Promise 반환
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadAllFormulas();
    await this.loadingPromise;
    this.loadingPromise = null;
  }

  /**
   * DB에서 모든 환산 공식 로드
   */
  private async loadAllFormulas(): Promise<void> {
    try {
      const formulas = await this.formulaRepository.find({
        where: { is_active: true },
        order: { university_name: 'ASC' },
      });

      this.formulaCache.clear();

      for (const formula of formulas) {
        const key = this.getCacheKey(formula.university_name, formula.year);
        this.formulaCache.set(key, this.entityToFormula(formula));
      }

      this.dataLoaded = true;
      this.logger.log(`환산 공식 로드 완료: ${formulas.length}개`);
    } catch (error) {
      this.logger.error('환산 공식 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 캐시 키 생성
   */
  private getCacheKey(universityName: string, year?: number): string {
    return `${universityName}_${year || 2026}`;
  }

  /**
   * Entity → CalculationFormula 변환
   */
  private entityToFormula(entity: SusiCalculationFormulaEntity): CalculationFormula {
    return {
      id: entity.id,
      year: entity.year,
      university_name: entity.university_name,
      university_code: entity.university_code,
      reflection_semesters: entity.reflection_semesters,
      grade_1_ratio: Number(entity.grade_1_ratio) || 0,
      grade_2_ratio: Number(entity.grade_2_ratio) || 0,
      grade_3_ratio: Number(entity.grade_3_ratio) || 0,
      korean_ratio: Number(entity.korean_ratio) || 0,
      english_ratio: Number(entity.english_ratio) || 0,
      math_ratio: Number(entity.math_ratio) || 0,
      social_ratio: Number(entity.social_ratio) || 0,
      science_ratio: Number(entity.science_ratio) || 0,
      etc_ratio: Number(entity.etc_ratio) || 0,
      reflection_subject_count: entity.reflection_subject_count,
      reflection_subject_detail: entity.reflection_subject_detail,
      grade_conversion_table: entity.grade_conversion_table,
      career_subject_conversion: entity.career_subject_conversion,
      career_grade_conversion_table: entity.career_grade_conversion_table,
      attendance_score: Number(entity.attendance_score) || 0,
      volunteer_score: Number(entity.volunteer_score) || 0,
      max_score: Number(entity.max_score) || 1000,
      remarks: entity.remarks,
      is_active: entity.is_active,
    };
  }

  /**
   * 특정 대학의 환산 공식 조회
   */
  async getFormula(universityName: string, year?: number): Promise<CalculationFormula | null> {
    await this.ensureDataLoaded();

    const key = this.getCacheKey(universityName, year);
    return this.formulaCache.get(key) || null;
  }

  /**
   * 모든 환산 공식 조회
   */
  async getAllFormulas(year?: number): Promise<CalculationFormula[]> {
    await this.ensureDataLoaded();

    const targetYear = year || 2026;
    const formulas: CalculationFormula[] = [];

    for (const [key, formula] of this.formulaCache.entries()) {
      if (formula.year === targetYear) {
        formulas.push(formula);
      }
    }

    return formulas;
  }

  /**
   * 대학명 목록 조회
   */
  async getUniversityNames(year?: number): Promise<string[]> {
    const formulas = await this.getAllFormulas(year);
    return formulas.map((f) => f.university_name);
  }

  /**
   * 특정 대학들의 환산 공식 조회
   */
  async getFormulas(universityNames: string[], year?: number): Promise<CalculationFormula[]> {
    await this.ensureDataLoaded();

    const targetYear = year || 2026;
    const formulas: CalculationFormula[] = [];

    for (const name of universityNames) {
      const key = this.getCacheKey(name, targetYear);
      const formula = this.formulaCache.get(key);
      if (formula) {
        formulas.push(formula);
      }
    }

    return formulas;
  }

  /**
   * 캐시된 대학 수 조회
   */
  getCachedCount(): number {
    return this.formulaCache.size;
  }

  /**
   * 데이터 리로드 (관리자용)
   */
  async reloadData(): Promise<void> {
    this.dataLoaded = false;
    this.formulaCache.clear();
    await this.ensureDataLoaded();
    this.logger.log('환산 공식 데이터 리로드 완료');
  }

  /**
   * 환산 공식 저장 또는 업데이트
   */
  async saveFormula(formula: Partial<SusiCalculationFormulaEntity>): Promise<SusiCalculationFormulaEntity> {
    const existingFormula = await this.formulaRepository.findOne({
      where: {
        university_name: formula.university_name,
        year: formula.year,
      },
    });

    let savedEntity: SusiCalculationFormulaEntity;

    if (existingFormula) {
      // 업데이트
      await this.formulaRepository.update(existingFormula.id, formula);
      savedEntity = await this.formulaRepository.findOne({ where: { id: existingFormula.id } });
    } else {
      // 신규 저장
      savedEntity = await this.formulaRepository.save(this.formulaRepository.create(formula));
    }

    // 캐시 업데이트
    const key = this.getCacheKey(savedEntity.university_name, savedEntity.year);
    this.formulaCache.set(key, this.entityToFormula(savedEntity));

    return savedEntity;
  }

  /**
   * 여러 환산 공식 일괄 저장
   */
  async saveFormulas(
    formulas: Partial<SusiCalculationFormulaEntity>[],
  ): Promise<SusiCalculationFormulaEntity[]> {
    const savedEntities: SusiCalculationFormulaEntity[] = [];

    for (const formula of formulas) {
      const saved = await this.saveFormula(formula);
      savedEntities.push(saved);
    }

    return savedEntities;
  }
}
