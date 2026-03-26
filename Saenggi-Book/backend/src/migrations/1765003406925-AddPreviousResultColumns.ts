// @ts-nocheck

export class AddPreviousResultColumns1765003406925 implements MigrationInterface {
  name = 'AddPreviousResultColumns1765003406925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_routine_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_management_planner_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_management_class_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_management_use_yn"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_item_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_item_start_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_item_primary_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_item_subject"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_plan_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_plan_subject"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_class_planner_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_class_class_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_planner_class_use_yn"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mentoring_temp_code_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mentoring_temp_code_expire_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mentoring_admin_class_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mentoring_admin_class_target_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mentoring_account_link_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mentoring_account_link_linked_member_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_member_calculated_scores_member_univ_calc"`);
    await queryRunner.query(
      `CREATE TABLE "planner_notice_tb" ("id" BIGSERIAL NOT NULL, "planner_id" bigint NOT NULL, "class_code" character varying(10), "title" character varying(200) NOT NULL, "content" text, "date" date NOT NULL, "is_important" boolean NOT NULL DEFAULT false, "use_yn" character varying(1) NOT NULL DEFAULT 'Y', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_72771ddf27bbb6060f292b11b15" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "myclass_test_tb" ("id" BIGSERIAL NOT NULL, "member_id" bigint NOT NULL, "title" character varying(200) NOT NULL, "subject" character varying(100), "date" date NOT NULL, "score" numeric(5,2), "total_score" numeric(5,2) NOT NULL DEFAULT '100', "rank" integer, "total_students" integer, "status" character varying(20) NOT NULL DEFAULT 'pending', "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_210873ebcdb1979dc4812fb837a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "myclass_health_record_tb" ("id" BIGSERIAL NOT NULL, "member_id" bigint NOT NULL, "date" date NOT NULL, "sleep_hours" numeric(3,1), "meal_count" integer, "exercise_minutes" integer, "mood" character varying(20), "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91c42d0f0a39cd2e8fe4e01db0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "myclass_consultation_tb" ("id" BIGSERIAL NOT NULL, "member_id" bigint NOT NULL, "date" date NOT NULL, "type" character varying(20) NOT NULL, "mentor" character varying(100), "mentor_id" bigint, "summary" text, "next_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cc5bd058c39744818222b3b1a1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "myclass_attendance_tb" ("id" BIGSERIAL NOT NULL, "member_id" bigint NOT NULL, "date" date NOT NULL, "check_in" TIME, "check_out" TIME, "status" character varying(20) NOT NULL DEFAULT 'present', "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab647cab6815585e4103bc1bd21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" ADD "additional_pass_rank" integer`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."additional_pass_rank" IS '충원합격순위'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" ADD "converted_score_total" numeric(10,5)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."converted_score_total" IS '환산점수총점'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" ADD "percentile_50" numeric(10,5)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."percentile_50" IS '백분위 50%컷'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" ADD "percentile_70" numeric(10,5)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."percentile_70" IS '백분위 70%컷'`,
    );
    await queryRunner.query(`ALTER TABLE "post_tb" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."min_cut" IS '환산점수 50%컷 (구: 최초컷)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."max_cut" IS '환산점수 70%컷 (구: 추합컷)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."recruitment_number" IS '모집인원(최종)'`,
    );
    await queryRunner.query(`ALTER TABLE "member_tb" ALTER COLUMN "ck_sms" SET DEFAULT b'0'`);
    await queryRunner.query(`ALTER TABLE "member_tb" ALTER COLUMN "ck_sms_agree" SET DEFAULT b'0'`);
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" DROP CONSTRAINT "FK_21a86f60a9a1f12d2e3e3aae75b"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."member_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."title" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."start_time" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."end_time" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."repeat" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."length" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."sun" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."mon" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."tues" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."wed" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."thurs" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."fri" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."sat" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."created_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."updated_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" DROP CONSTRAINT "FK_ba79d55f73b21f9d52df34cca8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" DROP CONSTRAINT "FK_eb3592df2d6a9db28e0c51e1bd4"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."member_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."planner_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."class_code" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."start_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."end_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."use_yn" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" DROP CONSTRAINT "FK_5bb76f190da4945bcec21670289"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."member_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."primary_type" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."subject" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."teacher" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."title" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."start_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."end_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."r_rule" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."ex_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."late" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."absent" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."description" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."progress" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."score" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."rank" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."mentor_rank" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."mentor_desc" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."mentor_test" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."study_type" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."study_content" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."plan_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."achievement" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."task_status" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."test" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."start_page" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."end_page" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."start_session" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."end_session" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."created_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."updated_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" DROP CONSTRAINT "FK_a614930dabfe6ed9b3c0761ebc9"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."member_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."title" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."subject" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."step" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."start_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."end_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."start_time" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."end_time" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."type" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."material" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."total" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."done" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."person" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."is_item" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."is_item_done" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."created_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."updated_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_class_tb" DROP CONSTRAINT "FK_2982a83834ec597bfaade6bf9c8"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."planner_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."class_code" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."class_name" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."start_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."end_date" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."use_yn" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "mentoring_temp_code_tb" DROP CONSTRAINT "FK_411fa24a35489953c7acc6e1509"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_temp_code_tb"."member_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_temp_code_tb"."code" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_temp_code_tb"."expire_at" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_temp_code_tb"."created_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "mentoring_temp_code_tb" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" DROP CONSTRAINT "FK_2259e1cf92677550bbfbf52970f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" DROP CONSTRAINT "FK_08099f9807ed5747074c570ebe3"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."member_id" IS NULL`);
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_admin_class_tb"."target_member_id" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."use_yn" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."first_reg_dt" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."last_mod_dt" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."group_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."group_name" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" DROP CONSTRAINT "FK_ccb23a36423ce085f87e8c0af80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" DROP CONSTRAINT "FK_5a91bf520e8c2b5ff83817fe824"`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_account_link_tb"."member_id" IS NULL`);
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_account_link_tb"."linked_member_id" IS NULL`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_account_link_tb"."created_at" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" ALTER COLUMN "created_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21a86f60a9a1f12d2e3e3aae75" ON "planner_routine_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c69d77eb51e3a5780821dafda" ON "planner_management_tb" ("use_yn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cc128a779225034eb8764ccb2a" ON "planner_management_tb" ("class_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb3592df2d6a9db28e0c51e1bd" ON "planner_management_tb" ("planner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9e932ca5c780bda9ce356833" ON "planner_item_tb" ("subject") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a04f9f366438973803bb6ebf9" ON "planner_item_tb" ("primary_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2ca4265449d78032df2a4e637" ON "planner_item_tb" ("start_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5bb76f190da4945bcec2167028" ON "planner_item_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3251b4761ceaea44130b801d53" ON "planner_plan_tb" ("subject") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a614930dabfe6ed9b3c0761ebc" ON "planner_plan_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39ea470e64a662ccb64c035ef1" ON "planner_class_tb" ("use_yn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a407518c2bb1a3d21bb8142144" ON "planner_class_tb" ("class_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2982a83834ec597bfaade6bf9c" ON "planner_class_tb" ("planner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3689ae4af63721534fbe4a7e08" ON "mentoring_temp_code_tb" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6b9e0fc4a30ae6d7cec0dea0d" ON "mentoring_temp_code_tb" ("expire_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08099f9807ed5747074c570ebe" ON "mentoring_admin_class_tb" ("target_member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2259e1cf92677550bbfbf52970" ON "mentoring_admin_class_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a91bf520e8c2b5ff83817fe82" ON "mentoring_account_link_tb" ("linked_member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccb23a36423ce085f87e8c0af8" ON "mentoring_account_link_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4beaa840b8efded4bb94bbfd54" ON "ts_member_calculated_scores" ("member_id", "university_id", "score_calculation") `,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" ADD CONSTRAINT "FK_21a86f60a9a1f12d2e3e3aae75b" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_notice_tb" ADD CONSTRAINT "FK_d68944e8e8602c0260aaf7da9dd" FOREIGN KEY ("planner_id") REFERENCES "member_tb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" ADD CONSTRAINT "FK_ba79d55f73b21f9d52df34cca8f" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" ADD CONSTRAINT "FK_eb3592df2d6a9db28e0c51e1bd4" FOREIGN KEY ("planner_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" ADD CONSTRAINT "FK_5bb76f190da4945bcec21670289" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" ADD CONSTRAINT "FK_a614930dabfe6ed9b3c0761ebc9" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_class_tb" ADD CONSTRAINT "FK_2982a83834ec597bfaade6bf9c8" FOREIGN KEY ("planner_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_test_tb" ADD CONSTRAINT "FK_a53786c6c72e6662f2aac293822" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_health_record_tb" ADD CONSTRAINT "FK_cd876689377ca4514a0ed0863f6" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_consultation_tb" ADD CONSTRAINT "FK_bc02c6a2ccb95ac82d27d9210f5" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_consultation_tb" ADD CONSTRAINT "FK_851df29b45c7b271d1b900e86e4" FOREIGN KEY ("mentor_id") REFERENCES "member_tb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_attendance_tb" ADD CONSTRAINT "FK_335151ad44a489317519569d21f" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_temp_code_tb" ADD CONSTRAINT "FK_411fa24a35489953c7acc6e1509" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" ADD CONSTRAINT "FK_2259e1cf92677550bbfbf52970f" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" ADD CONSTRAINT "FK_08099f9807ed5747074c570ebe3" FOREIGN KEY ("target_member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" ADD CONSTRAINT "FK_ccb23a36423ce085f87e8c0af80" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" ADD CONSTRAINT "FK_5a91bf520e8c2b5ff83817fe824" FOREIGN KEY ("linked_member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" DROP CONSTRAINT "FK_5a91bf520e8c2b5ff83817fe824"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" DROP CONSTRAINT "FK_ccb23a36423ce085f87e8c0af80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" DROP CONSTRAINT "FK_08099f9807ed5747074c570ebe3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" DROP CONSTRAINT "FK_2259e1cf92677550bbfbf52970f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_temp_code_tb" DROP CONSTRAINT "FK_411fa24a35489953c7acc6e1509"`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_attendance_tb" DROP CONSTRAINT "FK_335151ad44a489317519569d21f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_consultation_tb" DROP CONSTRAINT "FK_851df29b45c7b271d1b900e86e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_consultation_tb" DROP CONSTRAINT "FK_bc02c6a2ccb95ac82d27d9210f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_health_record_tb" DROP CONSTRAINT "FK_cd876689377ca4514a0ed0863f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "myclass_test_tb" DROP CONSTRAINT "FK_a53786c6c72e6662f2aac293822"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_class_tb" DROP CONSTRAINT "FK_2982a83834ec597bfaade6bf9c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" DROP CONSTRAINT "FK_a614930dabfe6ed9b3c0761ebc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" DROP CONSTRAINT "FK_5bb76f190da4945bcec21670289"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" DROP CONSTRAINT "FK_eb3592df2d6a9db28e0c51e1bd4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" DROP CONSTRAINT "FK_ba79d55f73b21f9d52df34cca8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_notice_tb" DROP CONSTRAINT "FK_d68944e8e8602c0260aaf7da9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" DROP CONSTRAINT "FK_21a86f60a9a1f12d2e3e3aae75b"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_4beaa840b8efded4bb94bbfd54"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ccb23a36423ce085f87e8c0af8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a91bf520e8c2b5ff83817fe82"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2259e1cf92677550bbfbf52970"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_08099f9807ed5747074c570ebe"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e6b9e0fc4a30ae6d7cec0dea0d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3689ae4af63721534fbe4a7e08"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2982a83834ec597bfaade6bf9c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a407518c2bb1a3d21bb8142144"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_39ea470e64a662ccb64c035ef1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a614930dabfe6ed9b3c0761ebc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3251b4761ceaea44130b801d53"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5bb76f190da4945bcec2167028"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d2ca4265449d78032df2a4e637"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6a04f9f366438973803bb6ebf9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_af9e932ca5c780bda9ce356833"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eb3592df2d6a9db28e0c51e1bd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cc128a779225034eb8764ccb2a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0c69d77eb51e3a5780821dafda"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_21a86f60a9a1f12d2e3e3aae75"`);
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_account_link_tb"."created_at" IS '생성일시'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_account_link_tb"."linked_member_id" IS '연동된 회원 ID'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_account_link_tb"."member_id" IS '회원 ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" ADD CONSTRAINT "FK_5a91bf520e8c2b5ff83817fe824" FOREIGN KEY ("linked_member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_account_link_tb" ADD CONSTRAINT "FK_ccb23a36423ce085f87e8c0af80" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_admin_class_tb"."group_name" IS '그룹명'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."group_id" IS '그룹 ID'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_admin_class_tb"."last_mod_dt" IS '최종 수정일'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_admin_class_tb"."first_reg_dt" IS '최초 등록일'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "mentoring_admin_class_tb"."use_yn" IS '사용 여부'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_admin_class_tb"."target_member_id" IS '대상 회원 ID'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_admin_class_tb"."member_id" IS '회원 ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" ADD CONSTRAINT "FK_08099f9807ed5747074c570ebe3" FOREIGN KEY ("target_member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_admin_class_tb" ADD CONSTRAINT "FK_2259e1cf92677550bbfbf52970f" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_temp_code_tb" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_temp_code_tb"."created_at" IS '생성일시'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_temp_code_tb"."expire_at" IS '만료 시간'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_temp_code_tb"."code" IS '6자리 연결 코드'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "mentoring_temp_code_tb"."member_id" IS '회원 ID (PK)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mentoring_temp_code_tb" ADD CONSTRAINT "FK_411fa24a35489953c7acc6e1509" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."use_yn" IS '사용 여부'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_class_tb"."end_date" IS '종료일 (YYYYMMDD)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_class_tb"."start_date" IS '시작일 (YYYYMMDD)'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."class_name" IS '클래스 이름'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."class_code" IS '클래스 코드'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_class_tb"."planner_id" IS '플래너(멘토) ID'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_class_tb"."id" IS '클래스 ID'`);
    await queryRunner.query(
      `ALTER TABLE "planner_class_tb" ADD CONSTRAINT "FK_2982a83834ec597bfaade6bf9c8" FOREIGN KEY ("planner_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."updated_at" IS '수정일시'`);
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."created_at" IS '생성일시'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_plan_tb"."is_item_done" IS '일정 완료 여부'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."is_item" IS '일정 생성 여부'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."person" IS '담당자'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."done" IS '완료 수량'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."total" IS '총 수량'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."material" IS '교재/강의명'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_plan_tb"."type" IS '타입 (0: 강의, 1: 교재)'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."end_time" IS '종료 시간'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."start_time" IS '시작 시간'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."end_date" IS '종료일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."start_date" IS '시작일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."step" IS '단계'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."subject" IS '과목'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."title" IS '제목'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."member_id" IS '회원 ID'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_plan_tb"."id" IS '계획 ID'`);
    await queryRunner.query(
      `ALTER TABLE "planner_plan_tb" ADD CONSTRAINT "FK_a614930dabfe6ed9b3c0761ebc9" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."updated_at" IS '수정일시'`);
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."created_at" IS '생성일시'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_item_tb"."end_session" IS '종료 강의 번호'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_item_tb"."start_session" IS '시작 강의 번호'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."end_page" IS '종료 페이지'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."start_page" IS '시작 페이지'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."test" IS '테스트'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."task_status" IS '과제 상태'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."achievement" IS '달성도'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."plan_date" IS '계획 날짜'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."study_content" IS '학습 내용'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."study_type" IS '학습 유형'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."mentor_test" IS '멘토 테스트'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."mentor_desc" IS '멘토 코멘트'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_item_tb"."mentor_rank" IS '멘토 평가 순위'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."rank" IS '순위'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."score" IS '점수'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."progress" IS '성취도 (0-100)'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."description" IS '설명'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."absent" IS '결석 여부'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."late" IS '지각 여부'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."ex_date" IS '반복 예외 날짜'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_item_tb"."r_rule" IS 'iCalendar 반복 규칙'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."end_date" IS '종료 일시'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."start_date" IS '시작 일시'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."title" IS '제목'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."teacher" IS '선생님'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."subject" IS '과목'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_item_tb"."primary_type" IS '유형 (학습/수업)'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."member_id" IS '회원 ID'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_item_tb"."id" IS '일정 ID'`);
    await queryRunner.query(
      `ALTER TABLE "planner_item_tb" ADD CONSTRAINT "FK_5bb76f190da4945bcec21670289" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."use_yn" IS '사용 여부'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_management_tb"."end_date" IS '종료일 (YYYYMMDD)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_management_tb"."start_date" IS '시작일 (YYYYMMDD)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_management_tb"."class_code" IS '클래스 코드'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_management_tb"."planner_id" IS '플래너 ID'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_management_tb"."member_id" IS '학생 ID'`);
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" ADD CONSTRAINT "FK_eb3592df2d6a9db28e0c51e1bd4" FOREIGN KEY ("planner_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_management_tb" ADD CONSTRAINT "FK_ba79d55f73b21f9d52df34cca8f" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."updated_at" IS '수정일시'`);
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."created_at" IS '생성일시'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."sat" IS '토요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."fri" IS '금요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."thurs" IS '목요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."wed" IS '수요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."tues" IS '화요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."mon" IS '월요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."sun" IS '일요일'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."length" IS '소요 시간 (분)'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "planner_routine_tb"."date" IS '특정 날짜 (반복 아닌 경우)'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."repeat" IS '반복 여부'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."end_time" IS '종료 시간'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."start_time" IS '시작 시간'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."title" IS '제목'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."member_id" IS '회원 ID'`);
    await queryRunner.query(`COMMENT ON COLUMN "planner_routine_tb"."id" IS '루틴 ID'`);
    await queryRunner.query(
      `ALTER TABLE "planner_routine_tb" ADD CONSTRAINT "FK_21a86f60a9a1f12d2e3e3aae75b" FOREIGN KEY ("member_id") REFERENCES "member_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "member_tb" ALTER COLUMN "ck_sms_agree" SET DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "member_tb" ALTER COLUMN "ck_sms" SET DEFAULT '0'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."recruitment_number" IS '모집인원'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."max_cut" IS '추합컷'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."min_cut" IS '최초컷'`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_tb" ALTER COLUMN "updated_at" SET DEFAULT '2025-12-01 11:16:18.987647'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."percentile_70" IS '백분위 70%컷'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" DROP COLUMN "percentile_70"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."percentile_50" IS '백분위 50%컷'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" DROP COLUMN "percentile_50"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."converted_score_total" IS '환산점수총점'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" DROP COLUMN "converted_score_total"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "ts_regular_admission_previous_results"."additional_pass_rank" IS '충원합격순위'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ts_regular_admission_previous_results" DROP COLUMN "additional_pass_rank"`,
    );
    await queryRunner.query(`DROP TABLE "myclass_attendance_tb"`);
    await queryRunner.query(`DROP TABLE "myclass_consultation_tb"`);
    await queryRunner.query(`DROP TABLE "myclass_health_record_tb"`);
    await queryRunner.query(`DROP TABLE "myclass_test_tb"`);
    await queryRunner.query(`DROP TABLE "planner_notice_tb"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_member_calculated_scores_member_univ_calc" ON "ts_member_calculated_scores" ("member_id", "university_id", "score_calculation") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mentoring_account_link_linked_member_id" ON "mentoring_account_link_tb" ("linked_member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mentoring_account_link_member_id" ON "mentoring_account_link_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mentoring_admin_class_target_member_id" ON "mentoring_admin_class_tb" ("target_member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mentoring_admin_class_member_id" ON "mentoring_admin_class_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mentoring_temp_code_expire_at" ON "mentoring_temp_code_tb" ("expire_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mentoring_temp_code_code" ON "mentoring_temp_code_tb" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_class_use_yn" ON "planner_class_tb" ("use_yn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_class_class_code" ON "planner_class_tb" ("class_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_class_planner_id" ON "planner_class_tb" ("planner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_plan_subject" ON "planner_plan_tb" ("subject") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_plan_member_id" ON "planner_plan_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_item_subject" ON "planner_item_tb" ("subject") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_item_primary_type" ON "planner_item_tb" ("primary_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_item_start_date" ON "planner_item_tb" ("start_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_item_member_id" ON "planner_item_tb" ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_management_use_yn" ON "planner_management_tb" ("use_yn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_management_class_code" ON "planner_management_tb" ("class_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_management_planner_id" ON "planner_management_tb" ("planner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_planner_routine_member_id" ON "planner_routine_tb" ("member_id") `,
    );
  }
}
