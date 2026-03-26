const { Client } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
  });
  await client.connect();

  // 강원대 다군 모집단위 조회
  const result = await client.query(`
    SELECT u.name, ra.recruitment_name, ra.admission_type
    FROM ts_regular_admissions ra
    JOIN ts_universities u ON ra.university_id = u.id
    WHERE u.name LIKE '%강원%' AND ra.year = 2026 AND ra.admission_type = '다'
    ORDER BY u.name, ra.recruitment_name
  `);
  console.log('=== 강원대 다군 모집단위 ===');
  console.log('총:', result.rows.length, '개');
  result.rows.forEach(r => console.log(r.name + ' | ' + r.recruitment_name));

  // Excel에서 매칭 실패한 것들 확인
  const notMatched = [
    '간호학과', '다문화학과', '사회복지학과', '유아교육과',
    'AI콘텐츠공학과', '기계융합공학부', '산업경영공학과',
    '전기공학과', '정보통신공학과', '컴퓨터공학과'
  ];

  console.log('\n=== 매칭 실패 확인 ===');
  for (const name of notMatched) {
    const check = await client.query(`
      SELECT u.name, ra.recruitment_name
      FROM ts_regular_admissions ra
      JOIN ts_universities u ON ra.university_id = u.id
      WHERE u.name LIKE '%강원%' AND ra.year = 2026
        AND ra.recruitment_name LIKE $1
    `, [`%${name}%`]);
    if (check.rows.length > 0) {
      console.log(`${name}: 있음 (${check.rows.map(r => r.name + '-' + r.recruitment_name).join(', ')})`);
    } else {
      console.log(`${name}: DB에 없음`);
    }
  }

  await client.end();
}
main();
