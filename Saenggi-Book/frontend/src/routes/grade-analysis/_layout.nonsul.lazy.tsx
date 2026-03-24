import { ComingSoon } from "@/components/coming-soon";
import { buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/grade-analysis/_layout/nonsul")({
  component: GradeAnalysisNonsul,
});

function GradeAnalysisNonsul() {
  return (
    <div className="w-full pb-8">
      <div className="flex flex-col items-center gap-10">
        <ComingSoon />
        <Link className={cn(buttonVariants())} to="/">
          홈으로
        </Link>
      </div>
    </div>
  );
}
