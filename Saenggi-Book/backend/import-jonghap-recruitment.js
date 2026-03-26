const XLSX = require('xlsx');
const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

// TypeORM DataSource 설정
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_DATABASE || 'geobukschool_dev',
  synchronize: false,
  logging: false,
});

async function main() {
  try {
    console.log('📊 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Excel 파일 읽기
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile('./uploads/ss_26_jonghap_recruitment.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📄 Found ${jsonData.length} rows in Excel file`);

    if (jsonData.length > 0) {
      console.log('📋 Sample row:', jsonData[0]);
    }

    // 테이블 truncate
    console.log('🗑️  Truncating susi_jonghap_recruitment table...');
    await AppDataSource.query('TRUNCATE TABLE susi_jonghap_recruitment RESTART IDENTITY CASCADE');
    console.log('✅ Table truncated');

    // 데이터 삽입
    console.log('💾 Inserting data...');
    let inserted = 0;
    let failed = 0;

    for (const row of jsonData) {
      try {
        await AppDataSource.query(
          `INSERT INTO susi_jonghap_recruitment (
            ida_id, university_name, university_code, university_type,
            admission_type, admission_name, category, recruitment_unit,
            region_major, region_detail, admission_category,
            special_admission_types, qualification, admission_method,
            minimum_standard, recruitment_count, major_field, mid_field, minor_field
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            row['id'] || null,
            row['대학'] || null,
            row['대학코드'] || null,
            row['대학설립형태'] || null,
            row['전형타입'] || null,
            row['세부전형'] || null,
            row['계열'] || null,
            row['모집단위'] || null,
            row['지역(광역)'] || null,
            row['지역(세부)'] || null,
            row['일반/특별'] || null,
            row['특별전형종류'] || null,
            (row[' 지원자격'] || row['지원자격']) || null,
            (row[' 전형요소'] || row['전형요소']) || null,
            (row[' 최저학력기준'] || row['최저학력기준']) || null,
            parseInt(row[' 모집인원'] || row['모집인원']) || null,
            row['대계열'] || null,
            row['중계열'] || null,
            row['소계열'] || null,
          ]
        );
        inserted++;
        if (inserted % 100 === 0) {
          console.log(`  ✓ Inserted ${inserted} rows...`);
        }
      } catch (error) {
        failed++;
        console.error(`  ✗ Failed to insert row:`, error.message);
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`   - Successfully inserted: ${inserted} rows`);
    console.log(`   - Failed: ${failed} rows`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

main();
