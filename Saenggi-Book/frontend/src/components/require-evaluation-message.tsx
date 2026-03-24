import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface Props {
  className?: string;
}

export const RequireEvaluationMessage = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-20",
        className,
      )}
    >
      <p className="text-xl">진행중이거나 완료된 평가가 존재하지 않아요😭</p>
      <Link to="/evaluation/request" className="text-sm text-blue-500">
        사정관 평가 받으러가기
      </Link>
    </div>
  );
};
