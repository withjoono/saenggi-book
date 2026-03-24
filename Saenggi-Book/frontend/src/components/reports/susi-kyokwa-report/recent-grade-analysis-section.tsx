import { useMemo } from "react";
import { RecentGradeCutChart } from "@/components/score-visualizations/recent-grade-cut-chart";
import { IExploreSusiKyokwaDetailResponse } from "@/stores/server/features/explore/susi-kyokwa/interfaces";

interface RecentGradeAnalysisSectionProps {
  myGrade?: number;
  susiKyokwa: IExploreSusiKyokwaDetailResponse;
}

export const RecentGradeAnalysisSection = ({
  myGrade,
  susiKyokwa,
}: RecentGradeAnalysisSectionProps) => {
  const chartData = useMemo(() => {
    if (!susiKyokwa) return null;

    return susiKyokwa.previousResults
      .filter((item) => item.gradeCut !== null)
      .map((item) => {
        return {
          year: item.year,
          ranking: Number(item.gradeCut) || 9,
        };
      });
  }, [susiKyokwa]);

  return (
    <section className="space-y-2">
      <h3 className="text-xl">최근 입결 분석</h3>
      <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-2">
        <RecentGradeCutChart
          data={chartData || []}
          myGrade={myGrade}
          className="h-[400px] w-full"
        />
        <div className="mx-auto flex max-w-xl flex-wrap items-start justify-start gap-2 text-sm sm:text-base">
          <div className="grid w-full grid-cols-4 text-sm">
            <p>년도</p>
            <p>등급</p>
            <p>경쟁률</p>
            <p>충원인원</p>
          </div>
          {susiKyokwa.previousResults.map((item, idx) => {
            return (
              <div key={idx} className="grid w-full grid-cols-4 font-bold">
                <p>{item.year}</p>
                <p>{parseFloat(item.gradeCut + "") || "-"}</p>
                <p>{parseFloat(item.competitionRatio + "") || "-"}</p>
                <p>{parseFloat(item.recruitmentNumber + "") || "-"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
