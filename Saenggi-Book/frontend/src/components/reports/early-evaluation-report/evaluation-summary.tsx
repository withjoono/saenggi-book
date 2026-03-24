import { Button } from "@/components/custom/button";
import { EvaluationRadarChart } from "@/components/score-visualizations/evaluation-radar-chart";
import { EvaluationScoreChart } from "@/components/score-visualizations/evaluation-score-chart";
import { EvaluationScoreStackChart } from "@/components/score-visualizations/evaluation-score-stack-chart";
import { NonSubjectGradeDisplay } from "@/components/score-visualizations/non-subject-grade-display";
import { ICalculatedEvaluationBasicScore } from "@/lib/calculations/evaluation/basic-score";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

interface EvaluationSummaryProps {
  scoreAvgs: ICalculatedEvaluationBasicScore;
}

export const EvaluationSummary = ({ scoreAvgs }: EvaluationSummaryProps) => {
  const [mode, setMode] = useState<"3" | "4">("3");

  const data_4comp = useMemo(() => {
    return [
      {
        name: "발전가능성",
        value: scoreAvgs.etcAvg,
      },
      {
        name: "인성",
        value: scoreAvgs.gongdongAvg,
      },
      {
        name: "전공적합성",
        value: scoreAvgs.jinroAvg,
      },
      {
        name: "학업역량",
        value: scoreAvgs.hakupAvg,
      },
    ];
  }, [scoreAvgs]);

  const data_3comp = useMemo(() => {
    return [
      {
        name: "진로역량",
        value: scoreAvgs.jinroAvg,
      },
      {
        name: "학업역량",
        value: scoreAvgs.hakupAvg,
      },
      {
        name: "공동체역량",
        value: scoreAvgs.gongdongAvg,
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

  const processedData4Comp = useMemo(() => {
    return data_4comp.map((item) => {
      return {
        ...item,
        score: Math.min((item.value / 7) * 100, 100),
      };
    });
  }, [data_4comp]);

  const totalAvg3 = processedData3Comp.reduce((acc, n) => acc + n.score, 0);
  const totalAvg4 = processedData4Comp.reduce((acc, n) => acc + n.score, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold md:text-2xl">📊 주요 평가</h2>
        <p className="text-foreground/60">
          대학에서 가장 많이보는 유형을 기준으로 평가한 내용이에요.{" "}
          <Link to="/ms/comprehensive" className="text-blue-500">
            학종 분석 및 대학 찾기 서비스
          </Link>
          에서는 내 평가 점수를 바탕으로 대학별 평가요소에 맞춰 각각 계산하기
          때문에 대략적인 참고로 봐주세요!
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() => setMode("3")}
          variant={mode === "3" ? "default" : "outline"}
        >
          3대 평가
        </Button>
        <Button
          type="button"
          onClick={() => setMode("4")}
          variant={mode === "4" ? "default" : "outline"}
        >
          4대 평가
        </Button>
      </div>

      {mode === "3" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-end space-x-2 text-xl md:pb-4">
              <p>내 점수: </p>
              <p className="text-3xl font-semibold text-primary">
                {totalAvg3.toFixed(2)} / 300
              </p>
              <p>점</p>
            </div>
            <div className="flex items-end space-x-2 text-xl md:pb-4">
              <p>내 비교과 등급: </p>
              <p className="text-3xl font-semibold text-primary">
                {convertEvaluationScoreToGrade(
                  (scoreAvgs.jinroAvg +
                    scoreAvgs.hakupAvg +
                    scoreAvgs.gongdongAvg) /
                    3,
                )}
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 items-center gap-2 gap-y-6 pb-6 lg:grid-cols-2">
            <EvaluationScoreChart
              data={processedData3Comp}
              className="h-[200px]"
            />
            <EvaluationRadarChart
              data={processedData3Comp}
              className="h-[200px]"
            />
            <EvaluationScoreStackChart
              data={processedData3Comp}
              className="h-[200px]"
            />
            <NonSubjectGradeDisplay
              className="mx-auto"
              mainGrade={convertEvaluationScoreToGrade(
                (scoreAvgs.jinroAvg +
                  scoreAvgs.hakupAvg +
                  scoreAvgs.gongdongAvg) /
                  3,
              )}
            />
          </div>
        </div>
      )}

      {mode === "4" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-end space-x-2 text-xl md:pb-4">
              <p>내 점수: </p>
              <p className="text-3xl font-semibold text-primary">
                {totalAvg4.toFixed(2)} / 400
              </p>
              <p>점</p>
            </div>

            <div className="flex items-end space-x-2 text-xl md:pb-4">
              <p>내 비교과 등급: </p>
              <p className="text-3xl font-semibold text-primary">
                {convertEvaluationScoreToGrade(
                  (scoreAvgs.jinroAvg +
                    scoreAvgs.hakupAvg +
                    scoreAvgs.gongdongAvg +
                    scoreAvgs.etcAvg) /
                    4,
                )}
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 items-center gap-2 gap-y-6 pb-6 lg:grid-cols-2">
            <EvaluationScoreChart
              data={processedData4Comp}
              className="h-[200px]"
            />
            <EvaluationRadarChart
              data={processedData4Comp}
              className="h-[200px]"
            />
            <EvaluationScoreStackChart
              data={processedData4Comp}
              className="h-[200px]"
            />
            <NonSubjectGradeDisplay
              className="mx-auto"
              mainGrade={convertEvaluationScoreToGrade(
                (scoreAvgs.jinroAvg +
                  scoreAvgs.hakupAvg +
                  scoreAvgs.gongdongAvg +
                  scoreAvgs.etcAvg) /
                  4,
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
