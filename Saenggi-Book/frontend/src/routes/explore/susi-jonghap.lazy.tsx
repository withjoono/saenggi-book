import { SusiJonghapSteps } from "@/components/services/explore/susi-jonghap/components/susi-jonghap-steps";
import { ExploreSusiJonghapStepperProvider } from "@/components/services/explore/susi-jonghap/context/explore-susi-jonghap-provider";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/explore/susi-jonghap")({
  component: () => <ExploreSusiJonghap />,
});

function ExploreSusiJonghap() {
  return (
    <div className="mx-auto w-full max-w-screen-xl py-20 pb-8">
      <ExploreSusiJonghapStepperProvider>
        <SusiJonghapSteps />
      </ExploreSusiJonghapStepperProvider>
    </div>
  );
}
