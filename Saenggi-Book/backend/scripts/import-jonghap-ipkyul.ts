import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * 종합전형 입시 결과 데이터 import 스크립트
 * 파일: uploads/26_jonghap_ipkyul.xlsx
 *
 * 데이터 구조:
 * - ida_id, 대학, 대학코드, 전형타입, 세부전형, 계열, 모집단위
 * - 등급평균, 등급70%컷, 등급90컷 통계
 * - 2023~2026년 입시 결과 (모집인원, 경쟁률, 컷라인 등)
 */

async function importJonghapIpkyul() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev',
    entities: [],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    const filePath = path.join(__dirname, '../uploads/26_jonghap_ipkyul.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log(`📊 총 ${data.length}개의 행 발견`);

    // Row 0: 연도, Row 1: 컬럼명, Row 2부터: 실제 데이터
    const headerRow = data[1];
    console.log('\n헤더 구조 (일부):', headerRow.slice(0, 12));

    // 테이블 존재 여부 확인
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'susi_jonghap_ipkyul'
      );
    `;

    const tableExists = await dataSource.query(tableCheckQuery);
    console.log('\n테이블 존재 여부:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('\n⚠️  susi_jonghap_ipkyul 테이블이 존재하지 않습니다.');
      console.log('테이블 생성 중...');

      await dataSource.query(`
        CREATE TABLE susi_jonghap_ipkyul (
          id SERIAL PRIMARY KEY,
          ida_id VARCHAR(50) NOT NULL UNIQUE,

          -- 기본 정보
          university_name VARCHAR(200),
          university_code VARCHAR(20),
          admission_type VARCHAR(50),
          admission_type_code INTEGER,
          admission_detail VARCHAR(200),
          category VARCHAR(100),
          recruitment_unit VARCHAR(200),

          -- 통계 데이터
          grade_avg DECIMAL(10, 2),
          grade_70p_cut DECIMAL(10, 2),
          grade_90p_cut DECIMAL(10, 2),

          -- 2023년 데이터
          recruitment_2023 INTEGER,
          competition_rate_2023 DECIMAL(10, 2),
          additional_pass_rank_2023 INTEGER,
          actual_competition_rate_2023 DECIMAL(10, 2),
          grade_50p_2023 DECIMAL(10, 2),
          grade_70p_2023 DECIMAL(10, 2),

          -- 2024년 데이터
          recruitment_2024 INTEGER,
          competition_rate_2024 DECIMAL(10, 2),
          additional_pass_rank_2024 INTEGER,
          actual_competition_rate_2024 DECIMAL(10, 2),
          grade_50p_2024 DECIMAL(10, 2),
          grade_70p_2024 DECIMAL(10, 2),

          -- 2025년 데이터
          recruitment_2025 INTEGER,
          competition_rate_2025 DECIMAL(10, 2),
          additional_pass_rank_2025 INTEGER,
          actual_competition_rate_2025 DECIMAL(10, 2),
          grade_50p_2025 DECIMAL(10, 2),
          grade_70p_2025 DECIMAL(10, 2),

          -- 2026년 데이터
          recruitment_2026 INTEGER,
          competition_rate_2026 DECIMAL(10, 2),
          additional_pass_rank_2026 INTEGER,
          actual_competition_rate_2026 DECIMAL(10, 2),
          grade_50p_2026 DECIMAL(10, 2),
          grade_70p_2026 DECIMAL(10, 2),

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_susi_jonghap_ipkyul_ida_id ON susi_jonghap_ipkyul(ida_id);
        CREATE INDEX idx_susi_jonghap_ipkyul_university_code ON susi_jonghap_ipkyul(university_code);
        CREATE INDEX idx_susi_jonghap_ipkyul_admission_type ON susi_jonghap_ipkyul(admission_type);
      `);

      console.log('✅ 테이블 생성 완료');
    }

    const countResult = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_ipkyul');
    console.log(`\n📊 기존 데이터: ${countResult[0].count}개`);

    let successCount = 0;
    let errorCount = 0;

    // Row 2부터 실제 데이터 처리
    for (let i = 2; i < data.length; i++) {
      const row = data[i];

      const idaId = String(row[0] || '');
      if (!idaId) continue;

      try {
        await dataSource.query(
          `INSERT INTO susi_jonghap_ipkyul (
            ida_id, university_name, university_code, admission_type, admission_type_code,
            admission_detail, category, recruitment_unit,
            grade_avg, grade_70p_cut, grade_90p_cut,
            recruitment_2023, competition_rate_2023, additional_pass_rank_2023, actual_competition_rate_2023,
            grade_50p_2023, grade_70p_2023,
            recruitment_2024, competition_rate_2024, additional_pass_rank_2024, actual_competition_rate_2024,
            grade_50p_2024, grade_70p_2024,
            recruitment_2025, competition_rate_2025, additional_pass_rank_2025, actual_competition_rate_2025,
            grade_50p_2025, grade_70p_2025,
            recruitment_2026, competition_rate_2026, additional_pass_rank_2026, actual_competition_rate_2026,
            grade_50p_2026, grade_70p_2026
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23,
            $24, $25, $26, $27, $28, $29,
            $30, $31, $32, $33, $34, $35
          ) ON CONFLICT (ida_id) DO UPDATE SET
            university_name = $2, university_code = $3, admission_type = $4, admission_type_code = $5,
            admission_detail = $6, category = $7, recruitment_unit = $8,
            grade_avg = $9, grade_70p_cut = $10, grade_90p_cut = $11,
            recruitment_2023 = $12, competition_rate_2023 = $13, additional_pass_rank_2023 = $14,
            actual_competition_rate_2023 = $15, grade_50p_2023 = $16, grade_70p_2023 = $17,
            recruitment_2024 = $18, competition_rate_2024 = $19, additional_pass_rank_2024 = $20,
            actual_competition_rate_2024 = $21, grade_50p_2024 = $22, grade_70p_2024 = $23,
            recruitment_2025 = $24, competition_rate_2025 = $25, additional_pass_rank_2025 = $26,
            actual_competition_rate_2025 = $27, grade_50p_2025 = $28, grade_70p_2025 = $29,
            recruitment_2026 = $30, competition_rate_2026 = $31, additional_pass_rank_2026 = $32,
            actual_competition_rate_2026 = $33, grade_50p_2026 = $34, grade_70p_2026 = $35,
            updated_at = CURRENT_TIMESTAMP
          `,
          [
            idaId, row[1], row[2], row[3], row[4], row[5], row[7], row[8],
            row[9], row[10], row[11],
            row[12], row[13], row[14], row[15], row[16], row[17],
            row[18], row[19], row[20], row[21], row[22], row[23],
            row[24], row[25], row[26], row[27], row[28], row[29],
            row[30], row[31], row[32], row[33], row[34], row[35]
          ]
        );

        successCount++;
        if (successCount % 500 === 0) {
          console.log(`진행 중: ${successCount}/${data.length - 2}`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) {
          console.error(`❌ 에러 발생 (행 ${i}, ID: ${idaId}):`, error.message);
        }
      }
    }

    const finalCount = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_ipkyul');
    console.log(`\n✅ Import 완료!`);
    console.log(`   - 성공: ${successCount}개`);
    console.log(`   - 실패: ${errorCount}개`);
    console.log(`   - 총 데이터: ${finalCount[0].count}개`);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ 데이터베이스 연결 종료');
  }
}

importJonghapIpkyul()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
