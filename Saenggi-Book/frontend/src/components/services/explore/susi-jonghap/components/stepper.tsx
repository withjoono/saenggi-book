import { IconCheck, IconChevronRight, IconPencil } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useExploreSusiJonghapStepper } from "../context/explore-susi-jonghap-provider";

type StepProps = {
  id: number;
  text: string;
  isLast?: boolean;
};

export const Step = ({ id, text, isLast }: StepProps) => {
  const { step } = useExploreSusiJonghapStepper();
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center rounded-md border px-3 py-2 text-xs font-semibold transition duration-200 lg:px-4 lg:text-sm",
          id < step && "bg-green-500 text-white",
          step === id && "border-primary bg-primary text-primary-foreground",
          step < id && "border-muted bg-muted text-muted-foreground",
        )}
      >
        {id < step ? (
          <IconCheck className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
        ) : null}
        {id === step ? (
          <IconPencil className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
        ) : null}{" "}
        {text}
      </div>
      {isLast ? null : <IconChevronRight className="mr-0" />}
    </div>
  );
};
