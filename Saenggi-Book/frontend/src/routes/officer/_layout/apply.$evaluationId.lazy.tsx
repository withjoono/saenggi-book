/**
 * 학생 평가 상세 페이지 (NestJS 마이그레이션 완료)
 */
import { EditEvaluationForm } from "@/components/services/evaluation/edit-evaluation-form";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/officer/_layout/apply/$evaluationId")({
  component: EditEvaluation,
});

function EditEvaluation() {
  const evaluationId = Route.useParams().evaluationId;

  return (
    <div>
      <EditEvaluationForm evaluationId={Number(evaluationId)} />
    </div>
  );
}
