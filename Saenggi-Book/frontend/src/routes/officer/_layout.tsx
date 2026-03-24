import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { useCheckOfficer } from "@/stores/server/features/susi/evaluation/queries";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/officer/_layout")({
  component: EvaluationLayout,
});

const sidebarNavItems = [
  {
    title: "평가 신청자 리스트",
    href: "/officer/apply",
  },
  {
    title: "프로필 관리",
    href: "/officer/profile",
  },
];

function EvaluationLayout() {
  const { data: isOfficer, status } = useCheckOfficer();
  const navigate = useNavigate();

  useEffect(() => {
    if ((status === "success" && !isOfficer) || status === "error") {
      toast.error("권한이 없습니다.");
      navigate({ to: "/" });
    }
  }, [isOfficer, navigate, status]);

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
