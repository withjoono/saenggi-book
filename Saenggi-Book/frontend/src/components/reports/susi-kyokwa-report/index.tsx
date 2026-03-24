import NotFoundError from "@/components/errors/not-found-error";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import {
  useGetCurrentUser,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { SubjectRiskSection } from "./subject-risk-section";
import { RecentGradeAnalysisSection } from "./recent-grade-analysis-section";
import { useMemo } from "react";
import { useGetExploreSusiKyokwaDetail } from "@/stores/server/features/explore/susi-kyokwa/queries";
import { SusiReportHeader } from "../susi-report-header";
import { SusiKyokwaDetailSection } from "./susi-kyokwa-detail-section";
import { calculateSubjectRisk } from "@/lib/calculations/subject/risk";
import { useGetSusiPassRecord } from "@/stores/server/features/susi/pass-record/queries";
import { PassFailAnalysisSection } from "../pass-fail-analysis-section";

interface SusiKyokwaReportProps {
  susiKyokwaId: number;
}

export const SusiKyokwaReport = ({
  susiKyokwaId,
}: SusiKyokwaReportProps) => {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: susiKyokwa, status: susiKyokwaStatus } =
    useGetExploreSusiKyokwaDetail(susiKyokwaId);
  const { data: passRecords } = useGetSusiPassRecord({
    recruitmentUnitId: susiKyokwaId,
  });
  const { data: myGrade } = useGetMyGrade();

  // 교과 위험도
  const subjectRisk = useMemo(() => {
    if (!myGrade || !susiKyokwa?.scores) return null;
    return calculateSubjectRisk(myGrade, {
      risk_1: susiKyokwa.scores.riskPlus5,
      risk_2: susiKyokwa.scores.riskPlus4,
      risk_3: susiKyokwa.scores.riskPlus3,
      risk_4: susiKyokwa.scores.riskPlus2 ?? susiKyokwa.scores.grade50Cut,
      risk_5: susiKyokwa.scores.riskPlus1,
      risk_6: susiKyokwa.scores.riskMinus1 ?? susiKyokwa.scores.grade70Cut,
      risk_7: susiKyokwa.scores.riskMinus2,
      risk_8: susiKyokwa.scores.riskMinus3,
      risk_9: susiKyokwa.scores.riskMinus4,
      risk_10: susiKyokwa.scores.riskMinus5,
    });
  }, [susiKyokwa, myGrade]);

  if (susiKyokwaStatus === "pending") {
    return <LoadingSpinner />;
  }

  if (susiKyokwaStatus === "error") {
    return <UnknownErrorPage />;
  }

  if (susiKyokwa === null) {
    return <NotFoundError />;
  }

  return (
    <div className="pb-20">
      <div className="space-y-12">
        <SusiReportHeader
          title={`${susiKyokwa.university.name} (${susiKyokwa.university.region})`}
          subtitle={`${susiKyokwa.generalField.name} - ${susiKyokwa.admission.name}`}
          recruitmentUnitName={susiKyokwa.name || "-"}
          badges={
            susiKyokwa.admission.subtypes.map((n) => n.id).join(",") || ""
          }
          risk={subjectRisk || undefined}
        />

        <SubjectRiskSection
          myGrade={myGrade}
          susiKyokwa={susiKyokwa}
          userName={currentUser?.nickname || ""}
          subjectRisk={subjectRisk}
        />

        <RecentGradeAnalysisSection
          myGrade={myGrade}
          susiKyokwa={susiKyokwa}
        />

        <PassFailAnalysisSection passRecords={passRecords || []} />

        <SusiKyokwaDetailSection susiKyokwa={susiKyokwa} />
      </div>
    </div>
  );
};
