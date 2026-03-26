const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function checkExistingEvaluations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Check for existing evaluations (student_id=8, member_id=1)
    console.log('🔍 Checking for existing evaluations...');
    console.log('   student_id: 8 (withjuno6@naver.com)');
    console.log('   member_id: 1 (거북쌤 officer)\n');

    const result = await dataSource.query(`
      SELECT * FROM officer_student_evaludate_relation_tb
      WHERE student_id = 8 AND member_id = 1
    `);

    if (result.length > 0) {
      console.log(`❌ FOUND ${result.length} EXISTING EVALUATION(S)!`);
      console.log('This will cause Unique constraint violation!\n');

      result.forEach((eval, idx) => {
        console.log(`Evaluation ${idx + 1}:`);
        console.log(`   ID: ${eval.id}`);
        console.log(`   Series: ${eval.series}`);
        console.log(`   Status: ${eval.status}`);
        console.log(`   Created: ${eval.create_dt}`);
        console.log('');
      });

      console.log('💡 Solution: Delete these evaluations to allow new ones\n');
      console.log('Run this command to delete:');
      console.log('DELETE FROM officer_student_evaludate_relation_tb WHERE student_id = 8 AND member_id = 1;');

    } else {
      console.log('✅ No existing evaluations found');
      console.log('Safe to create new evaluation!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

checkExistingEvaluations();
