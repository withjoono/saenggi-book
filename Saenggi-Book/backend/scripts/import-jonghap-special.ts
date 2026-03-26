import * as XLSX from 'xlsx';
import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * 종합 전형 일반/특별 데이터 import 스크립트
 * 파일: uploads/26_jonghap_special.xlsx
 *
 * 데이터 구조:
 * - ida_id: 모집단위 ID
 * - 일반/특별: 일반 또는 특별 전형 구분
 * - 특별전형종류: 특별전형 코드 (예: 21,22,25,27,28)
 * - 2026 지원자격: 지원 가능한 자격 조건
 */

async function importJonghapSpecial() {
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

    const filePath = path.join(__dirname, '../uploads/26_jonghap_special.xlsx');
    console.log(`📁 파일 읽기: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log(`📊 총 ${data.length}개의 행 발견`);

    // Row 0: 헤더 레이블, Row 1: 실제 헤더, Row 2부터: 데이터
    const headerRow = data[1];
    console.log('\n헤더:', headerRow);

    // 테이블 존재 여부 확인
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'susi_jonghap_special'
      );
    `;

    const tableExists = await dataSource.query(tableCheckQuery);
    console.log('\n테이블 존재 여부:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('\n⚠️  susi_jonghap_special 테이블이 존재하지 않습니다.');
      console.log('테이블 생성 중...');

      await dataSource.query(`
        CREATE TABLE susi_jonghap_special (
          id SERIAL PRIMARY KEY,
          ida_id VARCHAR(50) NOT NULL UNIQUE,
          admission_category VARCHAR(20),
          special_admission_types VARCHAR(200),
          qualification_2026 TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_susi_jonghap_special_ida_id ON susi_jonghap_special(ida_id);
        CREATE INDEX idx_susi_jonghap_special_category ON susi_jonghap_special(admission_category);
      `);

      console.log('✅ 테이블 생성 완료');
    }

    const countResult = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_special');
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
          `INSERT INTO susi_jonghap_special (ida_id, admission_category, special_admission_types, qualification_2026)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (ida_id) DO UPDATE
           SET admission_category = $2, special_admission_types = $3, qualification_2026 = $4, updated_at = CURRENT_TIMESTAMP`,
          [
            idaId,
            row[1] || null,
            row[2] || null,
            row[3] || null
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

    const finalCount = await dataSource.query('SELECT COUNT(*) as count FROM susi_jonghap_special');
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

importJonghapSpecial()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
