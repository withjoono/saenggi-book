// @ts-nocheck
import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTablePrefixToSv1774054800000 implements MigrationInterface {
    name = 'RenameTablePrefixToSv1774054800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename ms_auth_member → sv_auth_member
        await queryRunner.query(`ALTER TABLE "ms_auth_member" RENAME TO "sv_auth_member"`);

        // Rename sgb_* tables → sv_*
        // Drop FK constraints first, rename tables, then re-add FK constraints with new names
        await queryRunner.query(`ALTER TABLE "sgb_select_subject" DROP CONSTRAINT IF EXISTS "FK_sgb_select_subject_member_id"`);
        await queryRunner.query(`ALTER TABLE "sgb_sport_art" DROP CONSTRAINT IF EXISTS "FK_sgb_sport_art_member_id"`);
        await queryRunner.query(`ALTER TABLE "sgb_subject_learning" DROP CONSTRAINT IF EXISTS "FK_sgb_subject_learning_member_id"`);
        await queryRunner.query(`ALTER TABLE "sgb_volunteer" DROP CONSTRAINT IF EXISTS "FK_sgb_volunteer_member_id"`);

        await queryRunner.query(`ALTER TABLE "sgb_attendance" RENAME TO "sv_attendance"`);
        await queryRunner.query(`ALTER TABLE "sgb_select_subject" RENAME TO "sv_select_subject"`);
        await queryRunner.query(`ALTER TABLE "sgb_sport_art" RENAME TO "sv_sport_art"`);
        await queryRunner.query(`ALTER TABLE "sgb_subject_learning" RENAME TO "sv_subject_learning"`);
        await queryRunner.query(`ALTER TABLE "sgb_volunteer" RENAME TO "sv_volunteer"`);

        // Re-add FK constraints with sv_ names
        await queryRunner.query(`ALTER TABLE "sv_select_subject" ADD CONSTRAINT "FK_sv_select_subject_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sv_sport_art" ADD CONSTRAINT "FK_sv_sport_art_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sv_subject_learning" ADD CONSTRAINT "FK_sv_subject_learning_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sv_volunteer" ADD CONSTRAINT "FK_sv_volunteer_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert FK constraints
        await queryRunner.query(`ALTER TABLE "sv_select_subject" DROP CONSTRAINT IF EXISTS "FK_sv_select_subject_member_id"`);
        await queryRunner.query(`ALTER TABLE "sv_sport_art" DROP CONSTRAINT IF EXISTS "FK_sv_sport_art_member_id"`);
        await queryRunner.query(`ALTER TABLE "sv_subject_learning" DROP CONSTRAINT IF EXISTS "FK_sv_subject_learning_member_id"`);
        await queryRunner.query(`ALTER TABLE "sv_volunteer" DROP CONSTRAINT IF EXISTS "FK_sv_volunteer_member_id"`);

        // Rename sv_* tables back to sgb_*
        await queryRunner.query(`ALTER TABLE "sv_attendance" RENAME TO "sgb_attendance"`);
        await queryRunner.query(`ALTER TABLE "sv_select_subject" RENAME TO "sgb_select_subject"`);
        await queryRunner.query(`ALTER TABLE "sv_sport_art" RENAME TO "sgb_sport_art"`);
        await queryRunner.query(`ALTER TABLE "sv_subject_learning" RENAME TO "sgb_subject_learning"`);
        await queryRunner.query(`ALTER TABLE "sv_volunteer" RENAME TO "sgb_volunteer"`);

        // Re-add FK constraints with sgb_ names
        await queryRunner.query(`ALTER TABLE "sgb_select_subject" ADD CONSTRAINT "FK_sgb_select_subject_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sgb_sport_art" ADD CONSTRAINT "FK_sgb_sport_art_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sgb_subject_learning" ADD CONSTRAINT "FK_sgb_subject_learning_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sgb_volunteer" ADD CONSTRAINT "FK_sgb_volunteer_member_id" FOREIGN KEY ("member_id") REFERENCES "auth_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Rename sv_auth_member back to ms_auth_member
        await queryRunner.query(`ALTER TABLE "sv_auth_member" RENAME TO "ms_auth_member"`);
    }

}
