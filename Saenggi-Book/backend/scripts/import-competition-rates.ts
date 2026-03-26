#!/usr/bin/env ts-node
/**
 * 경쟁률 데이터 Import 스크립트
 *
 * 사용법:
 * ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts <excel-file-path>
 *
 * Excel 파일 필수 컬럼:
 * - unified_id 또는 (대학명 + 모집단위명) 조합
 * - 2024학년도경쟁률, 2023학년도경쟁률, 2022학년도경쟁률, 2021학년도경쟁률, 2020학년도경쟁률
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { SuSiSubjectEntity } from '../src/database/entities/susi/susi-subject.entity';
import { SusiComprehensiveEntity } from '../src/database/entities/susi/susi-comprehensive.entity';
import { RecruitmentUnitPreviousResultEntity } from '../src/database/entities/core/recruitment-unit-previous-result.entity';
import { RecruitmentUnitEntity } from '../src/database/entities/core/recruitment-unit.entity';
import { config } from 'dotenv';
import { resolve } from 'path';

// 환경 변수 로드
config({ path: resolve(__dirname, '../.env.development') });

// 컬럼 매핑
const COMPETITION_RATE_MAPPING = {
  'unified_id': 'unified_id',
  'id': 'unified_id',
  '대학명': 'university_name',
  '모집단위명': 'recruitment_unit_name',
  '전형명': 'type_name',
  '2024학년도경쟁률': 'competition_rate_2024',
  '2023학년도경쟁률': 'competition_rate_2023',
  '2022학년도경쟁률': 'competition_rate_2022',
  '2021학년도경쟁률': 'competition_rate_2021',
  '2020학년도경쟁률': 'competition_rate_2020',
};

interface CompetitionRateRow {
  unified_id?: string;
  university_name?: string;
  recruitment_unit_name?: string;
  type_name?: string;
  competition_rate_2024?: string;
  competition_rate_2023?: string;
  competition_rate_2022?: string;
  competition_rate_2021?: string;
  competition_rate_2020?: string;
}

interface UpdateStats {
  total: number;
  susiSubjectUpdated: number;
  susiComprehensiveUpdated: number;
  recruitmentUnitUpdated: number;
  notFound: number;
  errors: number;
}

/**
 * Excel 파일에서 경쟁률 데이터 읽기
 */
function readCompetitionRatesFromExcel(filePath: string): CompetitionRateRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet);

  const mappedData: CompetitionRateRow[] = rawData.map((row: any) => {
    const mappedRow: CompetitionRateRow = {};

    for (const [excelKey, dbKey] of Object.entries(COMPETITION_RATE_MAPPING)) {
      if (row[excelKey] !== undefined && row[excelKey] !== null && row[excelKey] !== '-') {
        const value = String(row[excelKey]).trim();
        if (value !== '' && value !== 'N' && value !== '#N/A') {
          mappedRow[dbKey] = value;
        }
      }
    }

    return mappedRow;
  });

  return mappedData.filter(row =>
    row.unified_id || (row.university_name && row.recruitment_unit_name)
  );
}

/**
 * 경쟁률 값 파싱 (예: "5.5:1" -> 5.5)
 */
function parseCompetitionRate(value: string | undefined): string | null {
  if (!value) return null;

  // "5.5:1" 형태의 경쟁률 파싱
  const match = value.match(/^(\d+\.?\d*)/);
  return match ? match[1] : value;
}

/**
 * 데이터베이스 연결 생성
 */
async function createDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
    entities: [
      SuSiSubjectEntity,
      SusiComprehensiveEntity,
      RecruitmentUnitEntity,
      RecruitmentUnitPreviousResultEntity,
    ],
    synchronize: false,
  });

  await dataSource.initialize();
  return dataSource;
}

/**
 * SuSiSubjectEntity 경쟁률 업데이트
 */
async function updateSusiSubject(
  dataSource: DataSource,
  row: CompetitionRateRow,
): Promise<boolean> {
  const repository = dataSource.getRepository(SuSiSubjectEntity);

  let query = repository.createQueryBuilder('s');

  if (row.unified_id) {
    query = query.where('s.unified_id = :unified_id', { unified_id: row.unified_id });
  } else {
    query = query
      .where('s.university_name = :university_name', { university_name: row.university_name })
      .andWhere('s.recruitment_unit_name = :recruitment_unit_name', {
        recruitment_unit_name: row.recruitment_unit_name
      });

    if (row.type_name) {
      query = query.andWhere('s.type_name = :type_name', { type_name: row.type_name });
    }
  }

  const entities = await query.getMany();

  if (entities.length === 0) {
    return false;
  }

  const updateData: Partial<SuSiSubjectEntity> = {};

  if (row.competition_rate_2024) {
    updateData.competition_rate_2024 = parseCompetitionRate(row.competition_rate_2024);
  }
  if (row.competition_rate_2023) {
    updateData.competition_rate_2023 = parseCompetitionRate(row.competition_rate_2023);
  }
  if (row.competition_rate_2022) {
    updateData.competition_rate_2022 = parseCompetitionRate(row.competition_rate_2022);
  }
  if (row.competition_rate_2021) {
    updateData.competition_rate_2021 = parseCompetitionRate(row.competition_rate_2021);
  }
  if (row.competition_rate_2020) {
    updateData.competition_rate_2020 = parseCompetitionRate(row.competition_rate_2020);
  }

  for (const entity of entities) {
    await repository.update(entity.id, updateData);
  }

  return true;
}

/**
 * SusiComprehensiveEntity 경쟁률 업데이트
 */
async function updateSusiComprehensive(
  dataSource: DataSource,
  row: CompetitionRateRow,
): Promise<boolean> {
  const repository = dataSource.getRepository(SusiComprehensiveEntity);

  let query = repository.createQueryBuilder('s');

  if (row.unified_id) {
    query = query.where('s.unified_id = :unified_id', { unified_id: row.unified_id });
  } else {
    query = query
      .where('s.university_name = :university_name', { university_name: row.university_name })
      .andWhere('s.recruitment_unit_name = :recruitment_unit_name', {
        recruitment_unit_name: row.recruitment_unit_name
      });

    if (row.type_name) {
      query = query.andWhere('s.type_name = :type_name', { type_name: row.type_name });
    }
  }

  const entities = await query.getMany();

  if (entities.length === 0) {
    return false;
  }

  const updateData: Partial<SusiComprehensiveEntity> = {};

  if (row.competition_rate_2024) {
    updateData.competition_rate_2024 = parseCompetitionRate(row.competition_rate_2024);
  }
  if (row.competition_rate_2023) {
    updateData.competition_rate_2023 = parseCompetitionRate(row.competition_rate_2023);
  }
  if (row.competition_rate_2022) {
    updateData.competition_rate_2022 = parseCompetitionRate(row.competition_rate_2022);
  }
  if (row.competition_rate_2021) {
    updateData.competition_rate_2021 = parseCompetitionRate(row.competition_rate_2021);
  }
  if (row.competition_rate_2020) {
    updateData.competition_rate_2020 = parseCompetitionRate(row.competition_rate_2020);
  }

  for (const entity of entities) {
    await repository.update(entity.id, updateData);
  }

  return true;
}

/**
 * RecruitmentUnitPreviousResultEntity 경쟁률 업데이트
 */
async function updateRecruitmentUnitPreviousResults(
  dataSource: DataSource,
  row: CompetitionRateRow,
): Promise<boolean> {
  const recruitmentUnitRepo = dataSource.getRepository(RecruitmentUnitEntity);
  const previousResultRepo = dataSource.getRepository(RecruitmentUnitPreviousResultEntity);

  // 모집단위 찾기
  let recruitmentUnits: RecruitmentUnitEntity[] = [];

  if (row.university_name && row.recruitment_unit_name) {
    recruitmentUnits = await recruitmentUnitRepo
      .createQueryBuilder('ru')
      .innerJoin('ru.admission', 'adm')
      .innerJoin('adm.university', 'univ')
      .where('univ.name = :university_name', { university_name: row.university_name })
      .andWhere('ru.name = :recruitment_unit_name', {
        recruitment_unit_name: row.recruitment_unit_name
      })
      .getMany();
  }

  if (recruitmentUnits.length === 0) {
    return false;
  }

  let updated = false;

  for (const recruitmentUnit of recruitmentUnits) {
    // 각 연도별 경쟁률 업데이트
    const years = [2024, 2023, 2022, 2021, 2020];
    const competitionRates = [
      row.competition_rate_2024,
      row.competition_rate_2023,
      row.competition_rate_2022,
      row.competition_rate_2021,
      row.competition_rate_2020,
    ];

    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      const competitionRate = competitionRates[i];

      if (!competitionRate) continue;

      const parsedRate = parseCompetitionRate(competitionRate);
      if (!parsedRate) continue;

      // 기존 레코드 찾기
      let previousResult = await previousResultRepo.findOne({
        where: {
          recruitment_unit: { id: recruitmentUnit.id },
          year: year,
        },
      });

      if (previousResult) {
        // 업데이트
        previousResult.competition_ratio = parseFloat(parsedRate);
        await previousResultRepo.save(previousResult);
      } else {
        // 새로 생성
        previousResult = previousResultRepo.create({
          recruitment_unit: recruitmentUnit,
          year: year,
          result_criteria: '최종등록자90%컷',
          competition_ratio: parseFloat(parsedRate),
        });
        await previousResultRepo.save(previousResult);
      }

      updated = true;
    }
  }

  return updated;
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('사용법: ts-node -r tsconfig-paths/register scripts/import-competition-rates.ts <excel-file-path>');
    process.exit(1);
  }

  const filePath = args[0];

  console.log(`📊 경쟁률 데이터 Import 시작`);
  console.log(`파일: ${filePath}\n`);

  let dataSource: DataSource | null = null;

  try {
    // Excel 파일 읽기
    console.log('1️⃣ Excel 파일 읽기...');
    const competitionRates = readCompetitionRatesFromExcel(filePath);
    console.log(`   ✅ ${competitionRates.length}개 레코드 읽기 완료\n`);

    // 데이터베이스 연결
    console.log('2️⃣ 데이터베이스 연결...');
    dataSource = await createDataSource();
    console.log('   ✅ 데이터베이스 연결 완료\n');

    // 경쟁률 업데이트
    console.log('3️⃣ 경쟁률 데이터 업데이트 중...');
    const stats: UpdateStats = {
      total: competitionRates.length,
      susiSubjectUpdated: 0,
      susiComprehensiveUpdated: 0,
      recruitmentUnitUpdated: 0,
      notFound: 0,
      errors: 0,
    };

    for (let i = 0; i < competitionRates.length; i++) {
      const row = competitionRates[i];

      try {
        const identifier = row.unified_id ||
          `${row.university_name} - ${row.recruitment_unit_name}`;

        process.stdout.write(`   [${i + 1}/${competitionRates.length}] ${identifier}...`);

        let foundAny = false;

        // SuSiSubjectEntity 업데이트
        const susiSubjectUpdated = await updateSusiSubject(dataSource, row);
        if (susiSubjectUpdated) {
          stats.susiSubjectUpdated++;
          foundAny = true;
        }

        // SusiComprehensiveEntity 업데이트
        const susiComprehensiveUpdated = await updateSusiComprehensive(dataSource, row);
        if (susiComprehensiveUpdated) {
          stats.susiComprehensiveUpdated++;
          foundAny = true;
        }

        // RecruitmentUnitPreviousResultEntity 업데이트
        const recruitmentUnitUpdated = await updateRecruitmentUnitPreviousResults(dataSource, row);
        if (recruitmentUnitUpdated) {
          stats.recruitmentUnitUpdated++;
          foundAny = true;
        }

        if (!foundAny) {
          stats.notFound++;
          process.stdout.write(' ❌ 미발견\n');
        } else {
          process.stdout.write(' ✅\n');
        }
      } catch (error) {
        stats.errors++;
        process.stdout.write(` ⚠️ 오류: ${error.message}\n`);
      }
    }

    console.log('\n4️⃣ 완료!\n');
    console.log('📈 업데이트 통계:');
    console.log(`   전체: ${stats.total}`);
    console.log(`   수시교과(SuSiSubject): ${stats.susiSubjectUpdated}`);
    console.log(`   수시종합(SusiComprehensive): ${stats.susiComprehensiveUpdated}`);
    console.log(`   모집단위(RecruitmentUnit): ${stats.recruitmentUnitUpdated}`);
    console.log(`   미발견: ${stats.notFound}`);
    console.log(`   오류: ${stats.errors}`);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (dataSource) {
      await dataSource.destroy();
    }
  }
}

// 스크립트 실행
main();
