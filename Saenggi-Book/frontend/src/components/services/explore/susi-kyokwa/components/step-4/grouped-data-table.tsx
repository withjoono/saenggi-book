import { Button } from "@/components/custom/button";
import { RiskBadge } from "@/components/custom/risk-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateSubjectRisk } from "@/lib/calculations/subject/risk";
import { cn } from "@/lib/utils";
import { IExploreSusiKyokwaStep4Item } from "@/stores/server/features/explore/susi-kyokwa/interfaces";
import { useEffect, useState } from "react";

interface GroupedDataTableProps {
  className?: string;
  data: IExploreSusiKyokwaStep4Item[];
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  myGrade?: number;
  onClickSusiSubjectDetail: (susiSubjectId: number) => void;
}

export const GroupedDataTable = ({
  data,
  selectedIds,
  setSelectedIds,
  className,
  myGrade,
  onClickSusiSubjectDetail,
}: GroupedDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const onClick = (item: IExploreSusiKyokwaStep4Item) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(selectedIds.filter((n) => n !== item.id));
    } else {
      setSelectedIds([...selectedIds, item.id]);
    }
  };

  const checkSelectedItem = (item: IExploreSusiKyokwaStep4Item) => {
    return selectedIds.includes(item.id);
  };

  const handleSelectAll = () => {
    const currentTableIds = data.map((item) => item.id);
    const areAllSelected = data.every((item) => selectedIds.includes(item.id));

    if (areAllSelected) {
      setSelectedIds(selectedIds.filter((id) => !currentTableIds.includes(id)));
    } else {
      setSelectedIds([
        ...selectedIds,
        ...currentTableIds.filter((id) => !selectedIds.includes(id)),
      ]);
    }
  };

  const isCurrentPageAllSelected = data.every((item) =>
    selectedIds.includes(item.id),
  );
  const isCurrentPageSelected = data.filter((item) =>
    selectedIds.includes(item.id),
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <div className="w-full max-w-screen-lg overflow-x-auto pt-8 text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {isCurrentPageSelected.length} / {data.length}
          </p>
          <Button
            className="flex items-center px-3 py-1.5"
            variant={isCurrentPageAllSelected ? "default" : "outline"}
            onClick={handleSelectAll}
          >
            <span>전체 선택/해제</span>
          </Button>
        </div>
        <table className="w-full min-w-96 table-fixed bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-8 shrink-0 py-2 font-normal">선택</th>
              <th className="w-28 py-2 text-start font-normal">모집단위</th>
              <th className="w-16 py-2 text-start font-normal">최초컷</th>
              <th className="w-16 py-2 text-start font-normal">추합컷</th>
              <th className="w-16 py-2 text-start font-normal">위험도</th>
              <th className="w-24 py-2 text-start font-normal">상세보기</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {data
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((item) => {
                const isSelected = checkSelectedItem(item);
                return (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-t hover:bg-accent"
                    onClick={() => onClick(item)}
                  >
                    <td className="align-middle">
                      <div className="flex h-full items-center justify-center">
                        <Checkbox checked={isSelected} />
                      </div>
                    </td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">
                      {(() => {
                        const val = item.scores?.grade50Cut;
                        if (val === null || val === undefined) return "-";
                        const num = Number(val);
                        return isNaN(num) ? "-" : num.toFixed(2);
                      })()}
                    </td>
                    <td className="py-2">
                      {(() => {
                        const val = item.scores?.grade70Cut;
                        if (val === null || val === undefined) return "-";
                        const num = Number(val);
                        return isNaN(num) ? "-" : num.toFixed(2);
                      })()}
                    </td>
                    <th className="py-2 text-start">
                      {myGrade ? (
                        <RiskBadge
                          risk={calculateSubjectRisk(myGrade, {
                            risk_1: item.scores?.riskPlus5 || null,
                            risk_2: item.scores?.riskPlus4 || null,
                            risk_3: item.scores?.riskPlus3 || null,
                            risk_4: item.scores?.riskPlus2 || null,
                            risk_5: item.scores?.riskPlus1 || null,
                            risk_6: item.scores?.riskMinus1 || null,
                            risk_7: item.scores?.riskMinus2 || null,
                            risk_8: item.scores?.riskMinus3 || null,
                            risk_9: item.scores?.riskMinus4 || null,
                            risk_10: item.scores?.riskMinus5 || null,
                          })}
                        />
                      ) : (
                        "내 성적 필요"
                      )}
                    </th>
                    <td className="py-2">
                      <p
                        className="cursor-pointer text-primary hover:underline"
                        onClick={() => onClickSusiSubjectDetail(item.id)}
                      >
                        입결 확인
                      </p>
                    </td>
                  </tr>
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
