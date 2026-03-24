import { AiEvaluationDetail } from "@/components/reports/ai-evaluation-detail";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetAiEvaluationHistory } from "@/stores/server/features/ai-evaluation/queries";
import type { IAiEvaluation } from "@/stores/server/features/ai-evaluation/interfaces";
import { IconSparkles, IconAlertTriangle } from "@tabler/icons-react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute(
  "/grade-analysis/_layout/evaluation-list",
)({
  component: AiEvaluationList,
});

/** 평가 내역에서 고유 학기 수를 계산 (4학기 = 2년 이상 필요) */
function countUniqueSemesters(evaluationList: IAiEvaluation[]): number {
  const semesterSet = new Set<string>();

  for (const evaluation of evaluationList) {
    if (evaluation.evalType === "comprehensive") {
      // 종합 평가: 해당 학년의 1학기, 2학기를 모두 커버
      semesterSet.add(`${evaluation.grade}-1`);
      semesterSet.add(`${evaluation.grade}-2`);
    } else if (evaluation.evalType === "semester" && evaluation.semester) {
      // 학기별 평가: 해당 학기만 커버
      semesterSet.add(`${evaluation.grade}-${evaluation.semester}`);
    }
  }

  return semesterSet.size;
}

const REQUIRED_SEMESTERS = 4; // 4학기 (2년)

function AiEvaluationList() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: evaluationList, isLoading } = useGetAiEvaluationHistory();

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 고유 학기 수 계산
  const uniqueSemesterCount = useMemo(() => {
    if (!evaluationList?.length) return 0;
    return countUniqueSemesters(evaluationList);
  }, [evaluationList]);

  const hasEnoughSemesters = uniqueSemesterCount >= REQUIRED_SEMESTERS;

  // 데이터 로드 시 최신 평가를 자동 선택 (4학기 이상일 때만)
  useEffect(() => {
    if (evaluationList?.length && selectedId === null && hasEnoughSemesters) {
      setSelectedId(evaluationList[0].id);
    }
  }, [evaluationList, selectedId, hasEnoughSemesters]);

  const selectedItem = useMemo(() => {
    return evaluationList?.find((n) => n.id === selectedId) ?? null;
  }, [evaluationList, selectedId]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">AI 생기부 평가 내역</h3>
        <p className="text-sm text-muted-foreground">
          AI 사정관이 분석한 생기부 평가 결과 목록입니다.
        </p>
        <p className="text-sm text-muted-foreground">
          평가 결과를 참고하여{" "}
          <Link className="text-blue-500" to="/grade-analysis/comprehensive">
            학종
          </Link>{" "}
          탭에서 나에게 맞는 대학을 탐색해보세요!
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>평가 내역을 불러오는 중...</span>
          </div>
        </div>
      ) : !evaluationList?.length ? (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <IconSparkles className="size-12 text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="font-medium">아직 평가 내역이 없습니다</p>
            <p className="text-sm text-muted-foreground">
              생기부를 업로드하고 AI 평가를 받아보세요!
            </p>
          </div>
        </Card>
      ) : !hasEnoughSemesters ? (
        /* 4학기 미만: 서비스 불가 안내 */
        <Card className="flex flex-col items-center gap-5 border-amber-200 bg-amber-50 p-10 text-center dark:border-amber-800 dark:bg-amber-950">
          <IconAlertTriangle className="size-14 text-amber-500" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">
              서비스 불가
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              수시 서비스를 이용하기 위해서는{" "}
              <strong>4학기 이상(2년)</strong>의 생기부 평가가 필요합니다.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              현재 <strong>{uniqueSemesterCount}학기</strong>의 평가만 완료되었습니다.
              <br />
              나머지 학기의 생기부를 평가한 후 이용해주세요.
            </p>
          </div>
          <Link
            to="/ms/evaluation"
            className={cn(
              "mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700",
            )}
          >
            <IconSparkles className="size-4" />
            생기부 평가하러 가기
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 평가 목록 (가로 스크롤) */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {evaluationList.map((evaluation) => (
              <EvaluationTab
                key={evaluation.id}
                evaluation={evaluation}
                isSelected={evaluation.id === selectedId}
                onClick={() => setSelectedId(evaluation.id)}
              />
            ))}
          </div>

          {/* 선택된 평가 상세 */}
          {selectedItem && <AiEvaluationDetail evaluation={selectedItem} />}
        </div>
      )}
    </div>
  );
}

function EvaluationTab({
  evaluation,
  isSelected,
  onClick,
}: {
  evaluation: IAiEvaluation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const totalScore =
    evaluation.totalScore ??
    evaluation.scoreAcademic +
      evaluation.scoreCareer +
      evaluation.scoreCommunity +
      evaluation.scoreOther;

  const evalTypeLabel =
    evaluation.evalType === "comprehensive" ? "종합" : "학기별";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col items-center gap-1 rounded-lg border px-4 py-3 text-center transition-all hover:border-primary/50 hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-gray-200 bg-white",
      )}
    >
      <Badge
        variant="outline"
        className={cn(
          "text-[10px]",
          evaluation.evalType === "comprehensive"
            ? "border-primary text-primary"
            : "border-blue-500 text-blue-500",
        )}
      >
        {evalTypeLabel}
      </Badge>
      <p className="text-sm font-medium">
        {evaluation.grade}학년
        {evaluation.evalType === "semester" && evaluation.semester
          ? ` ${evaluation.semester}학기`
          : ""}
      </p>
      <p className={cn("text-lg font-bold", isSelected ? "text-primary" : "text-neutral-700")}>
        {totalScore}점
      </p>
      <p className="text-[10px] text-muted-foreground">
        {formatDateYYYYMMDD(evaluation.createdAt)}
      </p>
    </button>
  );
}
