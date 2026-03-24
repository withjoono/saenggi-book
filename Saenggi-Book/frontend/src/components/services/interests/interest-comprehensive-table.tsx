import React, { useCallback } from "react";
import { RiskBadge } from "@/components/custom/risk-badge";
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
import { cn } from "@/lib/utils";
import { IInterestRecruitment } from "@/stores/server/features/susi/interest-univ/interfaces";

interface ProcessedInterestRecruitment extends IInterestRecruitment {
  isNonSubjectExist: boolean;
  nonSubjectRisk: number;
  isSubjectExist: boolean;
  subjectRisk: number;
  compatibilityRisk: number;
  totalRisk: number;
}

interface GroupedDataTableProps {
  className?: string;
  data: ProcessedInterestRecruitment[];
  removeItem: (ids: number[]) => Promise<void>;
  onClickSusiComprehensiveDetail: (item: IInterestRecruitment) => void;
  isCreatingCombination: boolean;
  selectedItems: IInterestRecruitment[];
  toggleItemSelection: (item: IInterestRecruitment) => void;
  myGrade?: number;
}

export const InterestComprehensiveTable = React.memo(
  ({
    data,
    removeItem,
    className,
    onClickSusiComprehensiveDetail,
    isCreatingCombination,
    selectedItems,
    toggleItemSelection,
  }: GroupedDataTableProps) => {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-end justify-center pb-8",
          className,
        )}
      >
        <div className="w-full max-w-screen-lg overflow-x-auto pt-8 text-sm">
          <table className="w-full min-w-96 table-fixed bg-white">
            <thead className="bg-gray-100">
              <tr>
                {isCreatingCombination && (
                  <th className="w-12 py-2 text-start font-normal">선택</th>
                )}
                <th className="w-28 py-2 text-start font-normal">대학명</th>
                <th className="w-28 py-2 text-start font-normal">전형명</th>
                <th className="w-36 py-2 text-start font-normal">모집단위</th>
                <th className="w-20 py-2 text-start font-normal">계열적합성</th>
                <th className="w-20 py-2 text-start font-normal">교과</th>
                <th className="w-20 py-2 text-start font-normal">비교과</th>
                <th className="w-20 py-2 text-start font-normal">종합위험도</th>
                <th className="w-20 py-2 text-start font-normal">상세보기</th>
                <th className="w-12 py-2 text-start font-normal"></th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {data.map((item) => (
                <TableRow
                  key={item.recruitmentUnit.id}
                  item={item}
                  removeItem={removeItem}
                  onClickSusiComprehensiveDetail={
                    onClickSusiComprehensiveDetail
                  }
                  isCreatingCombination={isCreatingCombination}
                  isSelected={selectedItems.some(
                    (i) => i.recruitmentUnit.id === item.recruitmentUnit.id,
                  )}
                  toggleItemSelection={toggleItemSelection}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

const TableRow = React.memo(
  ({
    item,
    removeItem,
    onClickSusiComprehensiveDetail,
    isCreatingCombination,
    isSelected,
    toggleItemSelection,
  }: {
    item: ProcessedInterestRecruitment;
    onClickSusiComprehensiveDetail: (item: IInterestRecruitment) => void;
    removeItem: (ids: number[]) => Promise<void>;
    isCreatingCombination: boolean;
    isSelected: boolean;
    toggleItemSelection: (item: IInterestRecruitment) => void;
  }) => {
    const handleRowClick = useCallback(() => {
      if (isCreatingCombination) {
        toggleItemSelection(item);
      }
    }, [isCreatingCombination, toggleItemSelection, item]);

    const handleCheckboxChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        toggleItemSelection(item);
      },
      [toggleItemSelection, item],
    );

    return (
      <tr
        className={cn("cursor-pointer border-t", isSelected && "bg-blue-100")}
        onClick={handleRowClick}
      >
        {isCreatingCombination && (
          <td className="py-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
            />
          </td>
        )}
        <td className="py-2">
          {item.recruitmentUnit.university.name}(
          {item.recruitmentUnit.university.region})
        </td>
        <td className="py-2">{item.recruitmentUnit.admission.name}</td>
        <td className="py-2">{item.recruitmentUnit.name}</td>
        <td className="py-2">
          <RiskBadge risk={item.compatibilityRisk || 10} />
        </td>
        <td className="py-2">
          {item.isSubjectExist ? (
            <RiskBadge risk={item.subjectRisk || 10} />
          ) : (
            "내 성적 없음"
          )}
        </td>
        <td className="py-2">
          {item.isNonSubjectExist ? (
            <RiskBadge risk={item.nonSubjectRisk || 10} />
          ) : (
            "데이터 없음"
          )}
        </td>
        <td className="py-2">
          <RiskBadge risk={Math.floor(item.totalRisk || 10)} />
        </td>
        <td className="py-2" onClick={(e) => e.stopPropagation()}>
          <p
            className="cursor-pointer text-primary hover:underline"
            onClick={() => onClickSusiComprehensiveDetail(item)}
          >
            입결 확인
          </p>
        </td>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <th
              className="w-12 cursor-pointer py-2 text-red-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              삭제
            </th>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                {item.recruitmentUnit.university.name}(
                {item.recruitmentUnit.name}
                )가 관심대학 목록에서 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  removeItem([item.recruitmentUnit.id]);
                }}
              >
                확인
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </tr>
    );
  },
);
