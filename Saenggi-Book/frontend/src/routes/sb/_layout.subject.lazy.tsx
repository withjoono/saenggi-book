import { SusiKyokwaSteps } from "@/components/services/explore/susi-kyokwa/components/susi-kyokwa-steps";
import { ExploreSusiKyokwaStepperProvider } from "@/components/services/explore/susi-kyokwa/context/explore-susi-kyokwa-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/sb/_layout/subject")({
  component: MsSubject,
});

function MsSubject() {
  return (
    <div className="w-full pb-8">
      <ExploreSusiKyokwaStepperProvider>
        <SusiKyokwaSteps />
      </ExploreSusiKyokwaStepperProvider>
    </div>
  );
}
