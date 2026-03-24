import { useMemo, useState } from "react";
import { GroupedDataTable } from "./grouped-data-table";
import { Button } from "@/components/custom/button";
import { Link } from "@tanstack/react-router";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { useExploreSusiKyokwaStepper } from "../../context/explore-susi-kyokwa-provider";
import { useGetExploreSusiKyokwaStep2 } from "@/stores/server/features/explore/susi-kyokwa/queries";
import { IExploreSusiKyokwaStep2Item } from "@/stores/server/features/explore/susi-kyokwa/interfaces";

export interface ISusiKyokwaStep2GroupData {
  university_name: string; // 대학명
  university_region: string; // 대학지역
  admission_name: string; // 전형명
  general_field: string; // 계열
  is_applied: number; // 최저반영여부
  description: string; // 최저반영 TEXT
  ids: number[]; // 해당 그룹에 포함된 전형 id 목록
}

export const SusiKyokwaStep2 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiKyokwaStepper();

  // 디버깅: Step 1에서 전달된 ID 확인
  console.log("🔍 Step 2 - formData.step1SelectedIds:", formData.step1SelectedIds);

  // queries
  const susiKyokwaStep2 = useGetExploreSusiKyokwaStep2(
    formData.step1SelectedIds,
  );
  const data = susiKyokwaStep2.data?.items || [];

  // 디버깅: API 응답 확인
  console.log("🔍 Step 2 - API 응답 데이터:", data);
  console.log("🔍 Step 2 - API 로딩 상태:", susiKyokwaStep2.isLoading);
  console.log("🔍 Step 2 - API 에러:", susiKyokwaStep2.error);

  const { data: mockExamScores } = useGetMockExamStandardScores();

  const [selectedUniversitiesTable, setSelectedUniversitiesTable] = useState<
    string[]
  >([]);

  // 대학-전형명-계열-최저내역으로 그룹화 (전체 데이터)
  const allGroupedData = useMemo(
    () => groupDataByUniversityTypeFieldDescription(data),
     
    [data],
  );

  // 다음단계로 (테이블에서 선택한 그룹에 포함된 수시전형 id를 전달)
  const handleNextClick = () => {
    updateFormData(
      "step2SelectedIds",
      selectedUniversitiesTable.flatMap(
        (key) => allGroupedData[key]?.ids || [],
      ),
    );
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 py-6">
      <div className="space-y-3">
        <div className="flex items-center pb-4">
          <img src="/images/ts-teacher.png" className="h-12 w-12" />
          <div>
            <p className="text-sm text-foreground/60">
              교과전형은 교과 비중이 단지 50% 이상일뿐, 당락은 오히려 최저와
              비교과에서 결정됩니다
            </p>
          </div>
        </div>
        <p className="text-center text-2xl font-semibold">
          최저등급 확인 ({selectedUniversitiesTable.length})
        </p>
      </div>
      <div className="space-y-2 pt-6">
        <p className="text-center font-semibold">🧐 내 최저등급</p>

        {mockExamScores?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <p>내 성적이 입력되지 않았어요 🥲</p>
            <Link to="/users/mock-exam" className="text-sm text-blue-500">
              모의고사 성적 입력하기
            </Link>
          </div>
        ) : null}
        <div className="grid grid-cols-2 text-sm">
          {mockExamScores?.data.map((n, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {n.subject_name} - <p className="text-primary">{n.grade}등급</p>
            </div>
          ))}
        </div>
      </div>
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

const groupDataByUniversityTypeFieldDescription = (
  data: IExploreSusiKyokwaStep2Item[],
): Record<string, ISusiKyokwaStep2GroupData> => {
  console.log("🔍 groupDataByUniversityTypeFieldDescription - 입력 데이터:", data);
  console.log("🔍 groupDataByUniversityTypeFieldDescription - 데이터 개수:", data.length);

  // 첫 번째 아이템의 구조 확인
  if (data.length > 0) {
    console.log("🔍 첫 번째 아이템:", data[0]);
    console.log("🔍 첫 번째 아이템 - university:", data[0].university);
    console.log("🔍 첫 번째 아이템 - admission:", data[0].admission);
    console.log("🔍 첫 번째 아이템 - generalField:", data[0].generalField);
  }

  let skippedCount = 0;
  const result = data.reduce<Record<string, ISusiKyokwaStep2GroupData>>(
    (grouped, item, index) => {
      // 필수 필드가 없는 경우 해당 아이템 건너뛰기
      if (!item.university || !item.admission || !item.generalField) {
        console.log(`⚠️ 아이템 ${index} 건너뜀:`, item);
        skippedCount++;
        return grouped;
      }

      const key = `${item.university.name}-${item.university.region}-${item.admission.name}-${item.generalField.name}-${item.minimumGrade?.description || ""}`;
      if (!grouped[key]) {
        grouped[key] = {
          university_name: item.university.name,
          university_region: item.university.region,
          admission_name: item.admission.name,
          general_field: item.generalField.name,
          is_applied: item.minimumGrade?.isApplied === "Y" ? 1 : 0,
          description: item.minimumGrade?.description || "",
          ids: [item.id],
        };
      } else {
        grouped[key].ids.push(item.id);
      }
      return grouped;
    },
    {},
  );

  console.log("🔍 groupDataByUniversityTypeFieldDescription - 건너뛴 아이템 수:", skippedCount);
  console.log("🔍 groupDataByUniversityTypeFieldDescription - 그룹화 결과:", result);
  console.log("🔍 groupDataByUniversityTypeFieldDescription - 그룹 개수:", Object.keys(result).length);

  return result;
};
