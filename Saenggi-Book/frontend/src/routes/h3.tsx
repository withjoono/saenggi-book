import { HomeContent } from "@/components/home-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/h3")({
  component: H3Page,
});

function H3Page() {
  return <HomeContent grade="2" />;
}
