// @ts-nocheck

// 수시 교과 상세보기 페이지
export class SusiSubjectDetailResponseDto {
  id: SuSiSubjectEntity['id'];

  // 대학 전형 모집단위
  university_name: SuSiSubjectEntity['university_name']; // 대학명
  region: SuSiSubjectEntity['region']; // 지역
  national_or_private: SuSiSubjectEntity['national_or_private']; // '국립/사립'
  detailed_type: SuSiSubjectEntity['detailed_type']; // 전형세부유형
  type_name: SuSiSubjectEntity['type_name']; // 전형명
  central_classification: SuSiSubjectEntity['central_classification']; // 중심전형분류
  department: SuSiSubjectEntity['department']; // 계열
  recruitment_unit_name: SuSiSubjectEntity['recruitment_unit_name']; // 모집단위명

  // 지원자격
  basic_type: SuSiSubjectEntity['basic_type']; // 기본유형
  application_eligibility_text: SuSiSubjectEntity['application_eligibility_text']; // 지원자격TEXT

  // 선발방식
  recruitment_number: SuSiSubjectEntity['recruitment_number']; // 모집인원
  selection_model: SuSiSubjectEntity['selection_model']; // 선발모형
  selection_ratio: SuSiSubjectEntity['selection_ratio']; // 선발비율
  selection_method: SuSiSubjectEntity['selection_method']; // 전형방법

  // 학생부 비율
  curriculum: SuSiSubjectEntity['curriculum']; // 교과
  interview: SuSiSubjectEntity['interview']; // 면접
  attendance: SuSiSubjectEntity['attendance']; // 출결
  volunteer: SuSiSubjectEntity['volunteer']; // 봉사
  document_non_academic: SuSiSubjectEntity['document_non_academic']; // '서류(비교과)'
  step1_score: SuSiSubjectEntity['step1_score']; // '(2단계)1단계성적'
  step2_others: SuSiSubjectEntity['step2_others']; // '(2단계)그외'
  step2_other_details: SuSiSubjectEntity['step2_other_details']; // '(2단계)그외내역'

  // 위험도
  risk_level_minus1: SuSiSubjectEntity['risk_level_minus1'];
  risk_level_minus2: SuSiSubjectEntity['risk_level_minus2'];
  risk_level_minus3: SuSiSubjectEntity['risk_level_minus3'];
  risk_level_minus4: SuSiSubjectEntity['risk_level_minus4'];
  risk_level_minus5: SuSiSubjectEntity['risk_level_minus5'];
  risk_level_plus1: SuSiSubjectEntity['risk_level_plus1'];
  risk_level_plus2: SuSiSubjectEntity['risk_level_plus2'];
  risk_level_plus3: SuSiSubjectEntity['risk_level_plus3'];
  risk_level_plus4: SuSiSubjectEntity['risk_level_plus4'];
  risk_level_plus5: SuSiSubjectEntity['risk_level_plus5'];

  // 교과 반영 방식
  curriculum_reflection_semester: SuSiSubjectEntity['curriculum_reflection_semester']; // 교과_반영학기
  student_record_utilization_index: SuSiSubjectEntity['student_record_utilization_index']; // 학생부활용지표
  career_subject_reflection_method: SuSiSubjectEntity['career_subject_reflection_method']; // 진로과목반영방식
  common_general_reflection_method: SuSiSubjectEntity['common_general_reflection_method']; // 공통일반반영방식
  first_year_ratio: SuSiSubjectEntity['first_year_ratio']; // '1학년비율'
  second_year_ratio: SuSiSubjectEntity['second_year_ratio']; // '2학년비율'
  third_year_ratio: SuSiSubjectEntity['third_year_ratio']; // '3학년비율'
  second_third_year_ratio: SuSiSubjectEntity['second_third_year_ratio']; // '2-3학년비율'
  first_second_third_year_ratio: SuSiSubjectEntity['first_second_third_year_ratio']; // '1-2-3학년비율'
  curriculum_grade_1: SuSiSubjectEntity['curriculum_grade_1']; // 교과_등급점수_1등급
  curriculum_grade_2: SuSiSubjectEntity['curriculum_grade_2']; // 교과_등급점수_2등급
  curriculum_grade_3: SuSiSubjectEntity['curriculum_grade_3']; // 교과_등급점수_3등급
  curriculum_grade_4: SuSiSubjectEntity['curriculum_grade_4']; // 교과_등급점수_4등급
  curriculum_grade_5: SuSiSubjectEntity['curriculum_grade_5']; // 교과_등급점수_5등급
  curriculum_grade_6: SuSiSubjectEntity['curriculum_grade_6']; // 교과_등급점수_6등급
  curriculum_grade_7: SuSiSubjectEntity['curriculum_grade_7']; // 교과_등급점수_7등급
  curriculum_grade_8: SuSiSubjectEntity['curriculum_grade_8']; // 교과_등급점수_8등급
  curriculum_grade_9: SuSiSubjectEntity['curriculum_grade_9']; // 교과_등급점수_9등급

  // 수능 최저
  minimum_academic_standards_applied: SuSiSubjectEntity['minimum_academic_standards_applied']; // 최저학력기준_반영여부
  minimum_academic_standards_text: SuSiSubjectEntity['minimum_academic_standards_text']; // 수능최저학력기준TEXT

  // 면접
  interview_score_applied: SuSiSubjectEntity['interview_score_applied']; // 면접점수반영여부
  interview_type: SuSiSubjectEntity['interview_type']; // 면접유형
  interview_resources: SuSiSubjectEntity['interview_resources']; // 면접시활용자료
  interview_method: SuSiSubjectEntity['interview_method']; // 면접진행방식
  interview_evaluation_content: SuSiSubjectEntity['interview_evaluation_content']; // 면접평가내용
  interview_date_text: SuSiSubjectEntity['interview_date_text']; // 면접날짜TEXT
  interview_time: SuSiSubjectEntity['interview_time']; // 면접시간

  // 지난년도 경쟁률
  admission_2024_grade: SuSiSubjectEntity['admission_2024_grade']; // '2024학년도입결(등급)'
  admission_2024_converted_score: SuSiSubjectEntity['admission_2024_converted_score']; // '2024학년도입결(환산점수)'
  competition_rate_2024: SuSiSubjectEntity['competition_rate_2024']; // '2024학년도경쟁률'
  replenishment_2024: SuSiSubjectEntity['replenishment_2024']; // '2024충원'

  admission_2023_grade: SuSiSubjectEntity['admission_2023_grade']; // '2023학년도입결(등급)'
  admission_2023_converted_score: SuSiSubjectEntity['admission_2023_converted_score']; // '2023학년도입결(환산점수)'
  competition_rate_2023: SuSiSubjectEntity['competition_rate_2023']; // '2023학년도경쟁률'
  replenishment_2023: SuSiSubjectEntity['replenishment_2023']; // '2023충원'

  admission_2022_grade: SuSiSubjectEntity['admission_2022_grade']; // '2022학년도입결'
  competition_rate_2022: SuSiSubjectEntity['competition_rate_2022']; // '2022학년도경쟁률'
  replenishment_2022: SuSiSubjectEntity['replenishment_2022']; // '2022충원'

  admission_2021_grade: SuSiSubjectEntity['admission_2021_grade']; // '2021학년도입결'
  competition_rate_2021: SuSiSubjectEntity['competition_rate_2021']; // '2021학년도경쟁률'
  replenishment_2021: SuSiSubjectEntity['replenishment_2021']; // '2021충원'

  admission_2020_grade: SuSiSubjectEntity['admission_2020_grade']; // '2020학년도입결'
  competition_rate_2020: SuSiSubjectEntity['competition_rate_2020']; // '2020학년도경쟁률'
  replenishment_2020: SuSiSubjectEntity['replenishment_2020']; // '2020충원'
}
