export interface ISusiSubject {
  id: number; // id
  unified_id: string; // 통합 아이디 (ex. U0094121)
  year: number | null; // 년도
  region: string | null; // 지역구분
  university_name: string | null; // 대학명
  university_code: string | null; // 대학코드
  national_or_private: string | null; // '국립/사립'
  basic_type: string | null; // 기본유형
  detailed_type: string | null; // 전형세부유형
  type_name: string | null; // 전형명
  central_classification: string | null; // 중심전형분류
  department: string | null; // 계열
  college: string | null; // 단과대학
  recruitment_unit_name: string | null; // 모집단위명
  large_department: string | null; // 대계열
  medium_department: string | null; // 중계열
  small_department: string | null; // 소계열
  recruitment_number: string | null; // 모집인원
  selection_model: string | null; // 선발모형
  selection_ratio: string | null; // 선발비율
  selection_method: string | null; // 전형방법
  curriculum: number | null; // 교과
  interview: number | null; // 면접
  attendance: number | null; // 출결
  volunteer: number | null; // 봉사
  document_non_academic: number | null; // '서류(비교과)'
  step1_score: number | null; // '(2단계)1단계성적'
  step2_others: number | null; // '(2단계)그외'
  practical_skills: number | null; // 실무
  step2_other_details: string | null; // '(2단계)그외내역'
  step2_interview: string | null; // (2단계) 면접
  application_eligibility_text: string | null; // 지원자격TEXT
  student_record_utilization_index: string | null; // 학생부활용지표
  curriculum_reflection_semester: number | null; // 교과_반영학기
  first_year_ratio: number | null; // '1학년비율'
  second_year_ratio: number | null; // '2학년비율'
  third_year_ratio: number | null; // '3학년비율'
  second_third_year_ratio: number | null; // '2-3학년비율'
  first_second_third_year_ratio: number | null; // '1-2-3학년비율'
  curriculum_grade_1: number | null; // 교과_등급점수_1등급
  curriculum_grade_2: number | null; // 교과_등급점수_2등급
  curriculum_grade_3: number | null; // 교과_등급점수_3등급
  curriculum_grade_4: number | null; // 교과_등급점수_4등급
  curriculum_grade_5: number | null; // 교과_등급점수_5등급
  curriculum_grade_6: number | null; // 교과_등급점수_6등급
  curriculum_grade_7: number | null; // 교과_등급점수_7등급
  curriculum_grade_8: number | null; // 교과_등급점수_8등급
  curriculum_grade_9: number | null; // 교과_등급점수_9등급
  common_general_and_career_integration: number | null; // 공통일반과진로가통합
  common_general_subject_ratio: number | null; // 공통일반과목비율
  reflected_subject_1_year_korean: number | null; // '1년_국어'
  reflected_subject_1_year_math: number | null; // '1년_수학'
  reflected_subject_1_year_english: number | null; // '1년_영어'
  reflected_subject_1_year_science: number | null; // '1년_과학'
  reflected_subject_1_year_social: number | null; // '1년_사회'
  reflected_subject_1_year_korean_history: number | null; // '1년_한국사'
  reflected_subject_1_year_other: number | null; // '1년_기가외'
  number_of_optional_subjects_1: number | null; // '1년_선택과목수'
  total_number_of_top_subjects_1: number | null; // '1_년전체상위과목수'
  number_of_top_subjects_per_subject_1: number | null; // '1_년과목별상위과목수'
  reflected_subject_2_3_years_korean: number | null; // '2-3년_국어'
  reflected_subject_2_3_years_math: number | null; // '2-3년_수학'
  reflected_subject_2_3_years_english: number | null; // '2-3년_영어'
  reflected_subject_2_3_years_science: number | null; // '2-3년_과학'
  reflected_subject_2_3_years_social: number | null; // '2-3년_사회'
  reflected_subject_2_3_years_korean_history: number | null; // '2-3년_한국사'
  reflected_subject_2_3_years_other: number | null; // '2-3년_기가외'
  number_of_optional_subjects_2_3: number | null; // '2-3년_선택과목수'
  total_number_of_top_subjects_2_3: number | null; // '2-3년_전체상위과목수'
  number_of_top_subjects_per_subject_2_3: number | null; // '2-3년_과목별상위과목수'
  common_general_reflection_method: string | null; // 공통일반반영방식
  perfect_score: number | null; // 만점
  attendance_usage: number | null; // 출결사용여부
  attendance_usage_ratio: number | null; // 출결사용비중
  absence_1: number | null; // 결석1회
  absence_2: number | null; // 결석2회
  absence_3: number | null; // 결석3회
  absence_4: number | null; // 결석4회
  absence_5: number | null; // 결석5회
  absence_6: number | null; // 결석6회
  absence_7: number | null; // 결석7회
  absence_8: number | null; // 결석8회
  absence_9: number | null; // 결석9회
  absence_10: number | null; // 결석10회
  absence_11: number | null; // 결석11회
  absence_12: number | null; // 결석12회
  absence_13: number | null; // 결석13회
  absence_14: number | null; // 결석14회
  absence_15: number | null; // 결석15회
  absence_16: number | null; // 결석16회
  absence_17: number | null; // 결석17회
  absence_18: number | null; // 결석18회
  absence_19: number | null; // 결석19회
  absence_20: number | null; // 결석20회
  career_subject_application: number | null; // 진로과목적용여부
  career_subject_reflection_method: string | null; // 진로과목반영방식
  career_optional_subject: number | null; // 진로선택과목
  career_if_2: string | null; // 진로2일경우
  career_optional_subject_A: number | null; // 진로선택과목A
  career_optional_subject_B: number | null; // 진로선택과목B
  career_optional_subject_C: number | null; // 진로선택과목C
  A_distribution_ratio: number | null; // A분포비율
  B_distribution_ratio: number | null; // B분포비율
  C_distribution_ratio: number | null; // C분포비율
  career_subject_ratio: number | null; // 진로과목비율
  career_subject_additional_points: number | null; // 진로과목가산
  number_of_top_subjects_in_all_career_subjects: number | null; // 진로전체과목중상위과목수
  number_of_top_subjects_in_career_curriculum: number | null; // 진로교과중상위과목수
  grade_cut: number | null; // 등급컷
  grade_cut_70: number | null; // 등급컷 70
  converted_score_cut: number | null; // 환산점수컷
  converted_score_total: number | null; // 환산점수총점
  risk_level_plus5: number | null; // '환산점수위험도(+)5'
  risk_level_plus4: number | null; // '위험도(+)4'
  risk_level_plus3: number | null; // '위험도(+)3'
  risk_level_plus2: number | null; // '위험도(+)2'
  risk_level_plus1: number | null; // '위험도(+)1'
  risk_level_minus1: number | null; // '위험도(-1)'
  risk_level_minus2: number | null; // '위험도(-2)'
  risk_level_minus3: number | null; // '위험도(-3)'
  risk_level_minus4: number | null; // '위험도(-4)'
  risk_level_minus5: number | null; // '위험도(-5)'
  minimum_academic_standards_applied: number | null; // 최저학력기준_반영여부
  minimum_academic_standards_text: string | null; // 수능최저학력기준TEXT
  minimum_korean: number | null; // 최저국어
  minimum_math: number | null; // 최저수학
  minimum_math_science_engineering: number | null; // '최저수학(미/기)'
  english: number | null; // 영어
  social_studies: number | null; // 사탐
  science_studies: number | null; // 과탐
  calculation_studies: number | null; // 탐계산
  minimum_count: number | null; // 최저갯수
  minimum_sum: number | null; // '최저합'
  korean_history: number | null; // '한국사'
  others: number | null; // 그외
  others_details: string | null; // 그외상세
  additional_points: number | null; // 가산점
  additional_points_text: string | null; // 가산점TEXT
  interview_score_applied: string | null; // 면접점수반영여부
  interview_type: string | null; // 면접유형
  interview_resources: string | null; // 면접시활용자료
  interview_method: string | null; // 면접진행방식
  interview_evaluation_content: string | null; // 면접평가내용
  interview_date_text: string | null; // 면접날짜TEXT
  interview_time: string | null; // 면접시간
  curriculum_calculation_formula: number | null; // 교과계산식
  admission_criteria_2024: string | null; // '2024년입결기준'
  admission_2024_grade: string | null; // '2024학년도입결(등급)'
  admission_2024_converted_score: string | null; // '2024학년도입결(환산점수)'
  competition_rate_2024: string | null; // '2024학년도경쟁률'
  replenishment_2024: string | null; // '2024충원'
  admission_criteria_2023: string | null; // '2023학년도기준'
  admission_2023_grade: string | null; // '2023학년도입결(등급)'
  admission_2023_converted_score: string | null; // '2023학년도입결(환산점수)'
  competition_rate_2023: string | null; // '2023학년도경쟁률'
  replenishment_2023: string | null; // '2023충원'
  admission_criteria_2022: string | null; // '2022학년도기준'
  admission_2022_grade: string | null; // '2022학년도입결'
  competition_rate_2022: string | null; // '2022학년도경쟁률'
  replenishment_2022: string | null; // '2022충원'
  admission_2021_grade: string | null; // '2021학년도입결'
  competition_rate_2021: string | null; // '2021학년도경쟁률'
  replenishment_2021: string | null; // '2021충원'
  admission_2020_grade: string | null; // '2020학년도입결'
  competition_rate_2020: string | null; // '2020학년도경쟁률'
  replenishment_2020: string | null; // '2020충원'
  application_notes: string | null; // 지원시유의사항
}

// 그룹핑된 수시 전형
export interface IGroupedSusiSubject {
  university_name: string; // 대학명
  type_name: string; // 전형명
  department: string; // 계열
  detailed_type: number[]; // 상세전형
  min_cut: number; // 최소컷
  max_cut: number; // 최대컷
  ids: number[]; // 해당 그룹에 포함된 전형 id 목록
  region: string; // 지역
}

export interface ISusiSubjectStep1 {
  grouped_data: Record<string, IGroupedSusiSubject>;
}

// Step 2 - 최저등급
export interface ISusiSubjectStep2 {
  id: ISusiSubject["id"]; // id
  university_name: ISusiSubject["university_name"]; // 대학명
  type_name: ISusiSubject["type_name"]; // 전형명
  department: ISusiSubject["department"]; // 계열
  basic_type: ISusiSubject["basic_type"]; // 기본유형
  minimum_academic_standards_applied: ISusiSubject["minimum_academic_standards_applied"]; // 최저학력기준_반영여부
  minimum_academic_standards_text: ISusiSubject["minimum_academic_standards_text"]; // 수능최저학력기준TEXT

  minimum_korean: ISusiSubject["minimum_korean"]; // 최저국어
  minimum_math: ISusiSubject["minimum_math"]; // 최저수학
  minimum_math_science_engineering: ISusiSubject["minimum_math_science_engineering"]; // '최저수학(미/기)'
  english: ISusiSubject["english"]; // 영어 (최저?)
  social_studies: ISusiSubject["social_studies"]; // 사탐(최저?)
  science_studies: ISusiSubject["science_studies"]; // 과탐(최저?)
  calculation_studies: ISusiSubject["calculation_studies"]; // 탐계산 (1:탐구 중 높은거 1개, 2: 둘다, 0: 탐구계산 없음)
  minimum_count: ISusiSubject["minimum_count"]; // 최저갯수
  minimum_sum: ISusiSubject["minimum_sum"]; // 최저합
  korean_history: ISusiSubject["korean_history"]; // 한국사 (~이내)
}

// Step 3 - 비교과
export interface ISusiSubjectStep3 {
  id: ISusiSubject["id"]; // id
  university_name: ISusiSubject["university_name"]; // 대학명
  type_name: ISusiSubject["type_name"]; // 전형명
  department: ISusiSubject["department"]; // 계열
  basic_type: ISusiSubject["basic_type"]; // 기본유형

  attendance: ISusiSubject["attendance"]; // 출결
  volunteer: ISusiSubject["volunteer"]; // 봉사
  document_non_academic: ISusiSubject["document_non_academic"]; // '서류(비교과)'
}

// Step 4 - 모집단위 선택
export interface ISusiSubjectStep4 {
  id: ISusiSubject["id"];
  university_name: ISusiSubject["university_name"]; // 대학명
  type_name: ISusiSubject["type_name"]; // 전형명
  department: ISusiSubject["department"]; // 계열
  basic_type: ISusiSubject["basic_type"]; // 기본유형
  recruitment_unit_name: ISusiSubject["recruitment_unit_name"]; // 모집단위명

  converted_score_cut: ISusiSubject["converted_score_cut"]; // 환산점수컷(교과컷)
  converted_score_total: ISusiSubject["converted_score_total"]; // 환산점수총점
  // non_subject_cut: ISusiSubject["non_subject_cut"]; // 비교과컷

  risk_level_minus1: ISusiSubject["risk_level_minus1"]; // 위험도
  risk_level_minus2: ISusiSubject["risk_level_minus2"]; // 위험도
  risk_level_minus3: ISusiSubject["risk_level_minus3"]; // 위험도
  risk_level_minus4: ISusiSubject["risk_level_minus4"]; // 위험도
  risk_level_minus5: ISusiSubject["risk_level_minus5"]; // 위험도
  risk_level_plus1: ISusiSubject["risk_level_plus1"]; // 위험도
  risk_level_plus2: ISusiSubject["risk_level_plus2"]; // 위험도
  risk_level_plus3: ISusiSubject["risk_level_plus3"]; // 위험도
  risk_level_plus4: ISusiSubject["risk_level_plus4"]; // 위험도
  risk_level_plus5: ISusiSubject["risk_level_plus5"]; // 위험도
}

// Step 5 - 전형일자 확인
export interface ISusiSubjectStep5 {
  id: ISusiSubject["id"];
  university_name: ISusiSubject["university_name"]; // 대학명
  type_name: ISusiSubject["type_name"]; // 전형명
  recruitment_unit_name: ISusiSubject["recruitment_unit_name"]; // 모집단위명

  interview_score_applied: ISusiSubject["interview_score_applied"]; // 면접점수반영여부
  interview_type: ISusiSubject["interview_type"]; // 면접유형
  interview_resources: ISusiSubject["interview_resources"]; // 면접시활용자료
  interview_method: ISusiSubject["interview_method"]; // 면접진행방식
  interview_evaluation_content: ISusiSubject["interview_evaluation_content"]; // 면접평가내용
  interview_date_text: ISusiSubject["interview_date_text"]; // 전형일자
  interview_time: ISusiSubject["interview_time"]; // 면접 시간
}

// 수시 교과 상세보기 페이지
export interface ISusiSubjectDetail {
  id: ISusiSubject["id"];

  // 대학 전형 모집단위
  university_name: ISusiSubject["university_name"]; // 대학명
  region: ISusiSubject["region"]; // 지역
  national_or_private: ISusiSubject["national_or_private"]; // '국립/사립'
  detailed_type: ISusiSubject["detailed_type"]; // 전형세부유형
  type_name: ISusiSubject["type_name"]; // 전형명
  central_classification: ISusiSubject["central_classification"]; // 중심전형분류
  department: ISusiSubject["department"]; // 계열
  recruitment_unit_name: ISusiSubject["recruitment_unit_name"]; // 모집단위명

  // 지원자격
  basic_type: ISusiSubject["basic_type"]; // 기본유형
  application_eligibility_text: ISusiSubject["application_eligibility_text"]; // 지원자격TEXT

  // 선발방식
  recruitment_number: ISusiSubject["recruitment_number"]; // 모집인원
  selection_model: ISusiSubject["selection_model"]; // 선발모형
  selection_ratio: ISusiSubject["selection_ratio"]; // 선발비율
  selection_method: ISusiSubject["selection_method"]; // 전형방법

  // 학생부 비율
  curriculum: ISusiSubject["curriculum"]; // 교과
  interview: ISusiSubject["interview"]; // 면접
  attendance: ISusiSubject["attendance"]; // 출결
  volunteer: ISusiSubject["volunteer"]; // 봉사
  document_non_academic: ISusiSubject["document_non_academic"]; // '서류(비교과)'
  step1_score: ISusiSubject["step1_score"]; // '(2단계)1단계성적'
  step2_others: ISusiSubject["step2_others"]; // '(2단계)그외'
  step2_other_details: ISusiSubject["step2_other_details"]; // '(2단계)그외내역'

  // 위험도
  risk_level_minus1: ISusiSubject["risk_level_minus1"];
  risk_level_minus2: ISusiSubject["risk_level_minus2"];
  risk_level_minus3: ISusiSubject["risk_level_minus3"];
  risk_level_minus4: ISusiSubject["risk_level_minus4"];
  risk_level_minus5: ISusiSubject["risk_level_minus5"];
  risk_level_plus1: ISusiSubject["risk_level_plus1"];
  risk_level_plus2: ISusiSubject["risk_level_plus2"];
  risk_level_plus3: ISusiSubject["risk_level_plus3"];
  risk_level_plus4: ISusiSubject["risk_level_plus4"];
  risk_level_plus5: ISusiSubject["risk_level_plus5"];

  // 교과 반영 방식
  curriculum_reflection_semester: ISusiSubject["curriculum_reflection_semester"]; // 교과_반영학기
  student_record_utilization_index: ISusiSubject["student_record_utilization_index"]; // 학생부활용지표
  career_subject_reflection_method: ISusiSubject["career_subject_reflection_method"]; // 진로과목반영방식
  common_general_reflection_method: ISusiSubject["common_general_reflection_method"]; // 공통일반반영방식
  first_year_ratio: ISusiSubject["first_year_ratio"]; // '1학년비율'
  second_year_ratio: ISusiSubject["second_year_ratio"]; // '2학년비율'
  third_year_ratio: ISusiSubject["third_year_ratio"]; // '3학년비율'
  second_third_year_ratio: ISusiSubject["second_third_year_ratio"]; // '2-3학년비율'
  first_second_third_year_ratio: ISusiSubject["first_second_third_year_ratio"]; // '1-2-3학년비율'
  curriculum_grade_1: ISusiSubject["curriculum_grade_1"]; // 교과_등급점수_1등급
  curriculum_grade_2: ISusiSubject["curriculum_grade_2"]; // 교과_등급점수_2등급
  curriculum_grade_3: ISusiSubject["curriculum_grade_3"]; // 교과_등급점수_3등급
  curriculum_grade_4: ISusiSubject["curriculum_grade_4"]; // 교과_등급점수_4등급
  curriculum_grade_5: ISusiSubject["curriculum_grade_5"]; // 교과_등급점수_5등급
  curriculum_grade_6: ISusiSubject["curriculum_grade_6"]; // 교과_등급점수_6등급
  curriculum_grade_7: ISusiSubject["curriculum_grade_7"]; // 교과_등급점수_7등급
  curriculum_grade_8: ISusiSubject["curriculum_grade_8"]; // 교과_등급점수_8등급
  curriculum_grade_9: ISusiSubject["curriculum_grade_9"]; // 교과_등급점수_9등급

  // 수능 최저
  minimum_academic_standards_applied: ISusiSubject["minimum_academic_standards_applied"]; // 최저학력기준_반영여부
  minimum_academic_standards_text: ISusiSubject["minimum_academic_standards_text"]; // 수능최저학력기준TEXT

  // 면접
  interview_score_applied: ISusiSubject["interview_score_applied"]; // 면접점수반영여부
  interview_type: ISusiSubject["interview_type"]; // 면접유형
  interview_resources: ISusiSubject["interview_resources"]; // 면접시활용자료
  interview_method: ISusiSubject["interview_method"]; // 면접진행방식
  interview_evaluation_content: ISusiSubject["interview_evaluation_content"]; // 면접평가내용
  interview_date_text: ISusiSubject["interview_date_text"]; // 면접날짜TEXT
  interview_time: ISusiSubject["interview_time"]; // 면접시간

  // 지난년도 경쟁률
  admission_2024_grade: ISusiSubject["admission_2024_grade"]; // '2024학년도입결(등급)'
  admission_2024_converted_score: ISusiSubject["admission_2024_converted_score"]; // '2024학년도입결(환산점수)'
  competition_rate_2024: ISusiSubject["competition_rate_2024"]; // '2024학년도경쟁률'
  replenishment_2024: ISusiSubject["replenishment_2024"]; // '2024충원'

  admission_2023_grade: ISusiSubject["admission_2023_grade"]; // '2023학년도입결(등급)'
  admission_2023_converted_score: ISusiSubject["admission_2023_converted_score"]; // '2023학년도입결(환산점수)'
  competition_rate_2023: ISusiSubject["competition_rate_2023"]; // '2023학년도경쟁률'
  replenishment_2023: ISusiSubject["replenishment_2023"]; // '2023충원'

  admission_2022_grade: ISusiSubject["admission_2022_grade"]; // '2022학년도입결'
  competition_rate_2022: ISusiSubject["competition_rate_2022"]; // '2022학년도경쟁률'
  replenishment_2022: ISusiSubject["replenishment_2022"]; // '2022충원'

  admission_2021_grade: ISusiSubject["admission_2021_grade"]; // '2021학년도입결'
  competition_rate_2021: ISusiSubject["competition_rate_2021"]; // '2021학년도경쟁률'
  replenishment_2021: ISusiSubject["replenishment_2021"]; // '2021충원'

  admission_2020_grade: ISusiSubject["admission_2020_grade"]; // '2020학년도입결'
  competition_rate_2020: ISusiSubject["competition_rate_2020"]; // '2020학년도경쟁률'
  replenishment_2020: ISusiSubject["replenishment_2020"]; // '2020충원'
}
