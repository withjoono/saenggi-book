import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ISchoolRecordSubject } from "@/stores/server/features/me/interfaces";
import { ITransformedSubjects } from "@/stores/server/features/static-data/queries";
import { type ValidationError } from "@/hooks/use-life-record";

export const SubjectInputItem = React.memo(
  ({
    index,
    subjectItem,
    onChangeSubjectValue,
    subjects,
    validationErrors = [],
  }: {
    index: number;
    subjectItem: Omit<ISchoolRecordSubject, "id">;
    onChangeSubjectValue: (index: number, type: string, value: string) => void;
    subjects: ITransformedSubjects;
    validationErrors?: ValidationError[];
  }) => {
    const getMainSubjectByCode = (code: string) => subjects.MAIN_SUBJECTS[code];
    const getSubjectByCode = (code: string) => subjects.SUBJECTS[code];

    const hasError = (field: string) =>
      validationErrors.some(
        (e) => e.index === index && e.field === field && !e.isSelectSubject,
      );

    const isEmpty = (field: string) =>
      subjectItem.mainSubjectCode && !((subjectItem as any)[field]);

    const errorRingClass = "ring-2 ring-red-400 border-red-300";
    const emptyHighlightClass = "ring-2 ring-amber-300 border-amber-200 bg-amber-50 dark:bg-amber-950/30";

    return (
      <div className="flex items-center gap-2">
        <Select
          value={subjectItem.semester || ""}
          onValueChange={(value) =>
            onChangeSubjectValue(index, "semester", value)
          }
        >
          <SelectTrigger className="min-w-[80px] max-w-[80px]">
            <SelectValue placeholder="학기 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>학기 선택</SelectLabel>
              <SelectItem value="1">1학기</SelectItem>
              <SelectItem value="2">2학기</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={subjectItem.mainSubjectCode || ""}
          onValueChange={(value) => {
            onChangeSubjectValue(index, "mainSubjectCode", value);
            const mainSubject = getMainSubjectByCode(value);
            if (mainSubject) {
              onChangeSubjectValue(
                index,
                "mainSubjectName",
                mainSubject.name,
              );
            }
          }}
        >
          <SelectTrigger className={`min-w-[120px] max-w-[120px] ${hasError("mainSubjectCode") ? errorRingClass : ""}`}>
            <SelectValue placeholder="교과 선택">
              {subjectItem.mainSubjectCode
                ? (getMainSubjectByCode(subjectItem.mainSubjectCode)?.name || subjectItem.mainSubjectName || subjectItem.mainSubjectCode)
                : "교과 선택"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>교과 선택</SelectLabel>
              {Object.keys(subjects.MAIN_SUBJECTS).map((key) => (
                <SelectItem key={key} value={key}>
                  {subjects.MAIN_SUBJECTS[key].name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={subjectItem.subjectCode || ""}
          onValueChange={(value) => {
            onChangeSubjectValue(index, "subjectCode", value);
            const subject = getSubjectByCode(value);
            if (subject) {
              onChangeSubjectValue(index, "subjectName", subject.name);
            }
          }}
        >
          <SelectTrigger className="min-w-[120px] max-w-[120px]">
            <SelectValue placeholder="과목 선택">
              {subjectItem.subjectCode
                ? (getSubjectByCode(subjectItem.subjectCode)?.name || subjectItem.subjectName || subjectItem.subjectCode)
                : "과목 선택"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>세부과목 선택</SelectLabel>
              {subjectItem.mainSubjectCode &&
                subjects.MAIN_SUBJECTS[
                  subjectItem.mainSubjectCode
                ]?.subjectList
                  .filter((code) => subjects.SUBJECTS[code].courseType !== 2)
                  .map((code) => (
                    <SelectItem key={code} value={code}>
                      {subjects.SUBJECTS[code].name}
                    </SelectItem>
                  ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          className={`min-w-[60px] max-w-[60px] ${isEmpty("unit") ? emptyHighlightClass : ""}`}
          placeholder="단위수"
          type="text"
          value={subjectItem.unit || ""}
          onChange={(e) => onChangeSubjectValue(index, "unit", e.target.value)}
        />
        <Input
          className={`min-w-[60px] max-w-[60px] ${isEmpty("rawScore") ? emptyHighlightClass : ""}`}
          placeholder="원점수"
          type="text"
          value={subjectItem.rawScore || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "rawScore", e.target.value)
          }
        />
        <Input
          className={`min-w-[60px] max-w-[60px] ${isEmpty("subSubjectAverage") ? emptyHighlightClass : ""}`}
          placeholder="과목평균"
          type="text"
          value={subjectItem.subSubjectAverage || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "subSubjectAverage", e.target.value)
          }
        />
        <Input
          className={`min-w-[60px] max-w-[60px] ${isEmpty("standardDeviation") ? emptyHighlightClass : ""}`}
          placeholder="표준편차"
          type="text"
          value={subjectItem.standardDeviation || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "standardDeviation", e.target.value)
          }
        />

        <Select
          value={subjectItem.achievement || ""}
          onValueChange={(value) => {
            onChangeSubjectValue(index, "achievement", value);
          }}
        >
          <SelectTrigger className={`min-w-[60px] max-w-[60px] ${hasError("achievement") ? errorRingClass : ""}`}>
            <SelectValue placeholder="성취도" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>성취도</SelectLabel>
              {["A", "B", "C", "D", "E"].map((achievement) => (
                <SelectItem key={achievement} value={achievement}>
                  {achievement}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          className={`min-w-[60px] max-w-[60px] ${isEmpty("studentsNum") ? emptyHighlightClass : ""}`}
          placeholder="수강자수"
          type="text"
          value={subjectItem.studentsNum || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "studentsNum", e.target.value)
          }
        />
        <Input
          className="min-w-[60px] max-w-[60px]"
          placeholder="석차등급"
          type="text"
          value={subjectItem.ranking || ""}
          onChange={(e) =>
            onChangeSubjectValue(index, "ranking", e.target.value)
          }
        />
      </div>
    );
  },
);
