import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D";
type GradeMap = Record<Grade, string>;

interface NonSubjectGradeDisplayProps {
  mainGrade: Grade | null;
  gradeLabel?: string;
  targetLevel?: number;
  className?: string;
}

const gradeMap: GradeMap = {
  "A+": "의치한약수서, 카포",
  A: "연고서성한, 지유디",
  "B+": "중경외시건동홍, 부산",
  B: "국숭세광, 인아단가명에, 경북",
  "C+": "서울하위, 경기중위, 지거국",
  C: "경기하위, 지방국립하위",
  D: "지방사립하위",
};

const getTargetGrade = (targetLevel: number | undefined): Grade | null => {
  if (!targetLevel || targetLevel < 1 || targetLevel > 7) return null;
  return Object.keys(gradeMap)[targetLevel - 1] as Grade;
};

export const NonSubjectGradeDisplay = ({
  mainGrade,
  gradeLabel,
  className,
  targetLevel,
}: NonSubjectGradeDisplayProps) => {
  const targetGrade = getTargetGrade(targetLevel);

  return (
    <div
      className={cn("w-full min-w-[180px] max-w-[300px] space-y-2", className)}
    >
      <GradeInfo
        label={gradeLabel || "내 비교과 등급"}
        grade={mainGrade || "-"}
        className="text-primary"
      />
      {targetGrade && (
        <GradeInfo
          sub
          label="대학 추천 등급"
          grade={targetGrade}
          className="text-blue-500"
        />
      )}
      <Separator />
      <GradeList mainGrade={mainGrade} targetGrade={targetGrade} />
    </div>
  );
};

const GradeInfo = ({
  label,
  grade,
  sub,
  className,
}: {
  label: string;
  grade: string | null;
  sub?: boolean;
  className?: string;
}) => (
  <div
    className={cn("flex w-full justify-between", sub ? "text-base" : "text-lg")}
  >
    <p>{label}</p>
    <p className={cn("font-semibold", className)}>{grade || "-"}</p>
  </div>
);

const GradeList = ({
  mainGrade,
  targetGrade,
}: {
  mainGrade: Grade | null;
  targetGrade: Grade | null;
}) => (
  <div className="space-y-1">
    {(Object.keys(gradeMap) as Grade[]).map((grade) => (
      <div
        key={grade}
        className="flex w-full items-center justify-between text-sm"
      >
        <p className="w-9">{grade} : </p>
        <p
          className={cn(
            "w-full text-right",
            grade === targetGrade && "text-blue-500",
            grade === mainGrade && "text-primary",
          )}
        >
          {gradeMap[grade]}
        </p>
      </div>
    ))}
  </div>
);
