import { useMemo, useState } from "react";
import { GroupedDataTable } from "./grouped-data-table";
import { Button } from "@/components/custom/button";
import { useGetExploreSusiKyokwaStep3 } from "@/stores/server/features/explore/susi-kyokwa/queries";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";
import { IExploreSusiKyokwaStep3Item } from "@/stores/server/features/explore/susi-kyokwa/interfaces";
import { useGetActiveServices } from "@/stores/server/features/me/queries";
import { toast } from "sonner";

export interface SusiKyokwaStep3GroupData {
  university_name: string;
  university_region: string;
  admission_name: string;
  general_field_name: string;
  method_description: string;
  subject_ratio: number | null;
  document_ratio: number | null;
  interview_ratio: number | null;
  practical_ratio: number | null;
  ids: number[];
}

export const SusiKyokwaStep3 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiKyokwaStepper();

  // queries
  const activeServices = useGetActiveServices();
  const susiKyokwaStep3 = useGetExploreSusiKyokwaStep3(
    formData.step2SelectedIds,
  );
  const data = susiKyokwaStep3.data?.items || [];

  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    string[]
  >([]);

  // 대학-전형명-계열로 그룹화 (전체 데이터)
  const allGroupedData = useMemo(
    () => groupDataByUniversityAdmissionField(data),
     
    [data],
  );

  // 다음단계로 (테이블에서 선택한 그룹에 포함된 수시전형 id를 전달)
  const handleNextClick = () => {
    if (!activeServices.data?.includes("S")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }

    updateFormData(
      "step3SelectedIds",
      selectedUniversitiesTable.flatMap(
        (key) => allGroupedData[key]?.ids || [],
      ),
    );
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      <GroupedDataTable
        selectedUniversities={selectedUniversitiesTable}
        setSelectedUniversities={setSelectedUniversitiesTable}
        groupedData={allGroupedData}
      />
      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant={"outline"} onClick={prevStep}>
          이전 단계
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={selectedUniversitiesTable.length === 0}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
};

const groupDataByUniversityAdmissionField = (
  data: IExploreSusiKyokwaStep3Item[],
): Record<string, SusiKyokwaStep3GroupData> => {
  return data.reduce<Record<string, SusiKyokwaStep3GroupData>>(
    (grouped, item) => {
      const key = `${item.university.name}-${item.university.region}-${item.admission.name}-${item.generalField.name}`;
      if (!grouped[key]) {
        grouped[key] = {
          university_name: item.university.name,
          university_region: item.university.region,
          admission_name: item.admission.name,
          general_field_name: item.generalField.name,
          method_description: item.method.methodDescription,
          subject_ratio: item.method.subjectRatio,
          document_ratio: item.method.documentRatio,
          interview_ratio: item.method.interviewRatio,
          practical_ratio: item.method.practicalRatio,
          ids: [item.id],
        };
      } else {
        grouped[key].ids.push(item.id);
      }
      return grouped;
    },
    {},
  );
};
