import { useMemo, useState } from "react";
import { GroupedDataTable } from "./grouped-data-table";
import { useGetExploreSusiKyokwaStep4 } from "@/stores/server/features/explore/susi-kyokwa/queries";
import { Button } from "@/components/custom/button";
import { useGetMyGrade } from "@/stores/server/features/me/queries";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";
import { IExploreSusiKyokwaStep4Item } from "@/stores/server/features/explore/susi-kyokwa/interfaces";
import { SusiKyokwaReport } from "@/components/reports/susi-kyokwa-report";

export interface SusiKyokwaStep4GroupData {
  university_name: string;
  university_region: string;
  admission_name: string;
  general_field_name: string;
  data: IExploreSusiKyokwaStep4Item[];
}

export const SusiKyokwaStep4 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiKyokwaStepper();

  // queries
  const exploreSusiKyokwaStep4 = useGetExploreSusiKyokwaStep4(
    formData.step3SelectedIds,
  );
  const data = exploreSusiKyokwaStep4.data?.items || [];
  const { data: myGrade } = useGetMyGrade();

  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedSusiKyokwaId, setSelectedSusiKyokwaId] = useState<
    number | null
  >(null);

  // 대학-전형명-계열로 그룹화 (전체 데이터)
  const allGroupedData = useMemo(
    () => groupDataByUniversityAdmissionField(data),
     
    [data],
  );

  // 다음단계로 (테이블에서 선택한 그룹에 포함된 수시전형 id를 전달)
  const handleNextClick = () => {
    updateFormData("step4SelectedIds", selectedIds);
    nextStep();
  };

  const resetSelectedItems = () => {
    setSelectedSusiKyokwaId(null);
  };

  const onClickSusiSubjectDetail = (susiSubjectId: number) => {
    setSelectedSusiKyokwaId(susiSubjectId);
    window.scrollTo(0, 0);
  };

  if (selectedSusiKyokwaId) {
    return (
      <div className="mx-auto max-w-screen-lg space-y-6">
        <div className="sticky top-20 z-10 flex justify-center">
          <Button className="w-1/3" onClick={resetSelectedItems}>
            목록으로
          </Button>
        </div>
        <SusiKyokwaReport susiKyokwaId={selectedSusiKyokwaId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      <div className="w-full">
        <p className="pb-2 text-center text-2xl font-semibold">
          모집단위 확인({selectedIds.length})
        </p>
        <p className="text-center text-sm text-foreground/60">
          이전 단계들을 통해 선택한 대학들의 학과를 살펴보고 원하는 학과를
          선택해주세요.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 py-8">
          {Object.keys(allGroupedData).map((item) => {
            return (
              <Button
                key={item}
                variant={item === selectedKey ? "default" : "outline"}
                className="font-bold"
                onClick={() => {
                  setSelectedKey(item);
                }}
              >
                {item}
              </Button>
            );
          })}
        </div>
      </div>
      {selectedKey ? (
        <GroupedDataTable
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          data={allGroupedData[selectedKey]?.data || []}
          myGrade={myGrade}
          onClickSusiSubjectDetail={onClickSusiSubjectDetail}
        />
      ) : (
        <NoSelectionMessage />
      )}
      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button onClick={handleNextClick} disabled={selectedIds.length === 0}>
          다음 단계
        </Button>
      </div>
    </div>
  );
};

const groupDataByUniversityAdmissionField = (
  data: IExploreSusiKyokwaStep4Item[],
): Record<string, SusiKyokwaStep4GroupData> => {
  return data.reduce<Record<string, SusiKyokwaStep4GroupData>>(
    (grouped, item) => {
      const key = `${item.university.name}-${item.university.region}-${item.admission.name}-${item.generalField.name}`;
      if (!grouped[key]) {
        grouped[key] = {
          university_name: item.university.name,
          university_region: item.university.region,
          admission_name: item.admission.name,
          general_field_name: item.generalField.name,
          data: [item],
        };
      } else {
        grouped[key].data.push(item);
      }
      return grouped;
    },
    {},
  );
};

const NoSelectionMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-16 font-semibold text-primary">
    위 목록중 대학을 선택해주세요!
  </div>
);
