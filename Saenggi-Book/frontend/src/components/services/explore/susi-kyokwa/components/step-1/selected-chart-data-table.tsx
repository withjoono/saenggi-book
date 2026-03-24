import { Button } from "@/components/custom/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  IExploreSusiKyokwaStep1Item,
  IExploreSusiKyokwaStep1Response,
} from "@/stores/server/features/explore/susi-kyokwa/interfaces";
import { useGetExploreSusiKyokwaStep4 } from "@/stores/server/features/explore/susi-kyokwa/queries";
import { Link } from "@tanstack/react-router";
import { Fragment, useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SelectedChartDataTableProps {
  className?: string;
  data: IExploreSusiKyokwaStep1Response;
  myGrade?: number;
  list: string[];
  selectedUniversities: string[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
  selectedRecruitmentUnits: number[];
  setSelectedRecruitmentUnits: React.Dispatch<React.SetStateAction<number[]>>;
}

export const SelectedChartDataTable = ({
  data,
  list,
  myGrade,
  selectedUniversities,
  setSelectedUniversities,
  selectedRecruitmentUnits,
  setSelectedRecruitmentUnits,
  className,
}: SelectedChartDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(list.length / itemsPerPage);

  // 현재 페이지에 표시되는 전형들의 recruitmentUnitIds 수집
  const currentPageRecruitmentUnitIds = useMemo(() => {
    const ids: number[] = [];
    list
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .forEach((key) => {
        const item = data.items.find(
          (item) =>
            `${item.university?.region}-${item.university?.name}-${item.name}` ===
            key,
        );
        if (item?.recruitmentUnitIds) {
          ids.push(...item.recruitmentUnitIds);
        }
      });
    return ids;
  }, [list, currentPage, data.items]);

  // 모집단위 상세 정보 조회 (등급컷 포함)
  const { data: recruitmentUnitsData } = useGetExploreSusiKyokwaStep4(
    currentPageRecruitmentUnitIds,
  );

  const toggleExpand = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // 전형에 속한 모집단위 목록 가져오기
  const getRecruitmentUnitsForItem = (item: IExploreSusiKyokwaStep1Item) => {
    if (!recruitmentUnitsData?.items || !item.recruitmentUnitIds) return [];
    return recruitmentUnitsData.items.filter((unit) =>
      item.recruitmentUnitIds.includes(unit.id),
    );
  };

  // 모집단위들의 등급컷 범위 계산
  const getGradeCutRange = (item: IExploreSusiKyokwaStep1Item) => {
    const units = getRecruitmentUnitsForItem(item);
    if (units.length === 0) return { min: null, max: null };

    const cuts = units
      .map((u) => u.scores?.grade70Cut)
      .filter((cut): cut is number => cut !== null && cut !== undefined);

    if (cuts.length === 0) return { min: null, max: null };

    return {
      min: Math.min(...cuts),
      max: Math.max(...cuts),
    };
  };

  // 모집단위 선택/해제
  const toggleRecruitmentUnit = (unitId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRecruitmentUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId],
    );
  };

  // 전형 전체 선택/해제 (해당 전형의 모든 모집단위)
  const toggleAllUnitsInAdmission = (item: IExploreSusiKyokwaStep1Item) => {
    const units = getRecruitmentUnitsForItem(item);
    const unitIds = units.map((u) => u.id);
    const allSelected = unitIds.every((id) => selectedRecruitmentUnits.includes(id));

    if (allSelected) {
      setSelectedRecruitmentUnits((prev) =>
        prev.filter((id) => !unitIds.includes(id)),
      );
    } else {
      setSelectedRecruitmentUnits((prev) => {
        const newIds = unitIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  // 전형의 모든 모집단위가 선택되었는지 확인
  const isAllUnitsSelected = (item: IExploreSusiKyokwaStep1Item) => {
    const units = getRecruitmentUnitsForItem(item);
    if (units.length === 0) return false;
    return units.every((u) => selectedRecruitmentUnits.includes(u.id));
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const allUnitIds: number[] = [];
    list.forEach((key) => {
      const item = data.items.find(
        (item) =>
          `${item.university?.region}-${item.university?.name}-${item.name}` ===
          key,
      );
      if (item?.recruitmentUnitIds) {
        allUnitIds.push(...item.recruitmentUnitIds);
      }
    });

    const allSelected = allUnitIds.every((id) =>
      selectedRecruitmentUnits.includes(id),
    );

    if (allSelected) {
      setSelectedRecruitmentUnits([]);
    } else {
      setSelectedRecruitmentUnits(allUnitIds);
    }
  };

  // selectedUniversities 업데이트 (부모 컴포넌트와 동기화)
  useEffect(() => {
    const selectedKeys: string[] = [];
    list.forEach((key) => {
      const item = data.items.find(
        (item) =>
          `${item.university?.region}-${item.university?.name}-${item.name}` ===
          key,
      );
      if (item) {
        const units = getRecruitmentUnitsForItem(item);
        const hasSelectedUnit = units.some((u) =>
          selectedRecruitmentUnits.includes(u.id),
        );
        if (hasSelectedUnit) {
          selectedKeys.push(key);
        }
      }
    });
    // 부모 컴포넌트의 selectedUniversities 업데이트
    if (JSON.stringify(selectedKeys.sort()) !== JSON.stringify(selectedUniversities.sort())) {
      setSelectedUniversities(selectedKeys);
    }
  }, [selectedRecruitmentUnits, list, data.items, recruitmentUnitsData, selectedUniversities, setSelectedUniversities]);

  const isAllSelected = useMemo(() => {
    const allUnitIds: number[] = [];
    list.forEach((key) => {
      const item = data.items.find(
        (item) =>
          `${item.university?.region}-${item.university?.name}-${item.name}` ===
          key,
      );
      if (item?.recruitmentUnitIds) {
        allUnitIds.push(...item.recruitmentUnitIds);
      }
    });
    return allUnitIds.length > 0 && allUnitIds.every((id) => selectedRecruitmentUnits.includes(id));
  }, [list, data.items, selectedRecruitmentUnits]);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <p>🙋 내 등급이 표시되지 않는다면?</p>
        <Link to="/users/school-record" className="text-sm text-blue-500">
          생기부/성적 등록하기
        </Link>
      </div>

      <div className="w-full max-w-screen-xl overflow-x-auto text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {selectedRecruitmentUnits.length}개 선택
          </p>
          <Button
            className="flex items-center px-3 py-1.5"
            variant={isAllSelected ? "default" : "outline"}
            onClick={handleSelectAll}
          >
            <span>전체 선택/해제</span>
          </Button>
        </div>
        <table className="w-full min-w-[900px] bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-10 py-2 font-normal"></th>
              <th className="w-12 py-2 font-normal">선택</th>
              <th className="py-2 px-3 text-start font-normal whitespace-nowrap">대학명</th>
              <th className="py-2 px-3 text-start font-normal whitespace-nowrap">전형명</th>
              <th className="py-2 px-3 text-start font-normal whitespace-nowrap">계열</th>
              <th className="py-2 px-3 text-start font-normal whitespace-nowrap">등급컷 범위</th>
              <th className="py-2 px-3 text-start font-normal whitespace-nowrap">모집단위</th>
              <th className="py-2 px-3 text-start font-normal whitespace-nowrap">내 등급</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {list
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((key) => {
                const item = data.items.find(
                  (item) =>
                    `${item.university?.region}-${item.university?.name}-${item.name}` ===
                    key,
                );
                if (!item) return null;

                const isExpanded = expandedItems.includes(key);
                const recruitmentUnits = getRecruitmentUnitsForItem(item);
                const unitCount = item.recruitmentUnitIds?.length || 0;
                const gradeCutRange = getGradeCutRange(item);
                const allUnitsSelected = isAllUnitsSelected(item);

                return (
                  <Fragment key={key}>
                    <tr
                      className="cursor-pointer border-t hover:bg-accent"
                      onClick={() => toggleAllUnitsInAdmission(item)}
                    >
                      <td className="align-middle">
                        {unitCount > 0 && (
                          <button
                            className="p-1 hover:bg-gray-200 rounded"
                            onClick={(e) => toggleExpand(key, e)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="align-middle">
                        <div className="flex h-full items-center justify-center">
                          <Checkbox checked={allUnitsSelected} />
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {item.university?.name}({item.university?.region})
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">{item.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{item.generalType?.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {gradeCutRange.min !== null && gradeCutRange.max !== null ? (
                          gradeCutRange.min === gradeCutRange.max ? (
                            <span>{gradeCutRange.min.toFixed(2)}등급</span>
                          ) : (
                            <span>
                              {gradeCutRange.min.toFixed(2)} ~ {gradeCutRange.max.toFixed(2)}등급
                            </span>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-3 text-primary whitespace-nowrap">
                        {unitCount}개
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {myGrade ? `${myGrade.toFixed(2)}등급` : "내 성적 없음"}
                      </td>
                    </tr>
                    {/* 모집단위 테이블 (확장 시) */}
                    {isExpanded && recruitmentUnits.length > 0 && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 p-0">
                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs text-gray-500 font-normal">
                                📋 모집단위 목록 ({recruitmentUnits.length}개)
                              </p>
                              <Button
                                size="sm"
                                variant={allUnitsSelected ? "default" : "outline"}
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAllUnitsInAdmission(item);
                                }}
                              >
                                {allUnitsSelected ? "전체 해제" : "전체 선택"}
                              </Button>
                            </div>
                            <table className="w-full bg-white border rounded">
                              <thead className="bg-gray-100 text-xs">
                                <tr>
                                  <th className="py-2 px-3 text-start font-normal whitespace-nowrap">대학</th>
                                  <th className="py-2 px-3 text-start font-normal whitespace-nowrap">계열</th>
                                  <th className="py-2 px-3 text-start font-normal whitespace-nowrap">전형명</th>
                                  <th className="py-2 px-3 text-start font-normal whitespace-nowrap">모집단위</th>
                                  <th className="py-2 px-3 text-start font-normal whitespace-nowrap">최초컷</th>
                                  <th className="py-2 px-3 text-start font-normal whitespace-nowrap">내등급차이</th>
                                  <th className="py-2 px-3 text-center font-normal whitespace-nowrap">선택</th>
                                </tr>
                              </thead>
                              <tbody className="text-xs">
                                {recruitmentUnits.map((unit) => {
                                  const gradeCut = unit.scores?.grade70Cut;
                                  const gradeCutNum = typeof gradeCut === 'number' ? gradeCut : (gradeCut ? parseFloat(gradeCut) : null);
                                  const gradeDiff = gradeCutNum !== null && gradeCutNum !== undefined && myGrade
                                    ? (gradeCutNum - myGrade).toFixed(2)
                                    : null;
                                  const isSelected = selectedRecruitmentUnits.includes(unit.id);

                                  return (
                                    <tr
                                      key={unit.id}
                                      className={cn(
                                        "border-t hover:bg-accent cursor-pointer",
                                        isSelected && "bg-primary/10",
                                      )}
                                      onClick={(e) => toggleRecruitmentUnit(unit.id, e)}
                                    >
                                      <td className="py-2 px-3 whitespace-nowrap">
                                        {unit.university?.name}
                                      </td>
                                      <td className="py-2 px-3 whitespace-nowrap">
                                        {unit.generalField?.name || "-"}
                                      </td>
                                      <td className="py-2 px-3 whitespace-nowrap">
                                        {unit.admission?.name}
                                      </td>
                                      <td className="py-2 px-3 font-medium whitespace-nowrap">
                                        {unit.name}
                                      </td>
                                      <td className="py-2 px-3 whitespace-nowrap">
                                        {gradeCutNum !== null && gradeCutNum !== undefined ? `${gradeCutNum.toFixed(2)}등급` : "-"}
                                      </td>
                                      <td className="py-2 px-3 whitespace-nowrap">
                                        {gradeDiff !== null ? (
                                          <span
                                            className={cn(
                                              "font-medium",
                                              parseFloat(gradeDiff) > 0
                                                ? "text-green-600"
                                                : parseFloat(gradeDiff) < 0
                                                  ? "text-red-600"
                                                  : "text-gray-600",
                                            )}
                                          >
                                            {parseFloat(gradeDiff) > 0 ? "+" : ""}
                                            {gradeDiff}
                                          </span>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <Checkbox
                                          checked={isSelected}
                                          onClick={(e) => e.stopPropagation()}
                                          onCheckedChange={() => {
                                            setSelectedRecruitmentUnits((prev) =>
                                              prev.includes(unit.id)
                                                ? prev.filter((id) => id !== unit.id)
                                                : [...prev, unit.id],
                                            );
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
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
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
