import { EvaluationScoreChart } from "@/components/score-visualizations/evaluation-score-chart";
import { NonSubjectGradeDisplay } from "@/components/score-visualizations/non-subject-grade-display";
import { Separator } from "@/components/ui/separator";
import { ICalculatedEvaluationBasicScore } from "@/lib/calculations/evaluation/basic-score";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";
import { IOfficerEvaluationComment } from "@/stores/server/features/susi/evaluation/interfaces";
import { useMemo } from "react";

interface EvaluationETCProps {
  scoreAvgs: ICalculatedEvaluationBasicScore;
  evaluation?: {
    comments: IOfficerEvaluationComment[];
    scores: Record<string, number>;
  };
  comment?: string;
}

export const EvaluationETC = ({
  scoreAvgs,
  evaluation,
  comment,
}: EvaluationETCProps) => {
  const data_5comp = useMemo(() => {
    return [
      {
        name: "자기주도성",
        value: scoreAvgs.etcAvg1,
      },
      {
        name: "경험의 다양성",
        value: scoreAvgs.etcAvg2,
      },
      {
        name: "창의적 문제해결력",
        value: scoreAvgs.etcAvg3,
      },
      {
        name: "교직 적합성 및 잠재력",
        value: scoreAvgs.etcAvg4,
      },
      {
        name: "다문화글로벌 역량",
        value: scoreAvgs.etcAvg5,
      },
    ];
  }, [scoreAvgs]);

  const processedData5Comp = useMemo(() => {
    return data_5comp.map((item) => {
      return {
        ...item,
        score: Math.min((item.value / 7) * 100, 100),
      };
    });
  }, [data_5comp]);

  return (
    <div className="mx-auto w-full max-w-screen-lg space-y-8">
      <h2 className="text-xl font-semibold md:pb-4 md:text-2xl">기타 역량</h2>

      <div className="flex w-full flex-col items-center gap-0 lg:flex-row lg:gap-6">
        <EvaluationScoreChart data={processedData5Comp} className="h-[200px]" />
        <NonSubjectGradeDisplay
          mainGrade={convertEvaluationScoreToGrade(scoreAvgs.etcAvg)}
          gradeLabel="기타 역량"
        />
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">자기주도성</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>26 - 교내 다양한 활동에서 주도적, 적극적으로 활동을 수행하는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[26] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>27 - 새로운 과제를 주도적으로 만들고 성과를 내었는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[27] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            28 - 기존에 경험한 내용을 바탕으로 스스로 외연을 확장하려고
            노력하였는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[28] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">경험의 다양성</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            29 - 자율, 동아리, 봉사, 진로활동 등 체험활동을 통해 다양한 경험을
            쌓았는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[29] || 0)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            30 - 독서활동을 통해 다양한 영역에서 지식과 문화적 소양을 쌓았는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[30] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>31 - 예체능 영역에서 적극적이고 성실하게 참여하였는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[31] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>32 - 자신의 목표를 위해 도전한 경험을 통해 성취한 적이 있는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[32] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">창의적 문제해결력</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            33 - 교내 행동 과정에서 창의적인 발상을 통해 일을 진행한 경험이
            있는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[33] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            34 - 교내 활동 과정에서 나타나는 문제점을 적극적으로 해결하기 위해
            노력 하였는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[34] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>35 - 주어진 교육환경을 극복하거나 충분히 활용한 경험이 있는가?</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[35] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">
          교직 적합성 및 잠재력
        </h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            36 - 교직에 대한 흥미와 관심: 교직에 대한 적극적인 모습과 알고 있는
            정도 및 교원양성기관 진학을 위한 노력 정도
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[36] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            37 - 교직 수행을 위한 다양한 경험: 교직에 대한 관심을 갖고 본인이
            참여한 활동, 과정을 통해 얻은 다양한 경험
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[37] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            38 - 교직 활동을 위한 리더십 및 자기주도성: 공동체 활동에 참여하여,
            구성원을 긍정적인 방향으로 변화시킨 경험과 교직 관련 활동에서
            능동적으로 주도하려는 태도, 가치관, 역량
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[38] || 0)}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg font-semibold md:text-xl">다문화글로벌 역량</h3>
        <Separator />
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>39 - 다문화 역량, 글로벌 역량</p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[39] || 0)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-base md:gap-20 md:text-lg">
          <p>
            40 - 지역 및 세계 속 공동체의 일원으로서 환경, 기아, 빈곤, 인권과
            같은 범지구적 공동체 문제에 관심을 가지고 문제 해결에 참여하고자
            하는가?
          </p>
          <p className="w-10 shrink-0 text-primary">
            {convertEvaluationScoreToGrade(evaluation?.scores[40] || 0)}
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
