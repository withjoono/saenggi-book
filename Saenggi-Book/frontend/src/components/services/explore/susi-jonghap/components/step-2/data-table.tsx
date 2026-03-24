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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/custom/button";
import { RiskBadge } from "@/components/custom/risk-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { NonSubjectGradeDisplay } from "@/components/score-visualizations/non-subject-grade-display";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";
import { cn } from "@/lib/utils";
import { IExploreSusiJonghapStep2Item } from "@/stores/server/features/explore/susi-jonghap/interfaces";
import { getUnivLevelByCode } from "@/lib/utils/services/university";
import { calculateEvaluationRisk } from "@/lib/calculations/evaluation/risk";

export type IExploreSusiJonghapStep2ItemWithMyScores =
  IExploreSusiJonghapStep2Item & {
    myScores: {
      items: {
        text: string;
        score: number;
        adjustedScore: number;
        ratio: number;
      }[];
      totalScore: number;
    };
  };

interface DataTableProps {
  className?: string;
  data: IExploreSusiJonghapStep2ItemWithMyScores[];
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
  evaluationId: number | null;
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

  const onClick = (item: IExploreSusiJonghapStep2ItemWithMyScores) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(selectedIds.filter((n) => n !== item.id));
    } else {
      setSelectedIds([...selectedIds, item.id]);
    }
  };

  const checkSelectedItem = (
    item: IExploreSusiJonghapStep2ItemWithMyScores,
  ) => {
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
              <th className="w-28 py-2 text-start font-normal">전형명</th>
              <th className="w-32 py-2 text-start font-normal">모집단위</th>
              <th className="w-32 py-2 text-start font-normal">평가항목A</th>
              <th className="w-32 py-2 text-start font-normal">평가항목B</th>
              <th className="w-32 py-2 text-start font-normal">평가항목C</th>
              <th className="w-20 py-2 text-start font-normal">총점(100)</th>
              <th className="w-20 py-2 text-start font-normal">위험도</th>
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

                // 비교과를 보지 않는 경우
                if (!item.admission.method.schoolRecordEvaluationElements) {
                  return (
                    <tr
                      key={item.id}
                      className="cursor-pointer border-t hover:bg-accent"
                      onClick={() => onClick(item)}
                    >
                      <td className="flex w-8 shrink-0 items-center justify-center py-2">
                        <Checkbox checked={isSelected} />
                      </td>
                      <td className="py-2">
                        {item.university.name}({item.university.region})
                      </td>
                      <td className="py-2">{item.admission.name}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                    </tr>
                  );
                }

                const convertedScore = (item.myScores.totalScore / 100) * 7; // 위험도 표시를 위한 7점 만점 치환 점수
                const nonSubjectRisk = calculateEvaluationRisk(
                  convertedScore <= 1 ? 1 : convertedScore,
                  getUnivLevelByCode(
                    item.university.code || "",
                    item.generalField.name || "",
                  ),
                );

                const empty = [];
                for (let i = 0; i < 3 - item.myScores.items.length; ++i) {
                  empty.push("");
                }

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
                      {item.university.name}({item.university.region})
                    </td>
                    <td className="py-2">{item.admission.name}</td>
                    <td className="py-2">
                      <p className="line-clamp-2">{item.name}</p>
                    </td>
                    {item.myScores.items
                      .filter((_, t) => t < 3)
                      .map((n) => {
                        return (
                          <td className="py-2 text-xs" key={n.text}>
                            {n.text}({Math.floor(n.ratio)}%)
                            <br />
                            {n.adjustedScore.toFixed(2)}점
                          </td>
                        );
                      })}
                    {empty.map((_, idx) => (
                      <td key={idx}>-</td>
                    ))}

                    <td className="py-2">
                      {item.myScores.totalScore.toFixed(2)}점
                    </td>
                    <td className="py-2">
                      <RiskBadge risk={nonSubjectRisk} />
                    </td>
                    <td className="w-20 py-2">
                      <Dialog>
                        <DialogTrigger
                          onClick={(event) => event.stopPropagation()}
                        >
                          <p className="text-blue-500 hover:underline">
                            상세보기 {3 < item.myScores.items.length ? "+" : ""}
                          </p>
                        </DialogTrigger>
                        <DialogContent
                          onClick={(event) => event.stopPropagation()}
                          className="max-w-4xl px-4 sm:px-6"
                        >
                          <DialogHeader>
                            <DialogTitle className="py-0 text-left text-xl font-bold">
                              평가 항목 체크
                            </DialogTitle>
                            <DialogDescription className="py-0 text-left">
                              상위 평가 항목 3개 이외의 전체적인 배점을
                              확인하세요!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center gap-8 px-4 sm:flex-row">
                            <div className="flex w-full max-w-xl flex-wrap items-start gap-2 text-sm sm:text-base">
                              <div className="grid w-full grid-cols-5 gap-4 text-sm text-primary">
                                <p className="col-span-3">구분</p>
                                <p>배점</p>
                                <p>내점수</p>
                              </div>
                              {item.myScores.items.map((n) => {
                                return (
                                  <div
                                    key={n.text}
                                    className="grid w-full grid-cols-5 gap-4 font-semibold"
                                  >
                                    <p className="col-span-3">{n.text}</p>
                                    <p>{n.ratio}</p>
                                    <p>{n.adjustedScore.toFixed(2)}</p>
                                  </div>
                                );
                              })}

                              <Separator />
                              <div className="grid w-full grid-cols-5 gap-4 font-semibold">
                                <p className="col-span-3">총점</p>
                                <p>{100}</p>
                                <p>{item.myScores.totalScore.toFixed(2)}</p>
                              </div>
                            </div>
                            <NonSubjectGradeDisplay
                              mainGrade={convertEvaluationScoreToGrade(
                                (item.myScores.totalScore / 100) * 7,
                              )}
                              className="max-w-[300px]"
                              targetLevel={getUnivLevelByCode(
                                item.university.code || "",
                                item.generalField.name || "",
                              )}
                            />
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
