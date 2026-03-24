import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/grade-analysis/_layout")({
  component: GradeAnalysisLayout,
});

const sidebarNavItems = [
  {
    title: "생기부 입력",
    href: "/grade-analysis/school-record",
  },
  {
    title: "성적 분석",
    href: "/grade-analysis/performance",
  },
  {
    title: "AI 사정관 평가",
    href: "/grade-analysis/request",
  },
  {
    title: "생기부 평가 내역",
    href: "/grade-analysis/evaluation-list",
  },
  {
    title: "교과 전형 탐색",
    href: "/grade-analysis/subject",
  },
  {
    title: "학종 전형 탐색",
    href: "/grade-analysis/comprehensive",
  },
  {
    title: "논술 전형 탐색",
    href: "/grade-analysis/nonsul",
  },
];

function GradeAnalysisLayout() {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-10">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="shrink-0 lg:w-[220px]">
          <SubSidebarNav items={sidebarNavItems} showArrows />
        </aside>
        <div className="w-full flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
