import React, { useState } from "react";
import { useRecommendTopics, useGenerateDraft } from "@/stores/server/features/setuk-builder/mutations";
import { RecommendTopicRequestDto, RecommendedTopic, GenerateDraftRequestDto, StorylineContext } from "@/types/setuk-builder.type";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, CheckCircle2, ChevronRight, Play, BookOpen, Star, RefreshCw, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SetukWizardProps {
    /** 서사 컨텍스트 (선택). 평가 결과에서 전달받은 발달 서사 정보 */
    storylineContext?: StorylineContext | null;
    /** 빌드 페이지에서 넘어온 경우 사전 설정할 과목명 */
    prefilledSubject?: string;
}

export function SetukWizard({ storylineContext, prefilledSubject }: SetukWizardProps) {
    const [step, setStep] = useState<number>(1);
    const [data, setData] = useState({
        major: "",
        subject: prefilledSubject || "",
        taskType: "보고서/탐구활동",
        originalTopic: "",
        selectedTopic: null as RecommendedTopic | null,
        activities: "",
        draftText: ""
    });
    const [recommendedTopics, setRecommendedTopics] = useState<RecommendedTopic[]>([]);

    const recommendMutation = useRecommendTopics();
    const draftMutation = useGenerateDraft();

    const hasContext = !!storylineContext && storylineContext.storylines.length > 0;

    const handleNext1 = async () => {
        if (!data.major || !data.subject || !data.originalTopic) {
            toast.error("목표 전공, 과목, 주제를 모두 입력해주세요.");
            return;
        }

        const dto: RecommendTopicRequestDto = {
            major: data.major,
            subject: data.subject,
            taskType: data.taskType,
            originalTopic: data.originalTopic,
        };

        // 서사 컨텍스트가 있으면 함께 전달
        if (storylineContext) {
            if (storylineContext.storylines.length > 0) {
                dto.storylines = storylineContext.storylines;
            }
            if (storylineContext.storylineKeywords.length > 0) {
                dto.storylineKeywords = storylineContext.storylineKeywords;
            }
            if (storylineContext.weaknesses.length > 0) {
                dto.weaknesses = storylineContext.weaknesses;
            }
            if (storylineContext.suggestedActivities.length > 0) {
                dto.suggestedActivities = storylineContext.suggestedActivities;
            }
            if (storylineContext.currentGrade) {
                dto.currentGrade = storylineContext.currentGrade;
            }
        }

        try {
            const result = await recommendMutation.mutateAsync(dto);
            setRecommendedTopics(result);
            setStep(2);
        } catch (error) {
            toast.error("주제 추천 중 오류가 발생했습니다.");
            console.error(error);
        }
    };

    const handleSelectTopic = (topic: RecommendedTopic) => {
        setData({ ...data, selectedTopic: topic });
        setStep(3);
    };

    const handleNext3 = async () => {
        if (!data.activities.trim()) {
            toast.error("구체적인 활동 내용을 적어주세요.");
            return;
        }

        const dto: GenerateDraftRequestDto = {
            selectedTopic: data.selectedTopic!.title,
            studentActivities: data.activities.split('\n').filter(s => s.trim().length > 0),
        };

        // 서사 키워드 전달
        if (storylineContext && storylineContext.storylineKeywords.length > 0) {
            dto.storylineKeywords = storylineContext.storylineKeywords;
        }

        try {
            const result = await draftMutation.mutateAsync(dto);
            setData({ ...data, draftText: result.draft });
            setStep(4);
        } catch (error) {
            toast.error("세특 초안 생성 중 오류가 발생했습니다.");
            console.error(error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.draftText);
        toast.success("클립보드에 복사되었습니다!");
    };

    const resetWizard = () => {
        setStep(1);
        setData({
            major: "",
            subject: prefilledSubject || "",
            taskType: "보고서/탐구활동",
            originalTopic: "",
            selectedTopic: null,
            activities: "",
            draftText: ""
        });
        setRecommendedTopics([]);
    };

    return (
        <div className="mx-auto w-full rounded-2xl border bg-white shadow-sm p-4 sm:p-8">
            {/* 서사 연결 모드 배너 */}
            {hasContext && (
                <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">
                            <Link2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-indigo-800">📖 서사 연결 모드</span>
                        <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600">
                            AI 분석 결과 적용됨
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        기존 AI 평가 결과({storylineContext!.targetSeries || '전체'} 관점)의 발달 서사를 기반으로,
                        학생의 성장 흐름에 맞는 수행평가 주제를 추천합니다.
                    </p>
                    {storylineContext!.weaknesses.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-medium text-gray-500">보완 영역:</span>
                            {storylineContext!.weaknesses.slice(0, 3).map((w, i) => (
                                <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                    {w}
                                </span>
                            ))}
                        </div>
                    )}
                    {storylineContext!.storylineKeywords.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-medium text-gray-500">성장 키워드:</span>
                            {storylineContext!.storylineKeywords.slice(0, 5).map((kw, i) => (
                                <span key={i} className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step Indicators */}
            <div className="mb-10 flex items-center justify-between border-b pb-8">
                {[
                    { num: 1, label: "과제 입력" },
                    { num: 2, label: "주제 추천" },
                    { num: 3, label: "활동 내역" },
                    { num: 4, label: "초안 완성" },
                ].map((s, idx) => (
                    <div key={s.num} className="flex flex-col items-center gap-2 sm:flex-row flex-1 justify-center relative">
                        {idx !== 0 && (
                            <div className={`absolute top-4 left-[-20%] sm:left-[-10%] sm:top-auto sm:right-[auto] w-full sm:w-[30%] h-[2px] ${step >= s.num ? "bg-olive-500" : "bg-gray-200"}`} style={{ zIndex: 0 }} />
                        )}
                        <div
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold z-10 transition-colors",
                                step === s.num
                                    ? "bg-olive-600 text-white ring-4 ring-olive-100"
                                    : step > s.num
                                        ? "bg-olive-500 text-white"
                                        : "bg-gray-100 text-gray-400"
                            )}
                        >
                            {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-semibold sm:text-sm whitespace-nowrap z-10",
                                step >= s.num ? "text-olive-700" : "text-gray-400"
                            )}
                        >
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: Input */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900">학교 수행평가 정보를 알려주세요</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            {hasContext
                                ? "AI 분석 결과의 발달 서사를 기반으로 맞춤형 주제를 추천해 드립니다."
                                : "입력하신 정보와 목표 전공을 엮어 맞춤형 주제를 추천해 드립니다."
                            }
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">🎯 목표 전공 (학과)</label>
                            <Input
                                placeholder="예: 컴퓨터공학과, 경영학과, 의예과"
                                value={data.major}
                                onChange={(e) => setData({ ...data, major: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">📚 대상 과목</label>
                            <Input
                                placeholder="예: 통합과학, 동아시아사, 국어"
                                value={data.subject}
                                onChange={(e) => setData({ ...data, subject: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">📝 과제 유형</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.taskType}
                            onChange={(e) => setData({ ...data, taskType: e.target.value })}
                        >
                            <option value="보고서/탐구활동">보고서 작성 및 탐구</option>
                            <option value="발표/PPT">주제 발표 (PPT)</option>
                            <option value="토론/에세이">토론 논제 / 에세이</option>
                            <option value="자유주제">자유 양식</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">💡 원래 수행평가 주제</label>
                        <Input
                            placeholder="단원명 또는 학교에서 제시한 기본 주제 (예: 환경오염의 실태와 해결방안)"
                            value={data.originalTopic}
                            onChange={(e) => setData({ ...data, originalTopic: e.target.value })}
                        />
                    </div>

                    <div className="pt-6">
                        <Button
                            className={cn(
                                "w-full h-12 text-lg font-bold",
                                hasContext
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                    : "bg-gray-900 hover:bg-gray-800"
                            )}
                            onClick={handleNext1}
                            disabled={recommendMutation.isPending}
                        >
                            {recommendMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {hasContext ? "서사 기반 심화 주제 분석 중..." : "AI가 융합 주제를 고민하는 중..."}
                                </>
                            ) : (
                                <>
                                    {hasContext ? (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            서사 기반 전공 연계 주제 추천받기
                                        </>
                                    ) : (
                                        <>
                                            AI 전공 연계 주제 추천받기
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Recommendations */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900">
                            <span className="text-olive-600">{data.subject}</span> X <span className="text-indigo-600">{data.major}</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            {hasContext
                                ? "발달 서사의 연장선에 놓인 전공 연계 심화 주제입니다. 마음에 드는 것을 선택하세요."
                                : "두 분야를 교차시킨 전공 연계 심화 주제입니다. 마음에 드는 것을 선택하세요."
                            }
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {recommendedTopics.map((topic, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelectTopic(topic)}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 cursor-pointer transition-all hover:border-olive-500 hover:shadow-md hover:-translate-y-1"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-olive-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start justify-between">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">{topic.title}</h4>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-olive-500 mt-1" />
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    <div className="inline-flex rounded-md bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                        ✨ 기대효과: {topic.expectedEffect}
                                    </div>
                                    {topic.storylineConnection && (
                                        <div className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                                            <Link2 className="h-3 w-3" />
                                            서사 연결: {topic.storylineConnection}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-center pt-4">
                        <Button variant="ghost" className="text-gray-500 hover:text-gray-900" onClick={() => setStep(1)} disabled={draftMutation.isPending}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            조건 다시 설정하기
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Activities */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 mb-6">
                        <div className="text-xs font-bold text-olive-600 mb-1">선택한 탐구 주제</div>
                        <h3 className="text-lg font-bold text-gray-900">{data.selectedTopic?.title}</h3>
                        {data.selectedTopic?.storylineConnection && (
                            <p className="mt-2 text-xs text-purple-600 flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {data.selectedTopic.storylineConnection}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                구체적인 활동 내용을 적어주세요
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                논문 제목, 참고 문헌, 알게된 점, 느낀 점, 극복한 점 등 무엇을 어떻게 공부했는지 자유롭게 적어주세요.
                                (각 줄바꿈은 별도의 활동/문장으로 취급됩니다)
                            </p>
                        </div>
                        <Textarea
                            className="min-h-[200px] bg-white resize-y p-4 text-sm leading-relaxed"
                            placeholder={"- OOO 논문을 참고하여 ~~ 구조를 파악함\n- 기존 방식의 한계를 발견하고, ~~적인 대안을 모색함\n- 파이썬으로 ~~ 시뮬레이션을 구현해 데이터를 산출함"}
                            value={data.activities}
                            onChange={(e) => setData({ ...data, activities: e.target.value })}
                        />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <Button variant="outline" className="h-12 w-1/3" onClick={() => setStep(2)}>
                            이전으로
                        </Button>
                        <Button
                            className="h-12 w-2/3 bg-olive-600 hover:bg-olive-700 text-base font-bold"
                            onClick={handleNext3}
                            disabled={draftMutation.isPending}
                        >
                            {draftMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    세특 초안 작성 중...
                                </>
                            ) : (
                                <>
                                    세특 문장 생성하기
                                    <Play className="ml-2 w-4 h-4 fill-white" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Finished Draft */}
            {step === 4 && (
                <div className="animate-in fade-in zoom-in duration-500 space-y-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                            <Star className="w-6 h-6 fill-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">학술적 세특 초안 완성! 🎉</h3>
                        <p className="text-gray-500 text-sm">
                            아래 내용을 복사하여 수행평가 보고서 말미에 첨부하거나<br />선생님께 제출할 기초 자료로 활용하세요.
                        </p>
                    </div>

                    <div className="relative rounded-2xl bg-indigo-50 border border-indigo-100 p-6 shadow-sm">
                        <div className="absolute top-0 right-0 -mt-3 -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow border border-indigo-100">
                            <BookOpen className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="text-sm font-bold text-indigo-800 mb-3 border-b border-indigo-200 pb-2 inline-block">
                            [{data.subject}] 교과 교사 기재용 권장 문구
                        </div>
                        <p className="text-[15px] leading-loose text-gray-800 whitespace-pre-wrap font-medium">
                            {data.draftText}
                        </p>
                    </div>

                    {hasContext && (
                        <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-center">
                            <p className="text-xs text-purple-700">
                                <Link2 className="inline h-3 w-3 mr-1" />
                                이 세특 초안은 <span className="font-bold">발달 서사({storylineContext!.targetSeries || '전체'})</span>와 연결된
                                키워드가 반영되어, 생기부 전체의 서사 일관성을 높여줍니다.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button variant="outline" className="h-14 flex-1 text-base font-bold bg-white" onClick={copyToClipboard}>
                            📝 텍스트 복사하기
                        </Button>
                        <Button className="h-14 flex-1 text-base font-bold bg-gray-900 hover:bg-gray-800" onClick={resetWizard}>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            새로운 과제 분석하기
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
