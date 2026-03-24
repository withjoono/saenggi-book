import { IRecruitmentUnit } from "../../ms/interest-univ/interfaces";

export interface IExploreSusiJonghapStep1Item {
  id: number;
  name: string;
  recruitmentNumber: number | null;

  admission: {
    id: number;
    name: string;
    year: number;
    basicType: "일반" | "특별";
    university: {
      id: number;
      name: string;
      region: string;
      code: string;
      establishmentType: string;
    };
    category: {
      id: number;
      name: string;
    };
    subtypes: number[];
  };
  generalField: {
    id: number;
    name: string;
  };
  scores: {
    gradeAvg: number | null;
    grade50Cut: number | null;
    grade70Cut: number | null;
    convert50Cut: number | null;
    convert70Cut: number | null;
    riskPlus5: number | null;
    riskPlus4: number | null;
    riskPlus3: number | null;
    riskPlus2: number | null;
    riskPlus1: number | null;
    riskMinus1: number | null;
    riskMinus2: number | null;
    riskMinus3: number | null;
    riskMinus4: number | null;
    riskMinus5: number | null;
  } | null;
}

export interface IExploreSusiJonghapStep1Response {
  items: IExploreSusiJonghapStep1Item[];
}

export interface IExploreSusiJonghapStep2Item {
  id: number;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishmentType: string;
  };
  generalField: {
    id: number;
    name: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basicType: "일반" | "특별";
    method: {
      methodDescription: string;
      subjectRatio: number | null;
      documentRatio: number | null;
      interviewRatio: number | null;
      practicalRatio: number | null;
      otherDetails: string | null;
      secondStageFirstRatio: number | null;
      secondStageInterviewRatio: number | null;
      secondStageOtherRatio: number | null;
      secondStageOtherDetails: string | null;
      eligibility: string;
      schoolRecordEvaluationScore: string | null;
      schoolRecordEvaluationElements: string | null;
    };
  };
  name: string;
  recruitmentNumber: number | null;
}

export interface IExploreSusiJonghapStep2Response {
  items: IExploreSusiJonghapStep2Item[];
}

export interface IExploreSusiJonghapStep3Item {
  id: number;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishmentType: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basicType: "일반" | "특별";
  };
  generalField: {
    id: number;
    name: string;
  };
  name: string;
  recruitmentNumber: number | null;
  minimumGrade: {
    isApplied: "Y" | "N";
    description: string | null;
  } | null;
}

export interface IExploreSusiJonghapStep3Response {
  items: IExploreSusiJonghapStep3Item[];
}

export interface IExploreSusiJonghapStep4Item {
  id: number;
  name: string;
  recruitmentNumber: number | null;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishmentType: string;
  };
  admission: {
    id: number;
    name: string;
    year: number;
    basicType: "일반" | "특별";
  };
  generalField: {
    id: number;
    name: string;
  };
  interview: {
    isReflected: number;
    interviewType: string | null;
    materialsUsed: string | null;
    interviewProcess: string | null;
    evaluationContent: string | null;
    interviewDate: string | null;
    interviewTime: string | null;
  } | null;
}

export interface IExploreSusiJonghapStep4Response {
  items: IExploreSusiJonghapStep4Item[];
}

export interface IExploreSusiJonghapDetailResponse
  extends IRecruitmentUnit {
  admission: {
    id: number;
    name: string;
    year: number;
    basicType: "일반" | "특별";
    category: {
      id: number;
      name: string;
    };
    subtypes: {
      id: number;
      name: string;
    }[];
  };
  admissionMethod: {
    methodDescription: string;
    subjectRatio: number | null;
    documentRatio: number | null;
    interviewRatio: number | null;
    practicalRatio: number | null;
    otherDetails: string | null;
    secondStageFirstRatio: number | null;
    secondStageInterviewRatio: number | null;
    secondStageOtherRatio: number | null;
    secondStageOtherDetails: string | null;
    eligibility: string;
    schoolRecordEvaluationScore: string | null;
    schoolRecordEvaluationElements: string | null;
  };
  minimumGrade: {
    isApplied: "Y" | "N";
    description: string | null;
  } | null;
  interview: {
    isReflected: number;
    interviewType: string | null;
    materialsUsed: string | null;
    interviewProcess: string | null;
    evaluationContent: string | null;
    interviewDate: string | null;
    interviewTime: string | null;
  } | null;
  previousResults: Array<{
    year: number;
    resultCriteria: string;
    gradeCut: number | null;
    convertedScoreCut: number | null;
    competitionRatio: number | null;
    recruitmentNumber: number | null;
  }>;
}
