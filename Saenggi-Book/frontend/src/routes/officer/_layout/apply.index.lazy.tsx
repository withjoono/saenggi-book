import { Button } from "@/components/custom/button";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetOfficerPendingEvaluations } from "@/stores/server/features/susi/evaluation/queries";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/officer/_layout/apply/")({
  component: OfficerEvaluationList,
});

function OfficerEvaluationList() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: pendingEvaluations } = useGetOfficerPendingEvaluations();
  const navigate = useNavigate();

  // 디버깅 로그
  console.log("OfficerEvaluationList - currentUser:", currentUser);
  console.log("OfficerEvaluationList - pendingEvaluations:", pendingEvaluations);

  const handleCardClick = (evaluationId: number) => {
    navigate({
      to: "/officer/apply/$evaluationId",
      params: { evaluationId: evaluationId.toString() },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">평가 신청자 리스트</h3>
        <p className="text-sm text-muted-foreground">
          나에게 할당된 생기부 평가 요청 목록입니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : !pendingEvaluations || !pendingEvaluations.length ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            아직 할당된 평가 요청이 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingEvaluations.map((evaluation) => {
            const isCompleted = evaluation.progressStatus === "COMPLETE";
            return (
              <Card
                key={evaluation.evaluationId}
                className="flex w-full flex-col items-center justify-center gap-4 rounded-md bg-white px-4 py-6"
              >
                <div className="flex flex-col items-center justify-center gap-y-6">
                  <div className="space-y-1">
                    <p className="text-center text-xl font-medium text-neutral-900">
                      {evaluation.studentName}
                    </p>
                    <p className="h-14 text-center text-base text-neutral-900">
                      {evaluation.series.replace(/>/g, " - ")}
                    </p>
                    <p className="text-center text-sm text-foreground/60">
                      {formatDateYYYYMMDD(
                        evaluation.updateDt?.toString() ||
                          new Date().toString(),
                      )}{" "}
                      {!isCompleted ? "신청" : "완료"}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-y-2">
                  <div className="h-4 text-center">
                    {isCompleted && (
                      <span className="text-sm text-green-600 font-medium">
                        평가 완료
                      </span>
                    )}
                    {!isCompleted && (
                      <span className="text-sm text-orange-600 font-medium">
                        평가 대기중 (대기 {evaluation.readyCount}명)
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleCardClick(evaluation.evaluationId)}
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {!isCompleted ? "평가하기" : "평가 수정"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
