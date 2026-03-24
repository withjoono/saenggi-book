import { useState } from "react";
import { DataTable } from "./data-table";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/custom/button";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { useGetExploreSusiJonghapStep3 } from "@/stores/server/features/explore/susi-jonghap/queries";
import { useExploreSusiJonghapStepper } from "../../context/explore-susi-jonghap-provider";
import { getMockExamSubjectLabelByCode } from "@/lib/utils/services/subject";

export const SusiJonghapStep3 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiJonghapStepper();

  const susiComprehensiveStep3 = useGetExploreSusiJonghapStep3(
    formData.step2SelectedIds,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: mockExamScores } = useGetMockExamStandardScores();

  const handleNextClick = async () => {
    updateFormData("step3SelectedIds", selectedIds);
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      <div className="space-y-3">
        <p className="text-center text-2xl font-semibold">
          최저등급 확인 ({selectedIds.length})
        </p>
      </div>
      <div className="space-y-2 pt-6">
        <div className="space-y-2 pt-6">
          <p className="text-center font-semibold">🧐 내 최저등급</p>

          {mockExamScores?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <p>내 성적이 입력되지 않았어요 🥲</p>
              <Link to="/users/mock-exam" className="text-sm text-blue-500">
                모의고사 성적 입력하기
              </Link>
            </div>
          ) : null}
          <div className="grid grid-cols-2 text-sm">
            {mockExamScores?.data?.map((n) => (
              <div className="flex items-center gap-2">
                {getMockExamSubjectLabelByCode(n.code)} -{" "}
                <p className="text-primary">{n.grade}등급</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DataTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        data={susiComprehensiveStep3.data?.items || []}
        mockExamScores={mockExamScores?.data || []}
      />
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
