import { useGradeStore, Grade, gradeThemes, gradeLabels, gradeSubLabels, gradeRoutes } from "@/stores/client/use-grade-store";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const GradeBookmarkBar = () => {
  const { grade } = useGradeStore();

  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto">
        <div className="flex items-stretch justify-center gap-1 py-2">
          {(["3", "2N", "2", "1", "0"] as Grade[]).map((g) => {
            const theme = gradeThemes[g];
            const isActive = grade === g;
            const subLabel = gradeSubLabels[g];
            const isJungsi = g === "3"; // 정시 탭 (2026 정시)
            const route = gradeRoutes[g];

            return (
              <Link
                key={g}
                to={route}
                className={cn(
                  "relative flex-1 py-2.5 px-3 transition-all duration-300",
                  "flex flex-col items-center justify-center gap-0",
                  "rounded-xl font-semibold",
                  // 정시 탭은 2배 너비
                  isJungsi ? "max-w-[280px]" : "max-w-[140px]",
                  isActive
                    ? "text-white shadow-lg scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                )}
                style={{
                  backgroundColor: isActive ? theme.primary : undefined,
                }}
              >

                {/* 메인 라벨 (입시년도) */}
                <span className={cn(
                  "font-bold tracking-tight leading-tight",
                  isJungsi ? "text-lg" : "text-base"
                )}>
                  {gradeLabels[g]}
                </span>

                {/* 서브 라벨 (현재 학년) - 작은 글씨로 줄바꿈 */}
                {subLabel && (
                  <span className={cn(
                    "text-[10px] font-medium leading-tight mt-0.5",
                    isActive ? "opacity-80" : "opacity-60"
                  )}>
                    {subLabel}
                  </span>
                )}

                {/* 정시 탭 추가 설명 */}
                {isJungsi && (
                  <span className={cn(
                    "text-[10px] font-medium leading-tight mt-0.5",
                    isActive ? "opacity-80" : "opacity-70"
                  )}>
                    (정시 예측 분석)
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
