/**
 * 수시 종합
 */
export interface ISusiComprehensive {
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
  recruitment_unit_name: string | null; // 모집단위명

  large_department: string | null; // 대계열
  medium_department: string | null; // 중계열
  small_department: string | null; // 소계열
  recruitment_number: string | null; // 모집인원
  selection_model: string | null; // 선발모형
  selection_ratio: string | null; // 선발비율
  selection_method: string | null; // 전형방법

  document_rate: number | null; // 서류비율
  interview_rate: number | null; // 면접비율
  other_rate: number | null; // 그외비율
  other_details: string | null; // '그외내역'
  step2_step1_score_rate: number | null; // '(2단계)1단계성적'
  step2_interview_rate: number | null; // '(2단계)면접비율'
  step2_other_rate: number | null; // '(2단계)그외'
  step2_other_details: string | null; // '(2단계)그외내역'
  application_eligibility_text: string | null; // 지원자격TEXT

  cut_50: number | null; // 50컷
  cut_70: number | null; // 70컷

  risk_level_plus5: number | null; // '등급컷위험도(+)5'
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
  minimum_english: number | null; // 영어
  minimum_social_studies: number | null; // 사탐
  minimum_science_studies: number | null; // 과탐
  minimum_calculation_studies: number | null; // 탐계산
  minimum_count: number | null; // 최저갯수
  minimum_sum: number | null; // '최저합'
  minimum_korean_history: number | null; // '한국사'
  minimum_others: number | null; // 그외
  minimum_others_details: string | null; // 그외상세

  additional_point: string | null; // 가산점
  additional_point_text: string | null; // 가산점 TEXT

  evaluation_ratios: string | null; // 3개평가 비중(30:20:50)
  evaluation_code: string | null; //3개평가 코드

  interview_score_applied: number | null; // 면접점수반영여부
  interview_type: string | null; // 면접유형
  interview_resources: string | null; // 면접시활용자료
  interview_method: string | null; // 면접진행방식
  interview_evaluation_content: string | null; // 면접평가내용
  interview_date_text: string | null; // 면접날짜TEXT
  interview_time: string | null; // 면접시간

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

/**
 * [수시 종합] Step1 응답
 */
export interface ISusiComprehensiveStep1 {
  id: ISusiComprehensive["id"];

  university_name: ISusiComprehensive["university_name"];
  basic_type: ISusiComprehensive["basic_type"];
  type_name: ISusiComprehensive["type_name"];
  region: ISusiComprehensive["region"];
  detailed_type: ISusiComprehensive["detailed_type"];
  department: ISusiComprehensive["department"];
  recruitment_unit_name: ISusiComprehensive["recruitment_unit_name"];
  cut_50: ISusiComprehensive["cut_50"];
  cut_70: ISusiComprehensive["cut_70"];

  risk_level_plus5: ISusiComprehensive["risk_level_plus5"]; // '등급컷위험도(+)5'
  risk_level_plus4: ISusiComprehensive["risk_level_plus4"]; // '위험도(+)4'
  risk_level_plus3: ISusiComprehensive["risk_level_plus3"]; // '위험도(+)3'
  risk_level_plus2: ISusiComprehensive["risk_level_plus2"]; // '위험도(+)2'
  risk_level_plus1: ISusiComprehensive["risk_level_plus1"]; // '위험도(+)1'
  risk_level_minus1: ISusiComprehensive["risk_level_minus1"]; // '위험도(-1)'
  risk_level_minus2: ISusiComprehensive["risk_level_minus2"]; // '위험도(-2)'
  risk_level_minus3: ISusiComprehensive["risk_level_minus3"]; // '위험도(-3)'
  risk_level_minus4: ISusiComprehensive["risk_level_minus4"]; // '위험도(-4)'
  risk_level_minus5: ISusiComprehensive["risk_level_minus5"]; // '위험도(-5)'
}

/**
 * [수시 종합] Step2 응답
 */
export interface ISusiComprehensiveStep2 {
  id: ISusiComprehensive["id"];
  type_name: ISusiComprehensive["type_name"];
  university_name: ISusiComprehensive["university_name"];
  university_code: ISusiComprehensive["university_code"];
  recruitment_unit_name: ISusiComprehensive["recruitment_unit_name"];
  department: ISusiComprehensive["department"];

  evaluation_ratios: ISusiComprehensive["evaluation_ratios"]; // 3개평가 비중(30:20:50)
  evaluation_code: ISusiComprehensive["evaluation_code"]; // 3개평가 코드
}

/**
 * [수시 종합] Step3 응답
 */
export interface ISusiComprehensiveStep3 {
  id: ISusiComprehensive["id"];
  type_name: ISusiComprehensive["type_name"];
  university_name: ISusiComprehensive["university_name"];
  university_code: ISusiComprehensive["university_code"];
  recruitment_unit_name: ISusiComprehensive["recruitment_unit_name"];
  department: ISusiComprehensive["department"];

  minimum_academic_standards_applied: ISusiComprehensive["minimum_academic_standards_applied"]; // 최저학력기준_반영여부
  minimum_academic_standards_text: ISusiComprehensive["minimum_academic_standards_text"]; // 수능최저학력기준TEXT
  minimum_korean: ISusiComprehensive["minimum_korean"]; // 최저국어
  minimum_math: ISusiComprehensive["minimum_math"]; // 최저수학
  minimum_math_science_engineering: ISusiComprehensive["minimum_math_science_engineering"]; // '최저수학(미/기)'
  minimum_english: ISusiComprehensive["minimum_english"]; // 영어
  minimum_social_studies: ISusiComprehensive["minimum_social_studies"]; // 사탐
  minimum_science_studies: ISusiComprehensive["minimum_science_studies"]; // 과탐
  minimum_calculation_studies: ISusiComprehensive["minimum_calculation_studies"]; // 탐계산
  minimum_count: ISusiComprehensive["minimum_count"]; // 최저갯수
  minimum_sum: ISusiComprehensive["minimum_sum"]; // '최저합'
  minimum_korean_history: ISusiComprehensive["minimum_korean_history"]; // '한국사'
  minimum_others: ISusiComprehensive["minimum_others"]; // 그외
  minimum_others_details: ISusiComprehensive["minimum_others_details"]; // 그외상세
}

/**
 * [수시 종합] Step4 응답
 */
export interface ISusiComprehensiveStep4 {
  id: ISusiComprehensive["id"];
  university_name: ISusiComprehensive["university_name"]; // 대학명
  type_name: ISusiComprehensive["type_name"]; // 전형명
  recruitment_unit_name: ISusiComprehensive["recruitment_unit_name"]; // 모집단위명

  interview_score_applied: ISusiComprehensive["interview_score_applied"]; // 면접점수반영여부
  interview_type: ISusiComprehensive["interview_type"]; // 면접유형
  interview_resources: ISusiComprehensive["interview_resources"]; // 면접시활용자료
  interview_method: ISusiComprehensive["interview_method"]; // 면접진행방식
  interview_evaluation_content: ISusiComprehensive["interview_evaluation_content"]; // 면접평가내용
  interview_date_text: ISusiComprehensive["interview_date_text"]; // 전형일자
  interview_time: ISusiComprehensive["interview_time"]; // 면접 시간
}
