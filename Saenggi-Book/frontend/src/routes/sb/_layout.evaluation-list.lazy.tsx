import { Button } from "@/components/custom/button";
import { AiEvaluationDetail } from "@/components/reports/ai-evaluation-detail";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetAiEvaluationHistory } from "@/stores/server/features/ai-evaluation/queries";
import type { IAiEvaluation } from "@/stores/server/features/ai-evaluation/interfaces";
import { IconSparkles } from "@tabler/icons-react";
import { createLazyFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute("/sb/_layout/evaluation-list")({
  component: AiEvaluationList,
});

function AiEvaluationList() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: evaluationList, isLoading } = useGetAiEvaluationHistory();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "overview";

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredList = useMemo(() => {
    return evaluationList?.filter(e => e.evalType !== "semester") || [];
  }, [evaluationList]);

  // 데이터 로드 시 최신 평가를 자동 선택
  useEffect(() => {
    if (filteredList?.length && selectedId === null) {
      setSelectedId(filteredList[0].id);
    }
  }, [filteredList, selectedId]);

  const selectedItem = useMemo(() => {
    return filteredList?.find((n) => n.id === selectedId) ?? null;
  }, [filteredList, selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            생기부 빌드업 분석 리포트
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            평가 결과를 참고하여 <Link className="text-blue-500 font-semibold" to="/sb/comprehensive">학종</Link> 탭에서 나에게 맞는 대학을 탐색해보세요.
          </p>
        </div>
        
        {currentUser && filteredList && filteredList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap hidden sm:inline-block">이전 기록:</span>
            <Select value={selectedId?.toString()} onValueChange={(val) => setSelectedId(Number(val))}>
              <SelectTrigger className="w-[200px] md:w-[240px] h-10 text-sm bg-white shadow-sm border-slate-200">
                <SelectValue placeholder="평가 내역 선택" />
              </SelectTrigger>
              <SelectContent>
                {filteredList.map((evaluation) => {
                  const isComp = evaluation.evalType === "comprehensive";
                  const target = evaluation.targetSeries?.split(">")?.pop() || "전체";
                  const dateStr = formatDateYYYYMMDD(evaluation.createdAt);
                  return (
                    <SelectItem key={evaluation.id} value={evaluation.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", isComp ? "bg-primary/10 text-primary border-primary/20" : "bg-blue-50 text-blue-600 border-blue-200")}>
                            {isComp ? "종합" : "일반"}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{target} 관점</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-3">{dateStr}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Separator className="my-2" />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>평가 내역을 불러오는 중...</span>
          </div>
        </div>
      ) : !filteredList?.length ? (
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <IconSparkles className="size-12 text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="font-medium">아직 평가 내역이 없습니다</p>
            <p className="text-sm text-muted-foreground">
              생기부를 업로드하고 AI 평가를 받아보세요!
            </p>
          </div>
        </Card>
      ) : (
        <div className="w-full">
          {selectedItem && <AiEvaluationDetail evaluation={selectedItem} defaultTab={currentTab} />}
        </div>
      )}
    </div>
  );
}
