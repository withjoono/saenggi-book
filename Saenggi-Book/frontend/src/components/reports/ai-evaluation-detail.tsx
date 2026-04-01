import { useState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/custom/button";
import nestApiClient from "@/stores/server/api-client";
import CompetencyFlowGraph from "@/components/score-visualizations/competency-flow-graph";
import { CompetencyTimeline as ICompetencyTimeline } from "@/types/analysis.type";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/80 p-5 dark:border-blue-900/50 dark:bg-blue-950/40 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full opacity-50 dark:bg-blue-900/30" />
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3 z-10 relative">
            <span className="text-xl">🚀</span> 다음 학기 코칭 조언 (Next Step)
          </p>
          <ul className="ml-4 list-disc space-y-2 text-sm text-blue-950 dark:text-blue-100 font-medium z-10 relative">
            {annotation.advice.map((a, i) => (
              <li key={i} className="leading-relaxed">{a}</li>
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
            <div className="flex gap-2">
              <Badge className="shrink-0 font-medium text-white border-0" style={{ backgroundColor: GRADE_LEVEL_COLORS[m.gradeLevel] || '#94a3b8' }}>
                {GRADE_LETTER_MAPPING[m.gradeLevel]}
              </Badge>
              <Badge variant="outline" className="shrink-0 font-semibold border-gray-300 text-gray-600">
                {m.gradeLevel <= 2 ? '🌟 심화 소재' : m.gradeLevel <= 4 ? '📈 주도적 탐구' : '📝 일반 활동'}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{m.summary}</p>
          {m.relatedKeywords?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 items-center">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-200 font-bold dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
                🎯 [{CATEGORY_LABELS[m.category] || '핵심역량'}] 어필
              </span>
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

function NavigationCard({ value, title, icon, score, colorClass, isActive, isFirst, isLast, zIndex }: any) {
  return (
    <TabsTrigger 
       value={value}
       className={`relative flex flex-col items-center justify-center gap-1 py-3 md:py-4 px-6 md:px-8 cursor-pointer font-bold transition-all duration-300 outline-none select-none border-none whitespace-nowrap min-w-[100px] md:min-w-[140px] ${
         isActive 
           ? 'text-white shadow-xl shadow-slate-300/50 scale-[1.03] z-[100]' 
           : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 z-10'
       }`}
       style={{
         background: isActive ? colorClass.hex : undefined,
         clipPath: isFirst 
           ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
           : isLast
           ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)'
           : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
         marginLeft: isFirst ? '0px' : '-16px',
         zIndex: isActive ? 100 : zIndex,
         borderTopLeftRadius: isFirst ? '12px' : '0',
         borderBottomLeftRadius: isFirst ? '12px' : '0',
         borderTopRightRadius: isLast ? '12px' : '0',
         borderBottomRightRadius: isLast ? '12px' : '0'
       }}
    >
       <div className={`flex items-center gap-1 md:gap-2 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
          <span className="text-[14px] md:text-xl drop-shadow-sm">{icon}</span>
          <span className={`text-[12px] md:text-[15px] ${isActive ? '' : 'font-semibold'}`}>{title}</span>
       </div>
       <span className={`text-[14px] md:text-2xl font-black mt-1 ${isActive ? 'bg-white/20 px-1.5 md:px-2 py-0.5 rounded backdrop-blur-sm -ml-1' : ''}`}>
         {score}<span className="text-[10px] md:text-sm ml-0.5 opacity-90">점</span>
       </span>
    </TabsTrigger>
  );
}

export function AiEvaluationDetail({
  evaluation,
  defaultTab = "overview",
}: {
  evaluation: IAiEvaluation;
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState<Record<string, number | null>>({});

  const [timelineData, setTimelineData] = useState<Record<string, ICompetencyTimeline | null>>({});
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState<Record<string, boolean>>({});
  const [timelineError, setTimelineError] = useState<Record<string, string | null>>({});

  const getMaterialsByCategory = (category: string) => 
    evaluation.materials?.filter(m => m.category === category) || [];

  const handleGenerateTimeline = async (category: 'academic' | 'career' | 'community') => {
      const categoryMaterials = getMaterialsByCategory(category);
      if (categoryMaterials.length === 0) return;

      setIsGeneratingTimeline(prev => ({ ...prev, [category]: true }));
      setTimelineError(prev => ({ ...prev, [category]: null }));

      try {
          const res = await nestApiClient.post("/schoolrecord/timeline", { 
              materials: categoryMaterials, 
              category, 
              evaluationId: evaluation.id 
          });
          const timeline = res.data?.data || res.data;
          
          const hasNodes = timeline?.nodes && timeline.nodes.length > 0;
          const hasStoryline = !!(timeline?.overall_storyline || timeline?.overallStoryline);
          
          if (!hasNodes && !hasStoryline) {
              setTimelineError(prev => ({ ...prev, [category]: "AI가 서사 연결을 찾지 못했습니다. 다시 시도해주세요." }));
          } else {
              setTimelineData(prev => ({ ...prev, [category]: timeline as ICompetencyTimeline }));
          }
      } catch (err: any) {
          console.error(`[${category}] 타임라인 생성 실패:`, err);
          setTimelineError(prev => ({ ...prev, [category]: "타임라인 생성 중 오류가 발생했습니다. 다시 시도해주세요." }));
      } finally {
          setIsGeneratingTimeline(prev => ({ ...prev, [category]: false }));
      }
  };

  // 탭 이동 시 타임라인 자동 로드 (캐싱되어 있다면 즉시 로딩됨)
  useEffect(() => {
    if (['academic', 'career', 'community'].includes(activeTab)) {
      if (!timelineData[activeTab] && !isGeneratingTimeline[activeTab] && !timelineError[activeTab]) {
        // 백그라운드에서 타임라인 생성 혹은 캐시 로딩 수행
        handleGenerateTimeline(activeTab as 'academic' | 'career' | 'community');
      }
    }
  }, [activeTab, timelineData, isGeneratingTimeline, timelineError]);

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


  const getAnnotationsByCategory = (category: string) => 
    evaluation.annotations?.filter(a => a.category === category) || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center bg-transparent py-4 relative">
        <div className="flex w-full items-center justify-between px-2 sm:px-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 font-medium bg-blue-50/50 dark:bg-slate-900 border-indigo-100 text-indigo-700 shadow-sm">
              {evaluation.grade}학년
              {evaluation.evalType === "semester" && evaluation.semester
                ? ` ${evaluation.semester}학기`
                : " 종합"}
            </Badge>
            {evaluation.targetSeries && (
              <Badge variant="secondary" className="px-3 py-1 font-medium bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 shadow-sm">
                방향: {evaluation.targetSeries.split(" > ").pop()}
              </Badge>
            )}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-50 rounded-full transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-indigo-500 text-sm">ℹ️</span> <span className="hidden sm:inline">7단계 평가 척도 안내</span><span className="sm:hidden">안내</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] sm:w-[380px] p-0 overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-[200]">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">7단계 평가 척도 안내</h4>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <ul className="space-y-3 text-[13px] text-slate-600 dark:text-slate-400">
                  <li className="flex gap-3"><Badge className="bg-primary/10 text-primary border-primary/20 min-w-[56px] justify-center">A+ (탁월)</Badge> <span className="flex-1 pt-0.5">교육과정을 초월한 자발적 심화 탐구 및 독창적 결과물 산출.</span></li>
                  <li className="flex gap-3"><Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 min-w-[56px] justify-center">A (우수)</Badge> <span className="flex-1 pt-0.5">구체적 근거가 있는 주도적 학습 및 전공 관련 심화 성취.</span></li>
                  <li className="flex gap-3"><Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 min-w-[56px] justify-center">B+ (양호)</Badge> <span className="flex-1 pt-0.5">교과 지식의 주도적 확장 및 의미 있는 활동 참여.</span></li>
                  <li className="flex gap-3"><Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 min-w-[56px] justify-center">B (보통)</Badge> <span className="flex-1 pt-0.5">성실한 학교생활 및 학교 주도 프로그램의 수동적 참여.</span></li>
                  <li className="flex gap-3"><Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 min-w-[56px] justify-center">C+ (미흡)</Badge> <span className="flex-1 pt-0.5">구체성이 결여된 나열식 기록 및 미흡한 역량 수준.</span></li>
                  <li className="flex gap-3"><Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 min-w-[56px] justify-center">C (부족)</Badge> <span className="flex-1 pt-0.5">평가 불가 수준의 기록 부실 및 근거 미비초.</span></li>
                  <li className="flex gap-3"><Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 min-w-[56px] justify-center">D (부적격)</Badge> <span className="flex-1 pt-0.5">심각한 결격 사유 존재.</span></li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* 메인 요약 문구 (에센스) */}
        <div className="relative max-w-4xl mt-2 px-6 py-6 md:py-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] w-full">
          <span className="text-4xl md:text-5xl text-indigo-200 dark:text-indigo-900/30 absolute top-2 md:top-4 left-4 md:left-6 font-serif select-none pointer-events-none">"</span>
          <p className="relative z-10 text-[15px] md:text-lg font-medium leading-relaxed md:leading-loose text-slate-800 dark:text-slate-200 px-4 md:px-10 text-center break-keep">
            {evaluation.summary}
          </p>
          <span className="text-4xl md:text-5xl text-indigo-200 dark:text-indigo-900/30 absolute bottom-0 right-4 md:right-6 font-serif leading-none select-none pointer-events-none">"</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="relative flex w-full max-w-4xl mx-auto overflow-x-auto h-auto p-0 bg-transparent mb-6 rounded-xl scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] drop-shadow-sm pb-8 pt-4 border-none">
          <NavigationCard 
            value="overview" title="종합" icon="👑" score={totalScore} isFirst={true} isLast={false} zIndex={50} isActive={activeTab === 'overview'}
            colorClass={{ hex: '#4f46e5' }}
          />
          <NavigationCard 
            value="academic" title="학업" icon="📚" score={scores.academic} isFirst={false} isLast={false} zIndex={40} isActive={activeTab === 'academic'}
            colorClass={{ hex: '#3b82f6' }}
          />
          <NavigationCard 
            value="career" title="진로" icon="🎯" score={scores.career} isFirst={false} isLast={false} zIndex={30} isActive={activeTab === 'career'}
            colorClass={{ hex: '#10b981' }}
          />
          <NavigationCard 
            value="community" title="공동체" icon="🤝" score={scores.community} isFirst={false} isLast={false} zIndex={20} isActive={activeTab === 'community'}
            colorClass={{ hex: '#f59e0b' }}
          />
          <NavigationCard 
            value="other" title="기타" icon="✨" score={scores.other} isFirst={false} isLast={true} zIndex={10} isActive={activeTab === 'other'}
            colorClass={{ hex: '#8b5cf6' }}
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 align-top items-start">
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
                    <Card className="space-y-4 p-6 border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60 shadow-md sm:col-span-2 md:col-span-1 lg:col-span-3 xl:col-span-3 relative overflow-hidden ring-1 ring-blue-500/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-bl-full opacity-30 dark:bg-blue-800/20 pointer-events-none" />
                      <p className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 text-lg border-b border-blue-200/50 pb-3 z-10 relative">
                        <span className="text-2xl">🚀</span> 다음 학기를 위한 생기부 빌드업 코칭 (Next Step)
                      </p>
                      <ul className="ml-5 list-disc space-y-2.5 text-base text-blue-950 dark:text-blue-100 font-medium z-10 relative">
                        {evaluation.advice.map((a, i) => (
                          <li key={i} className="leading-relaxed tracking-wide">{a}</li>
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
              <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-slate-200/60 overflow-hidden bg-slate-50/50">
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
             <Tabs defaultValue="materials" className="w-full">
                <TabsList className="flex w-full overflow-x-auto h-auto p-0 bg-transparent border-b border-slate-200 dark:border-slate-800 mb-8 rounded-none scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                   <TabsTrigger 
                      value="materials" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">🧩</span>
                      <span>소재 위주</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="univ-criteria" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">📋</span>
                      <span>대학 평가 항목 위주</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="comprehensive" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">💡</span>
                      <span>종합 평가</span>
                   </TabsTrigger>
                </TabsList>

                {/* --- 1. 대학 평가 항목 위주 --- */}
                <TabsContent value="univ-criteria" className="space-y-6 mt-0 animate-in fade-in duration-300">
                   <CategoryQuestionList category="academic" questionScores={evaluation.questionScores} />
                </TabsContent>

                {/* --- 2. 소재 위주 --- */}
                <TabsContent value="materials" className="space-y-8 mt-0 animate-in fade-in duration-300">
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-blue-500">🔀</span> 관련 핵심 소재 네트워크</h4>
                     <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-blue-200/60 overflow-hidden bg-slate-50/50">
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
                   
                   <div className="space-y-4 pt-4">
                     <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                           <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-blue-500">📈</span> 학업 역량 발달 서사 (Timeline)</h4>
                           <p className="text-sm text-gray-500 mt-1">이 평가의 학업 역량 관련 소재들만 모아 3년간의 성장 스토리를 직관적인 플로우차트로 시각화합니다.</p>
                        </div>
                        <Button
                           onClick={() => handleGenerateTimeline('academic')}
                           disabled={isGeneratingTimeline['academic']}
                           className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                           variant={timelineData['academic'] ? "outline" : "default"}
                        >
                           {isGeneratingTimeline['academic'] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                           {timelineData['academic'] ? "타임라인 새로고침" : "학업 서사 타임라인 생성하기"}
                        </Button>
                     </div>
                     {timelineError['academic'] && (
                         <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                             {timelineError['academic']}
                         </div>
                     )}
                     {(timelineData['academic'] || isGeneratingTimeline['academic']) && (
                         <CompetencyFlowGraph data={timelineData['academic'] || null} category="academic" isLoading={isGeneratingTimeline['academic']} />
                     )}
                   </div>
                </TabsContent>

                {/* --- 3. 종합 평가 --- */}
                <TabsContent value="comprehensive" className="space-y-6 mt-0 animate-in fade-in duration-300">
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
       
                   <div className="space-y-4 mt-6">
                     <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-blue-500">📝</span> 학업 역량 상세 분석</h4>
                     <div className="grid gap-4 sm:grid-cols-2">
                       {getAnnotationsByCategory('academic').map((ann, i) => (
                         <AnnotationBlock key={`academic-ann-${i}`} annotation={ann} />
                       ))}
                     </div>
                   </div>
                </TabsContent>
             </Tabs>
          </TabsContent>

          {/* ======================= 진로 탭 ======================= */}
          <TabsContent value="career" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Tabs defaultValue="materials" className="w-full">
                <TabsList className="flex w-full overflow-x-auto h-auto p-0 bg-transparent border-b border-slate-200 dark:border-slate-800 mb-8 rounded-none scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                   <TabsTrigger 
                      value="materials" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">🧩</span>
                      <span>소재 위주</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="univ-criteria" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">📋</span>
                      <span>대학 평가 항목 위주</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="comprehensive" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">💡</span>
                      <span>종합 평가</span>
                   </TabsTrigger>
                </TabsList>

                {/* --- 1. 대학 평가 항목 위주 --- */}
                <TabsContent value="univ-criteria" className="space-y-6 mt-0 animate-in fade-in duration-300">
                   <CategoryQuestionList category="career" questionScores={evaluation.questionScores} />
                </TabsContent>

                {/* --- 2. 소재 위주 --- */}
                <TabsContent value="materials" className="space-y-8 mt-0 animate-in fade-in duration-300">
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-emerald-500">🔀</span> 관련 핵심 소재 네트워크</h4>
                     <Card className="p-1 flex flex-col items-center justify-center shadow-sm border-emerald-200/60 overflow-hidden bg-slate-50/50">
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
                   
                   <div className="space-y-4 pt-4">
                     <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                           <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-emerald-500">📈</span> 진로 역량 발달 서사 (Timeline)</h4>
                           <p className="text-sm text-gray-500 mt-1">이 평가의 진로 역량 관련 소재들만 모아 3년간의 성장 스토리를 직관적인 플로우차트로 시각화합니다.</p>
                        </div>
                        <Button
                           onClick={() => handleGenerateTimeline('career')}
                           disabled={isGeneratingTimeline['career']}
                           className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                           variant={timelineData['career'] ? "outline" : "default"}
                        >
                           {isGeneratingTimeline['career'] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                           {timelineData['career'] ? "타임라인 새로고침" : "진로 서사 타임라인 생성하기"}
                        </Button>
                     </div>
                     {timelineError['career'] && (
                         <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                             {timelineError['career']}
                         </div>
                     )}
                     {(timelineData['career'] || isGeneratingTimeline['career']) && (
                         <CompetencyFlowGraph data={timelineData['career'] || null} category="career" isLoading={isGeneratingTimeline['career']} />
                     )}
                   </div>
                </TabsContent>

                {/* --- 3. 종합 평가 --- */}
                <TabsContent value="comprehensive" className="space-y-6 mt-0 animate-in fade-in duration-300">
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
       
                   <div className="space-y-4 mt-6">
                     <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-emerald-500">📝</span> 진로 역량 상세 분석</h4>
                     <div className="grid gap-4 sm:grid-cols-2">
                       {getAnnotationsByCategory('career').map((ann, i) => (
                         <AnnotationBlock key={`career-ann-${i}`} annotation={ann} />
                       ))}
                     </div>
                   </div>
                </TabsContent>
             </Tabs>
          </TabsContent>

          {/* ======================= 공동체 탭 ======================= */}
          <TabsContent value="community" className="space-y-8 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Tabs defaultValue="materials" className="w-full">
                <TabsList className="flex w-full overflow-x-auto h-auto p-0 bg-transparent border-b border-slate-200 dark:border-slate-800 mb-8 rounded-none scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                   <TabsTrigger 
                      value="materials" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">🧩</span>
                      <span>소재 위주</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="univ-criteria" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">📋</span>
                      <span>대학 평가 항목 위주</span>
                   </TabsTrigger>
                   <TabsTrigger 
                      value="comprehensive" 
                      className="relative flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:border-amber-500 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap transition-colors"
                   >
                      <span className="text-lg">💡</span>
                      <span>종합 평가</span>
                   </TabsTrigger>
                </TabsList>

                {/* --- 1. 대학 평가 항목 위주 --- */}
                <TabsContent value="univ-criteria" className="space-y-6 mt-0 animate-in fade-in duration-300">
                   <CategoryQuestionList category="community" questionScores={evaluation.questionScores} />
                </TabsContent>

                {/* --- 2. 소재 위주 --- */}
                <TabsContent value="materials" className="space-y-8 mt-0 animate-in fade-in duration-300">
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
                   
                   <div className="space-y-4 pt-4">
                     <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                           <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-amber-500">📈</span> 공동체 역량 발달 서사 (Timeline)</h4>
                           <p className="text-sm text-gray-500 mt-1">이 평가의 공동체 역량 관련 소재들만 모아 3년간의 성장 스토리를 직관적인 플로우차트로 시각화합니다.</p>
                        </div>
                        <Button
                           onClick={() => handleGenerateTimeline('community')}
                           disabled={isGeneratingTimeline['community']}
                           className="gap-2 shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
                           variant={timelineData['community'] ? "outline" : "default"}
                        >
                           {isGeneratingTimeline['community'] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                           {timelineData['community'] ? "타임라인 새로고침" : "공동체 서사 타임라인 생성하기"}
                        </Button>
                     </div>
                     {timelineError['community'] && (
                         <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                             {timelineError['community']}
                         </div>
                     )}
                     {(timelineData['community'] || isGeneratingTimeline['community']) && (
                         <CompetencyFlowGraph data={timelineData['community'] || null} category="community" isLoading={isGeneratingTimeline['community']} />
                     )}
                   </div>
                </TabsContent>

                {/* --- 3. 종합 평가 --- */}
                <TabsContent value="comprehensive" className="space-y-6 mt-0 animate-in fade-in duration-300">
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
       
                   <div className="space-y-4 mt-6">
                     <h4 className="text-lg font-bold flex items-center gap-2"><span className="text-amber-500">📝</span> 공동체 역량 상세 분석</h4>
                     <div className="grid gap-4 sm:grid-cols-2">
                       {getAnnotationsByCategory('community').map((ann, i) => (
                         <AnnotationBlock key={`community-ann-${i}`} annotation={ann} />
                       ))}
                     </div>
                   </div>
                </TabsContent>
             </Tabs>
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

