import { buttonVariants } from "@/components/custom/button";
import { EvaluationResult } from "@/components/reports/evaluation-report";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetOfficerEvaluationList } from "@/stores/server/features/susi/evaluation/queries";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createLazyFileRoute("/evaluation/_layout/self/")({
  component: SelfEvaluation,
});

function SelfEvaluation() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: evaluationList } = useGetOfficerEvaluationList();

  const myEvaluationItem = useMemo(() => {
    if (!currentUser || !evaluationList) return null;
    const filtered = evaluationList.filter(
      (n) => n.officer_id === currentUser.id,
    );
    return filtered.length ? filtered[0] : null;
  }, [currentUser, evaluationList]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">자가 평가</h3>
        <p className="text-sm text-muted-foreground">
          학종 탐색을 위해 내 생기부를 대략적으로 평가합니다.
        </p>
        <p className="text-sm text-muted-foreground">
          정확한 평가를 위해선{" "}
          <Link to="/evaluation/request" className="text-blue-500">
            사정관 평가
          </Link>
          를 신청해주세요.
        </p>
      </div>
      <Separator />

      {!currentUser ? (
        <RequireLoginMessage />
      ) : myEvaluationItem ? (
        <div className="w-full space-y-8">
          <div className="flex items-center justify-center gap-2">

          </div>
          <EvaluationResult
            evaluationId={myEvaluationItem?.id}
            series={myEvaluationItem.series}
            isSelf
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 py-20">
          <h2 className="text-lg font-semibold">🚀 자가 평가 시작하기</h2>

        </div>
      )}
    </div>
  );
}
