import { HomeContent } from "@/components/home-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/h1")({
  component: H1Page,
});

function H1Page() {
  return <HomeContent grade="0" />;
}
