import React, { useCallback, useEffect, useState } from "react";
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
import { InterestSubjectTable } from "./interest-subject-table";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useGetMyGrade } from "@/stores/server/features/me/queries";
import { useRemoveInterestUniv } from "@/stores/server/features/susi/interest-univ/mutations";
import { useGetInterestRecruitmentUnits } from "@/stores/server/features/susi/interest-univ/queries";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import { IInterestRecruitment } from "@/stores/server/features/susi/interest-univ/interfaces";
import { calculateSubjectRisk } from "@/lib/calculations/subject/risk";

export interface ProcessedInterestRecruitment extends IInterestRecruitment {
  risk: number;
}

type InterestSubjectProps = {
  onClickSusiSubjectDetail: (susiSubjectId: number) => void;
  className?: string;
  isCreatingCombination: boolean;
  selectedItems: IInterestRecruitment[];
  toggleItemSelection: (item: IInterestRecruitment) => void;
};

export const InterestSubject = React.memo(
  ({
    onClickSusiSubjectDetail,
    className,
    isCreatingCombination,
    selectedItems,
    toggleItemSelection,
  }: InterestSubjectProps) => {
    const {
      data: interestUnits,
      refetch: refetchInterestUnits,
      status: interestUnitsStatus,
    } = useGetInterestRecruitmentUnits("early_subject");
    const { data: myGrade } = useGetMyGrade();
    const removeInterestUniv = useRemoveInterestUniv();

    const [processedUnits, setProcessedUnits] = useState<
      ProcessedInterestRecruitment[]
    >([]);

    useEffect(() => {
      if (interestUnits && myGrade) {
        const processed = interestUnits.map((unit) => ({
          ...unit,
          risk: calculateSubjectRisk(myGrade, {
            risk_1: unit.recruitmentUnit.scores?.risk_plus_5 || null,
            risk_2: unit.recruitmentUnit.scores?.risk_plus_4 || null,
            risk_3: unit.recruitmentUnit.scores?.risk_plus_3 || null,
            risk_4: unit.recruitmentUnit.scores?.risk_plus_2 || null,
            risk_5: unit.recruitmentUnit.scores?.risk_plus_1 || null,
            risk_6: unit.recruitmentUnit.scores?.risk_minus_1 || null,
            risk_7: unit.recruitmentUnit.scores?.risk_minus_2 || null,
            risk_8: unit.recruitmentUnit.scores?.risk_minus_3 || null,
            risk_9: unit.recruitmentUnit.scores?.risk_minus_4 || null,
            risk_10: unit.recruitmentUnit.scores?.risk_minus_5 || null,
          }),
        }));
        setProcessedUnits(processed);
      }
    }, [interestUnits, myGrade]);

    const removeItem = useCallback(
      async (ids: number[]) => {
        if (!interestUnits) return;
        const result = await removeInterestUniv.mutateAsync({
          targetIds: ids,
          targetTable: "early_subject",
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
        targetTable: "early_subject",
      });
      if (result.success) {
        await refetchInterestUnits();
        toast.success(`성공적으로 모든 대학을 삭제했습니다.`);
      } else {
        toast.error(result.error);
      }
    }, [interestUnits, removeInterestUniv, refetchInterestUnits]);

    if (interestUnitsStatus === "pending") {
      return <LoadingSpinner />;
    }

    if (interestUnitsStatus === "error") {
      return <UnknownErrorPage />;
    }

    if (processedUnits.length === 0) {
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-20">
          <p className="text-base font-semibold sm:text-lg">
            관심대학으로 선택된 대학 목록이 비어있어요 🥲
          </p>
          <p className="text-sm text-foreground/70">
            <Link to="/ms/subject" className="text-blue-500">
              교과탭
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
                  전체삭제({processedUnits.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    관심대학으로 선택된 모든 대학 목록(교과)이 삭제됩니다.
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

        <InterestSubjectTable
          data={processedUnits}
          removeItem={removeItem}
          myGrade={myGrade}
          onClickSusiSubjectDetail={onClickSusiSubjectDetail}
          isCreatingCombination={isCreatingCombination}
          selectedItems={selectedItems}
          toggleItemSelection={
            toggleItemSelection as (item: ProcessedInterestRecruitment) => void
          }
        />
      </div>
    );
  },
);
