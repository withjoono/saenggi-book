import { useState } from "react";
import { DataTable } from "./data-table";
import { useGetExploreSusiKyokwaStep5 } from "@/stores/server/features/explore/susi-kyokwa/queries";
import { Button } from "@/components/custom/button";
import { useAddInterestUniv } from "@/stores/server/features/susi/interest-univ/mutations";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";
import { useGetInterestRecruitmentUnits } from "@/stores/server/features/susi/interest-univ/queries";

export const SusiKyokwaStep5 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiKyokwaStepper();

  // queries
  const exploreSusiKyokwaStep5 = useGetExploreSusiKyokwaStep5(
    formData.step4SelectedIds,
  );
  const data = exploreSusiKyokwaStep5.data?.items || [];

  // mutations
  const addInterestUniv = useAddInterestUniv();

  const { refetch } = useGetInterestRecruitmentUnits("early_subject");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 관심대학 저장
  const handleNextClick = async () => {
    updateFormData("step5SelectedIds", selectedIds);
    await addInterestUniv.mutateAsync({
      targetIds: selectedIds,
      targetTable: "early_subject",
    });
    await refetch();
    nextStep();
  };

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
        data={data}
      />
      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={selectedIds.length === 0}
          loading={addInterestUniv.isPending}
        >
          관심대학 저장하기
        </Button>
      </div>
    </div>
  );
};
