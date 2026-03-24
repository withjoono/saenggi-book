import { EvaluationScoreChart } from "@/components/score-visualizations/evaluation-score-chart";
import { NonSubjectGradeDisplay } from "@/components/score-visualizations/non-subject-grade-display";
import { Separator } from "@/components/ui/separator";
import { ICalculatedEvaluationBasicScore } from "@/lib/calculations/evaluation/basic-score";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";
import { IOfficerEvaluationComment } from "@/stores/server/features/susi/evaluation/interfaces";
import { useMemo } from "react";

interface EvaluationHakupProps {
  scoreAvgs: ICalculatedEvaluationBasicScore;
  evaluation?: {
    comments: IOfficerEvaluationComment[];
    scores: Record<string, number>;
  };
  comment?: string;
}

export const EvaluationHakup = ({
  scoreAvgs,
  evaluation,
  comment,
}: EvaluationHakupProps) => {
  const data_3comp = useMemo(() => {
    return [
      {
        name: "협업과 소통능력",
        value: scoreAvgs.hakupAvg1,
      },
      {
        name: "나눔과 배려",
        value: scoreAvgs.hakupAvg2,
      },
      {
        name: "성실성과 규칙준수",
        value: scoreAvgs.hakupAvg3,
      },
    ];
  }, [scoreAvgs]);

  const processedData3Comp = useMemo(() => {
    return data_3comp.map((item) => {
      return {
        ...item,
        score: Math.min((item.value / 7) * 100, 100),
      };
    });
  }, [data_3comp]);

  return (
    <div className="mx-auto w-full max-w-screen-lg space-y-8">
      <h2 className="text-xl font-semibold md:pb-4 md:text-2xl">학업 역량</h2>

      <div className="flex w-full flex-col items-center gap-0 lg:flex-row lg:gap-6">
        <EvaluationScoreChart data={processedData3Comp} className="h-[200px]" />
        <NonSubjectGradeDisplay
          mainGrade={convertEvaluationScoreToGrade(scoreAvgs.hakupAvg)}
          gradeLabel="학업 역량"
        />
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">학업성취도</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            8 - 대학 수학에 필요한 기본 교과목(예 : 국어, 수학, 영어, 사회/과학
            등)의 교과성적은 적절한가? 그 외 교과목(예 : 예술, 체육,
            기술가정/정보, 제2외국어/한문, 교양 등)의 교과성적은 어느정도인가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[8] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>9 - 학기별/학년별 성적의 추이는 어떠한가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[9] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">학업태도</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            10 - 성취동기와 목표의식을 가지고 자발적으로 학습하려는 의지가
            있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[10] || 0)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            11 - 새로운 지식을 획득하기 위해 자기주도적으로 노력하고 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[11] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            12 - 교과 수업에 적극적으로 참여해 수업 내용을 이해하려는 태도와
            열정이 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[12] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">탐구력</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            13 - 교과와 각종 탐구 활동 등을 통해 지식을 화강하려고 노력하고
            있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[13] || 0)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>14 - 교과와 각종 탐구 활동에서 구체적인 성과를 보이고 있는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[14] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            15 - 교내 활동에서 학문에 대한 열의와 지적 관심이 드러나고 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[15] || 0)}
          </p>
        </div>
      </div>

      {comment ? (
        <div className="space-y-4 py-12">
          <h3 className="text-lg font-semibold md:text-xl">🧑‍🏫 사정관 코멘트</h3>
          <p className="text-wrap break-all">{comment}</p>
        </div>
      ) : null}
    </div>
  );
};
