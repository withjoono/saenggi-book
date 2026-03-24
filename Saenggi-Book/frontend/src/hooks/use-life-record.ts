import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  IEditLifeRecordBody,
  ISchoolRecordAttendance,
  ISchoolRecordSelectSubject,
  ISchoolRecordSubject,
} from "@/stores/server/features/me/interfaces";
import { useGetSchoolRecords } from "@/stores/server/features/me/queries";
import { useEditLifeRecord } from "@/stores/server/features/me/mutations";

// 검증 에러 타입
export interface ValidationError {
  grade: string;
  index: number;
  field: string; // 'mainSubjectCode' | 'achievement'
  fieldLabel: string;
  subjectName: string;
  isSelectSubject: boolean;
}

const makeInitialNormalGyogwaItem = (
  grade: string,
): Omit<ISchoolRecordSubject, "id"> => ({
  grade,
  semester: "1",
  mainSubjectCode: "",
  mainSubjectName: "",
  subjectCode: "",
  subjectName: "",
  unit: "",
  rawScore: "",
  subSubjectAverage: "",
  standardDeviation: "",
  achievement: "",
  studentsNum: "",
  ranking: "",
  detailAndSpecialty: "",
  etc: "",
});

const makeInitialCourseGyogwaItem = (
  grade: string,
): Omit<ISchoolRecordSelectSubject, "id"> => ({
  grade,
  semester: "1",
  mainSubjectCode: "",
  mainSubjectName: "",
  subjectCode: "",
  subjectName: "",
  unit: "",
  rawScore: "",
  subSubjectAverage: "",
  achievement: "",
  achievementa: "",
  achievementb: "",
  achievementc: "",
  studentsNum: "",
  detailAndSpecialty: "",
  etc: "",
});

const makeInitialAttendanceItem = (
  grade: string,
): Omit<ISchoolRecordAttendance, "id"> => ({
  grade,
  absent_disease: 0,
  absent_etc: 0,
  absent_unrecognized: 0,
  class_days: 0,
  etc: "",
  late_disease: 0,
  late_etc: 0,
  late_unrecognized: 0,
  leave_early_disease: 0,
  leave_early_etc: 0,
  leave_early_unrecognized: 0,
  result_disease: 0,
  result_early_etc: 0,
  result_unrecognized: 0,
});

export const useLifeRecord = () => {
  const { data: schoolRecord, refetch: refetchSchoolRecord } =
    useGetSchoolRecords();
  const editLifeRecordMutation = useEditLifeRecord();

  const [currentGrade, setCurrentGrade] = useState("1");
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [schoolrecordSubjectLearningList, setSchoolrecordSubjectLearningList] =
    useState<{
      [key: string]: Omit<ISchoolRecordSubject, "id">[];
    }>({ "1": [], "2": [], "3": [] });
  const [schoolrecordSelectSubjectList, setSchoolrecordSelectSubjectList] =
    useState<{
      [key: string]: Omit<ISchoolRecordSelectSubject, "id">[];
    }>({ "1": [], "2": [], "3": [] });
  const [
    schoolrecordAttendanceDetailList,
    setSchoolrecordAttendanceDetailList,
  ] = useState<{
    [key: string]: Omit<ISchoolRecordAttendance, "id">;
  }>({
    "1": makeInitialAttendanceItem("1"),
    "2": makeInitialAttendanceItem("2"),
    "3": makeInitialAttendanceItem("3"),
  });

  useEffect(() => {
    if (schoolRecord) {
      setSchoolrecordAttendanceDetailList(() => {
        const newState = schoolRecord.attendance.reduce<{
          [key: string]: Omit<ISchoolRecordAttendance, "id">;
        }>((acc, curr) => {
          if (curr?.grade && ["1", "2", "3"].includes(curr.grade)) {
            const { ...attendanceWithoutId } = curr;
            acc[curr.grade] = attendanceWithoutId;
          }
          return acc;
        }, {});

        // 누락된 학년에 대해 초기값 설정
        ["1", "2", "3"].forEach((grade) => {
          if (!newState[grade]) {
            newState[grade] = makeInitialAttendanceItem(grade);
          }
        });

        return newState;
      });

      setSchoolrecordSelectSubjectList(() => {
        const newState = schoolRecord.selectSubjects.reduce<{
          [key: string]: Omit<ISchoolRecordSelectSubject, "id">[];
        }>((acc, curr) => {
          if (curr?.grade) {
            if (!acc[curr.grade]) acc[curr.grade] = [];
            const { ...subjectWithoutId } = curr;
            acc[curr.grade].push(subjectWithoutId);
          }
          return acc;
        }, {});

        // 누락된 학년에 대해 빈 배열 설정
        ["1", "2", "3"].forEach((grade) => {
          if (!newState[grade]) {
            newState[grade] = [];
          }
        });

        return newState;
      });

      setSchoolrecordSubjectLearningList(() => {
        const newState = schoolRecord.subjects.reduce<{
          [key: string]: Omit<ISchoolRecordSubject, "id">[];
        }>((acc, curr) => {
          if (curr?.grade) {
            if (!acc[curr.grade]) acc[curr.grade] = [];
            const { ...subjectWithoutId } = curr;
            acc[curr.grade].push(subjectWithoutId);
          }
          return acc;
        }, {});

        // 누락된 학년에 대해 빈 배열 설정
        ["1", "2", "3"].forEach((grade) => {
          if (!newState[grade]) {
            newState[grade] = [];
          }
        });

        return newState;
      });
    }
  }, [schoolRecord]);

  const onChangeSubjectValue = useCallback(
    (index: number, type: string, value: string) => {
      setSchoolrecordSubjectLearningList((prev) => ({
        ...prev,
        [currentGrade]: prev[currentGrade].map((item, i) =>
          i === index ? { ...item, [type]: value } : item,
        ),
      }));
      setIsDirty(true);
      // 해당 필드 에러 클리어
      if (type === "mainSubjectCode" || type === "achievement") {
        setValidationErrors((prev) =>
          prev.filter(
            (e) =>
              !(e.grade === currentGrade && e.index === index && e.field === type && !e.isSelectSubject),
          ),
        );
      }
    },
    [currentGrade],
  );

  const onChangeSelectSubjectValue = useCallback(
    (index: number, type: string, value: string) => {
      setSchoolrecordSelectSubjectList((prev) => ({
        ...prev,
        [currentGrade]: prev[currentGrade].map((item, i) =>
          i === index ? { ...item, [type]: value } : item,
        ),
      }));
      setIsDirty(true);
      // 해당 필드 에러 클리어
      if (type === "mainSubjectCode" || type === "achievement") {
        setValidationErrors((prev) =>
          prev.filter(
            (e) =>
              !(e.grade === currentGrade && e.index === index && e.field === type && e.isSelectSubject),
          ),
        );
      }
    },
    [currentGrade],
  );

  const onChangeAttendanceValue = useCallback(
    (type: string, value: string | number) => {
      setSchoolrecordAttendanceDetailList((prev) => ({
        ...prev,
        [currentGrade]: { ...prev[currentGrade], [type]: Number(value) },
      }));
      setIsDirty(true);
    },
    [currentGrade],
  );

  const onClickAddOrDelLine = useCallback(
    (isAdd: boolean, isSelectSubject: boolean) => {
      const setter = isSelectSubject
        ? setSchoolrecordSelectSubjectList
        : setSchoolrecordSubjectLearningList;
      const makeInitialItem = isSelectSubject
        ? makeInitialCourseGyogwaItem
        : makeInitialNormalGyogwaItem;

      setter((prev: { [key: string]: any[] }) => {
        const currentList = prev[currentGrade] || [];
        const newList = isAdd
          ? [...currentList, makeInitialItem(currentGrade)]
          : currentList.length > 0
            ? currentList.slice(0, -1)
            : [];
        return { ...prev, [currentGrade]: newList };
      });
      setIsDirty(true);
    },
    [currentGrade],
  );

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const onClickSaveGrade = useCallback(async () => {
    if (!isDirty) {
      toast.info("변경된 내용이 없습니다.");
      return;
    }

    // 구체적 에러 수집
    const errors: ValidationError[] = [];

    Object.entries(schoolrecordSubjectLearningList).forEach(([grade, items]) => {
      items.forEach((item, index) => {
        if (item.mainSubjectCode === "") {
          errors.push({
            grade,
            index,
            field: "mainSubjectCode",
            fieldLabel: "교과",
            subjectName: item.subjectName || item.mainSubjectName || `${index + 1}번째 과목`,
            isSelectSubject: false,
          });
        }
        if (item.achievement === "") {
          errors.push({
            grade,
            index,
            field: "achievement",
            fieldLabel: "성취도",
            subjectName: item.subjectName || item.mainSubjectName || `${index + 1}번째 과목`,
            isSelectSubject: false,
          });
        }
      });
    });

    Object.entries(schoolrecordSelectSubjectList).forEach(([grade, items]) => {
      items.forEach((item, index) => {
        if (item.mainSubjectCode === "") {
          errors.push({
            grade,
            index,
            field: "mainSubjectCode",
            fieldLabel: "교과",
            subjectName: item.subjectName || item.mainSubjectName || `${index + 1}번째 선택과목`,
            isSelectSubject: true,
          });
        }
        if (item.achievement === "") {
          errors.push({
            grade,
            index,
            field: "achievement",
            fieldLabel: "성취도",
            subjectName: item.subjectName || item.mainSubjectName || `${index + 1}번째 선택과목`,
            isSelectSubject: true,
          });
        }
      });
    });

    setValidationErrors(errors);

    if (errors.length > 0) {
      // 첫 번째 에러가 있는 학년으로 자동 이동
      const firstErrorGrade = errors[0].grade;
      if (firstErrorGrade !== currentGrade) {
        setCurrentGrade(firstErrorGrade);
      }

      // 학년별 에러 요약 메시지
      const errorsByGrade: Record<string, number> = {};
      errors.forEach((e) => {
        errorsByGrade[e.grade] = (errorsByGrade[e.grade] || 0) + 1;
      });

      const gradeSummary = Object.entries(errorsByGrade)
        .map(([g, count]) => `${g}학년: ${count}개`)
        .join(", ");

      // 첫 번째 에러에 대한 구체적 메시지
      const firstErr = errors[0];
      const specificMsg = `${firstErr.grade}학년 "${firstErr.subjectName}"의 ${firstErr.fieldLabel}이(가) 비어있습니다.`;

      toast.error(
        `입력이 필요한 항목이 있습니다 (${gradeSummary})`,
        {
          description: `${specificMsg}${errors.length > 1 ? ` 외 ${errors.length - 1}건` : ""}`,
          duration: 6000,
        },
      );
      return;
    }

    // 출결 검증
    let isValidate = true;
    const validatedAttendances = Object.values(
      schoolrecordAttendanceDetailList,
    ).map((attendance) => {
      const convertedAttendance: Partial<ISchoolRecordAttendance> = {};
      for (const [key, value] of Object.entries(attendance)) {
        if (key === "grade" || key === "etc") {
          (convertedAttendance as any)[key] = value;
        } else {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 0) {
            isValidate = false;
            toast.error(
              `출결 정보의 ${key} 필드에 유효하지 않은 값이 있습니다.`,
            );
            return null;
          }
          (convertedAttendance as any)[key] = numValue;
        }
      }
      return convertedAttendance as ISchoolRecordAttendance;
    });

    if (!isValidate || validatedAttendances.some((item) => item === null)) {
      toast.error(
        "출결 데이터가 잘못되었습니다. 문자열 혹은 공백이 포함되어있는지 확인해주세요.",
      );
      return;
    }

    const payload: IEditLifeRecordBody = {
      attendances: validatedAttendances.filter(
        (n) => n !== null,
      ) as ISchoolRecordAttendance[],
      selectSubjects: Object.values(schoolrecordSelectSubjectList).flat(),
      subjects: Object.values(schoolrecordSubjectLearningList).flat(),
    };

    try {
      const result = await editLifeRecordMutation.mutateAsync(payload);
      if (result.success) {
        toast.success("성적이 성공적으로 저장되었습니다.");
        await refetchSchoolRecord();
        setIsDirty(false);
        setValidationErrors([]);
        return true;
      } else {
        throw new Error("저장 실패");
      }
    } catch (error) {
      toast.error("성적을 저장하는데 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    }
  }, [
    isDirty,
    currentGrade,
    schoolrecordAttendanceDetailList,
    schoolrecordSelectSubjectList,
    schoolrecordSubjectLearningList,
    editLifeRecordMutation,
    refetchSchoolRecord,
  ]);

  const currentSubjects = useMemo(
    () => schoolrecordSubjectLearningList[currentGrade] || [],
    [schoolrecordSubjectLearningList, currentGrade],
  );
  const currentSelectSubjects = useMemo(
    () => schoolrecordSelectSubjectList[currentGrade] || [],
    [schoolrecordSelectSubjectList, currentGrade],
  );
  const currentAttendance = useMemo(
    () => schoolrecordAttendanceDetailList[currentGrade] || null,
    [schoolrecordAttendanceDetailList, currentGrade],
  );

  // 현재 학년의 에러만 필터링
  const currentGradeErrors = useMemo(
    () => validationErrors.filter((e) => e.grade === currentGrade),
    [validationErrors, currentGrade],
  );

  // 학년별 에러 수
  const errorCountByGrade = useMemo(() => {
    const counts: Record<string, number> = { "1": 0, "2": 0, "3": 0 };
    validationErrors.forEach((e) => {
      counts[e.grade] = (counts[e.grade] || 0) + 1;
    });
    return counts;
  }, [validationErrors]);

  // 학년별 빈 필드 수 (교과/과목이 선택된 행에서 비어있는 숫자 필드 카운트)
  const emptyFieldCountByGrade = useMemo(() => {
    const counts: Record<string, number> = { "1": 0, "2": 0, "3": 0 };
    const normalFields = ["unit", "rawScore", "subSubjectAverage", "standardDeviation", "studentsNum"];
    const selectFields = ["unit", "rawScore", "subSubjectAverage", "studentsNum"];

    Object.entries(schoolrecordSubjectLearningList).forEach(([grade, items]) => {
      items.forEach((item) => {
        if (item.mainSubjectCode) {
          normalFields.forEach((field) => {
            if (!((item as any)[field])) counts[grade]++;
          });
        }
      });
    });
    Object.entries(schoolrecordSelectSubjectList).forEach(([grade, items]) => {
      items.forEach((item) => {
        if (item.mainSubjectCode) {
          selectFields.forEach((field) => {
            if (!((item as any)[field])) counts[grade]++;
          });
        }
      });
    });
    return counts;
  }, [schoolrecordSubjectLearningList, schoolrecordSelectSubjectList]);

  return {
    currentGrade,
    setCurrentGrade,
    schoolrecordSubjectLearningList: currentSubjects,
    schoolrecordSelectSubjectList: currentSelectSubjects,
    schoolrecordAttendanceDetailList: currentAttendance,
    onChangeAttendanceValue,
    onChangeSelectSubjectValue,
    onChangeSubjectValue,
    onClickAddOrDelLine,
    onClickSaveGrade,
    validationErrors: currentGradeErrors,
    errorCountByGrade,
    emptyFieldCountByGrade,
    clearValidationErrors,
  };
};
