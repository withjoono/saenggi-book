import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useGetSchoolRecords, useGetCurrentUser } from "@/stores/server/features/me/queries";
import nestApiClient from "@/stores/server/api-client";
import {
    MaterialItem,
    SchoolRecordAnalysis,
    AnalyzeRequestDto,
    CompetencyCategory,
    COMPETENCY_LABELS,
    COMPETENCY_COLORS,
} from "@/types/analysis.type";
import {
    BuildAnalysisResult,
    BuildAnalyzeRequestDto,
    GapScore,
    ActivityRecommendation,
    RoadmapItem,
    ACTIVITY_TYPE_LABELS,
    PRIORITY_LABELS,
} from "@/types/build.type";

export const Route = createLazyFileRoute("/ms/_layout/build")({
    component: BuildPage,
});

// ==================== Radar Chart Component ====================

function RadarChart({ gapAnalysis }: { gapAnalysis: GapScore[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gapAnalysis.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const size = 340;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const maxR = 130;
        const cats = gapAnalysis;
        const n = cats.length;
        const angleStep = (2 * Math.PI) / n;
        const startAngle = -Math.PI / 2;

        ctx.clearRect(0, 0, size, size);

        // Draw grid circles
        for (let level = 1; level <= 5; level++) {
            const r = (maxR * level) / 5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = level === 5 ? "#d1d5db" : "#e5e7eb";
            ctx.lineWidth = level === 5 ? 1.5 : 0.8;
            ctx.stroke();
        }

        // Draw axis lines and labels
        for (let i = 0; i < n; i++) {
            const angle = startAngle + i * angleStep;
            const ex = cx + maxR * Math.cos(angle);
            const ey = cy + maxR * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = "#d1d5db";
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Label
            const labelR = maxR + 24;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);
            ctx.font = "bold 12px 'Pretendard', sans-serif";
            ctx.fillStyle = "#374151";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(cats[i].label, lx, ly);
        }

        // Draw target polygon
        const getPoint = (value: number, idx: number) => {
            const angle = startAngle + idx * angleStep;
            const r = (maxR * value) / 100;
            return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
        };

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const p = getPoint(cats[i].target, i);
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(249, 115, 22, 0.08)";
        ctx.fill();
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw current polygon
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const p = getPoint(cats[i].current, i);
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw data points
        for (let i = 0; i < n; i++) {
            // Current point
            const cp = getPoint(cats[i].current, i);
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#6366f1";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Target point
            const tp = getPoint(cats[i].target, i);
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#f97316";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }, [gapAnalysis]);

    return (
        <div className="flex flex-col items-center gap-4">
            <canvas ref={canvasRef} className="max-w-full" />
            <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-indigo-500" />
                    <span className="text-gray-600">현재 수준</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full border-2 border-orange-400 bg-orange-100" />
                    <span className="text-gray-600">목표 수준</span>
                </div>
            </div>
        </div>
    );
}

// ==================== Score Circle Component ====================

function ScoreCircle({ score }: { score: number }) {
    const radius = 48;
    const stroke = 6;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color =
        score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={120} height={120} className="-rotate-90">
                <circle
                    cx={60}
                    cy={60}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                />
                <circle
                    cx={60}
                    cy={60}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold" style={{ color }}>
                    {score}
                </span>
                <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
        </div>
    );
}

// ==================== Main Build Page ====================

function BuildPage() {
    const { data: user } = useGetCurrentUser();
    const { data: schoolRecords, isLoading: isLoadingRecords } = useGetSchoolRecords();

    // Form state
    const [targetUniversity, setTargetUniversity] = useState("");
    const [targetMajor, setTargetMajor] = useState("");
    const [currentGrade, setCurrentGrade] = useState("2");
    const [currentSemester, setCurrentSemester] = useState("1");
    const [admissionType, setAdmissionType] = useState("학종");

    // Analysis state
    const [result, setResult] = useState<BuildAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'gap' | 'recommendations' | 'roadmap'>('gap');

    // 먼저 소재 분석 실행하여 materials 획득
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [isMaterialAnalyzing, setIsMaterialAnalyzing] = useState(false);

    // 생기부 텍스트 데이터 수집
    const analyzeRequestData = useMemo((): AnalyzeRequestDto | null => {
        if (!schoolRecords) return null;

        const subjectTexts: AnalyzeRequestDto["subjectTexts"] = [];
        const creativeTexts: AnalyzeRequestDto["creativeTexts"] = [];
        const behaviorTexts: AnalyzeRequestDto["behaviorTexts"] = [];

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

        for (const c of schoolRecords.creativeActivities || []) {
            if (c.content?.trim()) {
                creativeTexts.push({
                    grade: c.grade || "?",
                    activityType: c.activityType || "활동없음",
                    text: c.content,
                });
            }
        }

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

    // 소재 분석 후 빌드 분석 실행
    const handleAnalyze = useCallback(async () => {
        if (!targetUniversity.trim() || !targetMajor.trim()) {
            setError("목표 대학과 전공을 입력해주세요.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            // Step 1: 소재가 없으면 먼저 소재 분석
            let currentMaterials = materials;
            if (currentMaterials.length === 0 && analyzeRequestData) {
                setIsMaterialAnalyzing(true);
                try {
                    const matRes = await nestApiClient.post("/schoolrecord/analyze", analyzeRequestData);
                    const analysis = matRes.data?.data as { materials: MaterialItem[] };
                    currentMaterials = analysis.materials || [];
                    setMaterials(currentMaterials);
                } catch (matErr) {
                    console.warn("소재 분석 실패, 빈 소재로 빌드 분석 진행:", matErr);
                } finally {
                    setIsMaterialAnalyzing(false);
                }
            }

            // Step 2: 빌드 분석 실행
            const dto: BuildAnalyzeRequestDto = {
                targetUniversity: targetUniversity.trim(),
                targetMajor: targetMajor.trim(),
                currentGrade,
                currentSemester,
                admissionType,
                materials: currentMaterials,
            };

            const res = await nestApiClient.post("/schoolrecord/build-analyze", dto);
            const buildResult = res.data?.data as BuildAnalysisResult;
            setResult(buildResult);
            setActiveTab('gap');
        } catch (err: any) {
            console.error("빌드 분석 실패:", err);
            setError(err?.response?.data?.message || err?.message || "빌드 분석에 실패했습니다.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [targetUniversity, targetMajor, currentGrade, currentSemester, admissionType, materials, analyzeRequestData]);

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
                <h2 className="text-2xl font-bold text-gray-900">🏗️ 생기부 빌드</h2>
                <p className="mt-1 text-sm text-gray-500">
                    목표 대학/전공을 설정하면 AI가 현재 생기부를 분석하여 Gap 진단, 활동 추천, 학기별 로드맵을 제공합니다.
                </p>
            </div>

            {/* 목표 설정 폼 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-base font-bold text-gray-800">🎯 목표 설정</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">목표 대학</label>
                        <input
                            type="text"
                            value={targetUniversity}
                            onChange={(e) => setTargetUniversity(e.target.value)}
                            placeholder="예: 서울대, 연세대, 고려대..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">목표 전공</label>
                        <input
                            type="text"
                            value={targetMajor}
                            onChange={(e) => setTargetMajor(e.target.value)}
                            placeholder="예: 컴퓨터공학과, 경영학과..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">지원 전형</label>
                        <select
                            value={admissionType}
                            onChange={(e) => setAdmissionType(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="학종">학생부종합전형 (학종)</option>
                            <option value="교과">학생부교과전형 (교과)</option>
                            <option value="논술">논술전형</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">현재 학년</label>
                        <select
                            value={currentGrade}
                            onChange={(e) => setCurrentGrade(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="1">1학년</option>
                            <option value="2">2학년</option>
                            <option value="3">3학년</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">현재 학기</label>
                        <select
                            value={currentSemester}
                            onChange={(e) => setCurrentSemester(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="1">1학기</option>
                            <option value="2">2학기</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !targetUniversity.trim() || !targetMajor.trim()}
                            className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {isMaterialAnalyzing ? "소재 분석 중..." : "빌드 분석 중..."}
                                </span>
                            ) : (
                                <span>🏗️ {result ? "재분석" : "빌드 분석 시작"}</span>
                            )}
                        </button>
                    </div>
                </div>

                {!analyzeRequestData && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                        💡 생기부 데이터가 아직 입력되지 않았습니다. 생기부를 먼저 입력하면 더 정확한 빌드 분석이 가능합니다.
                        데이터 없이도 목표 대학 기반 일반 추천은 받을 수 있습니다.
                    </div>
                )}
            </div>

            {/* 에러 표시 */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    ⚠️ {error}
                </div>
            )}

            {/* 분석 결과 */}
            {result && (
                <div className="space-y-6">
                    {/* AI 요약 + 종합 점수 */}
                    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-sm">
                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                            <ScoreCircle score={result.overallScore} />
                            <div className="flex-1 text-center sm:text-left">
                                <p className="text-sm font-bold text-indigo-800">
                                    🎯 {targetUniversity} {targetMajor} 준비도
                                </p>
                                <p className="mt-1 text-sm text-gray-600">{result.summary}</p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {result.strengths.map((s, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            ✅ {s}
                                        </span>
                                    ))}
                                    {result.weaknesses.map((w, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                            ⚠️ {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 탭 네비게이션 */}
                    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                        {[
                            { key: 'gap' as const, label: '📊 Gap 분석', count: result.gapAnalysis.length },
                            { key: 'recommendations' as const, label: '💡 활동 추천', count: result.recommendations.length },
                            { key: 'roadmap' as const, label: '📅 로드맵', count: result.roadmap.length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab.key
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Gap 분석 탭 */}
                    {activeTab === 'gap' && (
                        <div className="space-y-6">
                            {/* 레이더 차트 */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-center text-base font-bold text-gray-800">역량별 현재 vs 목표</h3>
                                <RadarChart gapAnalysis={result.gapAnalysis} />
                            </div>

                            {/* Gap 상세 카드 */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                {result.gapAnalysis.map((gap) => (
                                    <div key={gap.category} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                        <div className="mb-3 flex items-center gap-2">
                                            <div
                                                className="h-3.5 w-3.5 rounded-full"
                                                style={{ backgroundColor: COMPETENCY_COLORS[gap.category] }}
                                            />
                                            <span className="text-sm font-bold text-gray-800">{gap.label}</span>
                                            {gap.gap > 20 && (
                                                <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                                    GAP △{gap.gap}
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress bars */}
                                        <div className="space-y-2">
                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="text-indigo-600 font-medium">현재</span>
                                                    <span className="text-gray-500">{gap.current}점</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-100">
                                                    <div
                                                        className="h-2 rounded-full bg-indigo-500 transition-all duration-700"
                                                        style={{ width: `${gap.current}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className="text-orange-600 font-medium">목표</span>
                                                    <span className="text-gray-500">{gap.target}점</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-100">
                                                    <div
                                                        className="h-2 rounded-full bg-orange-400 transition-all duration-700"
                                                        style={{ width: `${gap.target}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs leading-relaxed text-gray-500">{gap.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 활동 추천 탭 */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-4">
                            {result.recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className={`rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${PRIORITY_LABELS[rec.priority]?.bg || 'border-gray-200'}`}
                                >
                                    <div className="flex flex-wrap items-start gap-2">
                                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                            {ACTIVITY_TYPE_LABELS[rec.type] || rec.type}
                                        </span>
                                        <span
                                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{ backgroundColor: `${COMPETENCY_COLORS[rec.category]}15`, color: COMPETENCY_COLORS[rec.category] }}
                                        >
                                            {COMPETENCY_LABELS[rec.category]}
                                        </span>
                                        <span className={`ml-auto text-xs font-bold ${PRIORITY_LABELS[rec.priority]?.color || ''}`}>
                                            {PRIORITY_LABELS[rec.priority]?.label || rec.priority}
                                        </span>
                                    </div>

                                    <h4 className="mt-3 text-base font-bold text-gray-900">{rec.title}</h4>
                                    <p className="mt-1 text-sm text-gray-600">{rec.description}</p>

                                    {rec.expectedKeywords.length > 0 && (
                                        <div className="mt-3">
                                            <p className="mb-1.5 text-xs font-medium text-gray-500">📝 예상 생기부 키워드</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {rec.expectedKeywords.map((kw, ki) => (
                                                    <span key={ki} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        {rec.estimatedDuration && (
                                            <span>⏱️ {rec.estimatedDuration}</span>
                                        )}
                                        {rec.tip && (
                                            <span className="text-indigo-600">💡 Tip: {rec.tip}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 로드맵 탭 */}
                    {activeTab === 'roadmap' && (
                        <div className="relative space-y-0">
                            {/* 타임라인 선 */}
                            <div className="absolute left-[22px] top-0 h-full w-0.5 bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300 sm:left-[27px]" />

                            {result.roadmap.map((item, idx) => (
                                <div key={idx} className="relative flex gap-4 pb-8 sm:gap-6">
                                    {/* 타임라인 도트 */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold sm:h-14 sm:w-14 ${item.isCurrent
                                                ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                                                : "border-gray-300 bg-white text-gray-500"
                                                }`}
                                        >
                                            {item.isCurrent ? "NOW" : `${idx + 1}`}
                                        </div>
                                    </div>

                                    {/* 콘텐츠 */}
                                    <div className={`flex-1 rounded-xl border p-5 ${item.isCurrent
                                        ? "border-indigo-200 bg-indigo-50/50 shadow-sm"
                                        : "border-gray-200 bg-white"
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-gray-800">{item.semester}</h4>
                                            {item.isCurrent && (
                                                <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                                    현재
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-indigo-600">{item.theme}</p>

                                        {item.activities.length > 0 && (
                                            <div className="mt-3">
                                                <p className="mb-1.5 text-xs font-medium text-gray-500">📋 핵심 활동</p>
                                                <ul className="space-y-1">
                                                    {item.activities.map((act, ai) => (
                                                        <li key={ai} className="flex items-start gap-2 text-xs text-gray-700">
                                                            <span className="mt-0.5 text-indigo-400">•</span>
                                                            {act}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {item.goals.length > 0 && (
                                            <div className="mt-3">
                                                <p className="mb-1.5 text-xs font-medium text-gray-500">🎯 달성 목표</p>
                                                <ul className="space-y-1">
                                                    {item.goals.map((goal, gi) => (
                                                        <li key={gi} className="flex items-start gap-2 text-xs text-gray-700">
                                                            <span className="mt-0.5 text-green-500">✓</span>
                                                            {goal}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
