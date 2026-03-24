import { EvaluationScoreChart } from "@/components/score-visualizations/evaluation-score-chart";
import { NonSubjectGradeDisplay } from "@/components/score-visualizations/non-subject-grade-display";
import { Separator } from "@/components/ui/separator";
import { ICalculatedEvaluationBasicScore } from "@/lib/calculations/evaluation/basic-score";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";
import { IOfficerEvaluationComment } from "@/stores/server/features/susi/evaluation/interfaces";
import { useMemo } from "react";

interface EvaluationGongDongProps {
  scoreAvgs: ICalculatedEvaluationBasicScore;
  evaluation?: {
    comments: IOfficerEvaluationComment[];
    scores: Record<string, number>;
  };
  comment?: string;
}

export const EvaluationGongDong = ({
  scoreAvgs,
  evaluation,
  comment,
}: EvaluationGongDongProps) => {
  const data_4comp = useMemo(() => {
    return [
      {
        name: "협업과 소통능력",
        value: scoreAvgs.gongdongAvg1,
      },
      {
        name: "나눔과 배려",
        value: scoreAvgs.gongdongAvg2,
      },
      {
        name: "성실성과 규칙준수",
        value: scoreAvgs.gongdongAvg3,
      },
      {
        name: "리더십",
        value: scoreAvgs.gongdongAvg4,
      },
    ];
  }, [scoreAvgs]);

  const processedData4Comp = useMemo(() => {
    return data_4comp.map((item) => {
      return {
        ...item,
        score: Math.min((item.value / 7) * 100, 100),
      };
    });
  }, [data_4comp]);

  return (
    <div className="mx-auto w-full max-w-screen-lg space-y-8">
      <h2 className="text-xl font-semibold md:pb-4 md:text-2xl">공동체 역량</h2>

      <div className="flex w-full flex-col items-center gap-0 lg:flex-row lg:gap-6">
        <EvaluationScoreChart data={processedData4Comp} className="h-[200px]" />
        <NonSubjectGradeDisplay
          mainGrade={convertEvaluationScoreToGrade(scoreAvgs.gongdongAvg)}
          gradeLabel="공동체 역량"
        />
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">협업과 소통능력</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            16 - 단체 활동 과정에서 서로 돕고 함께 행동하는 모습이 보이는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[16] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            17 - 구성원들과 협력을 통하여 공동의 과제를 수행하고 완성한 경험이
            있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[17] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            18 - 타인의 의견에 공감하고 수용하는 태도를 보이며, 자신의 정보와
            생각을 잘 전달하는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[18] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">나눔과 배려</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>19 - 학교생활 속에서 나눔을 생활화한 경험이 있는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[19] || 0)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            20 - 타인을 위하여 양보하거나 배려를 실천한 구체적 경험이 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[20] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>21 - 상대를 이해하고 존중하는 노력을 기울이고 있는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[21] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">성실성과 규칙준수</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            22 - 교내 활동에서 자신이 맡은 역할에 최선을 다하려고 노력한 경험이
            있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[22] || 0)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>23 - 자신이 속한 공동체가 정한 규칙과 규정을 준수하고 있는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[23] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">리더십</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            24 - 공동체의 목표를 달성하기 위해 계획하고 실행을 주도한 경험이
            있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[24] || 0)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            25 - 구성원들의 인정과 신뢰를 바탕으로 참여를 이끌어내고 조율한
            경험이 있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[25] || 0)}
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
