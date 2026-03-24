import { useExploreSusiKyokwaStepper } from "../context/explore-susi-kyokwa-provider";
import { SusiKyokwaStep1 } from "./step-1/step-1";
import { SusiKyokwaStep2 } from "./step-2/step-2";
import { SusiKyokwaStep3 } from "./step-3/step-3";
import { SusiKyokwaStep4 } from "./step-4/step-4";
import { SusiKyokwaStep5 } from "./step-5/step-5";
import { Step } from "./stepper";
import { SusiKyokwaFinish } from "./susi-kyokwa-finish";
import { Link } from "@tanstack/react-router";

export const SusiKyokwaSteps = () => {
  const { step } = useExploreSusiKyokwaStepper();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SusiKyokwaStep1 />;
      case 2:
        return <SusiKyokwaStep2 />;
      case 3:
        return <SusiKyokwaStep3 />;
      case 4:
        return <SusiKyokwaStep4 />;
      case 5:
        return <SusiKyokwaStep5 />;
      case 6:
        return <SusiKyokwaFinish />;
      default:
        return null;
    }
  };
  const stepLabels = [
    {
      step: 1,
      text: "자격 및 대학선택",
    },
    {
      step: 2,
      text: "최저등급",
    },
    {
      step: 3,
      text: "비교과",
    },
    {
      step: 4,
      text: "모집단위",
    },
    {
      step: 5,
      text: "전형일자 확인",
    },
  ];

  return (
    <>
      <p className="pb-8 text-center text-2xl font-semibold md:text-3xl">
        🏫 교과 전형 탐색
      </p>
      <div className="flex w-full flex-wrap items-center justify-center gap-y-2 pb-8 md:gap-2">
        {stepLabels.map((label) => {
          return (
            <Step
              key={label.step}
              id={label.step}
              text={label.text}
              isLast={label.step === stepLabels.length}
            />
          );
        })}
      </div>
      {renderStep()}
    </>
  );
};
