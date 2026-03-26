// @ts-nocheck
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCodeToAdmissionSubtype1769973481547 implements MigrationInterface {
    name = 'AddCodeToAdmissionSubtype1769973481547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_member_firebase_uid"`);
        await queryRunner.query(`ALTER TABLE "middle_series_subject_requirements" DROP CONSTRAINT "middle_series_subject_requirement_middle_series_series_type_key"`);
        await queryRunner.query(`ALTER TABLE "auth_member" DROP COLUMN "firebase_uid"`);
        await queryRunner.query(`ALTER TABLE "ss_admission_subtype" ADD "code" character varying(10)`);
        await queryRunner.query(`COMMENT ON COLUMN "ss_admission_subtype"."code" IS '전형 코드 (Excel 파일의 특별전형 코드)'`);
        await queryRunner.query(`ALTER TABLE "ss_admission_subtype" ADD "category_id" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "ss_admission_subtype"."category_id" IS '카테고리 ID'`);
        await queryRunner.query(`ALTER TABLE "js_admission_previous_result" ADD "competition_ratio" numeric(10,5)`);
        await queryRunner.query(`COMMENT ON COLUMN "js_admission_previous_result"."competition_ratio" IS '경쟁률'`);
        await queryRunner.query(`ALTER TABLE "ss_recruitment_unit_previous_result" ADD "competition_ratio" numeric(10,5)`);
        await queryRunner.query(`COMMENT ON COLUMN "ss_recruitment_unit_previous_result"."competition_ratio" IS '경쟁률'`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms" SET DEFAULT b'0'`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms_agree" SET DEFAULT b'0'`);
        await queryRunner.query(`ALTER TABLE "ss_admission_subtype" ADD CONSTRAINT "FK_94271c6e2345168c81eb0acfa43" FOREIGN KEY ("category_id") REFERENCES "ss_admission_subtype_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ss_admission_subtype" DROP CONSTRAINT "FK_94271c6e2345168c81eb0acfa43"`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms_agree" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms" SET DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "ss_recruitment_unit_previous_result"."competition_ratio" IS '경쟁률'`);
        await queryRunner.query(`ALTER TABLE "ss_recruitment_unit_previous_result" DROP COLUMN "competition_ratio"`);
        await queryRunner.query(`COMMENT ON COLUMN "js_admission_previous_result"."competition_ratio" IS '경쟁률'`);
        await queryRunner.query(`ALTER TABLE "js_admission_previous_result" DROP COLUMN "competition_ratio"`);
        await queryRunner.query(`COMMENT ON COLUMN "ss_admission_subtype"."category_id" IS '카테고리 ID'`);
        await queryRunner.query(`ALTER TABLE "ss_admission_subtype" DROP COLUMN "category_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "ss_admission_subtype"."code" IS '전형 코드 (Excel 파일의 특별전형 코드)'`);
        await queryRunner.query(`ALTER TABLE "ss_admission_subtype" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "auth_member" ADD "firebase_uid" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "middle_series_subject_requirements" ADD CONSTRAINT "middle_series_subject_requirement_middle_series_series_type_key" UNIQUE ("middle_series", "series_type")`);
        await queryRunner.query(`CREATE INDEX "idx_member_firebase_uid" ON "auth_member" ("firebase_uid") `);
    }

}
