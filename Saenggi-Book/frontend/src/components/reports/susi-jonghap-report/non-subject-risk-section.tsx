import { RiskBadge } from "@/components/custom/risk-badge";
import { EvaluationRadarChart } from "@/components/score-visualizations/evaluation-radar-chart";
import { EvaluationScoreChart } from "@/components/score-visualizations/evaluation-score-chart";
import { EvaluationScoreStackChart } from "@/components/score-visualizations/evaluation-score-stack-chart";
import { Separator } from "@/components/ui/separator";
import { calculateEvaluationRisk } from "@/lib/calculations/evaluation/risk";
import { calculateEvaluationScore } from "@/lib/calculations/evaluation/score";
import { getUnivLevelByCode } from "@/lib/utils/services/university";
import { IExploreSusiJonghapDetailResponse } from "@/stores/server/features/explore/susi-jonghap/interfaces";
import { IEvaluationFactorScore } from "@/stores/server/features/susi/evaluation/interfaces";

interface NonSubjectRiskSectionProps {
  susiJonghap: IExploreSusiJonghapDetailResponse;
  evaluationScores: Record<string, IEvaluationFactorScore>;
  userName: string;
}

export const NonSubjectRiskSection = ({
  susiJonghap,
  evaluationScores,
  userName,
}: NonSubjectRiskSectionProps) => {
  const myScores = calculateEvaluationScore({
    myEvaluationFactorScore: evaluationScores,
    codes:
      susiJonghap.admission_method.school_record_evaluation_elements ||
      "",
    ratios:
      susiJonghap.admission_method.school_record_evaluation_score || "",
  });

  const univLevel = getUnivLevelByCode(
    susiJonghap.university.code || "",
    susiJonghap.general_field.name || "",
  );
  // 비교과 위험도
  const nonSubjectRisk = calculateEvaluationRisk(
    (myScores.totalScore / 100) * 7,
    univLevel,
  );

  // 차트데이터 생성
  const chartData = myScores.items
    .map((n) => {
      return {
        name: n.text,
        score: Math.min(n.score, 100),
        standard: ((7 - univLevel) / 7) * 100,
      };
    })
    ?.filter((n) => n !== null);

  return (
    <section className="">
      <div className="grid grid-cols-1 items-start gap-4 gap-y-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-l-4 border-primary pl-2 text-xl md:text-2xl">
            <span className="font-semibold">비교과 위험도</span>
            {nonSubjectRisk ? (
              <RiskBadge risk={Math.floor(nonSubjectRisk)} />
            ) : (
              <p className="">😴 성적X</p>
            )}
          </div>
          <p className="text-sm text-foreground/60 md:text-base">
            <b className="text-primary">{userName}</b>님의 교과 위험도
            예측입니다.
          </p>
          <div className="w-full space-y-2 pt-4 text-sm sm:text-base">
            <div className="grid w-full grid-cols-3 text-sm text-primary">
              <p>구분</p>
              <p>배점</p>
              <p>내점수</p>
            </div>
            {myScores.items.map((n) => {
              return (
                <div key={n.text} className="grid w-full grid-cols-3 font-bold">
                  <p className="line-clamp-2">{n.text}</p>
                  <p>{n.ratio}</p>
                  <p>{n.adjustedScore.toFixed(2)}</p>
                </div>
              );
            })}
            <Separator />
            <div className="grid w-full grid-cols-3 font-bold">
              <p>총점</p>
              <p>100</p>
              <p>{myScores.totalScore.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {chartData.length ? (
          <EvaluationRadarChart data={chartData} className="h-[300px]" />
        ) : null}
      </div>

      {chartData.length ? (
        <div className="hidden w-full grid-cols-2 items-center space-x-2 px-4 py-10 md:grid">
          <EvaluationScoreStackChart data={chartData} className="h-[300px]" />
          <EvaluationScoreChart data={chartData} className="h-[300px]" />
        </div>
      ) : null}
    </section>
  );
};
