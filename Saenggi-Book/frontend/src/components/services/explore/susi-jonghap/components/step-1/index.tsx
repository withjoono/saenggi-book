import { useMemo, useState } from "react";
import { BasicTypeSelector } from "./basic-type.selector";
import { RegionSelector } from "./region-selector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/custom/button";
import {
  useGetActiveServices,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { toast } from "sonner";
import { useExploreSusiJonghapStepper } from "../../context/explore-susi-jonghap-provider";
import { useGetExploreSusiJonghapStep1 } from "@/stores/server/features/explore/susi-jonghap/queries";
import { SelectedChartDataTable } from "./selected-chart-data-table";
import { AdmissionSubtypeSelector } from "./admission-subtype-selector";
import { Step1Chart } from "./step1-chart";
import { IExploreSusiJonghapStep1Item } from "@/stores/server/features/explore/susi-jonghap/interfaces";

export const SusiJonghapStep1 = () => {
  const { formData, nextStep, updateFormData, prevStep } =
    useExploreSusiJonghapStepper();

  const { data: activeServices } = useGetActiveServices();

  const susiComprehensiveStep1 = useGetExploreSusiJonghapStep1({
    year: 2025,
    basicType: formData.basicType,
    minorFieldId: formData.minorField?.id || null,
    subtypeIds: formData.selectedSubtypeIds,
  });
  const [isSorted, setIsSorted] = useState(false);
  const { data: myGrade } = useGetMyGrade();
  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    number[]
  >([]);

  const filteredData = useMemo(() => {
    console.log("[SusiJonghapStep1] FilterData Input:", {
      dataLength: susiComprehensiveStep1.data?.items?.length,
      formData,
      isSorted,
      firstItem: susiComprehensiveStep1.data?.items?.[0]
    });
    const result = filterData(susiComprehensiveStep1.data?.items || [], formData, isSorted);
    console.log("[SusiJonghapStep1] FilterData Output:", { resultLength: result.length });
    return result;
  }, [formData, susiComprehensiveStep1.data, isSorted]);

  const handleNextClick = () => {
    if (!activeServices?.includes("S")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }

    updateFormData("step1SelectedIds", selectedUniversitiesTable);
    nextStep();
  };



  const resetSelect = () => {
    setSelectedUniversitiesTable([]);
  };

  return (
    <div className="space-y-2 px-2 pt-4">
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 border-2 border-red-500 bg-red-100 text-red-900 text-sm font-mono overflow-auto max-h-40">
          <strong>DEBUG PANEL</strong><br />
          Data Status: {susiComprehensiveStep1.status}<br />
          Data Error: {JSON.stringify(susiComprehensiveStep1.error)}<br />
          Items Length: {susiComprehensiveStep1.data?.items?.length}<br />
          Filtered Length: {filteredData.length}<br />
          MinorField ID: {formData.minorField?.id}<br />
          BasicType: {formData.basicType}<br />
          Region: {JSON.stringify(formData.region)}
        </div>
      )}
      <BasicTypeSelector resetSelect={resetSelect} />
      <RegionSelector />
      {formData.basicType === "특별" ? <AdmissionSubtypeSelector /> : null}

      <div className="py-4">
        <ChartViewer data={filteredData} myGrade={myGrade ?? 0} />
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="airplane-mode"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="airplane-mode">추합컷 정렬</Label>
        </div>
      </div>

      <SelectedChartDataTable
        data={filteredData}
        myGrade={myGrade ?? 0}
        selectedUniversities={selectedUniversitiesTable}
        setSelectedUniversities={setSelectedUniversitiesTable}
      />

      <div className="flex items-center justify-center gap-4 py-12">
        <Button onClick={prevStep} variant={"outline"}>
          이전 단계
        </Button>
        <Button
          disabled={selectedUniversitiesTable.length === 0}
          onClick={handleNextClick}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
};

const ChartViewer = ({
  data,
  myGrade,
}: {
  data: IExploreSusiJonghapStep1Item[];
  myGrade: number;
}) => {
  return (
    <div className="h-[500px] overflow-x-auto">
      <Step1Chart data={data} myGrade={myGrade} />
    </div>
  );
};

const filterData = (
  data: IExploreSusiJonghapStep1Item[] | null,
  formData: any,
  isSorted: boolean,
): IExploreSusiJonghapStep1Item[] => {
  if (!data) return [];

  let filteredItems = data.filter((item) => {
    // Filter out items with missing admission or university data
    if (!item.admission || !item.admission.university) return false;
    if (!item.generalField.name) return false;

    // 지역 필터
    if (
      formData.region.length > 0 &&
      !formData.region.includes(item.admission.university.region)
    ) {
      return false;
    }

    // 특별전형 필터 - Server side now
    // if (
    //   formData.basicType === "특별" &&
    //   formData.selectedSubtypeIds.length > 0 &&
    //   !formData.selectedSubtypeIds.some((id: number) =>
    //     item.admission.subtypes.map((n) => n.id).includes(id),
    //   )
    // ) {
    //   return false;
    // }

    return true;
  });

  if (isSorted) {
    filteredItems = filteredItems.sort(
      (a, b) => (a.scores?.grade50Cut || 0) - (b.scores?.grade50Cut || 0),
    );
  }

  return filteredItems;
};
