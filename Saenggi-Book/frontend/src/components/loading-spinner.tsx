import { cn } from "@/lib/utils";
import headerLogoSrc from "@/assets/icon/header-logo.png";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <img src={headerLogoSrc} className="h-auto w-10 animate-bounce" />
      <p className="">Loading...</p>
    </div>
  );
}
