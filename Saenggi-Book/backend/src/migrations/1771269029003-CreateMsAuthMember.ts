// @ts-nocheck
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMsAuthMember1771269029003 implements MigrationInterface {
    name = 'CreateMsAuthMember1771269029003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ms_auth_member" ("id" BIGSERIAL NOT NULL, "hub_member_id" bigint NOT NULL, "nickname" character varying(255), "email" character varying(500), "member_type" character varying(20) NOT NULL DEFAULT 'student', "graduate_year" character varying(10), "major" character varying(10), "hst_type_id" character varying(20), "account_stop_yn" character varying(1) NOT NULL DEFAULT 'N', "create_dt" TIMESTAMP, "update_dt" TIMESTAMP, CONSTRAINT "UQ_c1308731e66268fa4e2bd3b260d" UNIQUE ("hub_member_id"), CONSTRAINT "PK_7a579f0f64ef1d3d020d6251af7" PRIMARY KEY ("id")); COMMENT ON COLUMN "ms_auth_member"."hub_member_id" IS 'Hub auth_member.id 참조'; COMMENT ON COLUMN "ms_auth_member"."nickname" IS '닉네임'; COMMENT ON COLUMN "ms_auth_member"."email" IS '이메일'; COMMENT ON COLUMN "ms_auth_member"."member_type" IS '회원 유형 (student, teacher, parent)'; COMMENT ON COLUMN "ms_auth_member"."graduate_year" IS '졸업년도'; COMMENT ON COLUMN "ms_auth_member"."major" IS '전공 (0: 문과, 1: 이과)'; COMMENT ON COLUMN "ms_auth_member"."hst_type_id" IS '고교유형 ID'; COMMENT ON COLUMN "ms_auth_member"."account_stop_yn" IS '계정 정지 여부'; COMMENT ON COLUMN "ms_auth_member"."create_dt" IS '생성일시'; COMMENT ON COLUMN "ms_auth_member"."update_dt" IS '수정일시'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c1308731e66268fa4e2bd3b260" ON "ms_auth_member" ("hub_member_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_c1308731e66268fa4e2bd3b260"`);
        await queryRunner.query(`DROP TABLE "ms_auth_member"`);
    }

}
