import { SusiJonghapSteps } from "@/components/services/explore/susi-jonghap/components/susi-jonghap-steps";
import { ExploreSusiJonghapStepperProvider } from "@/components/services/explore/susi-jonghap/context/explore-susi-jonghap-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/grade-analysis/_layout/comprehensive")({
  component: GradeAnalysisComprehensive,
});

function GradeAnalysisComprehensive() {
  return (
    <div className="w-full pb-8">
      <ExploreSusiJonghapStepperProvider>
        <SusiJonghapSteps />
      </ExploreSusiJonghapStepperProvider>
    </div>
  );
}
