import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useGetSchoolRecords, useGetCurrentUser } from "@/stores/server/features/me/queries";
import nestApiClient from "@/stores/server/api-client";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/custom/button";
import { Loader2, BarChart3, TrendingUp, Zap, AlertCircle } from "lucide-react";
import {
    CompetencyCategory,
    EvalMaterialItem,
    SemesterEvalResult,
    ComprehensiveEvalResult,
    GRADE_LEVEL_COLORS,
    GRADE_LEVEL_LABELS,
    EVAL_COMPETENCY_LABELS,
    EVAL_COMPETENCY_COLORS,
    GRADE_LETTER_MAPPING,
} from "@/types/evaluation.type";

export const Route = createLazyFileRoute("/sb/_layout/evaluation")({
    component: EvaluationPage,
});

// ==================== 학기 선택 타입 ====================

type SemesterKey = "1-1" | "1-2" | "2-1" | "2-2" | "3-1";

const SEMESTER_OPTIONS: { key: SemesterKey; label: string; grade: string; semester: string }[] = [
    { key: "1-1", label: "1-1학기", grade: "1", semester: "1" },
    { key: "1-2", label: "1-2학기", grade: "1", semester: "2" },
    { key: "2-1", label: "2-1학기", grade: "2", semester: "1" },
    { key: "2-2", label: "2-2학기", grade: "2", semester: "2" },
    { key: "3-1", label: "3-1학기", grade: "3", semester: "1" },
];

const COMPREHENSIVE_OPTIONS: { key: string; label: string; grade: string }[] = [
    { key: "year-1", label: "1학년 종합", grade: "1" },
    { key: "year-2", label: "2학년 종합", grade: "2" },
    { key: "year-3", label: "3학년 종합", grade: "3" },
];
import { RadarChart } from "@/components/score-visualizations/eval-graphs";
import MaterialGraph from "@/components/graph/MaterialGraph";
// ==================== 메인 페이지 ====================

function EvaluationPage() {
    const { data: user } = useGetCurrentUser();
    const { data: schoolRecords, isLoading: isLoadingRecords } = useGetSchoolRecords();

    const [selectedSemester, setSelectedSemester] = useState<SemesterKey | null>(null);
    const [selectedComprehensive, setSelectedComprehensive] = useState<string | null>(null);

    const [semesterResults, setSemesterResults] = useState<Record<string, SemesterEvalResult>>({});
    const [comprehensiveResults, setComprehensiveResults] = useState<Record<string, ComprehensiveEvalResult>>({});

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── 세특 텍스트 수집 (학기별 필터링) ──
    const getSubjectTextsForSemester = useCallback((grade: string, semester: string) => {
        if (!schoolRecords) return [];
        const texts: Array<{ subjectName: string; text: string }> = [];

        for (const s of [...(schoolRecords.subjects || []), ...(schoolRecords.selectSubjects || [])]) {
            if (s.grade === grade && s.semester === semester && s.detailAndSpecialty?.trim()) {
                texts.push({ subjectName: s.subjectName || "과목없음", text: s.detailAndSpecialty });
            }
        }
        return texts;
    }, [schoolRecords]);

    // ── 종합 데이터 수집 (학년 전체) ──
    const getComprehensiveData = useCallback((grade: string) => {
        if (!schoolRecords) return null;

        const subjectTexts: Array<{ semester: string; subjectName: string; text: string }> = [];
        const creativeTexts: Array<{ activityType: string; text: string }> = [];
        const behaviorTexts: Array<{ text: string }> = [];

        for (const s of [...(schoolRecords.subjects || []), ...(schoolRecords.selectSubjects || [])]) {
            if (s.grade === grade && s.detailAndSpecialty?.trim()) {
                subjectTexts.push({
                    semester: s.semester || "?",
                    subjectName: s.subjectName || "과목없음",
                    text: s.detailAndSpecialty,
                });
            }
        }

        for (const c of (schoolRecords.creativeActivities || [])) {
            if (c.grade === grade && c.content?.trim()) {
                creativeTexts.push({ activityType: c.activityType || "활동", text: c.content });
            }
        }

        for (const b of (schoolRecords.behaviorOpinions || [])) {
            if (b.grade === grade && b.content?.trim()) {
                behaviorTexts.push({ text: b.content });
            }
        }

        return { grade, subjectTexts, creativeTexts, behaviorTexts };
    }, [schoolRecords]);

    // ── 학기별 분석 실행 ──
    const onClickSemesterEval = useCallback(async () => {
        if (!selectedSemester) return;
        const opt = SEMESTER_OPTIONS.find(o => o.key === selectedSemester);
        if (!opt) return;

        const texts = getSubjectTextsForSemester(opt.grade, opt.semester);
        if (texts.length === 0) {
            setError(`${opt.label} 세특 데이터가 없습니다. 생기부를 먼저 등록해주세요.`);
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        try {
            const res = await nestApiClient.post("/schoolrecord/eval/semester", {
                grade: opt.grade,
                semester: opt.semester,
                subjectTexts: texts,
            });
            setSemesterResults(prev => ({ ...prev, [selectedSemester]: res.data.data }));
        } catch (e: any) {
            setError(e?.response?.data?.message || "학기 분석 중 오류가 발생했습니다.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedSemester, getSubjectTextsForSemester]);

    // ── 종합 분석 실행 ──
    const onClickComprehensiveEval = useCallback(async () => {
        if (!selectedComprehensive) return;
        const opt = COMPREHENSIVE_OPTIONS.find(o => o.key === selectedComprehensive);
        if (!opt) return;

        const data = getComprehensiveData(opt.grade);
        if (!data || data.subjectTexts.length === 0) {
            setError(`${opt.label} 데이터가 없습니다.`);
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        try {
            const res = await nestApiClient.post("/schoolrecord/eval/comprehensive", data);
            setComprehensiveResults(prev => ({ ...prev, [selectedComprehensive!]: res.data.data }));
        } catch (e: any) {
            setError(e?.response?.data?.message || "종합 분석 중 오류가 발생했습니다.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedComprehensive, getComprehensiveData]);

    // ── 현재 보여줄 결과 ──
    const currentSemesterResult = selectedSemester ? semesterResults[selectedSemester] : null;
    const currentComprehensiveResult = selectedComprehensive ? comprehensiveResults[selectedComprehensive] : null;

    if (!user) return <RequireLoginMessage />;

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h3 className="text-lg font-medium">📊 학기별 평가</h3>
                <p className="text-sm text-muted-foreground">
                    학기별로 세특을 평가하고, 학년 종합 평가에서 세특+창체+행특을 포함한 전체 분석을 확인하세요.
                </p>
            </div>
            <Separator />

            {isLoadingRecords ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : schoolRecords?.isEmpty ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        생기부를 먼저 등록해주세요. (생기부 입력 페이지에서 업로드)
                    </p>
                </div>
            ) : (
                <>
                    {/* ──── 학기별 세특 분석 ──── */}
                    <section className="space-y-4">
                        <h4 className="flex items-center gap-2 text-base font-semibold">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            학기별 세특 분석 (7등급)
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                            {SEMESTER_OPTIONS.map(opt => (
                                <Button
                                    key={opt.key}
                                    variant={selectedSemester === opt.key ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setSelectedSemester(opt.key);
                                        setSelectedComprehensive(null);
                                    }}
                                    className="relative"
                                >
                                    {opt.label}
                                    {semesterResults[opt.key] && (
                                        <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-green-400" />
                                    )}
                                </Button>
                            ))}
                        </div>

                        {selectedSemester && !currentSemesterResult && (
                            <Button
                                onClick={onClickSemesterEval}
                                disabled={isAnalyzing}
                                className="gap-2"
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                {selectedSemester && SEMESTER_OPTIONS.find(o => o.key === selectedSemester)?.label} 세특 분석하기
                            </Button>
                        )}

                        {currentSemesterResult && (
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-card p-4">
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                                        {currentSemesterResult.grade}학년 {currentSemesterResult.semester}학기 — {currentSemesterResult.summary}
                                    </p>
                                    <MaterialGraph
                                        materials={currentSemesterResult.materials.map(m => ({
                                            ...m,
                                            title: m.title,
                                            category: m.category as CompetencyCategory,
                                            severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                                        })) as any[]}
                                        centerLabel={`${currentSemesterResult.semester}학기 세특`}
                                        initialHeight={380}
                                    />
                                </div>

                                {/* 등급 범례 */}
                                <div className="flex flex-wrap gap-2 px-2">
                                    {[1, 2, 3, 4, 5, 6, 7].map(g => (
                                        <span
                                            key={g}
                                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                                            style={{ backgroundColor: GRADE_LEVEL_COLORS[g] }}
                                        >
                                            {GRADE_LETTER_MAPPING[g]}
                                        </span>
                                    ))}
                                </div>

                                {/* 소재 목록 */}
                                <div className="space-y-2">
                                    {currentSemesterResult.materials.map((mat, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                            <span
                                                className="mt-0.5 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                                                style={{ backgroundColor: GRADE_LEVEL_COLORS[mat.gradeLevel] }}
                                            >
                                                {GRADE_LETTER_MAPPING[mat.gradeLevel]}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{mat.title}</span>
                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                                                        style={{ color: EVAL_COMPETENCY_COLORS[mat.category] }}>
                                                        {EVAL_COMPETENCY_LABELS[mat.category]}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-sm text-muted-foreground">{mat.summary}</p>
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: GRADE_LEVEL_COLORS[mat.gradeLevel] }}>
                                                {mat.score}점
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 분석 다시 하기 */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClickSemesterEval}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                    다시 분석하기
                                </Button>
                            </div>
                        )}
                    </section>

                    <Separator />

                    {/* ──── 학년 종합 평가 ──── */}
                    <section className="space-y-4">
                        <h4 className="flex items-center gap-2 text-base font-semibold">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            학년 종합 평가 (세특 + 창체 + 행특)
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                            {COMPREHENSIVE_OPTIONS.map(opt => (
                                <Button
                                    key={opt.key}
                                    variant={selectedComprehensive === opt.key ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setSelectedComprehensive(opt.key);
                                        setSelectedSemester(null);
                                    }}
                                    className="relative"
                                >
                                    {opt.label}
                                    {comprehensiveResults[opt.key] && (
                                        <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-green-400" />
                                    )}
                                </Button>
                            ))}
                        </div>

                        {selectedComprehensive && !currentComprehensiveResult && (
                            <Button
                                onClick={onClickComprehensiveEval}
                                disabled={isAnalyzing}
                                className="gap-2"
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                                {COMPREHENSIVE_OPTIONS.find(o => o.key === selectedComprehensive)?.label} 분석하기
                            </Button>
                        )}

                        {currentComprehensiveResult && (
                            <div className="space-y-6">
                                {/* 요약 */}
                                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
                                    <p className="text-sm font-medium">
                                        📋 {currentComprehensiveResult.summary}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        종합 점수: <span className="font-bold text-purple-600 dark:text-purple-400">{currentComprehensiveResult.totalScore}점</span>
                                    </p>
                                </div>

                                {/* 그래프 + 레이더 차트 */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border bg-card p-4 overflow-hidden">
                                        <h5 className="mb-2 text-sm font-semibold">소재 그래프</h5>
                                        <div className="w-full">
                                          <MaterialGraph
                                              materials={currentComprehensiveResult.materials.map(m => ({
                                                  ...m,
                                                  title: m.title,
                                                  category: m.category as CompetencyCategory,
                                                  severity: m.gradeLevel <= 3 ? 'high' : m.gradeLevel <= 5 ? 'medium' : 'low'
                                              })) as any[]}
                                              centerLabel="종합 세특"
                                              initialHeight={350}
                                          />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4">
                                        <h5 className="mb-2 text-sm font-semibold">영역별 역량</h5>
                                        <RadarChart scores={currentComprehensiveResult.scores} />
                                    </div>
                                </div>

                                {/* 등급 범례 */}
                                <div className="flex flex-wrap gap-2 px-2">
                                    {[1, 2, 3, 4, 5, 6, 7].map(g => (
                                        <span
                                            key={g}
                                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                                            style={{ backgroundColor: GRADE_LEVEL_COLORS[g] }}
                                        >
                                            {GRADE_LEVEL_LABELS[g]}
                                        </span>
                                    ))}
                                </div>

                                {/* 영역별 주석 */}
                                <div className="space-y-2">
                                    <h5 className="text-sm font-semibold">📝 영역별 평가 주석</h5>
                                    {currentComprehensiveResult.annotations.map((ann, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                            <span
                                                className="mt-0.5 inline-flex h-6 min-w-[60px] items-center justify-center rounded-full px-2 text-[10px] font-bold text-white"
                                                style={{ backgroundColor: EVAL_COMPETENCY_COLORS[ann.category] }}
                                            >
                                                {EVAL_COMPETENCY_LABELS[ann.category]}
                                            </span>
                                            <p className="flex-1 text-sm">{ann.comment}</p>
                                            <span className="font-bold" style={{ color: EVAL_COMPETENCY_COLORS[ann.category] }}>
                                                {currentComprehensiveResult.scores[ann.category]}점
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 소재 목록 */}
                                <div className="space-y-2">
                                    <h5 className="text-sm font-semibold">📦 추출된 소재 ({currentComprehensiveResult.materials.length}개)</h5>
                                    {currentComprehensiveResult.materials.map((mat, i) => (
                                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                            <span
                                                className="mt-0.5 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full text-[10px] font-bold text-white"
                                                style={{ backgroundColor: GRADE_LEVEL_COLORS[mat.gradeLevel] }}
                                            >
                                                {mat.gradeLevel}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{mat.title}</span>
                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                                                        style={{ color: EVAL_COMPETENCY_COLORS[mat.category] }}>
                                                        {EVAL_COMPETENCY_LABELS[mat.category]}
                                                    </span>
                                                    {mat.sources.length > 0 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            ({mat.sources.map(s => s.type === "subject" ? "세특" : s.type === "creative" ? "창체" : "행특").filter((v, i, a) => a.indexOf(v) === i).join("+")})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-sm text-muted-foreground">{mat.summary}</p>
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: GRADE_LEVEL_COLORS[mat.gradeLevel] }}>
                                                {mat.score}점
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 강점 / 약점 */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                                        <h5 className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-300">
                                            💪 강점
                                        </h5>
                                        <ul className="list-disc space-y-1 pl-4 text-sm">
                                            {currentComprehensiveResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                                        <h5 className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-700 dark:text-red-300">
                                            📌 개선점
                                        </h5>
                                        <ul className="list-disc space-y-1 pl-4 text-sm">
                                            {currentComprehensiveResult.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                {/* 다음 학기 조언 */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                                    <h5 className="mb-2 flex items-center gap-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        💡 다음 학기 조언
                                    </h5>
                                    <ol className="list-decimal space-y-1 pl-4 text-sm">
                                        {currentComprehensiveResult.advice.map((a, i) => <li key={i}>{a}</li>)}
                                    </ol>
                                </div>

                                {/* 다시 분석 */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClickComprehensiveEval}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                    다시 분석하기
                                </Button>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* 에러 표시 */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                    {error}
                </div>
            )}
        </div>
    );
}
