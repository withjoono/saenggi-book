import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/custom/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { IExploreSusiKyokwaStep5Item } from "@/stores/server/features/explore/susi-kyokwa/interfaces";

interface DataTableProps {
  className?: string;
  data: IExploreSusiKyokwaStep5Item[];
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const DataTable = ({
  data,
  selectedIds,
  setSelectedIds,
  className,
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const onClick = (item: IExploreSusiKyokwaStep5Item) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(selectedIds.filter((n) => n !== item.id));
    } else {
      setSelectedIds([...selectedIds, item.id]);
    }
  };
  const checkSelectedItem = (item: IExploreSusiKyokwaStep5Item) => {
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
                    <td className="w-28 py-2">
                      {item.university.name}({item.university.region})
                    </td>
                    <td className="w-24 py-2">{item.admission.name}</td>
                    <td className="w-32 py-2">{item.name}</td>
                    <td className="w-20 py-2">
                      {item.interview?.interviewDate || "-"}
                    </td>
                    <td className="w-20 py-2">
                      {item.interview?.interviewTime || "-"}
                    </td>
                    <td className="w-20 py-2">
                      <Dialog>
                        <DialogTrigger
                          onClick={(event) => event.stopPropagation()}
                        >
                          <p className="text-blue-500 hover:underline">
                            상세보기
                          </p>
                        </DialogTrigger>
                        <DialogContent
                          onClick={(event) => event.stopPropagation()}
                          className="max-w-xl px-4 sm:px-6"
                        >
                          <DialogHeader>
                            <DialogTitle className="py-0 text-left text-xl font-bold">
                              면접 정보
                            </DialogTitle>
                            <DialogDescription className="py-0 text-left">
                              면접 일정과 내용을 확인해주세요!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="w-full space-y-4 pb-4 text-sm sm:text-base">
                            <div className="grid grid-cols-4">
                              <p className="text-center font-semibold">
                                전형일
                              </p>
                              <p className="text-center">
                                {item.interview?.interviewDate || "-"}
                              </p>
                              <p className="text-center font-semibold">시간</p>
                              <p className="text-center">
                                {item.interview?.interviewTime || "-"}
                              </p>
                            </div>
                            <div className="grid grid-cols-4">
                              <p className="text-center font-semibold">
                                점수 반영여부
                              </p>
                              <p className="text-center">
                                {item.interview?.isReflected === 1
                                  ? "반영"
                                  : "미반영"}
                              </p>
                              <p className="text-center font-semibold">유형</p>
                              <p className="text-center">
                                {item.interview?.interviewType || "-"}
                              </p>
                            </div>
                            <div className="grid grid-cols-4">
                              <p className="text-center font-semibold">
                                활용자료
                              </p>
                              <p className="text-center">
                                {item.interview?.materialsUsed || "-"}
                              </p>
                              <p className="text-center font-semibold">
                                진행방식
                              </p>
                              <p className="text-center">
                                {item.interview?.interviewProcess || "-"}
                              </p>
                            </div>
                            <div className="grid grid-cols-4">
                              <p className="text-center font-semibold">
                                평가내용
                              </p>
                              <p className="col-span-3 break-all text-center">
                                {item.interview?.evaluationContent || "-"}
                              </p>
                            </div>
                          </div>
                          <DialogClose asChild>
                            <Button className="w-full" variant={"default"}>
                              확인
                            </Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
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
