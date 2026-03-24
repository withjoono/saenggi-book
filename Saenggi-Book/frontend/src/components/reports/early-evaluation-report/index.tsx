import { useCallback } from "react";
import { EvaluationJinro } from "./evaluation-jinro";
import { EvaluationHakup } from "./evaluation-hakup";
import { EvaluationGongDong } from "./evaluation-gongdong";
import { EvaluationETC } from "./evaluation-etc";
import { EvaluationSummary } from "./evaluation-summary";
import { Separator } from "@/components/ui/separator";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetOfficerEvaluation } from "@/stores/server/features/susi/evaluation/queries";
import { IOfficerEvaluationComment } from "@/stores/server/features/susi/evaluation/interfaces";
import { EvaluationGrade } from "./evaluation-grade";
import {
  IMajorFieldData,
  IMidFieldData,
  IMinorFieldData,
} from "@/stores/server/features/static-data/interfaces";
import { calculateEvaluationBasicScore } from "@/lib/calculations/evaluation/basic-score";

interface EarlyEvaluationReportProps {
  evaluationId: number;
  majorField: IMajorFieldData | null;
  midField: IMidFieldData | null;
  minorField: IMinorFieldData | null;
  isSelf?: boolean;
}

export const EarlyEvaluationReport = ({
  evaluationId,
  majorField,
  midField,
  minorField,
  isSelf,
}: EarlyEvaluationReportProps) => {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: evaluation } = useGetOfficerEvaluation(evaluationId);

  // 3/4대 비교과 평균점수
  const scoreAvgs = calculateEvaluationBasicScore(evaluation);
  const getComment = useCallback(
    (type: string): string => {
      try {
        const result =
          evaluation?.comments?.filter(
            (n: IOfficerEvaluationComment) => n.mainSurveyType === type,
          ) || [];
        return 0 < result.length ? result[0].comment : "";
      } catch (e) {
        return "";
      }
    },
    [evaluation],
  );

  return (
    <div className="pb-20">
      <div className="space-y-6 md:space-y-12">
        <div className="flex flex-col items-center justify-center gap-2">
          <h3 className="text-2xl font-semibold">
            {currentUser?.nickname}님의 생기부 {isSelf ? "자가평가" : "평가"}{" "}
            결과
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>대계열: </span>
              <p className="font-semibold text-primary">
                {majorField?.name || "알수없음"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>중계열: </span>
              <p className="font-semibold text-primary">
                {midField?.name || "알수없음"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>소계열: </span>
              <p className="font-semibold text-primary">
                {minorField?.name || "알수없음"}
              </p>
            </div>
          </div>
        </div>
        <EvaluationGrade />
        <Separator />
        <EvaluationSummary scoreAvgs={scoreAvgs} />
        <Separator />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold md:text-2xl">
            {isSelf ? "📝 자가평가" : "📝 사정관 평가 및 코멘트"}
          </h2>
          <p className="text-foreground/60">
            {isSelf
              ? "내 생기부를 자가 평가한 내용입니다. 자가 평가로도 학종 전형을 탐색할 수 있지만 정확도가 떨어질 수 있으니, 나에게 맞는 학종 전형 예측을 위해 사정관 평가를 진행해주세요!"
              : "사정관이 내 생기부를 신청한 계열에 따라 여러 복합적인 요소와 합불 자료등을 참고하여 평가한 내용입니다. 코멘트를 참고해서 나에게 맞는 학종 전형을 탐색해보세요!"}
          </p>
        </div>
        <EvaluationJinro
          evaluation={evaluation}
          comment={getComment("JINRO")}
          scoreAvgs={scoreAvgs}
        />
        <Separator />
        <EvaluationHakup
          evaluation={evaluation}
          comment={getComment("HAKUP")}
          scoreAvgs={scoreAvgs}
        />
        <Separator />
        <EvaluationGongDong
          evaluation={evaluation}
          comment={getComment("GONGDONG")}
          scoreAvgs={scoreAvgs}
        />
        <Separator />
        <EvaluationETC
          evaluation={evaluation}
          comment={getComment("ETC")}
          scoreAvgs={scoreAvgs}
        />
      </div>
    </div>
  );
};
