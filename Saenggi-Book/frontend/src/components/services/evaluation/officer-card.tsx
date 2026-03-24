import { Button } from "@/components/custom/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import {
  IOfficerEvaluationItem,
  IOfficerListItem,
} from "@/stores/server/features/susi/evaluation/interfaces";
import { Link } from "@tanstack/react-router";

interface OfficerCardProps {
  officer: IOfficerListItem;
  handleEvaluationClick: (officerId: number) => void;
  appliedEvaluation: IOfficerEvaluationItem | null; // 이미 신청함
  selectedSeries: {
    grandSeries: string;
    middleSeries: string;
    rowSeries: string;
  };
}

export const OfficerCard = ({
  officer,
  handleEvaluationClick,
  appliedEvaluation,
  selectedSeries,
}: OfficerCardProps) => {
  return (
    <Card className="flex w-full flex-col items-center justify-center gap-10 rounded-md bg-white px-4 py-6">
      <div className="flex flex-col items-center justify-center gap-y-6">
        <img
          src={officer.officerProfileImage || ""}
          className="size-24 rounded-full"
        />
        <div className="space-y-1">
          <p className="text-center text-xl font-medium text-neutral-900">
            {officer.officerName} 쌤
          </p>
          <p className="h-16 text-center text-sm font-normal text-neutral-600">
            {officer.officerUniversity}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-y-2">
        <p className="h-4 text-center text-sm text-foreground/70">
          {officer.remainingEvaluations}명 대기중
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={appliedEvaluation !== null}>
              {appliedEvaluation?.updateDt
                ? `신청됨 (${formatDateYYYYMMDD(appliedEvaluation.updateDt.toString())})`
                : "평가받기"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {officer.officerName} 선생님께 생기부 평가를 요청할까요?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <div>
                    ({selectedSeries.grandSeries}) - (
                    {selectedSeries.middleSeries}) - ({selectedSeries.rowSeries})
                  </div>
                  <div className="text-red-500">
                    신청 후 계열을 변경할 수 없으니 다시한번 확인해주세요.
                  </div>
                  <div className="font-semibold">
                    모의고사 점수표, 3학년 생기부 등이 있다면{" "}
                    <Link to="/users/additional-file" className="text-blue-500">
                      마이페이지(추가자료 업로드)
                    </Link>
                    에서 파일을 업로드해주세요.
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleEvaluationClick(officer.officerId)}
              >
                확인
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
