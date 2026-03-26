const XLSX = require('xlsx');
const { Client } = require('pg');
const path = require('path');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'tsuser',
  password: 'tsuser1234',
  database: 'geobukschool_dev',
});

async function importSurveyData() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Read Excel file
    const filePath = path.join(__dirname, 'uploads', 'sanggibu_evaluation_question.xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['질문지'];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`📊 Found ${data.length - 1} questions in Excel file`);

    // Add columns if they don't exist
    console.log('🔧 Adding new columns...');
    await client.query(`
      ALTER TABLE officer_bottom_survey_tb
      ADD COLUMN IF NOT EXISTS main_category VARCHAR(50),
      ADD COLUMN IF NOT EXISTS middle_category VARCHAR(100)
    `);
    console.log('✅ Columns added');

    // Clear existing data
    console.log('🗑️ Clearing existing survey data...');
    await client.query('DELETE FROM officer_bottom_survey_tb');
    console.log('✅ Existing data cleared');

    // Prepare insert statement
    const insertQuery = `
      INSERT INTO officer_bottom_survey_tb
      (order_num, main_category, middle_category, evaluate_content, main_survey_type)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // Skip header row and import data
    let imported = 0;
    let skipped = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows

      const questionNum = row[0]; // 질문번호
      const mainCategory = row[1]; // 대분류
      const middleCategory = row[2]; // 중분류
      const question = row[3]; // 소분류 (actual question)

      // Skip if question is empty
      if (!question || question.toString().trim() === '') {
        console.log(`⚠️ Skipping row ${i + 1}: empty question`);
        skipped++;
        continue;
      }

      // Map main category to legacy type for backward compatibility
      let mainSurveyType = null;
      if (mainCategory && mainCategory.includes('진로')) {
        mainSurveyType = 'JINRO';
      } else if (mainCategory && mainCategory.includes('학업')) {
        mainSurveyType = 'HAKUP';
      } else if (mainCategory && mainCategory.includes('공동체')) {
        mainSurveyType = 'GONGDONG';
      } else if (mainCategory && mainCategory.includes('기타')) {
        mainSurveyType = 'ETC';
      }

      await client.query(insertQuery, [
        questionNum,
        mainCategory,
        middleCategory,
        question,
        mainSurveyType,
      ]);
      imported++;
    }

    console.log(`✅ Successfully imported ${imported} questions`);
    if (skipped > 0) {
      console.log(`⚠️ Skipped ${skipped} rows with empty questions`);
    }

    // Verify by showing sample grouped by main category
    const result = await client.query(`
      SELECT main_category, COUNT(*) as count
      FROM officer_bottom_survey_tb
      GROUP BY main_category
      ORDER BY main_category
    `);

    console.log('\n📋 Questions grouped by main category:');
    result.rows.forEach(row => {
      console.log(`  ${row.main_category}: ${row.count} questions`);
    });

    // Show first few questions
    const sample = await client.query(`
      SELECT order_num, main_category, middle_category, evaluate_content
      FROM officer_bottom_survey_tb
      ORDER BY order_num
      LIMIT 5
    `);

    console.log('\n📝 Sample questions:');
    sample.rows.forEach(row => {
      console.log(`  ${row.order_num}. [${row.main_category}]`);
      console.log(`     ${row.middle_category}`);
      console.log(`     → ${row.evaluate_content.substring(0, 60)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

importSurveyData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
