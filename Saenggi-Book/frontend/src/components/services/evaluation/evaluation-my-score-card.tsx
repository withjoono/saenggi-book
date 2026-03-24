import { Separator } from "@/components/ui/separator";
import { convertEvaluationScoreToGrade } from "@/lib/utils/services/evaluation";

/**
 * 내 비교과 점수에 맞는 대략적인 대학 등급을 나타내는 카드
 */
export const EvaluationMyScoreCard = ({
  mainGrade,
  isSelfEvaluation,
}: {
  mainGrade: string;
  isSelfEvaluation?: boolean;
}) => {
  const gradeMap = {
    "A+": "의치한약수",
    A: "서울상위권",
    "B+": "서울중위권",
    B: "서울하위권, 경기상위권",
    "C+": "경기중위권, 지방상위권",
    C: "경기하위권, 지방중하위권",
    D: "낙제",
  };

  return (
    <div className="space-y-2">
      <div>
        <div className="flex w-full items-end justify-between text-lg">
          <p>{isSelfEvaluation ? "자가" : "사정관"} 평가 전체 평균</p>
          <p className="text-2xl font-semibold text-primary">{mainGrade}</p>
        </div>
        <div className="flex w-full items-end justify-between text-lg">
          <p>비교과 등급</p>
          <p className="text-2xl font-semibold text-primary">
            {convertEvaluationScoreToGrade(parseFloat(mainGrade))}
          </p>
        </div>
      </div>
      <Separator />
      <div className="space-y-1">
        {Object.keys(gradeMap).map((grade) => (
          <div
            key={grade}
            className="flex w-full items-center justify-between text-sm"
          >
            <p className="w-9">{grade} : </p>
            <p
              className="w-full text-right"
              style={{
                width: "100%",
                minWidth: "180px",
                maxWidth: "260px",
                textAlign: "right",
              }}
            >
              {gradeMap[grade as keyof typeof gradeMap]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
