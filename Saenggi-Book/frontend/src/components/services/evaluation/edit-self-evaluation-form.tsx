import {
  useGetOfficerEvaluation,
  useGetOfficerEvaluationList,
  useGetOfficerEvaluationSurvey,
} from "@/stores/server/features/susi/evaluation/queries";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SeriesSelector } from "./series-selector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button, buttonVariants } from "@/components/custom/button";
import { useSelfEvaluation } from "@/stores/server/features/susi/evaluation/mutations";
import { cn } from "@/lib/utils";
import { RowSeriesSearch } from "@/components/row-series-search";
import { ICompatibilityData } from "@/constants/compatibility-series";

interface EditSelfEvaluationFormProps {
  evaluationId?: number;
  series?: string;
}

export const EditSelfEvaluationForm = ({
  evaluationId,
  series,
}: EditSelfEvaluationFormProps) => {
  // Queries
  const { refetch: refetchEvaluationList } = useGetOfficerEvaluationList();
  const { data: evaluation, refetch: refetchEvaluation } =
    useGetOfficerEvaluation(evaluationId);
  const { data: survey } = useGetOfficerEvaluationSurvey();

  // Mutations
  const selfEvaluation = useSelfEvaluation();

  const navigate = useNavigate();

  const [selectedSeries, setSelectedSeries] = useState({
    grandSeries: series?.split(">")[0] || "",
    middleSeries: series?.split(">")[1] || "",
    rowSeries: series?.split(">")[2] || "",
  });

  const [searchSeries, setSearchSeries] = useState<ICompatibilityData | null>(
    null,
  );

  const [scores, setScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (evaluation) {
      setScores(evaluation.scores);
    }
  }, [evaluation]);

  useEffect(() => {
    if (survey && Object.keys(scores).length === 0) {
      const initialScores = survey.reduce(
        (acc, item) => {
          acc[item.id] = evaluation?.scores[item.id] || 3; // 기본 점수를 3로 설정
          return acc;
        },
        {} as Record<number, number>,
      );
      setScores(initialScores);
    }
    // scores는 의도적으로 제외 (초기화 시에만 실행)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey, evaluation]);

  useEffect(() => {
    if (searchSeries) {
      setSelectedSeries({
        grandSeries: searchSeries.grandSeries,
        middleSeries: searchSeries.middleSeries,
        rowSeries: searchSeries.rowSeries,
      });
    }
  }, [searchSeries]);

  const handleScoreChange = (surveyId: number, score: number) => {
    setScores((prevScores) => ({
      ...prevScores,
      [surveyId]: score,
    }));
  };

  async function handleSubmit() {
    if (
      !selectedSeries.grandSeries ||
      !selectedSeries.middleSeries ||
      !selectedSeries.rowSeries
    ) {
      toast.error("🚨 계열을 선택해주세요!");
      return;
    }
    const updateData = Object.entries(scores).map(([surveyId, score]) => ({
      surveyId: Number(surveyId),
      score,
    }));

    const series = `${selectedSeries.grandSeries}>${selectedSeries.middleSeries}>${selectedSeries.rowSeries}`;

    const result = await selfEvaluation.mutateAsync({
      series,
      scores: updateData,
    });

    if (result.success) {
      toast.success("성공적으로 자가 평가를 업데이트 했습니다.");
      await refetchEvaluation();
      await refetchEvaluationList();
      navigate({ to: "/evaluation/self" });
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="pb-20">
      {/* 평가점수 */}
      <div className="space-y-4">
        <div className="space-y-4 py-12">
          <RowSeriesSearch
            selectedSeries={searchSeries}
            setSelectedSeries={setSearchSeries}
            className="mx-auto max-w-sm"
          />
          <SeriesSelector
            selectedSeries={selectedSeries}
            setSelectedSeries={setSelectedSeries}
          />
        </div>
        <div className="flex items-center border-b py-4 text-lg">
          <h4 className="w-full font-semibold">평가항목</h4>
          <div className="hidden w-80 shrink-0 items-center justify-between lg:flex">
            <p>A+</p>
            <p>A</p>
            <p>B+</p>
            <p>B</p>
            <p>C+</p>
            <p>C</p>
            <p>D</p>
          </div>
        </div>
        <div className="">
          {survey?.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-y-4 border-b py-2 hover:bg-accent hover:text-accent-foreground lg:flex-row"
              >
                <div className="w-full font-semibold lg:pr-8">
                  {item.id} - {item.evaluate_content}
                </div>
                <RadioGroup
                  onValueChange={(value) =>
                    handleScoreChange(item.id, Number(value))
                  }
                  value={scores[item.id]?.toString() || "3"}
                  className="flex w-full max-w-80 shrink-0 items-center justify-between"
                >
                  <div>
                    <RadioGroupItem value="7" id="7" />
                    <p className="text-sm lg:hidden">A+</p>
                  </div>
                  <div>
                    <RadioGroupItem value="6" id="6" />
                    <p className="text-sm lg:hidden">A</p>
                  </div>
                  <div>
                    <RadioGroupItem value="5" id="5" />
                    <p className="text-sm lg:hidden">B+</p>
                  </div>
                  <div>
                    <RadioGroupItem value="4" id="4" />
                    <p className="text-sm lg:hidden">B</p>
                  </div>
                  <div>
                    <RadioGroupItem value="3" id="3" />
                    <p className="text-sm lg:hidden">C+</p>
                  </div>
                  <div>
                    <RadioGroupItem value="2" id="2" />
                    <p className="text-sm lg:hidden">C</p>
                  </div>
                  <div>
                    <RadioGroupItem value="1" id="1" />
                    <p className="text-sm lg:hidden">D</p>
                  </div>
                </RadioGroup>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 pt-16">
          <Link
            to="/evaluation/self"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            뒤로가기
          </Link>
          <Button onClick={handleSubmit}>저장하기</Button>
        </div>
      </div>
    </div>
  );
};
