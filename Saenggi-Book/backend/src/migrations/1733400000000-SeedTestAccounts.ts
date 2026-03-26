// @ts-nocheck
import * as bcrypt from 'bcrypt';

export class SeedTestAccounts1733400000000 implements MigrationInterface {
  name = 'SeedTestAccounts1733400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if accounts already exist before inserting
    const existingAccounts = await queryRunner.query(`
      SELECT email FROM member_tb WHERE email IN ('test@test.com', 'test2@test.com', 'test3@test.com')
    `);

    const existingEmails = existingAccounts.map((row: any) => row.email);

    // Hash password with bcrypt (Spring compatible format)
    const password = 'test1234';
    const hashedPassword = '{bcrypt}' + (await bcrypt.hash(password, 10));

    const now = new Date().toISOString();

    // 1. Student account (test@test.com)
    if (!existingEmails.includes('test@test.com')) {
      await queryRunner.query(
        `
        INSERT INTO member_tb (
          email, password, role_type, phone, ck_sms, ck_sms_agree,
          member_type, nickname, account_stop_yn, create_dt, update_dt
        ) VALUES (
          'test@test.com',
          $1,
          'ROLE_USER',
          '01012345678',
          B'0',
          B'0',
          'student',
          '테스트학생',
          'N',
          $2,
          $2
        )
      `,
        [hashedPassword, now],
      );
      console.log('Created student account: test@test.com');
    } else {
      console.log('Student account already exists: test@test.com');
    }

    // 2. Parent account (test2@test.com)
    if (!existingEmails.includes('test2@test.com')) {
      await queryRunner.query(
        `
        INSERT INTO member_tb (
          email, password, role_type, phone, ck_sms, ck_sms_agree,
          member_type, nickname, account_stop_yn, create_dt, update_dt
        ) VALUES (
          'test2@test.com',
          $1,
          'ROLE_USER',
          '01012345679',
          B'0',
          B'0',
          'parent',
          '테스트학부모',
          'N',
          $2,
          $2
        )
      `,
        [hashedPassword, now],
      );
      console.log('Created parent account: test2@test.com');
    } else {
      console.log('Parent account already exists: test2@test.com');
    }

    // 3. Teacher/Mentor account (test3@test.com)
    if (!existingEmails.includes('test3@test.com')) {
      await queryRunner.query(
        `
        INSERT INTO member_tb (
          email, password, role_type, phone, ck_sms, ck_sms_agree,
          member_type, nickname, account_stop_yn, create_dt, update_dt
        ) VALUES (
          'test3@test.com',
          $1,
          'ROLE_USER',
          '01012345680',
          B'0',
          B'0',
          'teacher',
          '테스트멘토',
          'N',
          $2,
          $2
        )
      `,
        [hashedPassword, now],
      );
      console.log('Created teacher/mentor account: test3@test.com');
    } else {
      console.log('Teacher/mentor account already exists: test3@test.com');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove test accounts (only if they exist)
    await queryRunner.query(`
      DELETE FROM member_tb
      WHERE email IN ('test@test.com', 'test2@test.com', 'test3@test.com')
    `);
    console.log('Removed test accounts');
  }
}
