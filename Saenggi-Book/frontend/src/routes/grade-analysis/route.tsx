import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/grade-analysis")({
  component: GradeAnalysisRoute,
});

function GradeAnalysisRoute() {
  return <Outlet />;
}
