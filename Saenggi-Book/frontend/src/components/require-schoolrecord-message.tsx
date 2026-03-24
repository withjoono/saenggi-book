import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface Props {
  className?: string;
}

export const RequireSchoolRecordMessage = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-20",
        className,
      )}
    >
      <p className="text-center text-lg font-semibold">
        아직 생기부가 등록되어 있지 않아요 😭
      </p>
      <p className="text-center text-sm">
        <Link to="/users/school-record" className="text-blue-500">
          생기부 입력
        </Link>{" "}
        탭에서 생기부를 먼저 등록해주세요!
      </p>
    </div>
  );
};
