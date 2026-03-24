import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ms")({
  component: SusiRoute,
});

function SusiRoute() {
  return <Outlet />;
}
