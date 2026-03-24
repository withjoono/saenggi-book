/**
 * Try (무료 체험) 라우트 레이아웃
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/try")({
  component: TryLayout,
});

function TryLayout() {
  return <Outlet />;
}
