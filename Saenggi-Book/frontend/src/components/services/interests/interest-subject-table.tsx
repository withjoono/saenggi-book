import React, { useState, useCallback } from "react";
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
import { Button } from "@/components/custom/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProcessedInterestRecruitment } from "./interest-subject";
import { IInterestRecruitment } from "@/stores/server/features/susi/interest-univ/interfaces";

interface InterestSubjectTableProps {
  className?: string;
  data: ProcessedInterestRecruitment[];
  removeItem: (ids: number[]) => Promise<void>;
  myGrade?: number;
  onClickSusiSubjectDetail: (susiSubjectId: number) => void;
  isCreatingCombination: boolean;
  selectedItems: IInterestRecruitment[];
  toggleItemSelection: (item: ProcessedInterestRecruitment) => void;
}

type SortType = "none" | "risk";

export const InterestSubjectTable = React.memo(
  ({
    data,
    removeItem,
    myGrade,
    className,
    onClickSusiSubjectDetail,
    isCreatingCombination,
    selectedItems,
    toggleItemSelection,
  }: InterestSubjectTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortType, setSortType] = useState<SortType>("risk");
    const itemsPerPage = 10;

    const sortedData = React.useMemo(() => {
      if (sortType === "risk") {
        return [...data].sort((a, b) => b.risk - a.risk);
      }
      return data;
    }, [data, sortType]);

    const currentItems = sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSortChange = (newSortType: SortType) => {
      setSortType((prevSortType) =>
        prevSortType === newSortType ? "none" : newSortType,
      );
    };

    const handleSelectAll = () => {
      if (selectedItems.length === data.length) {
        toggleItemSelection([] as unknown as ProcessedInterestRecruitment);
      } else {
        data.forEach((item) => toggleItemSelection(item));
      }
    };

    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isCreatingCombination && (
              <Button
                className="flex items-center px-3 py-1.5"
                variant={
                  selectedItems.length === data.length ? "default" : "outline"
                }
                onClick={handleSelectAll}
              >
                <span>전체 선택/해제</span>
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="riskSort"
                checked={sortType === "risk"}
                onCheckedChange={() => handleSortChange("risk")}
              />
              <Label htmlFor="riskSort">위험도 정렬</Label>
            </div>
          </div>
        </div>

        <div className="w-full max-w-screen-lg overflow-x-auto text-sm">
          <table className="w-full min-w-96 table-fixed bg-white">
            <thead className="bg-gray-100">
              <tr>
                {isCreatingCombination && (
                  <th className="w-12 py-2 text-start font-normal">선택</th>
                )}
                <th className="w-28 py-2 text-start font-normal">대학명</th>
                <th className="w-28 py-2 text-start font-normal">전형명</th>
                <th className="w-36 py-2 text-start font-normal">모집단위</th>
                <th className="w-20 py-2 text-start font-normal">환산컷</th>
                <th className="w-20 py-2 text-start font-normal">교과컷</th>
                <th className="w-24 py-2 text-start font-normal">위험도</th>
                <th className="w-20 py-2 text-start font-normal">상세보기</th>
                <th className="w-12 py-2 text-start font-normal"></th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {currentItems.map((item) => (
                <TableRow
                  key={item.recruitmentUnit.id}
                  item={item}
                  myGrade={myGrade}
                  removeItem={removeItem}
                  onClickSusiSubjectDetail={onClickSusiSubjectDetail}
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
        <div className="flex flex-col items-center justify-center space-y-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </div>
          <div className="flex items-center justify-end space-x-2">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const TableRow = React.memo(
  ({
    item,
    myGrade,
    removeItem,
    onClickSusiSubjectDetail,
    isCreatingCombination,
    isSelected,
    toggleItemSelection,
  }: {
    item: ProcessedInterestRecruitment;
    myGrade?: number;
    removeItem: (ids: number[]) => Promise<void>;
    onClickSusiSubjectDetail: (susiSubjectId: number) => void;
    isCreatingCombination: boolean;
    isSelected: boolean;
    toggleItemSelection: (item: ProcessedInterestRecruitment) => void;
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
          {parseFloat(item.recruitmentUnit.scores?.convert_50_cut + "") || "-"}
        </td>
        <td className="py-2">
          {parseFloat(item.recruitmentUnit.scores?.grade_50_cut + "") || "-"}
        </td>
        <td className="py-2">
          {myGrade ? <RiskBadge risk={item.risk} /> : "내 성적 없음"}
        </td>
        <td className="py-2" onClick={(e) => e.stopPropagation()}>
          <p
            className="cursor-pointer text-primary hover:underline"
            onClick={() => onClickSusiSubjectDetail(item.recruitmentUnit.id)}
          >
            입결 확인
          </p>
        </td>
        <td className="py-2" onClick={(e) => e.stopPropagation()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <th className="cursor-pointer text-red-500 hover:underline">
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
        </td>
      </tr>
    );
  },
);

export default InterestSubjectTable;
