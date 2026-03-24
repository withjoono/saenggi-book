import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/custom/button";
import { MinusIcon, PlusIcon, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SubjectInputItem } from "./subject-input-item";
import { SelectSubjectInputItem } from "./select-subject-input-item";
import { AttendanceInputItem } from "./attendance-input-item";
import { useLifeRecord } from "@/hooks/use-life-record";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";

export const LifeRecordInputTabs: React.FC = () => {
  const {
    currentGrade,
    setCurrentGrade,
    schoolrecordSubjectLearningList,
    schoolrecordSelectSubjectList,
    schoolrecordAttendanceDetailList,
    onChangeSubjectValue,
    onChangeSelectSubjectValue,
    onChangeAttendanceValue,
    onClickAddOrDelLine,
    onClickSaveGrade,
    validationErrors,
    errorCountByGrade,
    emptyFieldCountByGrade,
  } = useLifeRecord();

  const { data: staticData, isLoading: isStaticDataLoading } = useGetStaticData();

  const subjects = useMemo(
    () => staticData?.subjects || { MAIN_SUBJECTS: {}, SUBJECTS: {} },
    [staticData],
  );

  const totalEmptyFields = useMemo(
    () => Object.values(emptyFieldCountByGrade).reduce((a, b) => a + b, 0),
    [emptyFieldCountByGrade],
  );

  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);

  const handleSave = useCallback(async () => {
    if (totalEmptyFields > 0) {
      setShowEmptyWarning(true);
      setTimeout(() => setShowEmptyWarning(false), 3000);
      return;
    }
    setShowEmptyWarning(false);
    const success = await onClickSaveGrade();
    if (success) {
      setSaveCompleted(true);
    }
  }, [totalEmptyFields, onClickSaveGrade]);

  const renderGradeButtons = useMemo(
    () => (
      <div className="flex items-center gap-4">
        {["1", "2", "3"].map((grade) => (
          <Button
            key={grade}
            type="button"
            onClick={() => setCurrentGrade(grade)}
            variant={currentGrade === grade ? "default" : "outline"}
            className="relative"
          >
            {grade}학년
            {(errorCountByGrade[grade] || 0) > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {errorCountByGrade[grade]}
              </span>
            )}
            {(errorCountByGrade[grade] || 0) === 0 && (emptyFieldCountByGrade[grade] || 0) > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {emptyFieldCountByGrade[grade]}
              </span>
            )}
          </Button>
        ))}
      </div>
    ),
    [currentGrade, setCurrentGrade, errorCountByGrade, emptyFieldCountByGrade],
  );

  const renderAttendanceSection = useMemo(
    () => (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">출결</h4>
        </div>
        <div className="space-y-2 overflow-x-auto p-2">
          <div className="flex items-end space-x-2 text-xs font-semibold text-primary">
            <div className="min-w-[80px]">학년</div>
            <div className="min-w-[80px]">수업일수</div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">결석일수</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">지각</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">조퇴</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
            <div className="min-w-[180px] items-center">
              <div className="text-center text-blue-500">결과</div>
              <div className="flex items-center justify-around">
                <div>질병</div>
                <div>무단</div>
                <div>기타</div>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <AttendanceInputItem
              attendanceItem={schoolrecordAttendanceDetailList}
              onChangeAttendanceValue={onChangeAttendanceValue}
            />
          </div>
        </div>
      </section>
    ),
    [schoolrecordAttendanceDetailList, onChangeAttendanceValue],
  );

  const renderSubjectSection = useMemo(
    () => (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">
              공통과목 / 일반선택과목 / 전문교과I / 전문교과II
            </h4>
            <p className="text-sm text-foreground/50">
              석차 등급이 없는 교과의 경우 석차등급은 비워두시면 됩니다
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="p-2"
              onClick={() => onClickAddOrDelLine(false, false)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="p-2"
              onClick={() => onClickAddOrDelLine(true, false)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2 overflow-x-auto p-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
            <div className="min-w-[80px]">학기</div>
            <div className="min-w-[120px]">교과</div>
            <div className="min-w-[120px]">과목</div>
            <div className="min-w-[60px]">단위수</div>
            <div className="min-w-[60px]">원점수</div>
            <div className="min-w-[60px]">과목평균</div>
            <div className="min-w-[60px]">표준편차</div>
            <div className="min-w-[60px]">성취도</div>
            <div className="min-w-[60px]">수강자수</div>
            <div className="min-w-[60px]">석차등급</div>
          </div>
          <div className="space-y-6 pb-6 lg:space-y-2">
            {schoolrecordSubjectLearningList.length ? (
              schoolrecordSubjectLearningList.map((item, index) => (
                <SubjectInputItem
                  key={`normal-${item.mainSubjectCode}-${item.subjectCode}-${index}`}
                  index={index}
                  onChangeSubjectValue={onChangeSubjectValue}
                  subjectItem={item}
                  subjects={subjects}
                  validationErrors={validationErrors}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-foreground/60">
                우측 플러스 버튼을 눌러 과목을 추가해주세요 😄
              </p>
            )}
          </div>
        </div>
      </section>
    ),
    [
      schoolrecordSubjectLearningList,
      onChangeSubjectValue,
      onClickAddOrDelLine,
      subjects,
      validationErrors,
    ],
  );

  const renderSelectSubjectSection = useMemo(
    () => (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">진로선택과목</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="p-2"
              onClick={() => onClickAddOrDelLine(false, true)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="p-2"
              onClick={() => onClickAddOrDelLine(true, true)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2 overflow-x-auto p-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <div className="min-w-[80px]">학기</div>
            <div className="min-w-[120px]">교과</div>
            <div className="min-w-[120px]">과목</div>
            <div className="min-w-[60px]">단위수</div>
            <div className="min-w-[60px]">원점수</div>
            <div className="min-w-[60px]">과목평균</div>
            <div className="min-w-[60px]">성취도</div>
            <div className="min-w-[60px]">수강자수</div>
            <div className="min-w-[196px]">성취도별 분포비율(A,B,C)</div>
          </div>
          <div className="space-y-6 pb-6 lg:space-y-2">
            {schoolrecordSelectSubjectList.length ? (
              schoolrecordSelectSubjectList.map((item, index) => (
                <SelectSubjectInputItem
                  key={`select-${item.mainSubjectCode}-${item.subjectCode}-${index}`}
                  index={index}
                  selectSubjectItem={item}
                  onChangeSelectSubjectValue={onChangeSelectSubjectValue}
                  subjects={subjects}
                  validationErrors={validationErrors}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-foreground/60">
                우측 플러스 버튼을 눌러 과목을 추가해주세요 😄
              </p>
            )}
          </div>
        </div>
      </section>
    ),
    [
      schoolrecordSelectSubjectList,
      onChangeSelectSubjectValue,
      onClickAddOrDelLine,
      subjects,
      validationErrors,
    ],
  );

  return (
    <div className="pb-20">
      {renderGradeButtons}
      <div className="flex w-full flex-col items-center space-y-2 py-4">
        <div className="w-full space-y-4 pt-4">
          {renderAttendanceSection}
          {renderSubjectSection}
          {renderSelectSubjectSection}
          {totalEmptyFields > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  노란색으로 표시된 {totalEmptyFields}개 항목이 비어있습니다
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  생기부 파싱 시 인식되지 않은 필드입니다. 수동으로 입력 후 저장해주세요!
                </p>
              </div>
            </div>
          )}
          {showEmptyWarning && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 animate-[shake_0.5s_ease-in-out] dark:border-red-700 dark:bg-red-950/40">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                빈칸에 수동 입력이 완료되어야 저장됩니다.
              </p>
            </div>
          )}
          {saveCompleted ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-5 dark:border-green-700 dark:bg-green-950/40">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  저장이 완료되었습니다!
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/grade-analysis/performance">
                  <Button variant="outline" className="w-full gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/30">
                    📊 교과성적 분석
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/grade-analysis/request">
                  <Button variant="outline" className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/30">
                    🤖 AI 사정관 평가
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleSave}>저장하기</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
