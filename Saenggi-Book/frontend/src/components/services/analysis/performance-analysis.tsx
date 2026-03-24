import { RequireSchoolRecordScoraeMessage } from "@/components/errors/require-schoolrecord-score";
import { useGetSchoolRecords } from "@/stores/server/features/me/queries";
import { PerformanceAnalysis1 } from "./analysis-1";
import { PerformanceAnalysis2 } from "./analysis-2";
import { PerformanceAnalysis3 } from "./analysis-3";
import { PerformanceAnalysis4 } from "./analysis-4";
import { PerformanceAnalysis5 } from "./analysis-5";
import { PerformanceAnalysis6 } from "./analysis-6";

export const PerformanceAnalysis = () => {
  const { data } = useGetSchoolRecords();

  const isExistData =
    data && data.subjects.length !== 0 && data.selectSubjects.length !== 0;
  return (
    <div>
      <p className="pb-2 text-center text-2xl font-semibold md:text-3xl">
        성적 분석
      </p>
      <p className="pb-8 text-center text-sm text-foreground/70">
        내 생기부의 성적 분석 페이지입니다.
      </p>

      {!isExistData && <RequireSchoolRecordScoraeMessage />}

      {isExistData && (
        <div className="space-y-8">
          <PerformanceAnalysis1
            subjects={data.subjects}
            className="max-w-screen-md"
          />
          <PerformanceAnalysis2 subjects={data.subjects} />
          <PerformanceAnalysis3 subjects={data.subjects} />
          <PerformanceAnalysis4 subjects={data.subjects} />
          <PerformanceAnalysis5
            selectSubjects={data.selectSubjects}
            className="max-w-screen-md"
          />
          <PerformanceAnalysis6 selectSubjects={data.selectSubjects} />
        </div>
      )}
    </div>
  );
};
