export interface ICombination {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  recruitment_units: {
    id: number;
    name: string;
    recruitment_number: number | null;
    code: string | null;
    general_field: {
      id: number;
      name: string;
    } | null;
    interview: {
      id: number;
      evaluation_content: string | null;
      interview_date: string | null;
      interview_process: string | null;
      interview_time: string | null;
      interview_type: string | null;
      is_reflected: number;
      materials_used: string | null;
    } | null;

    admission: {
      id: number;
      basic_type: string;
      name: string;
      year: number;
      category: {
        id: number;
        name: string;
      } | null;
      university: {
        code: string;
        establishment_type: string;
        id: number;
        name: string;
        region: string;
      } | null;
    };
  }[];
}

export interface ICreateCombinationBody {
  name: string;
  recruitment_unit_ids: number[];
}

export interface IUpdateCombinationBody {
  name?: string;
  recruitment_unit_ids?: number[];
}
