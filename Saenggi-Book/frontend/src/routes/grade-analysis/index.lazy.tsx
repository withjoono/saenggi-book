import { createLazyFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/grade-analysis/")({
  component: GradeAnalysisIndex,
});

function GradeAnalysisIndex() {
  // 기본 페이지로 생기부 입력 페이지로 리다이렉트
  return <Navigate to="/grade-analysis/school-record" />;
}
