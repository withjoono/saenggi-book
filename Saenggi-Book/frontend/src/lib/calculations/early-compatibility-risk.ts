import { IRecruitmentUnit } from "@/stores/server/features/susi/interest-univ/interfaces";
import { ISchoolRecord } from "@/stores/server/features/me/interfaces";
import { ISeries } from "@/types/compatibility.type";
import { getUnivLevelByCode } from "../utils/services/university";
import { calculateCompatibility } from "./compatibility/score";
import { calculateEvaluationScore } from "./evaluation/score";
import { calculateEvaluationRisk } from "./evaluation/risk";
import { calculateSubjectRisk } from "./subject/risk";
import { ITransformedStaticData } from "@/stores/server/features/static-data/queries";
import { IEvaluationFactorScore } from "@/stores/server/features/susi/evaluation/interfaces";

interface ComprehensiveRiskParams {
  recruitmentUnit: IRecruitmentUnit;
  myEvaluationFactorScore: Record<string, IEvaluationFactorScore>;
  myGrade: number;
  schoolRecord: ISchoolRecord;
  staticData: ITransformedStaticData;
}

interface ComprehensiveRiskResult {
  isNonSubjectExist: boolean;
  nonSubjectRisk: number;
  isSubjectExist: boolean;
  subjectRisk: number;
  compatibilityRisk: number;
  totalRisk: number;
}

export const calculateComprehensiveRisk = ({
  recruitmentUnit,
  myEvaluationFactorScore,
  myGrade,
  schoolRecord,
  staticData,
}: ComprehensiveRiskParams): ComprehensiveRiskResult => {
  const univLevel = getUnivLevelByCode(
    recruitmentUnit.university.code || "",
    recruitmentUnit.general_field.name || "",
  );

  // 계열적합성 위험도 계산
  const series: ISeries = {
    grandSeries: recruitmentUnit.fields.major?.name || "",
    middleSeries: recruitmentUnit.fields.mid?.name || "",
    rowSeries: recruitmentUnit.fields.minor?.name || "",
  };
  const calculatedCompatibility = calculateCompatibility({
    schoolRecord,
    series,
    univLevel,
    staticData,
  });
  const compatibilityRisk = Math.floor(calculatedCompatibility.totalRisk);
  // 비교과 위험도 계산
  const processedMyNonSubjectScores = calculateEvaluationScore({
    myEvaluationFactorScore: myEvaluationFactorScore,
    codes:
      recruitmentUnit.admission_method.school_record_evaluation_elements || "",
    ratios:
      recruitmentUnit.admission_method.school_record_evaluation_score || "",
  });
  const isNonSubjectExist = processedMyNonSubjectScores.items.length > 0;
  const nonSubjectRisk = calculateEvaluationRisk(
    (processedMyNonSubjectScores.totalScore / 100) * 7,
    univLevel,
  );

  // 교과 위험도 계산
  const isSubjectExist = myGrade !== 0;
  const subjectRisk = calculateSubjectRisk(myGrade, {
    // New Logic Risk Mapping:
    // risk_5 needs 50% Cut. Based on Table, +4 is 30~50%. So risk_plus_4 likely represents the 50% boundary.
    // risk_3 needs 70% Cut. Based on Table, +2 is 60~70%. So risk_plus_2 likely represents the 70% boundary.
    risk_5: recruitmentUnit.scores?.risk_plus_4 || null,
    risk_3: recruitmentUnit.scores?.risk_plus_2 || null,

    // Legacy / Fallbacks (Optional, not used by new logic but converting roughly)
    risk_1: recruitmentUnit.scores?.risk_plus_5 || null,
    risk_2: recruitmentUnit.scores?.risk_plus_4 || null,
    risk_4: recruitmentUnit.scores?.risk_plus_2 || null,
    risk_6: recruitmentUnit.scores?.risk_minus_1 || null,
    risk_7: recruitmentUnit.scores?.risk_minus_2 || null,
    risk_8: recruitmentUnit.scores?.risk_minus_3 || null,
    risk_9: recruitmentUnit.scores?.risk_minus_4 || null,
    risk_10: recruitmentUnit.scores?.risk_minus_5 || null,
  });

  // 종합 위험도 계산
  const subjectAndCompatibilityRisk =
    (compatibilityRisk + (isSubjectExist ? subjectRisk : 0)) /
    (isSubjectExist ? 2 : 1);

  const totalRisk = Math.floor(
    (subjectAndCompatibilityRisk + (isNonSubjectExist ? nonSubjectRisk : 0)) /
    (isNonSubjectExist ? 2 : 1),
  );

  return {
    isNonSubjectExist,
    nonSubjectRisk,
    isSubjectExist,
    subjectRisk,
    compatibilityRisk,
    totalRisk,
  };
};
