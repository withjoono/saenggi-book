import { Client } from 'pg';

/**
 * Production seed script: Creates board data on Cloud SQL
 * Requires Cloud SQL Proxy running on port 5600
 *
 * Usage: npx ts-node scripts/seed-boards-prod.ts
 */
async function seedBoardsProd() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5600,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
  });

  const boards = [
    { id: 1, name: '공지사항', permission: 'ROLE_ADMIN' },
    { id: 2, name: '자유게시판', permission: 'ROLE_USER' },
    { id: 3, name: 'FAQ', permission: 'ROLE_ADMIN' },
  ];

  try {
    await client.connect();
    console.log('✅ Connected to Cloud SQL (geobukschool_prod)');

    for (const board of boards) {
      // Check if board already exists
      const existing = await client.query(
        `SELECT id, name, permission FROM board_tb WHERE id = $1`,
        [board.id]
      );

      if (existing.rows.length === 0) {
        // Insert new board
        const result = await client.query(
          `INSERT INTO board_tb (id, name, permission) VALUES ($1, $2, $3) RETURNING id, name, permission`,
          [board.id, board.name, board.permission]
        );
        console.log(`✅ Board created:`, result.rows[0]);
      } else {
        console.log(`📝 Board already exists (id: ${board.id}, name: ${existing.rows[0].name})`);
      }
    }

    // Reset sequence to max id + 1
    await client.query(`
      SELECT setval('board_tb_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM board_tb), false)
    `);
    console.log('\n✅ Sequence reset to next available id');

    // Verify final state
    const allBoards = await client.query(
      `SELECT id, name, permission FROM board_tb ORDER BY id`
    );
    console.log('\n📋 All boards:');
    allBoards.rows.forEach((b) => {
      console.log(`   [${b.id}] ${b.name} (${b.permission})`);
    });

    await client.end();
    console.log('\n🎉 Seed completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Cloud SQL Proxy가 실행 중인지 확인하세요:');
      console.error('   cloud-sql-proxy ts-back-nest-479305:asia-northeast3:ts-back-nest --port=5600');
    }
    await client.end();
    process.exit(1);
  }
}

seedBoardsProd();
