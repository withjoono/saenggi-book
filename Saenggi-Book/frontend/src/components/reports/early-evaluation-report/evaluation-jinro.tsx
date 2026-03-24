import { EvaluationScoreChart } from "@/components/score-visualizations/evaluation-score-chart";
import { NonSubjectGradeDisplay } from "@/components/score-visualizations/non-subject-grade-display";
import { Separator } from "@/components/ui/separator";
import { ICalculatedEvaluationBasicScore } from "@/lib/calculations/evaluation/basic-score";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";
import { IOfficerEvaluationComment } from "@/stores/server/features/susi/evaluation/interfaces";
import { useMemo } from "react";

interface EvaluationJinroProps {
  scoreAvgs: ICalculatedEvaluationBasicScore;
  evaluation?: {
    comments: IOfficerEvaluationComment[];
    scores: Record<string, number>;
  };
  comment?: string;
}

export const EvaluationJinro = ({
  scoreAvgs,
  evaluation,
  comment,
}: EvaluationJinroProps) => {
  const data_3comp = useMemo(() => {
    return [
      {
        name: "전공(계열) 관련 교과 이수 노력",
        value: scoreAvgs.jinroAvg1,
      },
      {
        name: "전공(계열) 관련 교과 성취도",
        value: scoreAvgs.jinroAvg2,
      },
      {
        name: "진로 탐색 활동과 경험",
        value: scoreAvgs.jinroAvg3,
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
      <h2 className="text-xl font-semibold md:pb-4 md:text-2xl">진로 역량</h2>

      <div className="flex w-full flex-col items-center gap-0 lg:flex-row lg:gap-6">
        <EvaluationScoreChart data={processedData3Comp} className="h-[200px]" />
        <NonSubjectGradeDisplay
          mainGrade={convertEvaluationScoreToGrade(scoreAvgs.jinroAvg)}
          gradeLabel="진로 역량"
        />
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">
          전공(계열) 관련 교과 이수 노력
        </h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            1 - 전공(계열)과 관련된 과목을 적절하게 선택하고, 이수한 과목은
            얼마나 되는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[1] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            2 - 전공(계열)과 관련된 과목을 이수하기 위하여 추가적인 노력을
            하였는가?
            <br />
            (예 : 공동교육과정, 온라인수업, 소인수과목 등)
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[2] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            3 - 선택과목(일반/진로)은 교과목 학습단계(위계)에 따라 이수하였는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[3] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">
          전공(계열) 관련 교과 성취도
        </h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            4 - 전공(계열)과 관련된 과목의 석차등급/성취도, 원점수, 평균,
            표준편차, 이수단위, 수강자수, 성취도별 분포비율등을 종합적으로
            고려한 성취수준은 적절한가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[4] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            5 - 전공(계열)과 관련된 동일 교과 내 일반선택과목 대비
            진로선택과목의 성취수준은 어떠한가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[5] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">
          진로 탐색 활동과 경험
        </h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            6 - 자신의 관심 분야나 흥미와 관련한 다양한 활동에 참여하여 노력한
            경험이 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[6] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            7 - 교과 활동이나 창의적 체험활동에서 전공(계열)에 대한 관심을
            가지고 탐색한 경험이 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[7] || 0)}
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
