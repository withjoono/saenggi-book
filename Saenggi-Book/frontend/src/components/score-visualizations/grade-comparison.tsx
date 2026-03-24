import React from "react";
import { cn } from "@/lib/utils";

interface GradeComparisonProps {
  myGrade?: number | null;
  stableGrade: number;
  riskGrade: number;
  className?: string;
}

export const GradeComparison: React.FC<GradeComparisonProps> = ({
  myGrade,
  stableGrade,
  riskGrade,
  className,
}) => {
  let icon = "😴";
  let subText = "마이페이지에서 성적 혹은 생기부를 등록해주세요.";
  let comparisonGrade = 0;
  let isHigher = true;

  if (myGrade) {
    const diffStable = +(stableGrade - myGrade).toFixed(2);
    if (myGrade <= stableGrade) {
      icon = diffStable >= 0.3 ? "🥳" : "🔥";
      comparisonGrade = diffStable;
      isHigher = true;
      subText =
        diffStable >= 0.3
          ? "더 높은 곳에 지원해볼 수 있을 것 같아요!!"
          : "안전하게 지원하기에 좋아요.";
    } else if (myGrade <= riskGrade) {
      icon = "🤔";
      comparisonGrade = diffStable;
      isHigher = false;
      subText = "도전해 볼 만할 것 같아요. 한 번 고민해보세요!";
    } else {
      icon = "😰";
      comparisonGrade = diffStable;
      isHigher = false;
      subText = "위험해요ㅜㅜ 다른 대학을 고려해보세요.";
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="text-5xl lg:text-7xl">{icon}</span>
      <div className="text-sm">
        {myGrade ? (
          <span className="text-lg font-semibold lg:text-xl">
            안정권보다{" "}
            <b className={cn(isHigher ? "text-primary" : "text-blue-500")}>
              {Math.abs(comparisonGrade)}
            </b>{" "}
            등급 {isHigher ? "높아요" : "낮아요"}
          </span>
        ) : (
          <span className="text-lg font-semibold lg:text-xl">
            성적이 없어요 ㅜㅜ
          </span>
        )}
        <p className="text-sm text-foreground/70 lg:text-base">{subText}</p>
      </div>
    </div>
  );
};
