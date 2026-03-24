import { createLazyFileRoute } from "@tanstack/react-router";
import { PerformanceAnalysis } from "@/components/services/analysis/performance-analysis";
import { Separator } from "@/components/ui/separator";

export const Route = createLazyFileRoute("/grade-analysis/_layout/performance")({
  component: PerformancePage,
});

function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">성적 분석</h3>
        <p className="text-sm text-muted-foreground">
          입력된 생기부 성적을 기반으로 상세 분석 결과를 확인하세요.
        </p>
      </div>
      <Separator />
      <PerformanceAnalysis />
    </div>
  );
}
