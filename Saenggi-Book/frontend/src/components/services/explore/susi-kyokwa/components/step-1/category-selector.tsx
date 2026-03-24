import { cn } from "@/lib/utils";
import { Button } from "@/components/custom/button";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";

interface CategorySelectorProps {
  className?: string;
  resetSelect: () => void;
}

const CATEGORIES = [
  { value: "전체", label: "전체" },
  { value: "문과", label: "문과" },
  { value: "이과", label: "이과" },
  { value: "공통", label: "공통" },
  { value: "예체능", label: "예체능" },
] as const;

export const CategorySelector = ({
  className,
  resetSelect,
}: CategorySelectorProps) => {
  const { formData, updateFormData } = useExploreSusiKyokwaStepper();

  const handleClick = (category: string) => {
    resetSelect();
    updateFormData("category", category);
    updateFormData("step1SelectedIds", []);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-lg font-semibold md:text-xl">계열 선택 (문/이과)</p>
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={formData.category === cat.value ? "default" : "outline"}
            className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
            onClick={() => handleClick(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
