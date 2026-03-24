import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type {
  IAiEvaluation,
  IAiEvaluationAnnotation,
} from "@/stores/server/features/ai-evaluation/interfaces";

const CATEGORY_LABELS: Record<string, string> = {
  academic: "학업역량",
  career: "진로역량",
  community: "공동체역량",
  other: "기타역량",
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: "bg-blue-100 text-blue-800",
  career: "bg-emerald-100 text-emerald-800",
  community: "bg-amber-100 text-amber-800",
  other: "bg-purple-100 text-purple-800",
};

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const maxBarScore = 50;
  const pct = Math.min(100, (score / maxBarScore) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{score}점</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AnnotationBlock({ annotation }: { annotation: IAiEvaluationAnnotation }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={CATEGORY_COLORS[annotation.category] || ""}
        >
          {CATEGORY_LABELS[annotation.category] || annotation.category}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{annotation.comment}</p>
      {annotation.strengths?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-emerald-700">💪 강점</p>
          <ul className="ml-4 list-disc text-sm">
            {annotation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {annotation.weaknesses?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600">⚠️ 약점</p>
          <ul className="ml-4 list-disc text-sm">
            {annotation.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {annotation.advice?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-700">💡 조언</p>
          <ul className="ml-4 list-disc text-sm">
            {annotation.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export function AiEvaluationDetail({
  evaluation,
}: {
  evaluation: IAiEvaluation;
}) {
  const totalScore =
    evaluation.totalScore ??
    evaluation.scoreAcademic +
      evaluation.scoreCareer +
      evaluation.scoreCommunity +
      evaluation.scoreOther;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-semibold">AI 생기부 평가 결과</h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline">
            {evaluation.grade}학년
            {evaluation.evalType === "semester" && evaluation.semester
              ? ` ${evaluation.semester}학기`
              : " 종합"}
          </Badge>
          {evaluation.targetSeries && (
            <Badge variant="secondary">
              목표: {evaluation.targetSeries.replace(/>/g, " > ")}
            </Badge>
          )}
        </div>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {evaluation.summary}
        </p>
      </div>

      <Separator />

      {/* Scores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">📊 역량별 점수</h4>
          <span className="text-xl font-bold text-primary">
            총점: {totalScore}점
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ScoreBar
            label="🎯 진로역량"
            score={evaluation.scoreCareer}
            color="bg-emerald-500"
          />
          <ScoreBar
            label="📚 학업역량"
            score={evaluation.scoreAcademic}
            color="bg-blue-500"
          />
          <ScoreBar
            label="🤝 공동체역량"
            score={evaluation.scoreCommunity}
            color="bg-amber-500"
          />
          <ScoreBar
            label="✨ 기타역량"
            score={evaluation.scoreOther}
            color="bg-purple-500"
          />
        </div>
      </div>

      <Separator />

      {/* Strengths / Weaknesses / Advice */}
      {(evaluation.strengths?.length || evaluation.weaknesses?.length || evaluation.advice?.length) ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">📝 종합 평가</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <Card className="space-y-2 p-4">
                <p className="font-semibold text-emerald-700">💪 강점</p>
                <ul className="ml-4 list-disc space-y-1 text-sm">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
            )}
            {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
              <Card className="space-y-2 p-4">
                <p className="font-semibold text-red-600">⚠️ 약점</p>
                <ul className="ml-4 list-disc space-y-1 text-sm">
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </Card>
            )}
            {evaluation.advice && evaluation.advice.length > 0 && (
              <Card className="space-y-2 p-4">
                <p className="font-semibold text-blue-700">💡 개선 조언</p>
                <ul className="ml-4 list-disc space-y-1 text-sm">
                  {evaluation.advice.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {/* Annotations (category-level comments) */}
      {evaluation.annotations && evaluation.annotations.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">🔍 역량별 상세 평가</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {evaluation.annotations.map((ann, i) => (
                <AnnotationBlock key={i} annotation={ann} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Question Scores */}
      {evaluation.questionScores && evaluation.questionScores.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">📋 세부 항목 점수 (40문항)</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {evaluation.questionScores.map((q) => (
                <div
                  key={q.questionId}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    Q{q.questionId}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 7 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-3 rounded-sm ${
                              i < q.score ? "bg-primary" : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">
                        {q.score}/7
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {q.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Materials */}
      {evaluation.materials && evaluation.materials.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">🎯 핵심 소재 분석</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {evaluation.materials.map((m, i) => (
                <Card key={i} className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{m.title}</p>
                    <Badge
                      variant="outline"
                      className={CATEGORY_COLORS[m.category] || ""}
                    >
                      {m.gradeLevel}등급
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.summary}</p>
                  {m.relatedKeywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.relatedKeywords.map((kw, ki) => (
                        <span
                          key={ki}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
