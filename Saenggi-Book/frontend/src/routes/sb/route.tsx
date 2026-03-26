import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/sb")({
  component: SusiRoute,
});

function SusiRoute() {
  return <Outlet />;
}
