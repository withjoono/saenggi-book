import { Button } from "@/components/custom/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { IExploreSusiJonghapStep4Item } from "@/stores/server/features/explore/susi-jonghap/interfaces";
import { useState } from "react";

interface DataTableProps {
  className?: string;
  data: IExploreSusiJonghapStep4Item[];
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  onClickSusiComprehensiveDetail: (susiComprehensiveId: number) => void;
}

export const DataTable = ({
  data,
  selectedIds,
  setSelectedIds,
  className,
  onClickSusiComprehensiveDetail,
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const onClick = (item: IExploreSusiJonghapStep4Item) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(selectedIds.filter((n) => n !== item.id));
    } else {
      setSelectedIds([...selectedIds, item.id]);
    }
  };

  const checkSelectedItem = (item: IExploreSusiJonghapStep4Item) => {
    return selectedIds.includes(item.id);
  };

  const handleSelectAll = () => {
    const currentTableIds = data.map((item) => item.id);
    const areAllSelected = data.every((item) => selectedIds.includes(item.id));

    if (areAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds([
        ...selectedIds,
        ...currentTableIds.filter((id) => !selectedIds.includes(id)),
      ]);
    }
  };

  const isAllSelected = data.every((item) => selectedIds.includes(item.id));

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
            {selectedIds.length} / {data.length}
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
              <th className="w-24 py-2 text-start font-normal">전형명</th>
              <th className="w-32 py-2 text-start font-normal">모집단위</th>
              <th className="w-20 py-2 text-start font-normal">전형일</th>
              <th className="w-20 py-2 text-start font-normal">면접시간</th>
              <th className="w-20 py-2 text-start font-normal">상세보기</th>
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
                    <td className="py-2">{item.university.name}</td>
                    <td className="py-2">{item.admission.name}</td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">
                      {item.interview?.interview_date || "-"}
                    </td>
                    <td className="py-2">
                      {item.interview?.interview_time || "-"}
                    </td>
                    <td className="py-2">
                      <p
                        className="text-primary hover:underline"
                        onClick={() => onClickSusiComprehensiveDetail(item.id)}
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
