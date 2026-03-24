import { Button } from "@/components/custom/button";
import { EvaluationResult } from "@/components/reports/evaluation-report";
import { RequireEvaluationMessage } from "@/components/require-evaluation-message";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetOfficerEvaluationList } from "@/stores/server/features/susi/evaluation/queries";
import { IconChevronLeft } from "@tabler/icons-react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createLazyFileRoute("/evaluation/_layout/list")({
  component: EvaluationList,
});

function EvaluationList() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: evaluationList } = useGetOfficerEvaluationList();

  const filteredEvaluationList = useMemo(() => {
    if (!currentUser || !evaluationList) return [];
    return evaluationList.filter((n) => n.officer_id !== currentUser.id);
  }, [evaluationList, currentUser]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleCardClick = (evaluationId: number) => {
    setSelectedId(evaluationId);
  };

  const selectedItem = useMemo(() => {
    const item = evaluationList?.filter((n) => n.id === selectedId);
    return item?.length ? item[0] : null;
  }, [evaluationList, selectedId]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">사정관 평가 내역</h3>
        <p className="text-sm text-muted-foreground">
          진행중이거나 완료된 평가 목록입니다.
        </p>
        <p className="text-sm text-muted-foreground">
          완료된 평가를 가지고{" "}
          <Link className="text-blue-500" to="/ms/comprehensive">
            학종
          </Link>{" "}
          탭에서 나에게 맞는 대학을 탐색해보세요!
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : !filteredEvaluationList.length ? (
        <RequireEvaluationMessage />
      ) : selectedItem === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvaluationList.map((evaluation) => {
            const isCompleted = evaluation.status === "COMPLETE";
            return (
              <Card
                key={evaluation.id}
                className="flex w-full flex-col items-center justify-center gap-4 rounded-md bg-white px-4 py-6"
              >
                <div className="flex flex-col items-center justify-center gap-y-6">
                  <div className="space-y-1">
                    <p className="text-center text-xl font-medium text-neutral-900">
                      {evaluation.officer_name}
                    </p>
                    <p className="h-14 text-center text-base text-neutral-900">
                      {evaluation.series.replace(/>/g, " - ")}
                    </p>
                    <p className="text-center text-sm text-foreground/60">
                      {formatDateYYYYMMDD(
                        evaluation.update_dt?.toString() ||
                          new Date().toString(),
                      )}{" "}
                      {!isCompleted ? "신청" : "완료"}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-y-2">
                  <p className="h-4 text-center text-sm text-primary">
                    {!isCompleted
                      ? `대기 순위: ${evaluation.remaining_evaluations}`
                      : ""}
                  </p>
                  <Button
                    onClick={() => handleCardClick(evaluation.id)}
                    variant={"default"}
                    disabled={!isCompleted}
                  >
                    {!isCompleted ? "진행중" : "확인하기"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="w-full space-y-8">
          <div>
            <Button onClick={() => setSelectedId(null)} variant={"outline"}>
              <IconChevronLeft className="mr-2 size-4" /> 뒤로가기
            </Button>
          </div>
          <EvaluationResult
            evaluationId={selectedItem.id}
            series={selectedItem?.series || ""}
          />
        </div>
      )}
    </div>
  );
}
