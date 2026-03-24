import { Link } from "@tanstack/react-router";
import { Button } from "@/components/custom/button";
import { useExploreSusiJonghapStepper } from "../context/explore-susi-jonghap-provider";

export const SusiJonghapFinish = () => {
  const { prevStep, resetStep } = useExploreSusiJonghapStepper();

  return (
    <div className="flex w-full flex-col items-center justify-center pb-10 pt-20">
      <p className="text-2xl font-semibold">관심대학에 저장되었어요.</p>
      <p className="pt-4 text-base">
        <Link to="/ms/interest" className="text-blue-500 underline">
          지원전략 &gt; 관심대학 &gt; 학종
        </Link>
        에서 관심대학들을 확인할 수 있습니다.
      </p>

      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button onClick={resetStep}>처음부터 다시하기</Button>
      </div>
    </div>
  );
};
