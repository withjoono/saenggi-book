import { IRegularAdmission } from "../../jungsi/interfaces";
import { IRecruitmentUnit } from "../../ms/interest-univ/interfaces";

export interface IExploreSearchUniversityResponse {
  id: number;
  name: string;
  region: string;
  code: string;
  establishment_type: string;
  admissions:
    | {
        id: number;
        name: string;
        year: number;
        basic_type: "일반" | "특별";
        category: {
          id: number;
          name: string;
        } | null;
        recruitment_units:
          | {
              code: string;
              general_field: {
                id: number;
                name: string;
              } | null;
              id: number;
              minor_field: {
                id: number;
                name: string;
                mid_field_id: number;
              } | null;
              name: string;
              recruitment_number: number;
            }[]
          | null;
      }[]
    | null;
}

export interface IExploreSearchAdmissionResponse {
  id: number;
  name: string;
  year: number;
  basic_type: "일반" | "특별";
  category: {
    id: number;
    name: string;
  } | null;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishment_type: string;
  };
  recruitment_units:
    | {
        code: string;
        general_field: {
          id: number;
          name: string;
        } | null;
        id: number;
        minor_field: {
          id: number;
          name: string;
          mid_field_id: number;
        } | null;
        name: string;
        recruitment_number: number;
      }[]
    | null;
}

export interface IExploreSearchRecruitmentUnitResponse {
  id: number;
  code: string;
  name: string;
  recruitment_number: number;
  general_field: {
    id: number;
    name: string;
  } | null;
  minor_field: {
    id: number;
    name: string;
    mid_field_id: number;
  } | null;
  admission: {
    id: number;
    name: string;
    year: number;
    basic_type: "일반" | "특별";
    category: {
      id: number;
      name: string;
    } | null;
    university: {
      id: number;
      name: string;
      region: string;
      code: string;
      establishment_type: string;
    } | null;
  };
}

export interface IAdmissionWithCategory {
  id: number;
  name: string;
  category: {
    name: string;
  };
}

export interface ISearchSusiComparison {
  recruitmentUnit: IRecruitmentUnit;
  regularAdmission: IRegularAdmission | null;
}
