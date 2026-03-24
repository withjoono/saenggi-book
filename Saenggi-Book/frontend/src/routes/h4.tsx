import { HomeContent } from "@/components/home-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/h4")({
  component: H4Page,
});

function H4Page() {
  return <HomeContent grade="2N" />;
}
