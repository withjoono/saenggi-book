const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

async function addTicketsToUser(email, ticketCount = 5) {
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

    // 1. Find member by email
    console.log(`🔍 Finding member with email: ${email}`);
    const members = await dataSource.query(
      `SELECT id, email, nickname FROM auth_member WHERE email = $1`,
      [email]
    );

    if (members.length === 0) {
      console.log(`❌ Member not found with email: ${email}`);
      return;
    }

    const member = members[0];
    console.log(`✅ Found member: ID ${member.id}, Nickname: ${member.nickname}\n`);

    // 2. Check existing tickets
    const existingTickets = await dataSource.query(
      `SELECT * FROM officer_ticket_tb WHERE member_id = $1`,
      [member.id]
    );

    if (existingTickets.length > 0) {
      const currentCount = existingTickets[0].ticket_count;
      console.log(`📋 Current ticket count: ${currentCount}`);

      // Update existing record
      const newCount = currentCount + ticketCount;
      await dataSource.query(
        `UPDATE officer_ticket_tb SET ticket_count = $1 WHERE member_id = $2`,
        [newCount, member.id]
      );

      console.log(`✅ Added ${ticketCount} tickets`);
      console.log(`📊 New ticket count: ${newCount}\n`);

    } else {
      console.log(`📋 No existing tickets found`);

      // Insert new record
      await dataSource.query(
        `INSERT INTO officer_ticket_tb (member_id, ticket_count) VALUES ($1, $2)`,
        [member.id, ticketCount]
      );

      console.log(`✅ Created ticket record with ${ticketCount} tickets\n`);
    }

    // 3. Verify final state
    const finalTickets = await dataSource.query(
      `SELECT * FROM officer_ticket_tb WHERE member_id = $1`,
      [member.id]
    );

    console.log('📊 Final ticket status:');
    console.log(JSON.stringify(finalTickets[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Usage
const email = process.argv[2] || 'withjuno6@naver.com';
const count = parseInt(process.argv[3]) || 5;

console.log('🎫 Officer Ticket Manager\n');
console.log(`Email: ${email}`);
console.log(`Tickets to add: ${count}\n`);

addTicketsToUser(email, count);
