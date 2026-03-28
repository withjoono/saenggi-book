import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadarChart } from "@/components/score-visualizations/eval-graphs";
import MaterialGraph from "@/components/graph/MaterialGraph";
import { EVAL_QUESTIONS, SUB_CATEGORY_GROUPS } from "@/constants/evaluation-questions";
import type {
  IAiEvaluation,
  IAiEvaluationAnnotation,
  IAiEvaluationMaterial,
  IAiEvaluationQuestionScore,
} from "@/stores/server/features/ai-evaluation/interfaces";
import { GRADE_LETTER_MAPPING, GRADE_LEVEL_COLORS } from "@/types/evaluation.type";

const CATEGORY_LABELS: Record<string, string> = {
  academic: "학업역량",
  career: "진로역량",
  community: "공동체역량",
  other: "기타역량",
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: "bg-blue-100 text-blue-800 border-blue-200",
  career: "bg-emerald-100 text-emerald-800 border-emerald-200",
  community: "bg-amber-100 text-amber-800 border-amber-200",
  other: "bg-purple-100 text-purple-800 border-purple-200",
};

const CATEGORY_BAR_COLORS: Record<string, string> = {
  academic: "bg-blue-500",
  career: "bg-emerald-500",
  community: "bg-amber-500",
  other: "bg-purple-500",
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
    <Card className={`space-y-3 p-4 border ${CATEGORY_COLORS[annotation.category]?.split(" ")[2] || ""}`}>
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className={CATEGORY_COLORS[annotation.category] || ""}
        >
          {CATEGORY_LABELS[annotation.category] || annotation.category}
        </Badge>
      </div>
      <p className="text-sm">{annotation.comment}</p>
      {annotation.strengths?.length > 0 && (
        <div className="mt-2 rounded-md bg-emerald-50 p-3 dark:bg-emerald-950/50">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">💪 강점</p>
          <ul className="mt-1 ml-4 list-disc text-sm text-emerald-900 dark:text-emerald-100">
            {annotation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {annotation.weaknesses?.length > 0 && (
        <div className="mt-2 rounded-md bg-red-50 p-3 dark:bg-red-950/50">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400">⚠️ 약점</p>
          <ul className="mt-1 ml-4 list-disc text-sm text-red-900 dark:text-red-100">
            {annotation.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {annotation.advice?.length > 0 && (
        <div className="mt-2 rounded-md bg-blue-50 p-3 dark:bg-blue-950/50">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">💡 조언</p>
          <ul className="mt-1 ml-4 list-disc text-sm text-blue-900 dark:text-blue-100">
            {annotation.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export function getSubCategoryScores(category: string, questionScores: IAiEvaluationQuestionScore[] | null | undefined) {
  if (!questionScores || questionScores.length === 0) return [];
  const subCategoryGroups = SUB_CATEGORY_GROUPS.filter((g) => g.category === category);
  return subCategoryGroups
    .map((group) => {
      const scores = questionScores.filter((qs) => group.questionIds.includes(qs.questionId));
      if (scores.length === 0) return null;
      const avgScore = scores.reduce((sum, qs) => sum + qs.score, 0) / scores.length;
      return { name: group.name, score: Number(avgScore.toFixed(1)) };
    })
    .filter(Boolean) as { name: string; score: number }[];
}

export function VerticalScoreBarChart({
  scores, 
  colorClass
}: {
  scores: { name: string; score: number }[];
  colorClass: string;
}) {
  if (!scores || scores.length === 0) return null;
  return (
    <div className="flex items-end justify-center h-full w-full pt-6 pb-2 px-2 gap-2">
      {scores.map((sc) => {
        const heightPct = Math.min(100, (sc.score / 7) * 100);
        return (
          <div key={sc.name} className="flex flex-col items-center gap-2 h-full flex-1">
            <span className="text-xs font-bold text-primary">{sc.score}점</span>
            <div className="relative w-full max-w-[40px] flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-lg flex items-end justify-center overflow-hidden">
               <div
                 className={`w-full transition-all ${colorClass} rounded-t-lg`}
                 style={{ height: `${heightPct}%` }}
               />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight break-keep mt-2 h-[2.5rem] flex flex-col items-center justify-start">
              {sc.name.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryQuestionList({
  category,
  questionScores,
}: {
  category: "academic" | "career" | "community" | "other";
  questionScores: IAiEvaluationQuestionScore[] | null | undefined;
}) {
  if (!questionScores || questionScores.length === 0) return null;

  const categoryQuestions = EVAL_QUESTIONS.filter((q) => q.category === category);
  if (categoryQuestions.length === 0) return null;

  const subCategoryGroups = SUB_CATEGORY_GROUPS.filter((g) => g.category === category);

  return (
    <div className="space-y-6 pt-4">
      {/* 중분류별 문항 목록 */}
      {subCategoryGroups.map((group) => {
        const groupScores = questionScores.filter((qs) => group.questionIds.includes(qs.questionId));
        if (groupScores.length === 0) return null;

        return (
          <div key={group.name} className="space-y-3 pt-2">
            <h5 className="text-md font-bold mt-4 border-b border-slate-200 pb-2">{group.name}</h5>
            <div className="grid gap-3 sm:grid-cols-2">
              {groupScores.map((qs) => {
                const qInfo = categoryQuestions.find((q) => q.id === qs.questionId);
                return (
                  <div
                    key={qs.questionId}
                    className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-950"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">
                        Q{qs.questionId}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {qInfo?.question || "문항 정보 없음"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-14 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-primary">{qs.score} / 7</span>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-md dark:bg-slate-900">
                          {Array.from({ length: 7 }, (_, i) => (
                            <div
                              key={i}
                              className={`h-2.5 w-3.5 rounded-[2px] ${
                                i < qs.score ? "bg-primary shadow-sm" : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {qs.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MaterialsList({
  materials,
  tabId,
  highlightedIndex
}: {
  materials: IAiEvaluationMaterial[];
  tabId?: string;
  highlightedIndex?: number | null;
}) {
  if (!materials || materials.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <p className="text-sm">해당 역량의 관련 소재가 없습니다.</p>
      </Card>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {materials.map((m, i) => {
        const isHighlighted = highlightedIndex === i;
        const borderClass = isHighlighted
            ? `ring-4 ring-offset-2 z-10 scale-[1.02] shadow-xl transition-all duration-300 ${CATEGORY_COLORS[m.category]?.split(" ")[1] || "ring-primary"}`
            : CATEGORY_COLORS[m.category]?.split(" ")[2] || "";

        return (
          <Card 
            key={i} 
            id={tabId ? `material-card-${tabId}-${i}` : undefined}
            className={`space-y-2 p-4 border transition-all duration-300 ${borderClass}`}
          >
          <div className="flex items-start justify-between">
            <p className="font-semibold text-sm mr-2">{m.title}</p>
            <Badge
              className="shrink-0 font-medium text-white border-0"
              style={{ backgroundColor: GRADE_LEVEL_COLORS[m.gradeLevel] || '#94a3b8' }}
            >
              {GRADE_LETTER_MAPPING[m.gradeLevel]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{m.summary}</p>
          {m.relatedKeywords?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {m.relatedKeywords.map((kw, ki) => (
                <span
                  key={ki}
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </Card>
      );
    })}
    </div>
  );
}

function NavigationCard({ value, title, icon, score, subtitle, colorClass }: any) {
  return (
    <TabsTrigger 
       value={value}
       className={`group relative flex-1 min-w-[130px] sm:min-w-[140px] snap-center flex flex-col items-start justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/60 backdrop-blur-md dark:bg-slate-900/60 shadow-sm transition-all duration-300 overflow-hidden data-[state=active]:border-transparent data-[state=active]:shadow-md data-[state=active]:scale-[1.02] data-[state=active]:bg-gradient-to-br outline-none ${colorClass.ring} ${colorClass.bgFill}`}
    >
       <span className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-[28px] -mr-12 -mt-12 transition-opacity opacity-0 group-data-[state=active]:opacity-100 duration-500 ${colorClass.glowbg}`} />
       
       <div className="flex items-center gap-2 mb-4 z-10 w-full">
          <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-slate-500 transition-colors group-data-[state=active]:text-white shadow-sm ${colorClass.iconBg}`}>
            <span className="text-sm">{icon}</span>
          </div>
          <span className={`font-bold text-[13px] md:text-sm text-slate-700 dark:text-slate-300 transition-colors ${colorClass.text}`}>{title}</span>
       </div>
       
       <div className="z-10 flex flex-col items-start w-full">
          <span className="text-[11px] text-muted-foreground font-medium mb-0.5">{subtitle}</span>
          <span className={`text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-200 group-data-[state=active]:bg-gradient-to-r group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent transition-all ${colorClass.gradientText}`}>
            {score}<span className="text-sm font-semibold text-muted-foreground ml-0.5 tracking-normal group-data-[state=active]:text-current opacity-70">점</span>
          </span>
       </div>
    </TabsTrigger>
  );
}

export function AiEvaluationDetail({
  evaluation,
}: {
  evaluation: IAiEvaluation;
}) {
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState<Record<string, number | null>>({});

  const handleMaterialClick = (tab: string, idx: number) => {
    setSelectedMaterialIdx(prev => ({ ...prev, [tab]: prev[tab] === idx ? null : idx }));
    if (tab !== 'overview') {
       setTimeout(() => {
          const el = document.getElementById(`material-card-${tab}-${idx}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }, 50);
    }
  };
  const totalScore =
    evaluation.totalScore ??
    evaluation.scoreAcademic +
      evaluation.scoreCareer +
      evaluation.scoreCommunity +
      evaluation.scoreOther;

  const scores = {
    academic: evaluation.scoreAcademic || 0,
    career: evaluation.scoreCareer || 0,
    community: evaluation.scoreCommunity || 0,
    other: evaluation.scoreOther || 0,
  };

  const getMaterialsByCategory = (category: string) => 
    evaluation.materials?.filter(m => m.category === category) || [];
    
  const getAnnotationsByCategory = (category: string) => 
    evaluation.annotations?.filter(a => a.category === category) || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center bg-gray-50/50 py-6 rounded-xl border border-gray-100 dark:bg-slate-900/20 dark:border-slate-800">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI 생기부 평가 결과</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className="px-3 py-1 font-medium bg-white dark:bg-slate-950">
            {evaluation.grade}학년
            {evaluation.evalType === "semester" && evaluation.semester
              ? ` ${evaluation.semester}학기`
              : " 종합"}
          </Badge>
          {evaluation.targetSeries && (
            <Badge variant="secondary" className="px-3 py-1 font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              목표: {evaluation.targetSeries.replace(/>/g, " > ")}
            </Badge>
          )}
        </div>
        <p className="mt-4 max-w-2xl text-sm font-medium text-slate-700 dark:text-slate-300 px-4">
          {evaluation.summary}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex md:grid w-full grid-cols-5 h-auto p-0 bg-transparent gap-3 overflow-x-auto pb-4 snap-x justify-start snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <NavigationCard 
            value="overview" title="종합역량" icon="👑" score={totalScore} subtitle="총점"
            colorClass={{
              ring: "hover:border-primary/30 data-[state=active]:ring-2 data-[state=active]:ring-primary/20",
              text: "group-data-[state=active]:text-primary dark:group-data-[state=active]:text-primary",
              gradientText: "group-data-[state=active]:from-primary group-data-[state=active]:to-indigo-500",
              iconBg: "bg-slate-100 dark:bg-slate-800 group-data-[state=active]:bg-primary",
              glowbg: "bg-primary/20",
              bgFill: "data-[state=active]:from-primary/10 data-[state=active]:to-primary/5"
            }}
          />
          <NavigationCard 
            value="academic" title="학업역량" icon="📚" score={scores.academic} subtitle="세부 역량 점수"
            colorClass={{
              ring: "hover:border-blue-500/30 data-[state=active]:ring-2 data-[state=active]:ring-blue-500/20",
              text: "group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400",
              gradientText: "group-data-[state=active]:from-blue-600 group-data-[state=active]:to-blue-400",
              iconBg: "bg-slate-100 dark:bg-slate-800 group-data-[state=active]:bg-blue-500",
              glowbg: "bg-blue-500/20",
              bgFill: "data-[state=active]:from-blue-500/10 data-[state=active]:to-blue-500/5"
            }}
          />
          <NavigationCard 
            value="career" title="진로역량" icon="🎯" score={scores.career} subtitle="세부 역량 점수"
            colorClass={{
              ring: "hover:border-emerald-500/30 data-[state=active]:ring-2 data-[state=active]:ring-emerald-500/20",
              text: "group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-emerald-400",
              gradientText: "group-data-[state=active]:from-emerald-600 group-data-[state=active]:to-emerald-400",
              iconBg: "bg-slate-100 dark:bg-slate-800 group-data-[state=active]:bg-emerald-500",
              glowbg: "bg-emerald-500/20",
              bgFill: "data-[state=active]:from-emerald-500/10 data-[state=active]:to-emerald-500/5"
            }}
          />
          <NavigationCard 
            value="community" title="공동체역량" icon="🤝" score={scores.community} subtitle="세부 역량 점수"
            colorClass={{
              ring: "hover:border-amber-500/30 data-[state=active]:ring-2 data-[state=active]:ring-amber-500/20",
              text: "group-data-[state=active]:text-amber-600 dark:group-data-[state=active]:text-amber-400",
              gradientText: "group-data-[state=active]:from-amber-600 group-data-[state=active]:to-amber-500",
              iconBg: "bg-slate-100 dark:bg-slate-800 group-data-[state=active]:bg-amber-500",
              glowbg: "bg-amber-500/20",
              bgFill: "data-[state=active]:from-amber-500/10 data-[state=active]:to-amber-500/5"
            }}
          />
          <NavigationCard 
            value="other" title="기타역량" icon="✨" score={scores.other} subtitle="세부 역량 점수"
            colorClass={{
              ring: "hover:border-purple-500/30 data-[state=active]:ring-2 data-[state=active]:ring-purple-500/20",
              text: "group-data-[state=active]:text-purple-600 dark:group-data-[state=active]:text-purple-400",
              gradientText: "group-data-[state=active]:from-purple-600 group-data-[state=active]:to-purple-400",
              iconBg: "bg-slate-100 dark:bg-slate-800 group-data-[state=active]:bg-purple-500",
              glowbg: "bg-purple-500/20",
              bgFill: "data-[state=active]:from-purple-500/10 data-[state=active]:to-purple-500/5"
            }}
          />
        </TabsList>

        <div className="mt-6">
          {/* ======================= 종합 탭 ======================= */}
          <TabsContent value="overview" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 그래프 & 점수 요약 */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-slate-200/60 overflow-hidden">
                <div className="text-center mb-6 w-full">
                  <h4 className="text-lg font-bold">🎯 역량별 점수</h4>
                  <p className="text-sm text-muted-foreground mt-1">총점 <span className="font-bold text-primary">{totalScore}</span>점</p>
                </div>
                <RadarChart scores={scores} size={260} />
              </Card>
              
              <Card className="p-6 shadow-sm border-slate-200/60 flex flex-col justify-center">
                 <h4 className="text-lg font-bold mb-5 flex items-center gap-2">📊 세부 역량 점수</h4>
                 <div className="flex items-end justify-center h-[200px] w-full pt-4 pb-2 px-2 gap-4">
                  {[
                    { label: "진로", icon: "🎯", score: scores.career, color: "bg-emerald-500" },
                    { label: "학업", icon: "📚", score: scores.academic, color: "bg-blue-500" },
                    { label: "공동체", icon: "🤝", score: scores.community, color: "bg-amber-500" },
                    { label: "기타", icon: "✨", score: scores.other, color: "bg-purple-500" }
                  ].map((cat) => (
                    <div key={cat.label} className="flex flex-col items-center gap-2 h-full flex-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.score}점</span>
                      <div className="relative w-full max-w-[48px] flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-lg flex items-end justify-center overflow-hidden shadow-inner">
                        <div
                          className={`w-full transition-all ${cat.color} rounded-t-lg`}
                          style={{ height: `${Math.min(100, (cat.score / 50) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 text-center flex flex-col items-center gap-1 mt-1 break-keep">
                        <span className="text-sm">{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Strengths / Weaknesses / Advice */}
            {(evaluation.strengths?.length > 0 || evaluation.weaknesses?.length > 0 || evaluation.advice?.length > 0) && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold">📝 AI 사정관 종합 의견</h4>
                <div className="grid gap-4 sm:grid-cols-3 align-top items-start">
                  {evaluation.strengths?.length > 0 && (
                    <Card className="space-y-3 p-5 border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 shadow-sm h-full">
                      <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <span className="text-lg">💪</span> 강점 요소
                      </p>
                      <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="leading-relaxed">{s}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {evaluation.weaknesses?.length > 0 && (
                    <Card className="space-y-3 p-5 border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 shadow-sm h-full">
                      <p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                        <span className="text-lg">⚠️</span> 부족한 점
                      </p>
                      <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                        {evaluation.weaknesses.map((w, i) => (
                          <li key={i} className="leading-relaxed">{w}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {evaluation.advice?.length > 0 && (
                    <Card className="space-y-3 p-5 border-blue-100 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-sm h-full">
                      <p className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <span className="text-lg">💡</span> 개선 조언
                      </p>
                      <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                        {evaluation.advice.map((a, i) => (
                          <li key={i} className="leading-relaxed">{a}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </div>
            )}

            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">🔀 전체 소재 연결 네트워크</h4>
              <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-slate-200/60 overflow-hidden bg-slate-950">
                <div className="w-full">
                  <MaterialGraph 
                    materials={(evaluation.materials || []).map(m => ({
                      ...m,
                      severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                    })) as any[]} 
                    centerLabel="생기부 통합" 
                    initialHeight={650} 
                    onMaterialClick={(idx) => handleMaterialClick('overview', idx)}
                  />
                </div>
              </Card>

              {selectedMaterialIdx.overview !== undefined && selectedMaterialIdx.overview !== null && evaluation.materials?.[selectedMaterialIdx.overview] && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <h5 className="font-bold mb-3 text-sm flex items-center gap-2"><span className="text-primary text-base">📌</span> 선택된 소재 상세</h5>
                   <Card className="p-5 border-primary/40 ring-1 ring-primary/20 bg-primary/[0.03] dark:bg-primary/[0.05]">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-base">{evaluation.materials[selectedMaterialIdx.overview].title}</span>
                        <Badge className="text-white shrink-0 border-0" style={{ backgroundColor: GRADE_LEVEL_COLORS[evaluation.materials[selectedMaterialIdx.overview].gradeLevel] }}>
                           {GRADE_LETTER_MAPPING[evaluation.materials[selectedMaterialIdx.overview].gradeLevel]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{evaluation.materials[selectedMaterialIdx.overview].summary}</p>
                   </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ======================= 학업 탭 ======================= */}
          <TabsContent value="academic" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6 md:grid-cols-2 min-h-[400px]">
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-blue-200/60 overflow-hidden">
                <div className="text-center mb-6 w-full">
                  <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400">🎯 학업 세부 역량 (총점: {scores.academic}점)</h4>
                  <p className="text-sm text-muted-foreground mt-1">중분류별 점수 분포도</p>
                </div>
                {(() => {
                  const subScores = getSubCategoryScores('academic', evaluation.questionScores);
                  const radarScores = subScores.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.score }), {} as Record<string, number>);
                  if (Object.keys(radarScores).length < 3) {
                     return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center">중분류가 3개 미만이라 레이더 차트를<br/>그릴 수 없습니다.</div>
                  }
                  return <RadarChart scores={radarScores} maxScore={7} size={260} />;
                })()}
              </Card>
              
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-blue-200/60 overflow-hidden">
                <div className="text-center mb-4 w-full">
                  <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400">📊 세부 역량 평균 점수</h4>
                  <p className="text-sm text-muted-foreground mt-1">7점 만점 기준</p>
                </div>
                <div className="w-full flex-1">
                   <VerticalScoreBarChart scores={getSubCategoryScores('academic', evaluation.questionScores)} colorClass={CATEGORY_BAR_COLORS['academic']} />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-blue-500">📚</span> 학업 역량 상세 분석</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {getAnnotationsByCategory('academic').map((ann, i) => (
                  <AnnotationBlock key={`academic-ann-${i}`} annotation={ann} />
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-blue-500">🔀</span> 관련 핵심 소재 네트워크</h4>
              <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-blue-200/60 overflow-hidden bg-slate-950">
                <div className="w-full">
                  <MaterialGraph 
                    materials={getMaterialsByCategory('academic').map(m => ({
                      ...m,
                      severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                    })) as any[]} 
                    centerLabel="학업 역량" 
                    initialHeight={550} 
                    colorBy="gradeLevel"
                    onMaterialClick={(idx) => handleMaterialClick('academic', idx)}
                  />
                </div>
              </Card>
              <MaterialsList materials={getMaterialsByCategory('academic')} tabId="academic" highlightedIndex={selectedMaterialIdx.academic} />
            </div>

            <Separator />

            <CategoryQuestionList category="academic" questionScores={evaluation.questionScores} />
          </TabsContent>

          {/* ======================= 진로 탭 ======================= */}
          <TabsContent value="career" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6 md:grid-cols-2 min-h-[400px]">
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-emerald-200/60 overflow-hidden">
                <div className="text-center mb-6 w-full">
                  <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">🎯 진로 세부 역량 (총점: {scores.career}점)</h4>
                  <p className="text-sm text-muted-foreground mt-1">중분류별 점수 분포도</p>
                </div>
                {(() => {
                  const subScores = getSubCategoryScores('career', evaluation.questionScores);
                  const radarScores = subScores.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.score }), {} as Record<string, number>);
                  if (Object.keys(radarScores).length < 3) {
                     return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center">중분류가 3개 미만이라 레이더 차트를<br/>그릴 수 없습니다.</div>
                  }
                  return <RadarChart scores={radarScores} maxScore={7} size={260} />;
                })()}
              </Card>
              
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-emerald-200/60 overflow-hidden">
                <div className="text-center mb-4 w-full">
                  <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">📊 세부 역량 평균 점수</h4>
                  <p className="text-sm text-muted-foreground mt-1">7점 만점 기준</p>
                </div>
                <div className="w-full flex-1">
                   <VerticalScoreBarChart scores={getSubCategoryScores('career', evaluation.questionScores)} colorClass={CATEGORY_BAR_COLORS['career']} />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-emerald-500">🎯</span> 진로 역량 상세 분석</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {getAnnotationsByCategory('career').map((ann, i) => (
                  <AnnotationBlock key={`career-ann-${i}`} annotation={ann} />
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-emerald-500">🔀</span> 관련 핵심 소재 네트워크</h4>
              <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-emerald-200/60 overflow-hidden bg-slate-950">
                <div className="w-full">
                  <MaterialGraph 
                    materials={getMaterialsByCategory('career').map(m => ({
                      ...m,
                      severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                    })) as any[]} 
                    centerLabel="진로 역량" 
                    initialHeight={550} 
                    colorBy="gradeLevel"
                    onMaterialClick={(idx) => handleMaterialClick('career', idx)}
                  />
                </div>
              </Card>
              <MaterialsList materials={getMaterialsByCategory('career')} tabId="career" highlightedIndex={selectedMaterialIdx.career} />
            </div>

            <Separator />

            <CategoryQuestionList category="career" questionScores={evaluation.questionScores} />
          </TabsContent>

          {/* ======================= 공동체 탭 ======================= */}
          <TabsContent value="community" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid gap-6 md:grid-cols-2 min-h-[400px]">
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-amber-200/60 overflow-hidden">
                <div className="text-center mb-6 w-full">
                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-400">🎯 공동체 세부 역량 (총점: {scores.community}점)</h4>
                  <p className="text-sm text-muted-foreground mt-1">중분류별 점수 분포도</p>
                </div>
                {(() => {
                  const subScores = getSubCategoryScores('community', evaluation.questionScores);
                  const radarScores = subScores.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.score }), {} as Record<string, number>);
                  if (Object.keys(radarScores).length < 3) {
                     return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center">중분류가 3개 미만이라 레이더 차트를<br/>그릴 수 없습니다.</div>
                  }
                  return <RadarChart scores={radarScores} maxScore={7} size={260} />;
                })()}
              </Card>
              
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-amber-200/60 overflow-hidden">
                <div className="text-center mb-4 w-full">
                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-400">📊 세부 역량 평균 점수</h4>
                  <p className="text-sm text-muted-foreground mt-1">7점 만점 기준</p>
                </div>
                <div className="w-full flex-1">
                   <VerticalScoreBarChart scores={getSubCategoryScores('community', evaluation.questionScores)} colorClass={CATEGORY_BAR_COLORS['community']} />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-amber-500">🤝</span> 공동체 역량 상세 분석</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {getAnnotationsByCategory('community').map((ann, i) => (
                  <AnnotationBlock key={`community-ann-${i}`} annotation={ann} />
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-amber-500">🔀</span> 관련 핵심 소재 네트워크</h4>
              <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-amber-200/60 overflow-hidden bg-slate-950">
                <div className="w-full">
                  <MaterialGraph 
                    materials={getMaterialsByCategory('community').map(m => ({
                      ...m,
                      severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                    })) as any[]} 
                    centerLabel="공동체 역량" 
                    initialHeight={550} 
                    colorBy="gradeLevel"
                    onMaterialClick={(idx) => handleMaterialClick('community', idx)}
                  />
                </div>
              </Card>
              <MaterialsList materials={getMaterialsByCategory('community')} tabId="community" highlightedIndex={selectedMaterialIdx.community} />
            </div>

            <Separator />

            <CategoryQuestionList category="community" questionScores={evaluation.questionScores} />
          </TabsContent>

          {/* ======================= 기타 탭 ======================= */}
          <TabsContent value="other" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6 md:grid-cols-2 min-h-[400px]">
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-purple-200/60 overflow-hidden">
                <div className="text-center mb-6 w-full">
                  <h4 className="text-lg font-bold text-purple-800 dark:text-purple-400">🎯 기타 세부 역량 (총점: {scores.other}점)</h4>
                  <p className="text-sm text-muted-foreground mt-1">중분류별 점수 분포도</p>
                </div>
                {(() => {
                  const subScores = getSubCategoryScores('other', evaluation.questionScores);
                  const radarScores = subScores.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.score }), {} as Record<string, number>);
                  if (Object.keys(radarScores).length < 3) {
                     return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center">중분류가 3개 미만이라 레이더 차트를<br/>그릴 수 없습니다.</div>
                  }
                  return <RadarChart scores={radarScores} maxScore={7} size={260} />;
                })()}
              </Card>
              
              <Card className="p-5 flex flex-col items-center justify-center shadow-sm border-purple-200/60 overflow-hidden">
                <div className="text-center mb-4 w-full">
                  <h4 className="text-lg font-bold text-purple-800 dark:text-purple-400">📊 세부 역량 평균 점수</h4>
                  <p className="text-sm text-muted-foreground mt-1">7점 만점 기준</p>
                </div>
                <div className="w-full flex-1">
                   <VerticalScoreBarChart scores={getSubCategoryScores('other', evaluation.questionScores)} colorClass={CATEGORY_BAR_COLORS['other']} />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-purple-500">✨</span> 기타 역량 상세 분석</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {getAnnotationsByCategory('other').map((ann, i) => (
                  <AnnotationBlock key={`other-ann-${i}`} annotation={ann} />
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-purple-500">🔀</span> 관련 핵심 소재 네트워크</h4>
              <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-purple-200/60 overflow-hidden bg-slate-950">
                <div className="w-full">
                  <MaterialGraph 
                    materials={getMaterialsByCategory('other').map(m => ({
                      ...m,
                      severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                    })) as any[]} 
                    centerLabel="기타 역량" 
                    initialHeight={550} 
                    colorBy="gradeLevel"
                    onMaterialClick={(idx) => handleMaterialClick('other', idx)}
                  />
                </div>
              </Card>
              <MaterialsList materials={getMaterialsByCategory('other')} tabId="other" highlightedIndex={selectedMaterialIdx.other} />
            </div>

            <Separator />

            <CategoryQuestionList category="other" questionScores={evaluation.questionScores} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

