import { useState } from "react";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { Button } from "@/components/custom/button";
import { useAddInterestUniv } from "@/stores/server/features/susi/interest-univ/mutations";
import { useExploreSusiJonghapStepper } from "../../context/explore-susi-jonghap-provider";
import { useGetExploreSusiJonghapStep4 } from "@/stores/server/features/explore/susi-jonghap/queries";
import { SusiJonghapReport } from "@/components/reports/susi-jonghap-report";
import { useGetInterestRecruitmentUnits } from "@/stores/server/features/susi/interest-univ/queries";

export const SusiJonghapStep4 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiJonghapStepper();

  const susiComprehensiveStep4 = useGetExploreSusiJonghapStep4(
    formData.step3SelectedIds,
  );

  const { refetch } = useGetInterestRecruitmentUnits("early_comprehensive");

  // mutations
  const addInterestUniv = useAddInterestUniv();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComprehensiveId, setSelectedComprehensive] = useState<
    number | null
  >(null);

  const resetSelectedItems = () => {
    setSelectedComprehensive(null);
  };

  const onClickSusiComprehensiveDetail = (susiComprehensiveId: number) => {
    setSelectedComprehensive(susiComprehensiveId);
    window.scrollTo(0, 0);
  };

  // 관심대학 저장
  const handleNextClick = async () => {
    if (!formData.evaluation_id) {
      toast.error("선택된 평가가 존재하지 않습니다.");
      return;
    }
    updateFormData("step4SelectedIds", selectedIds);
    setIsLoading(true);
    await addInterestUniv.mutateAsync({
      targetIds: selectedIds,
      targetTable: "early_comprehensive",
      evaluation_id: formData.evaluation_id,
    });
    await refetch();
    setIsLoading(false);
    nextStep();
  };

  if (selectedComprehensiveId) {
    return (
      <div className="space-y-6">
        <div className="sticky top-20 z-10 flex justify-center">
          <Button className="w-1/3" onClick={resetSelectedItems}>
            목록으로
          </Button>
        </div>
        <SusiJonghapReport
          susiJonghapId={selectedComprehensiveId}
          evaluationId={formData.evaluation_id}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      <div className="w-full">
        <p className="pb-2 text-center text-2xl font-semibold">
          전형일자 확인({selectedIds.length})
        </p>
        <p className="text-center text-sm text-foreground/60">
          전형일과 면접시간을 확인 후 관심대학에 저장해주세요!
        </p>
      </div>
      <DataTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        data={susiComprehensiveStep4.data?.items || []}
        onClickSusiComprehensiveDetail={onClickSusiComprehensiveDetail}
      />
      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={selectedIds.length === 0}
          loading={isLoading}
        >
          관심대학 저장하기
        </Button>
      </div>
    </div>
  );
};
