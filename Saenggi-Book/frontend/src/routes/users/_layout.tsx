import { SubSidebarNav } from "@/components/sub-sidebar-nav";
import { useCheckOfficer } from "@/stores/server/features/susi/evaluation/queries";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/users/_layout")({
  component: UserLayout,
});

const defaultSidebarNavItems = [
  {
    title: "프로필 수정",
    href: "/users/profile",
  },
  {
    title: "생기부 등록",
    href: "/users/school-record",
  },
  {
    title: "추가자료 업로드",
    href: "/users/additional-file",
  },
  {
    title: "모의고사/수능 성적 등록",
    href: "/users/mock-exam",
  },
  {
    title: "결제 내역",
    href: "/users/payment",
  },
];

function UserLayout() {
  const { data: isOfficer } = useCheckOfficer();

  const sidebarNavItems = [...defaultSidebarNavItems];

  if (isOfficer) {
    sidebarNavItems.push({
      title: "생기부 평가 요청",
      href: "/officer/apply",
    });
  }

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
