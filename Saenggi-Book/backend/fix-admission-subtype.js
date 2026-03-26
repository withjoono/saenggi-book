const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'geobukschool_dev',
  user: 'tsuser',
  password: 'tsuser1234',
});

async function fixAdmissionSubtype() {
  try {
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공\n');

    // code 컬럼 추가
    console.log('🔧 code 컬럼 추가 중...');
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'ss_admission_subtype'
              AND column_name = 'code'
          ) THEN
              ALTER TABLE ss_admission_subtype
              ADD COLUMN code VARCHAR(10) NULL;

              EXECUTE 'COMMENT ON COLUMN ss_admission_subtype.code IS ''전형 코드 (Excel 파일의 특별전형 코드)''';

              RAISE NOTICE 'Column "code" added successfully';
          ELSE
              RAISE NOTICE 'Column "code" already exists';
          END IF;
      END $$;
    `);
    console.log('✅ code 컬럼 처리 완료\n');

    // category_id 컬럼 추가
    console.log('🔧 category_id 컬럼 추가 중...');
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_name = 'ss_admission_subtype'
              AND column_name = 'category_id'
          ) THEN
              ALTER TABLE ss_admission_subtype
              ADD COLUMN category_id INTEGER NULL;

              EXECUTE 'COMMENT ON COLUMN ss_admission_subtype.category_id IS ''카테고리 ID''';

              RAISE NOTICE 'Column "category_id" added successfully';
          ELSE
              RAISE NOTICE 'Column "category_id" already exists';
          END IF;
      END $$;
    `);
    console.log('✅ category_id 컬럼 처리 완료\n');

    // Foreign key 추가 (이미 존재하면 무시)
    console.log('🔧 Foreign key 추가 중...');
    try {
      await client.query(`
        ALTER TABLE ss_admission_subtype
        ADD CONSTRAINT fk_admission_subtype_category
        FOREIGN KEY (category_id)
        REFERENCES ss_admission_subtype_category(id);
      `);
      console.log('✅ Foreign key 추가 완료\n');
    } catch (err) {
      if (err.code === '42P07' || err.message.includes('already exists')) {
        console.log('ℹ️  Foreign key가 이미 존재합니다\n');
      } else {
        throw err;
      }
    }

    // 결과 확인
    console.log('📊 테이블 구조 확인:\n');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'ss_admission_subtype'
      ORDER BY ordinal_position;
    `);

    console.table(result.rows);

    console.log('\n✅ 모든 작업 완료!\n');

  } catch (error) {
    console.error('\n❌ 에러 발생:', error.message);
    if (error.code) {
      console.error(`에러 코드: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixAdmissionSubtype();
