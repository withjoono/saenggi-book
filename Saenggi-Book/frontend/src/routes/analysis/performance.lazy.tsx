import { createLazyFileRoute } from "@tanstack/react-router";
import { PerformanceAnalysis } from "@/components/services/analysis/performance-analysis";

export const Route = createLazyFileRoute("/analysis/performance")({
  component: SusiComparisonPage,
});

function SusiComparisonPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-20 pb-8">
      <PerformanceAnalysis />
    </div>
  );
}
