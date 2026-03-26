const fs = require('fs');
const path = require('path');

// Comprehensive table name mapping (Old -> Final after Phase 1 & 2)
const TABLE_MAPPINGS = {
  // Auth/Member tables
  'member_interests': 'ss_user_university_interest',
  'member_upload_file_list_tb': 'auth_member_file',
  'ts_member_recruitment_unit_combinations': 'ss_user_application_combination',
  'ts_member_regular_combinations': 'js_user_application_combination',
  'ts_member_regular_interests': 'js_user_university_interest',

  // Schoolrecord tables
  'schoolrecord_attendance_detail_tb': 'sgb_attendance',
  'schoolrecord_select_subject_tb': 'sgb_select_subject',
  'schoolrecord_subject_sports_art_tb': 'sgb_sport_art',
  'schoolrecord_subject_learning_tb': 'sgb_subject_learning',
  'schoolrecord_volunteer_tb': 'sgb_volunteer',

  // Jungsi/Mock exam tables
  'mockexam_raw_score_tb': 'js_sunung_raw_score',
  'mockexam_raw_to_standard_tb': 'js_raw_to_standard',
  'mockexam_schedule_tb': 'js_pyunggawon_month',
  'mockexam_marks_tb': 'js_pyunggawon_raw_score',
  'mockexam_standard_score_tb': 'js_sunung_standard_score',
  'ts_regular_admissions': 'js_admission',
  'ts_regular_admission_previous_results': 'js_admission_previous_result',
  'ts_member_jungsi_calculated_scores': 'js_user_calculated_scores',
  'ts_member_jungsi_input_scores': 'js_user_input_scores',
  'ts_member_jungsi_recruitment_scores': 'js_user_recruitment_scores',
  'ts_member_regular_combination_items': 'js_user_application_combination_items',

  // Susi tables
  'ts_admissions': 'ss_admission',
  'ts_admission_categories': 'ss_admission_category',
  'ts_admission_methods': 'ss_admission_method',
  'ts_admission_subtypes': 'ss_admission_subtype',
  'ts_admission_subtype_relations': 'ss_admission_subtype_relations',
  'ts_recruitment_units': 'ss_recruitment_unit',
  'ts_recruitment_unit_scores': 'ss_recruitment_unit_score',
  'ts_recruitment_unit_interviews': 'ss_recruitment_unit_interview',
  'ts_recruitment_unit_minimum_grades': 'ss_recruitment_unit_minimum_grade',
  'ts_recruitment_unit_previous_results': 'ss_recruitment_unit_previous_result',
  'ts_recruitment_unit_pass_fail_records': 'ss_recruitment_unit_pass_fail_record',
  'ts_universities': 'ss_university',
  'ts_general_fields': 'ss_general_field',
  'ts_major_fields': 'ss_major_field',
  'ts_mid_fields': 'ss_mid_field',
  'ts_minor_fields': 'ss_minor_field',
  'ts_member_recruitment_unit_combination_items': 'ss_user_recruitment_unit_combination_items',

  // Payment tables
  'pay_service_tb': 'payment_service',
  'pay_coupon_tb': 'payment_coupon',
  'pay_contract_tb': 'payment_contract',
  'pay_order_tb': 'payment_order',
  'pay_cancel_log_tb': 'payment_cancel_log',
  'pay_product_tb': 'payment_product',
  'pay_service_product_tb': 'payment_service_product',

  // Board tables
  'board_tb': 'board_board',
  'post_tb': 'board_post',
  'comment_tb': 'board_comment',

  // Mentoring tables
  'mentoring_temp_code_tb': 'tr_temp_code',
  'mentoring_account_link_tb': 'tr_account_link',
  'mentoring_admin_class_tb': 'tr_admin_class',

  // Planner tables
  'planner_plan_tb': 'pl_plan',
  'planner_item_tb': 'pl_item',
  'planner_routine_tb': 'pl_routine',
  'planner_class_tb': 'pl_class',
  'planner_management_tb': 'pl_management',
  'planner_notice_tb': 'pl_notice',

  // MyClass tables
  'myclass_health_record_tb': 'mc_health_record',
  'myclass_consultation_tb': 'mc_consultation',
  'myclass_attendance_tb': 'mc_attendance',
  'myclass_test_tb': 'mc_test',
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update @Entity decorators
  for (const [oldName, newName] of Object.entries(TABLE_MAPPINGS)) {
    const patterns = [
      new RegExp(`@Entity\\('${oldName}'\\)`, 'g'),
      new RegExp(`@Entity\\('${oldName}',`, 'g'),
    ];

    patterns.forEach(pattern => {
      if (content.match(pattern)) {
        content = content.replace(
          new RegExp(`@Entity\\('${oldName}'`, 'g'),
          `@Entity('${newName}'`
        );
        console.log(`  ✓ Updated: ${oldName} -> ${newName}`);
        updated = true;
      }
    });
  }

  // Update join table names in @JoinTable
  for (const [oldName, newName] of Object.entries(TABLE_MAPPINGS)) {
    const joinTablePattern = new RegExp(`name: '${oldName}'`, 'g');
    if (content.match(joinTablePattern)) {
      content = content.replace(joinTablePattern, `name: '${newName}'`);
      console.log(`  ✓ Updated join table: ${oldName} -> ${newName}`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return updated;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updatedCount += walkDir(filePath);
    } else if (file.endsWith('.entity.ts') || file.endsWith('-interests.ts')) {
      console.log(`\nProcessing: ${filePath}`);
      if (updateFile(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

const entitiesDir = path.join(__dirname, 'src', 'database', 'entities');
console.log('Starting table name update...\n');
console.log('Entities directory:', entitiesDir);
console.log('=====================================\n');

const updatedCount = walkDir(entitiesDir);

console.log('\n=====================================');
console.log(`\nUpdate complete! ${updatedCount} files updated.`);
