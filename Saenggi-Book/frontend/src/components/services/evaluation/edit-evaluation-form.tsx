/**
 * 평가자 평가 폼 (NestJS 마이그레이션 완료)
 */
import {
  useGetOfficerEvaluation,
  useGetOfficerEvaluationSurvey,
  useGetOfficerPendingEvaluations,
  officerQueryKeys,
} from "@/stores/server/features/susi/evaluation/queries";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEvaluationByOfficer } from "@/stores/server/features/susi/evaluation/mutations";
import { useQueryClient } from "@tanstack/react-query";

interface EditEvaluationFormProps {
  evaluationId: number;
}

export const EditEvaluationForm = ({ evaluationId }: EditEvaluationFormProps) => {
  // Queries
  const { data: survey, isLoading: surveyLoading, error: surveyError } = useGetOfficerEvaluationSurvey();
  const { data: pendingEvaluations } = useGetOfficerPendingEvaluations();
  const { data: existingEvaluation } = useGetOfficerEvaluation(evaluationId);

  // Mutations
  const evaluationByOfficer = useEvaluationByOfficer();
  const queryClient = useQueryClient();

  // 평가 요청 정보
  const evaluation = useMemo(() => {
    return pendingEvaluations?.find((e) => e.evaluationId === evaluationId);
  }, [pendingEvaluations, evaluationId]);

  const [scores, setScores] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  // 기존 평가 데이터 로드
  useEffect(() => {
    if (existingEvaluation && existingEvaluation.comments) {
      const commentMap: Record<string, string> = {};
      existingEvaluation.comments.forEach((c) => {
        commentMap[c.mainSurveyType] = c.comment;
      });
      setComments(commentMap);

      const scoreMap: Record<number, string> = {};
      Object.entries(existingEvaluation.scores).forEach(([surveyId, score]) => {
        scoreMap[Number(surveyId)] = String(score);
      });
      setScores(scoreMap);
    }
  }, [existingEvaluation]);

  const handleScoreChange = (surveyId: number, score: string) => {
    setScores((prevScores) => ({
      ...prevScores,
      [surveyId]: score,
    }));
  };

  const handleCommentChange = (mainSurveyType: string, value: string) => {
    setComments((prevComments) => ({
      ...prevComments,
      [mainSurveyType]: value,
    }));
  };

  // 평가 완료
  async function handleSubmit() {
    if (!evaluation) {
      toast.error("평가 정보를 찾을 수 없습니다.");
      return;
    }

    const updateScoreData = Object.entries(scores).map(([surveyId, score]) => ({
      surveyId: Number(surveyId),
      score: Number(score),
    }));
    const updateCommentData = Object.entries(comments)
      .filter(([, comment]) => comment && comment.trim().length > 0)
      .map(([mainSurveyType, comment]) => ({
        comment,
        mainSurveyType,
      }));

    if (survey && updateScoreData.length !== survey.length) {
      toast.error(`모든 설문 내용을 입력해주세요. (${updateScoreData.length}/${survey.length})`);
      return;
    }

    for (const n of updateCommentData) {
      if (n.comment.length < 10) {
        toast.error(`평가자 주석이 짧은 항목이 존재합니다. (최소 10글자) - ${n.mainSurveyType}`);
        return;
      }
    }

    try {
      const result = await evaluationByOfficer.mutateAsync({
        studentId: evaluation.studentId.toString(),
        series: evaluation.series,
        scores: updateScoreData,
        comments: updateCommentData,
        saveType: 1,
      });

      if (result.success) {
        toast.success("성공적으로 평가를 완료했습니다.");
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: officerQueryKeys.pending() });
        queryClient.invalidateQueries({ queryKey: [...officerQueryKeys.all, "list"] });
        queryClient.invalidateQueries({ queryKey: officerQueryKeys.evaluation(evaluationId) });
        navigate({ to: "/officer/apply" });
      } else {
        toast.error(result.error || "평가 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("평가 저장 에러:", error);
      toast.error("평가 저장에 실패했습니다.");
    }
  }

  // 임시 저장
  async function handleSubmitTemp() {
    if (!evaluation) {
      toast.error("평가 정보를 찾을 수 없습니다.");
      return;
    }

    const updateScoreData = Object.entries(scores).map(([surveyId, score]) => ({
      surveyId: Number(surveyId),
      score: Number(score),
    }));
    const updateCommentData = Object.entries(comments).map(
      ([mainSurveyType, comment]) => ({
        comment,
        mainSurveyType,
      }),
    );

    try {
      const result = await evaluationByOfficer.mutateAsync({
        studentId: evaluation.studentId.toString(),
        series: evaluation.series,
        scores: updateScoreData,
        comments: updateCommentData,
        saveType: 0,
      });

      if (result.success) {
        toast.info("성공적으로 임시저장을 완료했습니다.");
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: officerQueryKeys.pending() });
        queryClient.invalidateQueries({ queryKey: [...officerQueryKeys.all, "list"] });
        queryClient.invalidateQueries({ queryKey: officerQueryKeys.evaluation(evaluationId) });
        navigate({ to: "/officer/apply" });
      } else {
        toast.error(result.error || "임시저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("임시저장 에러:", error);
      toast.error("임시저장에 실패했습니다.");
    }
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">평가 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (surveyLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">평가 항목을 불러오는 중...</p>
      </div>
    );
  }

  if (surveyError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500">평가 항목을 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-muted-foreground mt-2">
          {surveyError instanceof Error ? surveyError.message : "알 수 없는 오류"}
        </p>
      </div>
    );
  }

  if (!survey || survey.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">평가 항목이 없습니다.</p>
      </div>
    );
  }

  // Group survey questions by main category
  const groupedSurvey = useMemo(() => {
    if (!survey) return {};

    const groups: Record<string, typeof survey> = {};
    survey.forEach((item) => {
      const category = item.mainCategory || '기타';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [survey]);

  return (
    <div className="pb-20">
      {/* 신청자 정보 */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-2xl font-semibold">
          신청자: {evaluation.studentName}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {evaluation.series.split(">").map((n, idx) => (
            <div key={`series-${idx}`} className="flex items-center gap-2 text-sm">
              <span>
                {idx === 0 ? "대계열: " : idx === 1 ? "중계열: " : "소계열: "}
              </span>
              <p className="font-semibold text-primary">
                {n}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 평가점수 - 대분류별로 그룹화 */}
      <div className="space-y-8 mt-8">
        {Object.entries(groupedSurvey).map(([category, questions]) => {
          // 첫 번째 질문의 mainSurveyType을 가져와서 해당 카테고리의 코멘트 키로 사용
          const mainSurveyType = questions[0]?.mainSurveyType || "";

          return (
            <div key={category} className="space-y-4">
              {/* 대분류 헤더 */}
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="text-xl font-bold text-primary">{category}</h4>
              </div>

              {/* 평가 항목 헤더 */}
              <div className="flex items-center border-b py-4 text-lg">
                <h5 className="w-full font-semibold">평가항목</h5>
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

              {/* 질문 목록 */}
              <div className="space-y-2">
                {questions.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center gap-y-4 border-b py-4 hover:bg-accent hover:text-accent-foreground lg:flex-row"
                    >
                      <div className="w-full lg:pr-8">
                        <div className="text-xs text-muted-foreground mb-1">
                          {item.middleCategory}
                        </div>
                        <div className="font-medium flex gap-2">
                          <span className="text-primary font-semibold shrink-0">
                            {item.orderNum}.
                          </span>
                          <span>{item.evaluateContent}</span>
                        </div>
                      </div>
                      <RadioGroup
                        onValueChange={(value) => handleScoreChange(item.id, value)}
                        value={scores[item.id] || ""}
                        className="flex w-full max-w-80 shrink-0 items-center justify-between"
                      >
                        <div>
                          <RadioGroupItem value="7" id={`${item.id}-7`} />
                          <p className="text-sm lg:hidden">A+</p>
                        </div>
                        <div>
                          <RadioGroupItem value="6" id={`${item.id}-6`} />
                          <p className="text-sm lg:hidden">A</p>
                        </div>
                        <div>
                          <RadioGroupItem value="5" id={`${item.id}-5`} />
                          <p className="text-sm lg:hidden">B+</p>
                        </div>
                        <div>
                          <RadioGroupItem value="4" id={`${item.id}-4`} />
                          <p className="text-sm lg:hidden">B</p>
                        </div>
                        <div>
                          <RadioGroupItem value="3" id={`${item.id}-3`} />
                          <p className="text-sm lg:hidden">C+</p>
                        </div>
                        <div>
                          <RadioGroupItem value="2" id={`${item.id}-2`} />
                          <p className="text-sm lg:hidden">C</p>
                        </div>
                        <div>
                          <RadioGroupItem value="1" id={`${item.id}-1`} />
                          <p className="text-sm lg:hidden">D</p>
                        </div>
                      </RadioGroup>
                    </div>
                  );
                })}
              </div>

              {/* 역량별 주석 */}
              {mainSurveyType && (
                <div className="mt-6 space-y-2">
                  <p className="text-lg font-semibold text-muted-foreground">
                    {category} 종합 의견
                  </p>
                  <Textarea
                    placeholder="이 역량에 대한 종합적인 평가 의견을 작성해주세요 (최소 10자)"
                    value={comments[mainSurveyType] || ""}
                    onChange={(e) => handleCommentChange(mainSurveyType, e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 저장 버튼 */}
      <div className="flex items-center justify-center gap-2 pt-16">
        <Link
          to="/officer/apply"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          뒤로가기
        </Link>
        <Button onClick={handleSubmitTemp} variant={"outline"}>
          임시저장
        </Button>
        <Button onClick={handleSubmit}>저장하기</Button>
      </div>
    </div>
  );
};
