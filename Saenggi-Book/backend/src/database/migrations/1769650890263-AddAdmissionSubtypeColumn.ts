// @ts-nocheck
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdmissionSubtypeColumn1769650890263 implements MigrationInterface {
    name = 'AddAdmissionSubtypeColumn1769650890263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "middle_series_subject_requirements" DROP CONSTRAINT "middle_series_subject_requirement_middle_series_series_type_key"`);
        await queryRunner.query(`CREATE TABLE "mentoring_invite_tb" ("id" SERIAL NOT NULL, "teacher_id" bigint NOT NULL, "invite_code" character varying(32) NOT NULL, "class_id" character varying(100), "class_name" character varying(100), "invite_type" character varying(20) NOT NULL DEFAULT 'student', "use_count" integer NOT NULL DEFAULT '0', "max_use_count" integer NOT NULL DEFAULT '100', "is_active" boolean NOT NULL DEFAULT true, "expire_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_22772dcddd707b19c7de994652c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_80cb5f7e2ae06aada8c52f06e4" ON "mentoring_invite_tb" ("teacher_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bd98d837af95941091b26a262b" ON "mentoring_invite_tb" ("invite_code") `);
        await queryRunner.query(`CREATE INDEX "IDX_53633640066bfdd28a3c8d6171" ON "mentoring_invite_tb" ("expire_at") `);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms" SET DEFAULT b'0'`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms_agree" SET DEFAULT b'0'`);
        await queryRunner.query(`ALTER TABLE "mentoring_invite_tb" ADD CONSTRAINT "FK_80cb5f7e2ae06aada8c52f06e41" FOREIGN KEY ("teacher_id") REFERENCES "auth_member"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentoring_invite_tb" DROP CONSTRAINT "FK_80cb5f7e2ae06aada8c52f06e41"`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms_agree" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "auth_member" ALTER COLUMN "ck_sms" SET DEFAULT '0'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53633640066bfdd28a3c8d6171"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd98d837af95941091b26a262b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_80cb5f7e2ae06aada8c52f06e4"`);
        await queryRunner.query(`DROP TABLE "mentoring_invite_tb"`);
        await queryRunner.query(`ALTER TABLE "middle_series_subject_requirements" ADD CONSTRAINT "middle_series_subject_requirement_middle_series_series_type_key" UNIQUE ("middle_series", "series_type")`);
    }

}
