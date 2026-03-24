import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { useExploreSusiJonghapStepper } from "../../context/explore-susi-jonghap-provider";

interface BasicTypeSelectorProps {
  className?: string;
  resetSelect: () => void;
}

export const BasicTypeSelector = ({
  className,
  resetSelect,
}: BasicTypeSelectorProps) => {
  const { formData, updateFormData } = useExploreSusiJonghapStepper();

  const handleClick = (basicType: "일반" | "특별") => {
    resetSelect();
    updateFormData("basicType", basicType);
    updateFormData("region", []);
    updateFormData("selectedGeneralFieldIds", [1]);
    updateFormData("selectedSubtypeIds", []);
    updateFormData("step1SelectedIds", []);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-lg font-semibold md:text-xl">✏️ 전형 선택</p>
      <div className="flex items-center gap-2">
        <Button
          variant={formData.basicType === "일반" ? "default" : "outline"}
          className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
          onClick={() => handleClick("일반")}
        >
          일반전형
        </Button>
        <Button
          variant={formData.basicType === "특별" ? "default" : "outline"}
          className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
          onClick={() => handleClick("특별")}
        >
          특별전형
        </Button>
      </div>
    </div>
  );
};
