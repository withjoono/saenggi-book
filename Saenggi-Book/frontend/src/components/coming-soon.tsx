import { cn } from "@/lib/utils";
import headerLogoSrc from "@/assets/icon/header-logo.png";

export const ComingSoon = ({ className }: { className?: string }) => {
  return (
    <div className={cn("h-auto", className)}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <img src={headerLogoSrc} className="h-auto w-20 pb-4" />
        <h1 className="text-3xl font-semibold leading-tight">출시 준비중 🥺</h1>
        <p className="text-center text-sm text-muted-foreground">
          조만간 출시될 기능이에요.
          <br />
          조금만 기다려주세요!
        </p>
      </div>
    </div>
  );
};
