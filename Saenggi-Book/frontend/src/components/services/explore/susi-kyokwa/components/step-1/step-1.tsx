import { useMemo, useState } from "react";
import { Step1Chart } from "./step-1-chart";
import { BasicTypeSelector } from "./basic-type-selector";
import { CategorySelector } from "./category-selector";
import { RegionSelector } from "./region-selector";
import { AdmissionSubtypeSelector } from "./admission-subtype-selector";
import { SelectedChartDataTable } from "./selected-chart-data-table";
import { toast } from "sonner";
import {
  useGetCurrentUser,
  useGetMyGrade,
} from "@/stores/server/features/me/queries";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";
import { IRegion } from "@/types/region.type";
import { useGetExploreSusiKyokwaStep1 } from "@/stores/server/features/explore/susi-kyokwa/queries";
import {
  IExploreSusiKyokwaStep1Item,
  IExploreSusiKyokwaStep1Response,
} from "@/stores/server/features/explore/susi-kyokwa/interfaces";

export const SusiKyokwaStep1 = () => {
  const user = useGetCurrentUser();
  const { formData, nextStep, updateFormData } =
    useExploreSusiKyokwaStepper();

  const susiKyokwaStep1 = useGetExploreSusiKyokwaStep1({
    year: 2025,
    basicType: formData.basicType,
    category: formData.category,
    subtypeIds: formData.selectedSubtypeIds,
  });
  const data = susiKyokwaStep1.data || { items: [] };

  const [isSorted, setIsSorted] = useState(false);
  const [selectedUniversitiesChart, setSelectedUniversitiesChart] = useState<
    string[]
  >([]);
  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    string[]
  >([]);
  const [selectedRecruitmentUnits, setSelectedRecruitmentUnits] = useState<
    number[]
  >([]);
  const { data: myGrade } = useGetMyGrade();

  const filteredData = useMemo(
    () => {
      return filterData(data, formData, isSorted);
    },
    [formData, data, isSorted],
  );

  const handleNextClick = () => {
    if (!user.data?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    // 디버깅: 선택된 모집단위 ID 확인
    console.log("🔍 Step 1 - selectedRecruitmentUnits:", selectedRecruitmentUnits);
    console.log("🔍 Step 1 - selectedUniversitiesChart:", selectedUniversitiesChart);
    console.log("🔍 Step 1 - selectedUniversitiesTable:", selectedUniversitiesTable);

    // 실제로 사용자가 선택한 모집단위 ID만 전달
    updateFormData("step1SelectedIds", selectedRecruitmentUnits);
    nextStep();
  };

  const resetSelect = () => {
    setSelectedUniversitiesChart([]);
    setSelectedUniversitiesTable([]);
    setSelectedRecruitmentUnits([]);
  };

  return (
    <div className="space-y-3 px-2 pt-4 md:space-y-6">
      <BasicTypeSelector resetSelect={resetSelect} />
      <CategorySelector resetSelect={resetSelect} />
      <RegionSelector />
      {formData.basicType === "특별" ? <AdmissionSubtypeSelector /> : null}

      <div className="py-4">
        <ChartViewer
          data={filteredData}
          selectedUniversities={selectedUniversitiesChart}
          setSelectedUniversities={setSelectedUniversitiesChart}
          myGrade={myGrade}
        />
      </div>

      {user.data?.id ? (
        selectedUniversitiesChart.length === 0 ? (
          <NoSelectionMessage />
        ) : (
          <SelectedChartDataTable
            list={selectedUniversitiesChart}
            myGrade={myGrade}
            selectedUniversities={selectedUniversitiesTable}
            setSelectedUniversities={setSelectedUniversitiesTable}
            selectedRecruitmentUnits={selectedRecruitmentUnits}
            setSelectedRecruitmentUnits={setSelectedRecruitmentUnits}
            data={data}
          />
        )
      ) : (
        <NoLoginMessage />
      )}

      <div className="flex items-center justify-center py-12">
        {user.data?.id ? (
          <Button
            disabled={
              selectedUniversitiesChart.length === 0 ||
              selectedRecruitmentUnits.length === 0
            }
            onClick={handleNextClick}
          >
            다음 단계
          </Button>
        ) : (
          <Link to="/auth/login" className={cn(buttonVariants())}>
            로그인
          </Link>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-red-500 bg-black/80 p-4 text-xs text-white shadow-xl">
          <h3 className="mb-2 font-bold text-red-400">DEBUG PANEL (KYOKWA)</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-gray-400">Data Status:</span>
            <span className={data ? "text-green-400" : "text-red-400"}>
              {data ? "success" : "loading/error"}
            </span>

            <span className="text-gray-400">Items Length:</span>
            <span>{data?.items?.length || 0}</span>

            <span className="text-gray-400">Filtered Length:</span>
            <span>{filteredData?.items?.length || 0}</span>

            <span className="text-gray-400">First Item MinCut:</span>
            <span>{data?.items?.[0]?.minCut ?? "null"}</span>

            <span className="text-gray-400">First Item MaxCut:</span>
            <span>{data?.items?.[0]?.maxCut ?? "null"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ChartViewer = ({
  data,
  selectedUniversities,
  setSelectedUniversities,
  myGrade,
}: {
  data: IExploreSusiKyokwaStep1Response;
  selectedUniversities: string[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
  myGrade?: number | null;
}) => {
  const handleChartClick = (item: IExploreSusiKyokwaStep1Item | string) => {
    if (typeof item === "string") {
      setSelectedUniversities((prevSelected) =>
        prevSelected.includes(item)
          ? prevSelected.filter((n) => n !== item)
          : [...prevSelected, item],
      );
    } else {
      const key = `${item.university.region}-${item.university.name}-${item.name}`;
      setSelectedUniversities((prevSelected) =>
        prevSelected.includes(key)
          ? prevSelected.filter((n) => n !== key)
          : [...prevSelected, key],
      );
    }
  };

  const isSelected = (item: IExploreSusiKyokwaStep1Item | string) => {
    if (typeof item === "string") {
      return selectedUniversities.includes(item);
    } else {
      const key = `${item.university.region}-${item.university.name}-${item.name}`;
      return selectedUniversities.includes(key);
    }
  };

  if (!data) return <div></div>;

  return (
    <div className="h-[500px] overflow-x-auto">
      <Step1Chart
        data={data}
        myGrade={myGrade}
        onClickItem={handleChartClick}
        checkSelectedItem={isSelected}
      />
    </div>
  );
};

const filterData = (
  data: IExploreSusiKyokwaStep1Response | null,
  formData: any,
  isSorted: boolean,
): IExploreSusiKyokwaStep1Response => {
  if (!data) return { items: [] };

  let filteredItems = data.items.filter((item) => {
    // 필수 필드 확인: generalType과 university가 있어야 함
    if (!item.generalType || !item.generalType.name) return false;
    if (!item.university || !item.university.name) return false;

    // 지역 필터
    if (
      formData.region.length > 0 &&
      !formData.region.includes(item.university.region as IRegion)
    ) {
      return false;
    }

    // 특별전형 필터
    if (
      formData.basicType === "특별" &&
      formData.selectedSubtypeIds.length > 0 &&
      !formData.selectedSubtypeIds.some((id: number) =>
        item.subtypeIds?.includes(id),
      )
    ) {
      return false;
    }

    return true;
  });

  if (isSorted) {
    filteredItems = filteredItems.sort(
      (a, b) => (a.maxCut || 0) - (b.maxCut || 0),
    );
  }

  return { items: filteredItems };
};

const NoLoginMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    🚨 로그인을 해야 서비스를 이용할 수 있습니다.
  </div>
);

const NoSelectionMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    위 차트에서 대학을 선택해주세요!
  </div>
);
