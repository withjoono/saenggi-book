const { Client } = require('pg');
const categoryMapping = {
  1: [11, 12, 13, 14, 15, 16],
  2: [41, 54],
  3: [21, 22, 29, 30, 36, 39, 43, 44, 46, 51],
  4: [23, 24, 26, 32, 33, 55],
  5: [25, 40],
  6: [27, 28, 31, 34, 37, 38, 42, 47, 48, 56],
  7: [20, 45, 49, 50],
  8: [35, 52, 53],
};
async function updateCategories() {
  const client = new Client({ host: 'localhost', port: 5432, database: 'geobukschool_dev', user: 'tsuser', password: 'tsuser1234' });
  await client.connect();
  for (const [categoryId, subtypeIds] of Object.entries(categoryMapping)) {
    const result = await client.query('UPDATE ss_admission_subtype SET category_id = $1 WHERE id = ANY($2)', [parseInt(categoryId), subtypeIds]);
    console.log(`Category ${categoryId}: Updated ${result.rowCount} records`);
  }
  const verification = await client.query('SELECT c.name, COUNT(s.id) as count FROM ss_admission_subtype_category c LEFT JOIN ss_admission_subtype s ON s.category_id = c.id GROUP BY c.id, c.name ORDER BY c.display_order');
  console.log('\nVerification:');
  verification.rows.forEach(r => console.log(`  ${r.name}: ${r.count}`));
  await client.end();
}
updateCategories();
