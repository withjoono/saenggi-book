import { Button } from "@/components/custom/button";
import {
  useGetOfficerEvaluationList,
  useGetOfficerList,
  useGetTicketCount,
} from "@/stores/server/features/susi/evaluation/queries";
import { IconRotate } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { OfficerCard } from "./officer-card";
import { toast } from "sonner";
import { useConsumeTicket } from "@/stores/server/features/susi/evaluation/mutations";

interface OfficerListProps {
  selectedSeries: {
    grandSeries: string;
    middleSeries: string;
    rowSeries: string;
  };
  resetSeries: () => void;
}

export const OfficerList = ({
  selectedSeries,
  resetSeries,
}: OfficerListProps) => {
  // Queries
  const { data: evaluationList, refetch: refetchEvaluationList } =
    useGetOfficerEvaluationList();
  const { data: officerList, refetch: refetchOfficerList } =
    useGetOfficerList();
  const { data: ticketCount, refetch: refetchTicket } = useGetTicketCount();

  // 디버깅: 데이터 확인
  console.log('OfficerList - officerList:', officerList);
  console.log('OfficerList - evaluationList:', evaluationList);
  console.log('OfficerList - ticketCount:', ticketCount);

  // Mutations
  const consumeTicket = useConsumeTicket();

  const navigate = useNavigate();

  const handleEvaluationClick = async (officerId: number) => {
    // 디버깅: officerId 값 확인
    console.log('handleEvaluationClick - officerId:', officerId);
    console.log('handleEvaluationClick - officerId type:', typeof officerId);
    console.log('handleEvaluationClick - isNaN:', isNaN(officerId));

    if (!officerId || isNaN(officerId)) {
      toast.error("사정관 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.");
      console.error('Invalid officerId:', officerId);
      return;
    }

    if (ticketCount && ticketCount.count < 1) {
      toast.error("이용권이 부족합니다.");
      return;
    }

    const series =
      selectedSeries.grandSeries +
      ">" +
      selectedSeries.middleSeries +
      ">" +
      selectedSeries.rowSeries;

    const requestData = {
      officerId: String(officerId),
      series: series,
    };
    console.log('평가 신청 요청:', requestData);

    try {
      const res = await consumeTicket.mutateAsync(requestData);

      console.log('평가 신청 응답:', res);

      if (res.success) {
        toast.success("신청이 완료되었습니다.");
        refetchTicket();
        refetchEvaluationList();
        refetchOfficerList();
        navigate({ to: "/evaluation/list" });
      } else {
        console.error('평가 신청 실패:', res.error);
        toast.error(res.error || "평가 신청에 실패했습니다.");
      }
    } catch (error: any) {
      console.error('평가 신청 에러 상세:', {
        error,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      const errorMessage = error?.response?.data?.message || error?.message || "평가 신청에 실패했습니다.";
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="space-y-2 py-4 pt-12">
        <p className="text-center text-lg font-semibold">
          원하는 사정관을 선택한 후 1:1 평가를 신청하세요!
        </p>
        <p className="text-center text-sm">
          평가 시 선생님이 해당 계열에 맞춰 합불 기록 및 전공 및 계열 적합성을
          고려하여 평가 및 코멘트를 작성합니다.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-2 md:py-8">
        <div className="flex flex-wrap items-center justify-center gap-4 md:flex-row md:gap-4">
          <div className="flex flex-col items-center">
            <p className="text-sm text-primary">대계열</p>
            <p className="text-base font-semibold md:text-lg">
              {selectedSeries.grandSeries}
            </p>
          </div>
          <div className="block">-</div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-primary">중계열</p>
            <p className="text-base font-semibold md:text-lg">
              {selectedSeries.middleSeries}
            </p>
          </div>
          <div className="block">-</div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-primary">소계열</p>
            <p className="text-base font-semibold md:text-lg">
              {selectedSeries.rowSeries}
            </p>
          </div>
        </div>
        <Button onClick={resetSeries} variant={"outline"} className="gap-2">
          <IconRotate className="size-4" />
          다시선택
        </Button>
      </div>

      <div className="flex w-full flex-col items-center justify-center space-y-2 py-4 pb-12">
        <div className="flex w-full flex-col items-center justify-between sm:flex-row">
          <div className="w-full"></div>
          <div className="w-full pb-4 text-center text-xl font-semibold">
            👨‍🏫 사정관 목록
          </div>
          <div className="w-full text-end">
            <div className="text-sm font-semibold">
              ✏️ 평가 이용권{" "}
              <span className="text-lg text-primary">
                {ticketCount ? ticketCount.count : 0}장
              </span>
            </div>
            <Link to="/products" className="text-sm text-blue-500">
              이용권 구매하기
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 md:grid-cols-3">
          {officerList?.map((officer, index) => {
            // 해당 사정관에게 신청한 완료되지 않은 평가가 존재하는 경우
            const appliedEvaluationList = evaluationList
              ?.filter((n) => n.status === "READY")
              .filter((n) => n.officerId === officer.officerId);
            const appliedEvaluation =
              appliedEvaluationList && 0 < appliedEvaluationList.length
                ? appliedEvaluationList[0]
                : null;

            return (
              <OfficerCard
                key={officer.officerId ?? `officer-${index}`}
                officer={officer}
                handleEvaluationClick={handleEvaluationClick}
                appliedEvaluation={appliedEvaluation}
                selectedSeries={selectedSeries}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
