export interface IExploreSusiKyokwaStep1Item {
  id: number;
  university: {
    id: number;
    name: string;
    region: string;
    code: string;
    establishmentType: string;  // camelCase
  };
  name: string;
  year: number;
  basicType: "일반" | "특별";  // camelCase
  category: {
    id: number;
    name: string;
  };
  subtypeIds: number[];  // camelCase
  generalType: {  // camelCase
    id: number;
    name: string;
  };
  subjectCategory?: string | null;  // camelCase
  minCut: number | null;  // camelCase: API response is transformed by humps
  maxCut: number | null;  // camelCase: API response is transformed by humps
  recruitmentUnitIds: number[];  // camelCase
}

export interface IExploreSusiKyokwaStep1Response {
  items: IExploreSusiKyokwaStep1Item[];
}

export interface IExploreSusiKyokwaStep2Item {
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

export interface IExploreSusiKyokwaStep2Response {
  items: IExploreSusiKyokwaStep2Item[];
}

export interface IExploreSusiKyokwaStep3Item {
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
}

export interface IExploreSusiKyokwaStep3Response {
  items: IExploreSusiKyokwaStep3Item[];
}

export interface IExploreSusiKyokwaStep4Item {
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
  scores: {
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

export interface IExploreSusiKyokwaStep4Response {
  items: IExploreSusiKyokwaStep4Item[];
}

export interface IExploreSusiKyokwaStep5Item {
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

export interface IExploreSusiKyokwaStep5Response {
  items: IExploreSusiKyokwaStep5Item[];
}

export interface IExploreSusiKyokwaDetailResponse {
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
  generalField: {
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
  scores: {
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
  previousResults: Array<{
    year: number;
    resultCriteria: string;
    gradeCut: number | null;
    convertedScoreCut: number | null;
    competitionRatio: number | null;
    recruitmentNumber: number | null;
  }>;
}
