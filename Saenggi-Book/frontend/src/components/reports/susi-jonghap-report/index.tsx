import NotFoundError from "@/components/errors/not-found-error";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import {
  useGetCurrentUser,
  useGetMyGrade,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { RecentGradeAnalysisSection } from "./recent-grade-analysis-section";
import { CompatibilityRiskSection } from "./compatibility-risk-section";
import { useGetExploreSusiJonghapDetail } from "@/stores/server/features/explore/susi-jonghap/queries";
import { useGetOfficerEvaluation } from "@/stores/server/features/susi/evaluation/queries";
import { SusiReportHeader } from "../susi-report-header";
import { SusiJonghapDetailSection } from "./susi-jonghap-detail-section";
import { NonSubjectRiskSection } from "./non-subject-risk-section";
import { SubjectRiskSection } from "./subject-risk-section";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { useMemo } from "react";
import { calculateComprehensiveRisk } from "@/lib/calculations/early-compatibility-risk";
import { calculateCompatibility } from "@/lib/calculations/compatibility/score";
import { ISeries } from "@/types/compatibility.type";
import { getUnivLevelByCode } from "@/lib/utils/services/university";
import { useGetSusiPassRecord } from "@/stores/server/features/susi/pass-record/queries";
import { PassFailAnalysisSection } from "../pass-fail-analysis-section";

interface SusiJonghapReportProps {
  susiJonghapId: number;
  evaluationId?: number | null;
}

export const SusiJonghapReport = ({
  susiJonghapId,
  evaluationId,
}: SusiJonghapReportProps) => {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: susiJonghap, status: susiJonghapStatus } =
    useGetExploreSusiJonghapDetail(susiJonghapId);
  const { data: evaluation, status: evaluationStatus } =
    useGetOfficerEvaluation(evaluationId);
  const { data: schoolRecord, status: schoolRecordStatus } =
    useGetSchoolRecords();
  const { data: myGrade } = useGetMyGrade();
  const { data: staticData } = useGetStaticData();
  const { data: passRecords } = useGetSusiPassRecord({
    recruitmentUnitId: susiJonghapId,
  });

  const series: ISeries = {
    grandSeries: susiJonghap?.fields.major?.name || "",
    middleSeries: susiJonghap?.fields.mid?.name || "",
    rowSeries: susiJonghap?.fields.minor?.name || "",
  };
  const univLevel = getUnivLevelByCode(
    susiJonghap?.university.code || "",
    susiJonghap?.general_field.name || "",
  );
  const calculatedCompatibility = calculateCompatibility({
    schoolRecord,
    series,
    univLevel,
    staticData,
  });

  const risk = useMemo(() => {
    if (
      !susiJonghap ||
      !schoolRecord ||
      !staticData ||
      myGrade === undefined
    ) {
      return null;
    }
    return calculateComprehensiveRisk({
      recruitmentUnit: susiJonghap,
      myEvaluationFactorScore: evaluation?.factorScores || {},
      myGrade: myGrade || 0,
      schoolRecord,
      staticData,
    });
  }, [susiJonghap, evaluation, myGrade, schoolRecord, staticData]);

  if (
    susiJonghapStatus === "pending" ||
    evaluationStatus === "pending" ||
    schoolRecordStatus === "pending"
  ) {
    return <LoadingSpinner />;
  }

  if (
    susiJonghapStatus === "error" ||
    evaluationStatus === "error" ||
    schoolRecordStatus === "error"
  ) {
    return <UnknownErrorPage />;
  }

  if (susiJonghap === null) {
    return <NotFoundError />;
  }

  return (
    <div className="pb-20">
      <div className="space-y-12">
        <SusiReportHeader
          title={`${susiJonghap.university.name} (${susiJonghap.university.region})`}
          subtitle={`${susiJonghap.general_field.name} - ${susiJonghap.admission.name}`}
          recruitmentUnitName={susiJonghap.name || "-"}
          badges={
            susiJonghap.admission.subtypes.map((n) => n.id).join(",") ||
            ""
          }
          risk={risk?.subjectRisk}
        />

        <CompatibilityRiskSection
          susiJonghap={susiJonghap}
          calculatedCompatibility={calculatedCompatibility}
          userName={currentUser?.nickname || ""}
        />

        <SubjectRiskSection
          susiJonghap={susiJonghap}
          userName={currentUser?.nickname || ""}
          subjectRisk={risk?.subjectRisk}
          myGrade={myGrade}
        />

        <NonSubjectRiskSection
          susiJonghap={susiJonghap}
          evaluationScores={evaluation.factorScores}
          userName={currentUser?.nickname || ""}
        />

        <RecentGradeAnalysisSection susiJonghap={susiJonghap} />

        <PassFailAnalysisSection passRecords={passRecords || []} />

        <SusiJonghapDetailSection
          susiJonghap={susiJonghap}
        />
      </div>
    </div>
  );
};
