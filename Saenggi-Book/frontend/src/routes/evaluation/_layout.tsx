import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/evaluation/_layout")({
  component: EvaluationLayout,
});

const sidebarNavItems = [
  {
    title: "계열 적합성 진단",
    href: "/evaluation/compatibility",
  },
  {
    title: "사정관 평가 신청",
    href: "/evaluation/request",
  },
  {
    title: "사정관 평가 내역",
    href: "/evaluation/list",
  },
  {
    title: "자가평가",
    href: "/evaluation/self",
  },
];

function EvaluationLayout() {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-10">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="shrink-0 lg:w-[220px]">
          <SubSidebarNav items={sidebarNavItems} />
        </aside>
        <div className="w-full flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
