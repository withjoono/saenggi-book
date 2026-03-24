import { Button } from "@/components/custom/button";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import feature7 from "@/assets/images/features/007.png";
import feature1 from "@/assets/images/features/001.png";
import feature2 from "@/assets/images/features/002.png";
import feature3 from "@/assets/images/features/003.png";
import feature4 from "@/assets/images/features/004.png";
import feature5 from "@/assets/images/features/005.png";
import feature6 from "@/assets/images/features/006.png";
import guide1 from "@/assets/images/user-guide/001.png";
import guide2 from "@/assets/images/user-guide/002.png";
import guide3 from "@/assets/images/user-guide/003.png";
import guide4 from "@/assets/images/user-guide/004.png";
import guide5 from "@/assets/images/user-guide/005.png";
import guide6 from "@/assets/images/user-guide/006.png";
import guide10 from "@/assets/images/user-guide/010.png";
import guide11 from "@/assets/images/user-guide/011.png";
import guide12 from "@/assets/images/user-guide/012.png";

export const Route = createLazyFileRoute("/official/guide")({
  component: GuidePage,
});

function GuidePage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-8">
      <h2 className="pb-4 text-2xl font-semibold">서비스 소개</h2>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => setTab(0)}
          variant={tab === 0 ? "default" : "outline"}
        >
          정시 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(1)}
          variant={tab === 1 ? "default" : "outline"}
        >
          수시(교과) 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(2)}
          variant={tab === 2 ? "default" : "outline"}
        >
          수시(학종) 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(3)}
          variant={tab === 3 ? "default" : "outline"}
        >
          사용 방법
        </Button>
      </div>
      <div className="m-auto flex w-full max-w-screen-lg items-center justify-center pt-14">
        {tab === 0 && (
          <div className="flex flex-col items-center gap-2">
            <img src={feature7} className="w-full" alt="정시 서비스 특징" />
          </div>
        )}
        {tab === 1 && (
          <div className="flex flex-col items-center gap-2">
            <img src={feature2} className="w-full" alt="교과 서비스 특징 2" />
            <img src={feature1} className="w-full" alt="교과 서비스 특징 1" />
            <img src={feature3} className="w-full" alt="교과 서비스 특징 3" />
          </div>
        )}
        {tab === 2 && (
          <div className="flex flex-col items-center gap-2">
            <img src={feature4} alt="학종 서비스 특징 1" />
            <img src={feature6} alt="학종 서비스 특징 3" />
            <img src={feature5} alt="학종 서비스 특징 2" />
          </div>
        )}
        {tab === 3 && (
          <div className="flex flex-col items-center gap-2">
            <img src={guide1} className="w-full" alt="사용 방법 가이드 1단계" />
            <img src={guide2} className="w-full" alt="사용 방법 가이드 2단계" />
            <img src={guide3} className="w-full" alt="사용 방법 가이드 3단계" />
            <img src={guide4} className="w-full" alt="사용 방법 가이드 4단계" />
            <img src={guide5} className="w-full" alt="사용 방법 가이드 5단계" />
            <img src={guide6} className="w-full" alt="사용 방법 가이드 6단계" />
            <img
              src={guide10}
              className="w-full"
              alt="사용 방법 가이드 7단계"
            />
            <img
              src={guide11}
              className="w-full"
              alt="사용 방법 가이드 8단계"
            />
            <img
              src={guide12}
              className="w-full"
              alt="사용 방법 가이드 9단계"
            />
          </div>
        )}
      </div>
    </div>
  );
}
