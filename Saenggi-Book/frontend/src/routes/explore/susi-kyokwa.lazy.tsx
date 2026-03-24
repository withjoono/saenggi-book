// ==========================================
// 예전 explore/susi-kyokwa 페이지 - 주석처리됨
// /ms/kyokwa 페이지를 사용하세요
// ==========================================

import { createLazyFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/explore/susi-kyokwa")({
  component: ExploreSusiKyokwaRedirect,
});

function ExploreSusiKyokwaRedirect() {
  // /ms/kyokwa로 리다이렉트
  return <Navigate to="/ms/kyokwa" />;
}

/* 예전 코드 - 주석처리됨

import { SusiKyokwaSteps } from "@/components/services/explore/susi-kyokwa/components/susi-kyokwa-steps";
import { ExploreSusiKyokwaStepperProvider } from "@/components/services/explore/susi-kyokwa/context/explore-susi-kyokwa-provider";

function ExploreSusiKyokwa() {
  return (
    <div className="mx-auto w-full max-w-screen-xl py-20 pb-8">
      <ExploreSusiKyokwaStepperProvider>
        <SusiKyokwaSteps />
      </ExploreSusiKyokwaStepperProvider>
    </div>
  );
}

주석처리 종료 */
