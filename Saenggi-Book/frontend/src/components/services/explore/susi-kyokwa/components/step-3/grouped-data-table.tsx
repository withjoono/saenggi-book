import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { SusiKyokwaStep3GroupData } from "./step-3";

interface GroupedDataTableProps {
  className?: string;
  groupedData: {
    [key: string]: SusiKyokwaStep3GroupData;
  };
  selectedUniversities: string[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
}

export const GroupedDataTable = ({
  groupedData,
  selectedUniversities,
  setSelectedUniversities,
  className,
}: GroupedDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const list = Object.keys(groupedData);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  const onClick = (item: SusiKyokwaStep3GroupData) => {
    const key = `${item.university_name}-${item.university_region}-${item.admission_name}-${item.general_field_name}`;
    if (selectedUniversities.includes(key)) {
      setSelectedUniversities(selectedUniversities.filter((n) => n !== key));
    } else {
      setSelectedUniversities([...selectedUniversities, key]);
    }
  };

  const checkSelectedItem = (item: SusiKyokwaStep3GroupData) => {
    const key = `${item.university_name}-${item.university_region}-${item.admission_name}-${item.general_field_name}`;
    return selectedUniversities.includes(key);
  };

  const handleSelectAll = () => {
    const allKeys = list.map((key) => key);
    const areAllSelected = allKeys.every((key) =>
      selectedUniversities.includes(key),
    );
    if (areAllSelected) {
      setSelectedUniversities([]);
    } else {
      setSelectedUniversities(allKeys);
    }
  };

  const isAllSelected = list.every((key) => selectedUniversities.includes(key));

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <p className="text-center text-2xl font-semibold">
        전형 방법 확인 ({selectedUniversities.length})
      </p>
      <p className="text-center text-sm text-foreground/60">
        각 전형의 세부 방법을 확인하세요
      </p>
      <div className="w-full max-w-screen-lg overflow-x-auto pt-8 text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {selectedUniversities.length} / {list.length}
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
              <th className="w-16 py-2 text-start font-normal">계열</th>
              <th className="w-24 py-2 text-start font-normal">전형 방법</th>
              <th className="w-20 py-2 text-start font-normal">상세 정보</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {list
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((key) => {
                const item = groupedData[key];
                if (!item) return null;

                const isSelected = checkSelectedItem(item);
                return (
                  <tr
                    key={key}
                    className="cursor-pointer border-t hover:bg-accent"
                    onClick={() => onClick(item)}
                  >
                    <td className="align-middle">
                      <div className="flex h-full items-center justify-center">
                        <Checkbox checked={isSelected} />
                      </div>
                    </td>
                    <td className="py-2">
                      {item.university_name}({item.university_region})
                    </td>
                    <td className="py-2">{`${item.admission_name} [${item.ids.length}]`}</td>
                    <td className="py-2">{item.general_field_name}</td>
                    <td className="py-2">{item.method_description}</td>
                    <td className="py-2">
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
                        >
                          <DialogHeader>
                            <DialogTitle className="py-0 text-left text-xl font-bold">
                              전형 상세 정보
                            </DialogTitle>
                            <DialogDescription className="py-0 text-left">
                              전형 방법의 세부 사항을 확인하세요
                            </DialogDescription>
                          </DialogHeader>
                          <div className="w-full space-y-2 pb-4">
                            <p>
                              교과 비율:{" "}
                              <b className="pl-4 font-semibold">
                                {item.subject_ratio
                                  ? `${item.subject_ratio}%`
                                  : "-"}
                              </b>
                            </p>
                            <p>
                              서류 비율:{" "}
                              <b className="pl-4 font-semibold">
                                {item.document_ratio
                                  ? `${item.document_ratio}%`
                                  : "-"}
                              </b>
                            </p>
                            <p>
                              면접 비율:{" "}
                              <b className="pl-4 font-semibold">
                                {item.interview_ratio
                                  ? `${item.interview_ratio}%`
                                  : "-"}
                              </b>
                            </p>
                            <p>
                              실기 비율:{" "}
                              <b className="pl-4 font-semibold">
                                {item.practical_ratio
                                  ? `${item.practical_ratio}%`
                                  : "-"}
                              </b>
                            </p>
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
