const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

async function checkMajorField() {
  try {
    await client.connect();
    
    // major_field 값 분포 확인
    const result = await client.query(`
      SELECT 
        major_field,
        COUNT(*) as count
      FROM susi_kyokwa_recruitment
      WHERE admission_category = '일반'
      GROUP BY major_field
      ORDER BY count DESC
    `);
    
    console.log('=== major_field 분포 (일반전형) ===');
    console.log('total groups:', result.rows.length);
    result.rows.forEach(row => {
      console.log(`"${row.major_field}": ${row.count}개`);
    });
    
    // NULL 또는 빈값 체크
    const emptyCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM susi_kyokwa_recruitment
      WHERE admission_category = '일반'
        AND (major_field IS NULL OR major_field = '' OR TRIM(major_field) = '')
    `);
    
    console.log('\n=== 빈값 체크 ===');
    console.log('NULL/빈값 개수:', emptyCheck.rows[0].count);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkMajorField();
