import React, { useCallback, useMemo } from "react";
import { InterestComprehensiveTable } from "./interest-comprehensive-table";
import { Button } from "@/components/custom/button";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useGetInterestRecruitmentUnits } from "@/stores/server/features/susi/interest-univ/queries";
import {
  useGetMyGrade,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { useRemoveInterestUniv } from "@/stores/server/features/susi/interest-univ/mutations";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/loading-spinner";
import UnknownErrorPage from "@/components/errors/unknown-error";
import { IInterestRecruitment } from "@/stores/server/features/susi/interest-univ/interfaces";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { calculateComprehensiveRisk } from "@/lib/calculations/early-compatibility-risk";
import { useGetOfficerEvaluations } from "@/stores/server/features/susi/evaluation/queries";

type InterestComprehensiveProps = {
  className?: string;
  onClickSusiComprehensiveDetail: (item: IInterestRecruitment) => void;
  isCreatingCombination: boolean;
  selectedItems: IInterestRecruitment[];
  toggleItemSelection: (item: IInterestRecruitment) => void;
};

export const InterestComprehensive = React.memo(
  ({
    className,
    onClickSusiComprehensiveDetail,
    isCreatingCombination,
    selectedItems,
    toggleItemSelection,
  }: InterestComprehensiveProps) => {
    // Queries
    const {
      data: interestUnits,
      refetch: refetchInterestUnits,
      status: interestUnitsStatus,
    } = useGetInterestRecruitmentUnits("early_comprehensive");
    const { data: myGrade } = useGetMyGrade();
    const { data: schoolRecord, status: schoolRecordStatus } =
      useGetSchoolRecords();
    const { data: staticData } = useGetStaticData();

    // Fetch all officer evaluations at once
    const evaluationIds = useMemo(() => {
      return (
        interestUnits
          ?.map((item) => item.evaluation_id)
          .filter((n) => n !== undefined) || []
      );
    }, [interestUnits]);

    const evaluations = useGetOfficerEvaluations([...new Set(evaluationIds)]);
    // Mutations
    const removeInterestUniv = useRemoveInterestUniv();

    const removeItem = useCallback(
      async (ids: number[]) => {
        if (!interestUnits) return;
        const result = await removeInterestUniv.mutateAsync({
          targetIds: ids,
          targetTable: "early_comprehensive",
        });
        if (result.success) {
          await refetchInterestUnits();
          toast.success(`성공적으로 대학을 삭제했습니다.`);
        } else {
          toast.error(result.error);
        }
      },
      [interestUnits, removeInterestUniv, refetchInterestUnits],
    );

    const removeAllItems = useCallback(async () => {
      if (!interestUnits) return;
      const result = await removeInterestUniv.mutateAsync({
        targetIds: interestUnits.map((item) => item.recruitmentUnit.id),
        targetTable: "early_comprehensive",
      });
      if (result.success) {
        await refetchInterestUnits();
        toast.success(`성공적으로 모든 대학을 삭제했습니다.`);
      } else {
        toast.error(result.error);
      }
    }, [interestUnits, removeInterestUniv, refetchInterestUnits]);

    // Pre-calculate all evaluations and risks
    const processedInterestUnits = useMemo(() => {
      if (
        !interestUnits ||
        !myGrade ||
        !schoolRecord ||
        !staticData ||
        !evaluations
      ) {
        return [];
      }

      return interestUnits.map((item) => {
        const evaluation = evaluations[item.evaluation_id!];

        const risk = calculateComprehensiveRisk({
          recruitmentUnit: item.recruitmentUnit,
          myEvaluationFactorScore: evaluation?.factorScores || {},
          myGrade,
          schoolRecord,
          staticData,
        });

        return { ...item, ...risk };
      });
    }, [interestUnits, myGrade, schoolRecord, staticData, evaluations]);

    if (interestUnitsStatus === "pending" || schoolRecordStatus === "pending") {
      return <LoadingSpinner />;
    }

    if (interestUnitsStatus === "error" || schoolRecordStatus === "error") {
      return <UnknownErrorPage />;
    }

    if (!interestUnits || interestUnits.length === 0) {
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-20">
          <p className="text-base font-semibold sm:text-lg">
            관심대학으로 선택된 대학 목록이 비어있어요 🥲
          </p>
          <p className="text-sm text-foreground/70">
            <Link to="/ms/comprehensive" className="text-blue-500">
              학종탭
            </Link>
            에서 대학을 탐색해서 관심목록에 담아보세요!
          </p>
        </div>
      );
    }

    return (
      <div className={cn("", className)}>
        <div className="flex items-center justify-end pb-2">
          {!isCreatingCombination && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  variant={"destructive"}
                >
                  <Trash className="size-4" />
                  전체삭제({interestUnits.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    관심대학으로 선택된 모든 대학 목록(학종)이 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={removeAllItems}>
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <InterestComprehensiveTable
          data={processedInterestUnits}
          removeItem={removeItem}
          onClickSusiComprehensiveDetail={onClickSusiComprehensiveDetail}
          isCreatingCombination={isCreatingCombination}
          selectedItems={selectedItems}
          toggleItemSelection={toggleItemSelection}
          myGrade={myGrade}
        />
      </div>
    );
  },
);
