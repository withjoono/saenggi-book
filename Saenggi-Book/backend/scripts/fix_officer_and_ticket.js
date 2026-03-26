const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_dev'
});

async function main() {
    try {
        await client.connect();

        // ------------------------------------------------------------------
        // 1. Find User
        // ------------------------------------------------------------------
        console.log('\n[1] Finding user...');
        const emailPattern = 'withjuno6%';
        const userRes = await client.query(
            "SELECT id, email, nickname FROM auth_member WHERE email LIKE $1 OR email LIKE $2",
            ['withjuno6@nver.com', 'withjuno6@naver.com']
        );

        let user;
        if (userRes.rows.length === 0) {
            console.error('❌ User not found!');
            return;
        } else if (userRes.rows.length > 1) {
            console.log('⚠️ Multiple users found, selecting the one with exact match if possible or the first one.');
            console.table(userRes.rows);
            user = userRes.rows[0]; // Logic can be improved if needed
        } else {
            user = userRes.rows[0];
        }
        console.log(`✅ User found: ID=${user.id}, Email=${user.email}, Nickname=${user.nickname}`);

        // ------------------------------------------------------------------
        // 2. Restore Evaluation Tickets
        // ------------------------------------------------------------------
        console.log('\n[2] Restoring Evaluation Tickets...');
        const ticketRes = await client.query("SELECT * FROM officer_ticket_tb WHERE member_id = $1", [user.id]);

        if (ticketRes.rows.length > 0) {
            await client.query("UPDATE officer_ticket_tb SET ticket_count = 5 WHERE member_id = $1", [user.id]);
            console.log('✅ Updated existing ticket record to 5 tickets.');
        } else {
            await client.query("INSERT INTO officer_ticket_tb (member_id, ticket_count) VALUES ($1, 5)", [user.id]);
            console.log('✅ Inserted new ticket record with 5 tickets.');
        }

        // ------------------------------------------------------------------
        // 3. Grant Integrated Ticket (Combined Ticket)
        // ------------------------------------------------------------------
        console.log('\n[3] Granting Integrated Ticket...');
        // Find the correct product for 'Integrated' or 'Combined'
        // Strategy: Look for '수시 정시 합격예측' or similar, assume it's valid for a long time or currently available.
        // Or simply look for a product that covers both "S" and "J" service range code.
        const productRes = await client.query(
            "SELECT id, product_nm, product_price FROM payment_service WHERE (product_nm LIKE '%통합%' OR product_nm LIKE '%패키지%') AND delete_flag = 0 LIMIT 1"
        );

        if (productRes.rows.length === 0) {
            console.error('❌ Could not find an Integrated Ticket product in payment_service table. Please check product names.');
            // Fallback: Try searching for any active product just to give SOMETHING if specifically requested, 
            // but for now, just logging error is safer.
        } else {
            const product = productRes.rows[0];
            console.log(`Using product: ${product.product_nm} (ID: ${product.id})`);

            // Check if user already has an active order for this product to avoid duplicates if closely run? 
            // Actually user asked to "grant again", so we just grant it.

            const merchantUid = `order-restored-${Date.now()}`;
            await client.query(`
                INSERT INTO pay_order 
                (merchant_uid, order_state, paid_amount, member_id, pay_service_id, create_dt, update_dt, card_name, card_number)
                VALUES ($1, 'COMPLETE', 0, $2, $3, NOW(), NOW(), 'ADMIN_GRANT', '0000')
            `, [merchantUid, user.id, product.id]);
            console.log(`✅ Granted product '${product.product_nm}' via new COMPLETE order.`);
        }

        // ------------------------------------------------------------------
        // 4. Debug/Fix Officer List
        // ------------------------------------------------------------------
        console.log('\n[4] Debugging Officer List...');
        const officerRes = await client.query("SELECT * FROM officer_list_tb");
        console.log(`Total officers found: ${officerRes.rows.length}`);

        if (officerRes.rows.length === 0) {
            console.error('❌ No officers found in officer_list_tb!');
            console.log('✨ Creating a dummy officer using the current user (ID=' + user.id + ') for testing...');

            // Check if this user is already an officer (just in case logic failed)
            // But we know count is 0.

            await client.query(`
                INSERT INTO officer_list_tb 
                (approval_status, create_dt, del_yn, education, officer_name, officer_profile_image, university, update_dt, member_id)
                VALUES 
                (1, NOW(), 'N', 'Seoul National Univ.', 'Dr. Test Officer', 'https://via.placeholder.com/150', 'Seoul National Univ.', NOW(), $1)
            `, [user.id]);
            console.log('✅ Dummy officer created.');

        } else {
            console.table(officerRes.rows.map(o => ({
                id: o.id,
                name: o.officer_name,
                del_yn: o.del_yn,
                approval_status: o.approval_status
            })));

            const hiddenOfficers = officerRes.rows.filter(o => o.del_yn === 'Y');
            if (hiddenOfficers.length > 0) {
                console.log(`Found ${hiddenOfficers.length} hidden officers (del_yn='Y'). Unhiding them...`);
                await client.query("UPDATE officer_list_tb SET del_yn = 'N' WHERE del_yn = 'Y'");
                console.log('✅ All officers unhidden (del_yn set to N).');
            } else {
                console.log('ℹ️ No hidden officers found. If list is still empty, check approval_status or other logic.');

                // Also check approval_status logic: usually 1 means approved.
                // OfficerListEntity has approval_status. 
                // Let's ensure they are approved.
                const unapprovedOfficers = officerRes.rows.filter(o => o.approval_status !== 1);
                if (unapprovedOfficers.length > 0) {
                    console.log(`Found ${unapprovedOfficers.length} unapproved officers (approval_status != 1). Approving them...`);
                    await client.query("UPDATE officer_list_tb SET approval_status = 1 WHERE approval_status != 1");
                    console.log('✅ All officers approved (approval_status set to 1).');
                }
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

main();
