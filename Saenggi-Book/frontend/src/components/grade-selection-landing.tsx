import {
  Grade,
  gradeThemes,
  gradeLabels,
  gradeSubLabels,
  gradeRoutes,
  useGradeStore
} from "@/stores/client/use-grade-store";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const gradeList: Grade[] = ["3", "2N", "2", "1", "0"];

// 각 학년별 이미지 매핑
const gradeImages: Record<Grade, string> = {
  "3": "/images/grades/grade-3.png",    // 정시
  "2N": "/images/grades/grade-2N.png",  // N수생
  "2": "/images/grades/grade-2.png",    // 고2
  "1": "/images/grades/grade-1.png",    // 고1
  "0": "/images/grades/grade-0.png",    // 예비고1
};

export function GradeSelectionLanding() {
  const { selectGrade } = useGradeStore();
  const navigate = useNavigate();

  const handleSelectGrade = (grade: Grade) => {
    selectGrade(grade);
    navigate({ to: gradeRoutes[grade] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* 마스코트 캐릭터와 말풍선 */}
      <div className="container mx-auto px-4 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="flex flex-row items-center justify-center gap-6">
          {/* 마스코트 캐릭터 이미지 */}
          <img
            src="/images/turtle-mascot.png"
            alt="T Skool 마스코트"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-lg"
          />

          {/* 말풍선 */}
          <div className="relative bg-white rounded-2xl px-6 py-5 shadow-lg border border-gray-100 max-w-md">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              T Skool 앱 학생용 페이지입니다. 학년을 선택하시면, 다음 로그인부터 자동으로 그 학년용 앱이 보여집니다.
              상단 탭을 통해서, 다른 학년으로 전환도 가능합니다
            </p>
            {/* 말풍선 꼬리 (왼쪽) */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-white" />
            <div className="absolute top-1/2 -left-[14px] -translate-y-1/2 w-0 h-0 border-t-[13px] border-t-transparent border-b-[13px] border-b-transparent border-r-[13px] border-r-gray-100 -z-10" />
          </div>
        </div>
      </div>

      {/* 학년 선택 카드 그리드 */}
      <div className="container mx-auto px-4 pt-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {gradeList.map((grade, index) => {
            const theme = gradeThemes[grade];
            const label = gradeLabels[grade];
            const subLabel = gradeSubLabels[grade];
            const gradeImage = gradeImages[grade];
            const isJungsi = grade === "3";

            return (
              <button
                key={grade}
                onClick={() => handleSelectGrade(grade)}
                className={cn(
                  "group relative flex flex-col rounded-2xl overflow-hidden text-left transition-all duration-500",
                  "bg-white border border-gray-100",
                  "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isJungsi && "sm:col-span-2 lg:col-span-1"
                )}
                style={{
                  // @ts-expect-error CSS custom property
                  "--card-color": theme.primary,
                  "--card-color-light": theme.primaryLight,
                }}
              >
                {/* 이미지 영역 */}
                <div className="relative w-full h-32 overflow-hidden">
                  <img
                    src={gradeImage}
                    alt={label}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                  />
                  {/* 이미지 오버레이 - 호버 시 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    style={{ backgroundColor: theme.primary }}
                  />
                  {/* 정시 배지 */}
                  {isJungsi && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-md"
                      style={{ backgroundColor: theme.primary }}
                    >
                      HOT
                    </div>
                  )}
                </div>

                {/* 콘텐츠 영역 */}
                <div className="relative z-10 p-5">
                  {/* 상단 장식 라인 */}
                  <div
                    className="absolute top-0 left-5 right-5 h-1 rounded-b-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ backgroundColor: theme.primary }}
                  />

                  {/* 입시년도 */}
                  <h3
                    className="text-xl font-bold mb-1 transition-colors duration-300"
                    style={{ color: theme.primaryDark }}
                  >
                    {label}
                  </h3>

                  {/* 현재 학년 */}
                  {subLabel && (
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: theme.primary }}
                    >
                      {subLabel}
                    </p>
                  )}
                  {!subLabel && <div className="mb-3" />}

                  {/* CTA */}
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-semibold",
                      "transition-all duration-300",
                      "group-hover:gap-3"
                    )}
                    style={{ color: theme.primary }}
                  >
                    시작하기
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* 하단 번호 인디케이터 */}
                <div
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{
                    backgroundColor: theme.primaryLight,
                    color: theme.primary
                  }}
                >
                  {index + 1}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
