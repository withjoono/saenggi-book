import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { useGetSchoolRecords, useGetCurrentUser } from "@/stores/server/features/me/queries";
import nestApiClient from "@/stores/server/api-client";
import MaterialGraph from "@/components/graph/MaterialGraph";
import {
    MaterialItem,
    SchoolRecordAnalysis,
    AnalyzeRequestDto,
    CompetencyCategory,
    COMPETENCY_LABELS,
    COMPETENCY_COLORS,
    SOURCE_TYPE_LABELS,
} from "@/types/analysis.type";

export const Route = createLazyFileRoute("/ms/_layout/material-analysis")({
    component: MaterialAnalysisPage,
});

function MaterialAnalysisPage() {
    const { data: user } = useGetCurrentUser();
    const { data: schoolRecords, isLoading: isLoadingRecords } = useGetSchoolRecords();

    const [analysis, setAnalysis] = useState<SchoolRecordAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMaterialIndex, setSelectedMaterialIndex] = useState<number | null>(null);

    // 생기부 텍스트 데이터 수집 (프론트엔드에서 수집 → 백엔드 AI로 전송)
    const analyzeRequestData = useMemo((): AnalyzeRequestDto | null => {
        if (!schoolRecords) return null;

        const subjectTexts: AnalyzeRequestDto["subjectTexts"] = [];
        const creativeTexts: AnalyzeRequestDto["creativeTexts"] = [];
        const behaviorTexts: AnalyzeRequestDto["behaviorTexts"] = [];

        // 세특 데이터 (subjects + selectSubjects에서 detailAndSpecialty 추출)
        for (const s of schoolRecords.subjects || []) {
            if (s.detailAndSpecialty?.trim()) {
                subjectTexts.push({
                    grade: s.grade || "?",
                    semester: s.semester || "?",
                    subjectName: s.subjectName || "과목없음",
                    text: s.detailAndSpecialty,
                });
            }
        }

        for (const s of schoolRecords.selectSubjects || []) {
            if (s.detailAndSpecialty?.trim()) {
                subjectTexts.push({
                    grade: s.grade || "?",
                    semester: s.semester || "?",
                    subjectName: s.subjectName || "과목없음",
                    text: s.detailAndSpecialty,
                });
            }
        }

        // 창체 데이터
        for (const c of schoolRecords.creativeActivities || []) {
            if (c.content?.trim()) {
                creativeTexts.push({
                    grade: c.grade || "?",
                    activityType: c.activityType || "활동없음",
                    text: c.content,
                });
            }
        }

        // 행특 데이터
        for (const b of schoolRecords.behaviorOpinions || []) {
            if (b.content?.trim()) {
                behaviorTexts.push({
                    grade: b.grade || "?",
                    text: b.content,
                });
            }
        }

        if (subjectTexts.length === 0 && creativeTexts.length === 0 && behaviorTexts.length === 0) {
            return null;
        }

        return { subjectTexts, creativeTexts, behaviorTexts };
    }, [schoolRecords]);

    // AI 분석 실행
    const handleAnalyze = useCallback(async () => {
        if (!analyzeRequestData) return;

        setIsAnalyzing(true);
        setError(null);
        setSelectedMaterialIndex(null);

        try {
            const res = await nestApiClient.post("/schoolrecord/analyze", analyzeRequestData);
            const result = res.data?.data as SchoolRecordAnalysis;
            setAnalysis(result);
        } catch (err: any) {
            console.error("AI 분석 실패:", err);
            setError(err?.response?.data?.message || err?.message || "AI 분석에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [analyzeRequestData]);

    // 선택된 소재 정보
    const selectedMaterial: MaterialItem | null =
        analysis && selectedMaterialIndex !== null ? analysis.materials[selectedMaterialIndex] : null;

    // 역량별 소재 개수
    const categoryStats = useMemo(() => {
        if (!analysis) return null;
        const stats: Record<CompetencyCategory, number> = { academic: 0, career: 0, community: 0, other: 0 };
        for (const m of analysis.materials) {
            stats[m.category]++;
        }
        return stats;
    }, [analysis]);

    if (!user) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <p className="text-gray-500">로그인이 필요합니다.</p>
            </div>
        );
    }

    if (isLoadingRecords) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-olive-500 border-t-transparent" />
                    <p className="text-gray-500">생기부 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">📊 생기부 소재 분석</h2>
                <p className="mt-1 text-sm text-gray-500">
                    AI가 생기부(세특, 창체, 행특)를 분석하여 4대 역량별 핵심 소재를 추출합니다.
                </p>
            </div>

            {/* 분석 시작 버튼 영역 */}
            {!analyzeRequestData ? (
                <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
                    <div className="text-5xl">📝</div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">분석 가능한 생기부 텍스트가 없습니다</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            생기부를 입력하고 세특, 창체, 행특 내용이 등록되면 AI 소재 분석이 가능합니다.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* 분석 정보 + 시작 버튼 */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                📚 세특 {analyzeRequestData.subjectTexts.length}개
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                                🎨 창체 {analyzeRequestData.creativeTexts.length}개
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                                💬 행특 {analyzeRequestData.behaviorTexts.length}개
                            </span>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    AI 분석 중...
                                </>
                            ) : (
                                <>
                                    ✨ {analysis ? "재분석" : "AI 분석 시작"}
                                </>
                            )}
                        </button>
                    </div>

                    {/* 에러 표시 */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* 분석 결과 */}
                    {analysis && (
                        <>
                            {/* AI 한줄 요약 */}
                            <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                                <p className="text-sm font-medium text-indigo-800">
                                    🤖 AI 요약: <span className="font-normal">{analysis.summary}</span>
                                </p>
                            </div>

                            {/* 역량별 통계 */}
                            {categoryStats && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {(Object.entries(categoryStats) as [CompetencyCategory, number][]).map(
                                        ([cat, count]) => (
                                            <div
                                                key={cat}
                                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: COMPETENCY_COLORS[cat] }}
                                                    />
                                                    <span className="text-xs font-medium text-gray-500">
                                                        {COMPETENCY_LABELS[cat]}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                                    {count}
                                                    <span className="ml-1 text-sm font-normal text-gray-400">개</span>
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            {/* 그래프뷰 */}
                            <MaterialGraph
                                materials={analysis.materials}
                                centerLabel="생기부"
                                initialHeight={500}
                                onMaterialClick={(idx) => setSelectedMaterialIndex(idx)}
                            />

                            {/* 선택된 소재 상세 */}
                            {selectedMaterial && (
                                <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
                                    {/* 소재 헤더 */}
                                    <div
                                        className="px-6 py-4"
                                        style={{ backgroundColor: `${COMPETENCY_COLORS[selectedMaterial.category]}15` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-4 w-4 rounded-full"
                                                    style={{ backgroundColor: COMPETENCY_COLORS[selectedMaterial.category] }}
                                                />
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {selectedMaterial.title}
                                                </h3>
                                                <span
                                                    className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                                    style={{ backgroundColor: COMPETENCY_COLORS[selectedMaterial.category] }}
                                                >
                                                    {COMPETENCY_LABELS[selectedMaterial.category]}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedMaterialIndex(null)}
                                                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">{selectedMaterial.summary}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                어필 강도:{" "}
                                                <span
                                                    className={`font-bold ${selectedMaterial.severity === "high"
                                                            ? "text-red-600"
                                                            : selectedMaterial.severity === "medium"
                                                                ? "text-orange-600"
                                                                : "text-yellow-600"
                                                        }`}
                                                >
                                                    {selectedMaterial.severity === "high"
                                                        ? "🔥 강함"
                                                        : selectedMaterial.severity === "medium"
                                                            ? "⚡ 보통"
                                                            : "💡 약함"}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* 원문 목록 */}
                                    <div className="divide-y divide-gray-100 px-6 py-2">
                                        <h4 className="py-3 text-sm font-bold text-gray-700">
                                            📄 관련 생기부 원문 ({selectedMaterial.sources.length}건)
                                        </h4>
                                        {selectedMaterial.sources.map((source, idx) => (
                                            <div key={idx} className="py-4">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                        {SOURCE_TYPE_LABELS[source.type] || source.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {source.grade}학년
                                                        {source.semester ? ` ${source.semester}학기` : ""}
                                                        {source.subjectName ? ` / ${source.subjectName}` : ""}
                                                        {source.activityType ? ` / ${source.activityType}` : ""}
                                                    </span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                                    {source.originalText}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 전체 소재 목록 */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900">전체 소재 목록</h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {analysis.materials.map((mat, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedMaterialIndex(idx)}
                                            className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${selectedMaterialIndex === idx
                                                    ? "border-indigo-300 ring-2 ring-indigo-100"
                                                    : "border-gray-200"
                                                }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: COMPETENCY_COLORS[mat.category] }}
                                                />
                                                <span className="text-xs font-medium text-gray-500">
                                                    {COMPETENCY_LABELS[mat.category]}
                                                </span>
                                                <span
                                                    className={`ml-auto text-xs font-bold ${mat.severity === "high"
                                                            ? "text-red-500"
                                                            : mat.severity === "medium"
                                                                ? "text-orange-500"
                                                                : "text-yellow-500"
                                                        }`}
                                                >
                                                    {mat.severity === "high" ? "🔥" : mat.severity === "medium" ? "⚡" : "💡"}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900">{mat.title}</h4>
                                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{mat.summary}</p>
                                            <p className="mt-2 text-xs text-gray-400">근거 {mat.sources.length}건</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
