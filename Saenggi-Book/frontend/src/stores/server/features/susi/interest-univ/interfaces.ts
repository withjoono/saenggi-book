import { ISusiComprehensive } from "../comprehensive/interfaces";
import { ISusiSubject } from "../subject/interfaces";

/**
 * 관심대학 추가 API Body
 */
export interface IAddInterestUnivBody {
  targetIds: number[];
  targetTable:
    | "susi_subject_tb"
    | "susi_comprehensive_tb"
    | "early_subject"
    | "early_comprehensive";

  evaluation_id?: number;
}

// 유저 관심목록(수시 교과)
export interface IInterestSusiSubject {
  id: ISusiSubject["id"];
  university_name: ISusiSubject["university_name"];
  type_name: ISusiSubject["type_name"];
  recruitment_unit_name: ISusiSubject["recruitment_unit_name"];
  converted_score_cut: ISusiSubject["converted_score_cut"];
  converted_score_total: ISusiSubject["converted_score_total"];
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
}

// 유저 관심목록(수시 학종) 조회
export interface IInterestSusiComprehensive {
  susi_comprehensive: ISusiComprehensive;
  evaluation_id?: number;
}

export interface IRecruitmentUnit {
  id: number;
  name: string;
  recruitment_number: number | null;
  general_field: {
    id: number;
    name: string;
  };
  fields: {
    major: {
      id: number;
      name: string;
    } | null;
    mid: {
      id: number;
      name: string;
    } | null;
    minor: {
      id: number;
      name: string;
    } | null;
  };
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
    category?: {
      id: number;
      name: string;
    };
  };
  admission_method: {
    method_description: string;
    subject_ratio: number | null;
    document_ratio: number | null;
    interview_ratio: number | null;
    practical_ratio: number | null;
    other_details: string | null;
    second_stage_first_ratio: number | null;
    second_stage_interview_ratio: number | null;
    second_stage_other_ratio: number | null;
    second_stage_other_details: string | null;
    eligibility: string;
    school_record_evaluation_score: string | null;
    school_record_evaluation_elements: string | null;
  };
  scores: {
    grade_50_cut: number | null;
    grade_70_cut: number | null;
    convert_50_cut: number | null;
    convert_70_cut: number | null;
    risk_plus_5: number | null;
    risk_plus_4: number | null;
    risk_plus_3: number | null;
    risk_plus_2: number | null;
    risk_plus_1: number | null;
    risk_minus_1: number | null;
    risk_minus_2: number | null;
    risk_minus_3: number | null;
    risk_minus_4: number | null;
    risk_minus_5: number | null;
  } | null;
}
// 유저 관심목록(수시 학종) 조회
export interface IInterestRecruitment {
  evaluation_id?: number;
  recruitmentUnit: IRecruitmentUnit;
}
