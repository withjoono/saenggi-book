import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ms/_layout")({
  component: SusiInterestLayout,
});

function SusiInterestLayout() {
  return (
    <div
      className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-10"
      style={
        {
          "--primary": "88 43% 24%",
          "--primary-foreground": "60 9.1% 97.8%",
        } as React.CSSProperties
      }
    >
      <Outlet />
    </div>
  );
}
