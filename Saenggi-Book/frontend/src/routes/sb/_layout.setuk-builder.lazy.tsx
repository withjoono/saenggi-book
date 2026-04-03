import { createLazyFileRoute } from "@tanstack/react-router";
import { SetukWizard } from "@/components/setuk-builder/setuk-wizard";
import { useGetAiEvaluationHistory } from "@/stores/server/features/ai-evaluation/queries";
import { IAiEvaluation } from "@/stores/server/features/ai-evaluation/interfaces";
import { useState, useMemo } from "react";
import { StorylineContext } from "@/types/setuk-builder.type";
import { cn } from "@/lib/utils";
import { Link2, ChevronDown, ChevronUp, FileCheck, X } from "lucide-react";

export const Route = createLazyFileRoute("/sb/_layout/setuk-builder")({
    component: SetukBuilderPage,
});

/** 평가 결과에서 서사 컨텍스트를 추출하는 헬퍼 */
function buildStorylineContext(evaluation: IAiEvaluation): StorylineContext {
    const storylines: StorylineContext["storylines"] = [];
    const storylineKeywords: string[] = [];

    // annotations에서 카테고리별 comment를 서사 요약으로 활용
    if (evaluation.annotations) {
        for (const ann of evaluation.annotations) {
            if (ann.category === 'academic' || ann.category === 'career' || ann.category === 'community') {
                if (ann.comment) {
                    storylines.push({
                        category: ann.category,
                        summary: ann.comment,
                    });
                }
            }
        }
    }

    // materials에서 relatedKeywords 수집
    if (evaluation.materials) {
        for (const mat of evaluation.materials) {
            if (mat.relatedKeywords) {
                for (const kw of mat.relatedKeywords) {
                    if (!storylineKeywords.includes(kw)) {
                        storylineKeywords.push(kw);
                    }
                }
            }
        }
    }

    // advice에서 추천 활동 추출 (조언을 활동 추천으로 활용)
    const suggestedActivities: string[] = [];
    if (evaluation.advice) {
        suggestedActivities.push(...evaluation.advice.slice(0, 5));
    }

    return {
        evaluationId: evaluation.id,
        evaluationSummary: evaluation.summary || '',
        targetSeries: evaluation.targetSeries || undefined,
        storylines,
        storylineKeywords: storylineKeywords.slice(0, 10),
        weaknesses: evaluation.weaknesses || [],
        advice: evaluation.advice || [],
        suggestedActivities,
        currentGrade: evaluation.grade || undefined,
    };
}

const COMPETENCY_LABELS: Record<string, string> = {
    academic: '학업',
    career: '진로',
    community: '공동체',
    other: '기타',
};

function SetukBuilderPage() {
    const { data: evaluations, isLoading: isLoadingEvals } = useGetAiEvaluationHistory();
    const [selectedEvalId, setSelectedEvalId] = useState<number | null>(null);
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // 종합 평가 결과만 필터 (학기별 평가는 서사 정보가 부족)
    const comprehensiveEvals = useMemo(() => {
        if (!evaluations) return [];
        return evaluations.filter(e => e.evalType === 'comprehensive');
    }, [evaluations]);

    // 선택된 평가 결과에서 서사 컨텍스트 빌드
    const storylineContext = useMemo<StorylineContext | null>(() => {
        if (!selectedEvalId || !comprehensiveEvals.length) return null;
        const evaluation = comprehensiveEvals.find(e => e.id === selectedEvalId);
        if (!evaluation) return null;
        return buildStorylineContext(evaluation);
    }, [selectedEvalId, comprehensiveEvals]);

    return (
        <div className="mx-auto w-full max-w-4xl space-y-8 pb-16">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">✨ 세특 마법사 (Setek Builder)</h2>
                <p className="text-gray-500">
                    학교 수행평가 과제를 목표 전공(학과)과 엮어 매력적인 세특으로 탈바꿈시켜 보세요.
                </p>
            </div>

            {/* 평가 결과 선택 영역 */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full",
                            selectedEvalId ? "bg-indigo-500" : "bg-gray-200"
                        )}>
                            <Link2 className={cn("h-4 w-4", selectedEvalId ? "text-white" : "text-gray-500")} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-800">
                                {selectedEvalId
                                    ? "📖 서사 연결 활성"
                                    : "📎 발달 서사 연결하기 (선택사항)"
                                }
                            </p>
                            <p className="text-xs text-gray-500">
                                {selectedEvalId
                                    ? "AI 분석 결과의 발달 서사를 기반으로 주제를 추천합니다."
                                    : "기존 AI 평가 결과를 선택하면 서사 흐름에 맞는 주제를 추천받을 수 있습니다."
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedEvalId && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvalId(null);
                                }}
                                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                title="서사 연결 해제"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        {isSelectOpen
                            ? <ChevronUp className="h-5 w-5 text-gray-400" />
                            : <ChevronDown className="h-5 w-5 text-gray-400" />
                        }
                    </div>
                </button>

                {isSelectOpen && (
                    <div className="border-t border-gray-100 px-6 py-4">
                        {isLoadingEvals ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                                <span className="ml-2 text-sm text-gray-500">평가 내역 로딩 중...</span>
                            </div>
                        ) : comprehensiveEvals.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-sm text-gray-500">아직 종합 평가 결과가 없습니다.</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    "분석 신청" 메뉴에서 AI 사정관 평가를 먼저 받아보세요.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="mb-3 text-xs font-medium text-gray-500">
                                    아래 평가 결과 중 하나를 선택하면, 해당 분석의 발달 서사를 기반으로 주제를 추천합니다.
                                </p>
                                {comprehensiveEvals.map((ev) => {
                                    const isSelected = selectedEvalId === ev.id;
                                    const date = new Date(ev.createdAt);
                                    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

                                    return (
                                        <button
                                            key={ev.id}
                                            onClick={() => {
                                                setSelectedEvalId(isSelected ? null : ev.id);
                                                setIsSelectOpen(false);
                                            }}
                                            className={cn(
                                                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                                                isSelected
                                                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                                    : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                                                isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                                            )}>
                                                {isSelected && (
                                                    <div className="h-2 w-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <FileCheck className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {ev.grade}학년 종합 평가
                                                    </span>
                                                    {ev.targetSeries && (
                                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                                                            {ev.targetSeries}
                                                        </span>
                                                    )}
                                                    <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">{dateStr}</span>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                    {ev.summary || '요약 없음'}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {(['academic', 'career', 'community', 'other'] as const).map((cat) => {
                                                        const score = cat === 'academic' ? ev.scoreAcademic
                                                            : cat === 'career' ? ev.scoreCareer
                                                            : cat === 'community' ? ev.scoreCommunity
                                                            : ev.scoreOther;
                                                        return (
                                                            <span key={cat} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                                                {COMPETENCY_LABELS[cat]} {score}점
                                                            </span>
                                                        );
                                                    })}
                                                    {ev.totalScore != null && (
                                                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                                            총점 {ev.totalScore}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <SetukWizard storylineContext={storylineContext} />
        </div>
    );
}
