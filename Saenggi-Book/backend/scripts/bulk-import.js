/**
 * 대량 데이터 Import 스크립트
 *
 * 사용법:
 *   node scripts/bulk-import.js <테이블명> <Excel파일경로>
 *
 * 예시:
 *   node scripts/bulk-import.js mockexam_raw_to_standard_tb ./uploads/conversion.xlsx
 *   node scripts/bulk-import.js ts_universities ./uploads/universities.xlsx
 *   node scripts/bulk-import.js ts_regular_admissions ./uploads/regular.xlsx
 */

const { Client } = require('pg');
const XLSX = require('xlsx');
const path = require('path');

// DB 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'geobukschool_dev',
  user: process.env.DB_USER || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
};

// 테이블별 컬럼 매핑 설정
const TABLE_MAPPINGS = {
  // 환산점수 변환 테이블
  mockexam_raw_to_standard_tb: {
    columns: ['code', 'grade', 'percentile', 'raw_score_common', 'raw_score_select', 'standard_score', 'top_cumulative'],
    excelMapping: (row) => [row[1], row[6] || 0, row[5] || 0, String(row[2] ?? '0'), String(row[3] ?? '0'), row[4] || 0, row[7] || 0],
    skipHeader: true,
    clearBefore: true,
    validateRow: (row) => row[1] && row[4] !== undefined, // code와 standard_score가 있어야 함
  },

  // 대학 테이블
  ts_universities: {
    columns: ['name', 'location', 'type', 'year'],
    excelMapping: (row) => [row[0], row[1], row[2], row[3] || 2024],
    skipHeader: true,
    clearBefore: false,
  },

  // 정시 전형 테이블
  ts_regular_admissions: {
    columns: ['university_id', 'department', 'admission_type', 'year', 'quota'],
    excelMapping: (row) => [row[0], row[1], row[2], row[3] || 2024, row[4] || 0],
    skipHeader: true,
    clearBefore: false,
  },

  // 상품 테이블
  pay_service_tb: {
    columns: ['service_name', 'price', 'service_period', 'service_range_code', 'delete_flag'],
    excelMapping: (row) => [row[0], row[1], row[2], row[3], 0],
    skipHeader: true,
    clearBefore: false,
  },
};

async function bulkImport(tableName, filePath) {
  const client = new Client(dbConfig);

  try {
    console.log(`\n📦 Bulk Import 시작`);
    console.log(`   테이블: ${tableName}`);
    console.log(`   파일: ${filePath}\n`);

    // 테이블 매핑 확인
    const mapping = TABLE_MAPPINGS[tableName];
    if (!mapping) {
      console.log(`⚠️  '${tableName}' 테이블의 매핑 설정이 없습니다.`);
      console.log(`   지원되는 테이블: ${Object.keys(TABLE_MAPPINGS).join(', ')}`);
      console.log(`\n   새 테이블 추가: scripts/bulk-import.js의 TABLE_MAPPINGS에 설정 추가`);
      return;
    }

    // Excel 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`📄 Excel 정보:`);
    console.log(`   시트: ${sheetName}`);
    console.log(`   전체 행: ${data.length}`);

    // 헤더 제외 및 유효성 검사
    const rows = mapping.skipHeader ? data.slice(1) : data;
    let validRows = rows.filter(row => row.length > 0 && row[0] !== undefined);

    // 커스텀 검증 함수가 있으면 적용
    if (mapping.validateRow) {
      const beforeCount = validRows.length;
      validRows = validRows.filter(mapping.validateRow);
      const skipped = beforeCount - validRows.length;
      if (skipped > 0) {
        console.log(`   ⚠️  유효하지 않은 행 ${skipped}개 제외됨`);
      }
    }

    console.log(`   유효 행: ${validRows.length}\n`);

    // DB 연결
    await client.connect();
    console.log(`✅ DB 연결 성공\n`);

    // 기존 데이터 삭제 (설정된 경우)
    if (mapping.clearBefore) {
      await client.query(`DELETE FROM ${tableName}`);
      console.log(`🗑️  기존 데이터 삭제 완료\n`);
    }

    // 배치 INSERT
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];

      batch.forEach((row, idx) => {
        const mappedRow = mapping.excelMapping(row);
        const rowPlaceholders = mappedRow.map((_, colIdx) =>
          `$${idx * mapping.columns.length + colIdx + 1}`
        );
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
        values.push(...mappedRow);
      });

      const query = `
        INSERT INTO ${tableName} (${mapping.columns.join(', ')})
        VALUES ${placeholders.join(', ')}
      `;

      await client.query(query, values);
      inserted += batch.length;

      // 진행률 표시
      const progress = Math.round((inserted / validRows.length) * 100);
      process.stdout.write(`\r⏳ Import 진행중... ${inserted}/${validRows.length} (${progress}%)`);
    }

    console.log(`\n\n✅ Import 완료!`);
    console.log(`   총 ${inserted}건 저장됨\n`);

    // 확인 쿼리
    const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
    console.log(`📊 테이블 현재 상태: ${countResult.rows[0].count}건\n`);

  } catch (error) {
    console.error(`\n❌ 에러 발생:`, error.message);
  } finally {
    await client.end();
  }
}

// CLI 실행
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
📦 대량 데이터 Import 스크립트

사용법:
  node scripts/bulk-import.js <테이블명> <Excel파일경로>

예시:
  node scripts/bulk-import.js mockexam_raw_to_standard_tb ./uploads/conversion.xlsx
  node scripts/bulk-import.js ts_universities ./uploads/universities.xlsx

지원 테이블:
  ${Object.keys(TABLE_MAPPINGS).map(t => `- ${t}`).join('\n  ')}
`);
} else {
  bulkImport(args[0], args[1]);
}
