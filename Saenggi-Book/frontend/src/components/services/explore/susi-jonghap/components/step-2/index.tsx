import { useMemo, useState } from "react";
import {
  DataTable,
  IExploreSusiJonghapStep2ItemWithMyScores,
} from "./data-table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/custom/button";
import { useGetOfficerEvaluation } from "@/stores/server/features/susi/evaluation/queries";
import { Step2Chart } from "./step-2-chart";
import { useGetExploreSusiJonghapStep2 } from "@/stores/server/features/explore/susi-jonghap/queries";
import { useExploreSusiJonghapStepper } from "../../context/explore-susi-jonghap-provider";
import { calculateEvaluationScore } from "@/lib/calculations/evaluation/score";

export const SusiJonghapStep2 = () => {
  const { prevStep, nextStep, formData, updateFormData } =
    useExploreSusiJonghapStepper();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSorted, setIsSorted] = useState(false);

  // Queries
  const { data: susiComprehensiveStep2 } = useGetExploreSusiJonghapStep2(
    formData.step1SelectedIds,
  );
  const { data: myEvaluation } = useGetOfficerEvaluation(
    formData.evaluation_id || 0,
  );

  // 관심대학 저장
  const handleNextClick = async () => {
    updateFormData("step2SelectedIds", selectedIds);
    nextStep();
  };

  const dataWithMyScore = susiComprehensiveStep2?.items.map((n) => {
    return {
      ...n,
      myScores: calculateEvaluationScore({
        myEvaluationFactorScore: myEvaluation?.factorScores || {},
        ratios: n.admission.method.school_record_evaluation_score || "",
        codes: n.admission.method.school_record_evaluation_elements || "",
      }),
    } as IExploreSusiJonghapStep2ItemWithMyScores;
  });

  const sortedData = useMemo(() => {
    if (!isSorted) return dataWithMyScore || [];
    return (
      dataWithMyScore?.sort(
        (a, b) => b.myScores.totalScore - a.myScores.totalScore,
      ) || []
    );
  }, [dataWithMyScore, isSorted]);

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      <div className="w-full py-4">
        <div className="h-[500px] overflow-x-auto">
          {<Step2Chart data={sortedData} />}
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="airplane-mode"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="airplane-mode">유리한순 정렬</Label>
        </div>
      </div>

      <div className="w-full">
        <p className="pb-2 text-center text-2xl font-semibold">
          비교과 체크({selectedIds.length})
        </p>
        <p className="text-center text-sm text-foreground/60">
          내 비교과 점수에 대한 대학별 위험도를 체크해보세요!
        </p>
      </div>
      <DataTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        data={sortedData}
        evaluationId={formData.evaluation_id}
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
