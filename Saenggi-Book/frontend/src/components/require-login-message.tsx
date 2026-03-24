import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "./custom/button";

interface Props {
  className?: string;
}

export const RequireLoginMessage = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-20",
        className,
      )}
    >
      <h2 className="text-lg font-semibold">
        🥺 로그인이 필요한 서비스입니다.
      </h2>
      <Link to="/auth/login" className={cn(buttonVariants())}>
        로그인
      </Link>
    </div>
  );
};
