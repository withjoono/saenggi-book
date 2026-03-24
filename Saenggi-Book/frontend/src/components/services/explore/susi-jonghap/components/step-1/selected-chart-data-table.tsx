import { Button } from "@/components/custom/button";
import { RiskBadge } from "@/components/custom/risk-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateSubjectRisk } from "@/lib/calculations/subject/risk";
import { cn } from "@/lib/utils";
import { IExploreSusiJonghapStep1Item } from "@/stores/server/features/explore/susi-jonghap/interfaces";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface SelectedChartDataTableProps {
  className?: string;
  data: IExploreSusiJonghapStep1Item[];
  myGrade?: number;
  selectedUniversities: number[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<number[]>>;
}

export const SelectedChartDataTable = ({
  data,
  myGrade,
  selectedUniversities,
  setSelectedUniversities,
  className,
}: SelectedChartDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const onClick = (item: IExploreSusiJonghapStep1Item) => {
    if (selectedUniversities.includes(item.id)) {
      setSelectedUniversities(
        selectedUniversities.filter((n) => n !== item.id),
      );
    } else {
      setSelectedUniversities([...selectedUniversities, item.id]);
    }
  };
  const checkSelectedItem = (item: IExploreSusiJonghapStep1Item) => {
    return selectedUniversities.includes(item.id);
  };

  const handleSelectAll = () => {
    const currentTableIds = data.map((item) => item.id);
    const areAllSelected = data.every((item) =>
      selectedUniversities.includes(item.id),
    );

    if (areAllSelected) {
      setSelectedUniversities([]);
    } else {
      setSelectedUniversities([
        ...selectedUniversities,
        ...currentTableIds.filter((id) => !selectedUniversities.includes(id)),
      ]);
    }
  };

  const isAllSelected = data.every((item) =>
    selectedUniversities.includes(item.id),
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <p className="text-center text-2xl font-semibold">
        🏫 대학교 목록 ({selectedUniversities.length})
      </p>
      <p className="text-center text-sm text-foreground/60">
        내 등급과 비교하여 대학교를 선택해주세요!
      </p>
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <p>🙋 내 등급이 표시되지 않는다면?</p>
        <Link to="/users/school-record" className="text-sm text-blue-500">
          생기부/성적 등록하기
        </Link>
      </div>
      <div className="w-full max-w-screen-lg overflow-x-auto text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {selectedUniversities.length} / {data.length}
          </p>
          <Button
            className="flex items-center px-3 py-1.5"
            variant={isAllSelected ? "default" : "outline"}
            onClick={handleSelectAll}
          >
            <span>전체 선택/해제</span>
          </Button>
        </div>
        <table className="w-full min-w-96 table-fixed bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-8 shrink-0 py-2 font-normal">선택</th>
              <th className="w-28 py-2 text-start font-normal">대학명</th>
              <th className="w-32 py-2 text-start font-normal">전형명</th>
              <th className="w-24 py-2 text-start font-normal">모집단위</th>
              <th className="w-20 py-2 text-start font-normal">최초컷</th>
              <th className="w-20 py-2 text-start font-normal">추합컷</th>
              <th className="w-20 py-2 text-start font-normal">내 등급</th>
              <th className="w-20 py-2 text-start font-normal">위험도</th>
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
                    <td className="py-2">
                      {item.admission.university.name}(
                      {item.admission.university.region})
                    </td>
                    <td className="py-2">{item.admission.name}</td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">
                      {parseFloat(item.scores?.grade50Cut + "")} 등급
                    </td>
                    <td className="py-2">
                      {parseFloat(item.scores?.grade70Cut + "")} 등급
                    </td>
                    <td className="py-2">
                      {myGrade ? `${myGrade} 등급` : "내 성적 없음"}
                    </td>
                    <td className="py-2">
                      {myGrade ? (
                        <RiskBadge
                          risk={calculateSubjectRisk(myGrade, {
                            risk_1: item.scores?.riskPlus5 || 0,
                            risk_2: item.scores?.riskPlus4 || 0,
                            risk_3: item.scores?.riskPlus3 || 0,
                            risk_4: item.scores?.riskPlus2 || 0,
                            risk_5: item.scores?.riskPlus1 || 0,
                            risk_6: item.scores?.riskMinus1 || 0,
                            risk_7: item.scores?.riskMinus2 || 0,
                            risk_8: item.scores?.riskMinus3 || 0,
                            risk_9: item.scores?.riskMinus4 || 0,
                            risk_10: item.scores?.riskMinus5 || 0,
                          })}
                        />
                      ) : (
                        "내 성적 없음"
                      )}
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
