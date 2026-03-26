const { Client } = require('pg');

async function updateSubtypeCategories() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'geobukschool_dev',
    user: 'tsuser',
    password: 'tsuser1234',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 카테고리별 서브타입 ID 매핑
    const categoryMappings = {
      1: [11, 12, 13, 14, 15, 16], // 지역인재
      2: [41], // 특혜지역 (서해5도)
      3: [21, 22, 29, 30, 44, 51], // 사회적 배려/저소득
      4: [23, 24, 26, 32, 33, 55], // 특수 교육/학교 배경
      5: [25, 36, 39], // 보훈/공로
      6: [27, 28, 31, 34, 40, 42, 47, 48, 54, 56], // 직업/공무원/특정 역할
      7: [20, 37, 38, 43, 45, 46, 49, 50, 53], // 특기/자격/실적
      8: [35, 52], // 기타
    };

    let totalUpdated = 0;

    for (const [categoryId, subtypeIds] of Object.entries(categoryMappings)) {
      for (const subtypeId of subtypeIds) {
        const result = await client.query(
          'UPDATE ss_admission_subtype SET category_id = $1 WHERE id = $2',
          [categoryId, subtypeId]
        );

        if (result.rowCount > 0) {
          totalUpdated++;
        }
      }
      console.log(`  Category ${categoryId}: Updated ${subtypeIds.length} subtypes`);
    }

    console.log(`\n✅ Total updated: ${totalUpdated} subtypes`);

    // 검증: 업데이트된 데이터 확인
    const verification = await client.query(
      'SELECT category_id, COUNT(*) as count FROM ss_admission_subtype GROUP BY category_id ORDER BY category_id'
    );

    console.log('\n📊 Verification - Subtypes per category:');
    verification.rows.forEach(row => {
      console.log(`  Category ${row.category_id}: ${row.count} subtypes`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateSubtypeCategories();
