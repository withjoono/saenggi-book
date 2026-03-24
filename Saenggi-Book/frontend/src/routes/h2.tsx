import { HomeContent } from "@/components/home-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/h2")({
  component: H2Page,
});

function H2Page() {
  return <HomeContent grade="1" />;
}
