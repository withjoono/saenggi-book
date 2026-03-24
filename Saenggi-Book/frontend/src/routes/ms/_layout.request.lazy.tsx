import { RequireLoginMessage } from "@/components/require-login-message";
import { RequireSchoolRecordMessage } from "@/components/require-schoolrecord-message";
import { RowSeriesSearch } from "@/components/row-series-search";
import { SeriesSelector } from "@/components/services/evaluation/series-selector";
import { Separator } from "@/components/ui/separator";
import { ICompatibilityData } from "@/constants/compatibility-series";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import nestApiClient from "@/stores/server/api-client";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconRotate } from "@tabler/icons-react";
import {
  ComprehensiveEvalResult,
  ComprehensiveEvalRequestDto,
  EvalMaterialItem,
  CompetencyCategory,
  EVAL_COMPETENCY_LABELS,
  EVAL_COMPETENCY_COLORS,
  GRADE_LEVEL_COLORS,
  GRADE_LEVEL_LABELS,
} from "@/types/evaluation.type";
import MaterialForceGraph from "@/components/graph/MaterialForceGraph";
import { SUB_CATEGORY_GROUPS, UNIV_EVAL_FACTORS, IMPROVEMENT_TIPS } from "@/constants/evaluation-questions";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export const Route = createLazyFileRoute("/ms/_layout/request")({
  component: SusiRequest,
});

const SOURCE_TYPE_LABELS: Record<string, string> = {
  subject: "세특",
  creative: "창체",
  behavior: "행특",
};

function SusiRequest() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();

  const [selectedSeries, setSelectedSeries] = useState({
    grandSeries: "",
    middleSeries: "",
    rowSeries: "",
  });
  const [searchSeries, setSearchSeries] = useState<ICompatibilityData | null>(
    null,
  );

  // AI 평가 상태
  const [evalResult, setEvalResult] = useState<ComprehensiveEvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CompetencyCategory | 'summary'>('academic');

  const resetSeries = () => {
    setSelectedSeries({ grandSeries: "", middleSeries: "", rowSeries: "" });
    setSearchSeries(null);
    setEvalResult(null);
    setEvalError(null);
    setSelectedMaterialIdx(null);
  };

  useEffect(() => {
    if (searchSeries) {
      setSelectedSeries({
        grandSeries: searchSeries.grandSeries,
        middleSeries: searchSeries.middleSeries,
        rowSeries: searchSeries.rowSeries,
      });
    }
  }, [searchSeries]);

  const seriesLabel = useMemo(() => {
    if (!selectedSeries.rowSeries) return "";
    return `${selectedSeries.grandSeries}>${selectedSeries.middleSeries}>${selectedSeries.rowSeries}`;
  }, [selectedSeries]);

  // 생기부 데이터 → 종합 평가 요청 DTO
  const buildEvalRequest = useCallback((): ComprehensiveEvalRequestDto | null => {
    if (!schoolRecords) return null;

    const subjectTexts: ComprehensiveEvalRequestDto["subjectTexts"] = [];
    const creativeTexts: ComprehensiveEvalRequestDto["creativeTexts"] = [];
    const behaviorTexts: ComprehensiveEvalRequestDto["behaviorTexts"] = [];

    // 세특 (subjects + selectSubjects)
    for (const s of schoolRecords.subjects || []) {
      if (s.detailAndSpecialty?.trim()) {
        subjectTexts.push({
          semester: s.semester || "?",
          subjectName: s.subjectName || "과목없음",
          text: s.detailAndSpecialty,
        });
      }
    }
    for (const s of schoolRecords.selectSubjects || []) {
      if (s.detailAndSpecialty?.trim()) {
        subjectTexts.push({
          semester: s.semester || "?",
          subjectName: s.subjectName || "과목없음",
          text: s.detailAndSpecialty,
        });
      }
    }

    // 창체
    for (const c of schoolRecords.creativeActivities || []) {
      if (c.content?.trim()) {
        creativeTexts.push({
          activityType: c.activityType || "활동없음",
          text: c.content,
        });
      }
    }

    // 행특
    for (const b of schoolRecords.behaviorOpinions || []) {
      if (b.content?.trim()) {
        behaviorTexts.push({ text: b.content });
      }
    }

    if (subjectTexts.length === 0 && creativeTexts.length === 0 && behaviorTexts.length === 0) {
      return null;
    }

    return {
      grade: "전체",
      targetSeries: seriesLabel,
      subjectTexts,
      creativeTexts,
      behaviorTexts,
    };
  }, [schoolRecords, seriesLabel]);

  // AI 평가 실행
  const handleAiEvaluate = useCallback(async () => {
    const dto = buildEvalRequest();
    if (!dto) return;

    setIsEvaluating(true);
    setEvalError(null);
    setEvalResult(null);
    setSelectedMaterialIdx(null);

    try {
      const res = await nestApiClient.post("/schoolrecord/eval/comprehensive", dto);
      console.log("[AI 평가] 원본 응답:", JSON.stringify(res.data, null, 2));
      // 백엔드가 { success, data: result }로 감싸는데, nestApiClient 인터셉터가 camelizeKeys 적용
      // 이중 래핑될 수 있으므로 data를 재귀적으로 벗김
      let result = res.data;
      while (result?.data && !result.scores && !result.materials) {
        result = result.data;
      }
      console.log("[AI 평가] 추출된 result:", JSON.stringify(result, null, 2));
      if (result && (result.scores || result.materials)) {
        setEvalResult(result as ComprehensiveEvalResult);
      } else {
        setEvalError("AI 평가 결과가 올바르지 않습니다. 콘솔을 확인해주세요.");
      }
    } catch (err: any) {
      console.error("AI 평가 실패:", err);
      setEvalError(err?.response?.data?.message || err?.message || "AI 평가에 실패했습니다.");
    } finally {
      setIsEvaluating(false);
    }
  }, [buildEvalRequest]);

  const selectedMaterial: EvalMaterialItem | null =
    evalResult && selectedMaterialIdx !== null ? evalResult.materials?.[selectedMaterialIdx] ?? null : null;

  const evalRequestData = buildEvalRequest();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">AI 사정관 생기부 평가</h3>
        <p className="text-sm text-muted-foreground">
          목표 계열을 선택하면 AI 사정관이 해당 계열 관점에서 생기부를 종합 평가합니다.
        </p>
        <p className="text-sm text-muted-foreground">
          평가는 4대 역량별로 7등급 체계로 진행되며, 강점/약점 분석 및 조언이 함께 제공됩니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : !schoolRecords || schoolRecords.isEmpty ? (
        <RequireSchoolRecordMessage />
      ) : (
        <div>
          {selectedSeries.rowSeries === "" ? (
            <>
              <div className="space-y-2 py-4 pt-12">
                <p className="text-center text-lg font-semibold">
                  목표 계열을 선택해주세요!
                </p>
                <p className="text-center text-sm">
                  선택한 계열에 맞춰 AI가 전공 적합성을 중심으로 생기부를 평가합니다.
                </p>
              </div>
              <div className="space-y-4 py-12">
                <RowSeriesSearch
                  selectedSeries={searchSeries}
                  setSelectedSeries={setSearchSeries}
                  className="mx-auto max-w-sm"
                />
                <SeriesSelector
                  selectedSeries={selectedSeries}
                  setSelectedSeries={setSelectedSeries}
                />
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* 선택된 계열 + 다시선택 */}
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-primary">대계열</p>
                    <p className="text-base font-semibold md:text-lg">{selectedSeries.grandSeries}</p>
                  </div>
                  <div>-</div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-primary">중계열</p>
                    <p className="text-base font-semibold md:text-lg">{selectedSeries.middleSeries}</p>
                  </div>
                  <div>-</div>
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-primary">소계열</p>
                    <p className="text-base font-semibold md:text-lg">{selectedSeries.rowSeries}</p>
                  </div>
                </div>
                <button
                  onClick={resetSeries}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <IconRotate className="size-4" />
                  다시선택
                </button>
              </div>

              {/* AI 평가 버튼 */}
              {!evalResult && (
                <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 md:p-12">
                  <div className="text-6xl">🤖</div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">AI 사정관 생기부 평가</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-indigo-600">「{seriesLabel}」</span> 계열 관점에서
                    </p>
                    <p className="text-sm text-gray-600">
                      생기부를 종합 평가합니다.
                    </p>
                  </div>

                  {!evalRequestData ? (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">
                      ⚠️ 분석 가능한 생기부 텍스트(세특/창체/행특)가 없습니다. 생기부를 먼저 입력해주세요.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                          📚 세특 {evalRequestData.subjectTexts.length}개
                        </span>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                          🎨 창체 {evalRequestData.creativeTexts.length}개
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                          💬 행특 {evalRequestData.behaviorTexts.length}개
                        </span>
                      </div>
                      <button
                        onClick={handleAiEvaluate}
                        disabled={isEvaluating}
                        className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isEvaluating ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            AI 평가 진행 중... (약 30초 소요)
                          </>
                        ) : (
                          <>✨ AI 사정관 생기부 평가 시작</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 에러 */}
              {evalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  ⚠️ {evalError}
                </div>
              )}

              {/* 평가 결과 */}
              {evalResult && (
                <div className="space-y-6">
                  {/* 재평가 + AI 요약 */}
                  <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-indigo-700">🤖 AI 사정관 종합 평가</p>
                        <p className="mt-1 text-sm text-gray-700">{evalResult.summary}</p>
                      </div>
                      <button
                        onClick={handleAiEvaluate}
                        disabled={isEvaluating}
                        className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
                      >
                        {isEvaluating ? "분석 중..." : "🔄 재평가"}
                      </button>
                    </div>
                  </div>

                  {/* 역량별 점수 + 총점 */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {(Object.entries(evalResult.scores || {}) as [CompetencyCategory, number][]).map(
                      ([cat, score]) => (
                        <button
                          key={cat}
                          onClick={() => setActiveTab(cat)}
                          className={`rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                            activeTab === cat
                              ? "border-2 ring-2 ring-opacity-30"
                              : "border-gray-200 bg-white"
                          }`}
                          style={activeTab === cat ? {
                            borderColor: EVAL_COMPETENCY_COLORS[cat],
                            backgroundColor: `${EVAL_COMPETENCY_COLORS[cat]}10`,
                            // @ts-ignore
                            '--tw-ring-color': EVAL_COMPETENCY_COLORS[cat],
                          } : {}}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: EVAL_COMPETENCY_COLORS[cat] }}
                            />
                            <span className="text-xs font-medium text-gray-500">
                              {EVAL_COMPETENCY_LABELS[cat]}
                            </span>
                          </div>
                          <p className="mt-2 text-2xl font-bold text-gray-900">
                            {score}
                            <span className="ml-1 text-sm font-normal text-gray-400">점</span>
                          </p>
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        activeTab === 'summary'
                          ? "border-2 border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200 ring-opacity-50"
                          : "border-2 border-indigo-200 bg-indigo-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500" />
                        <span className="text-xs font-semibold text-indigo-600">종합</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-indigo-700">
                        {evalResult.totalScore}
                        <span className="ml-1 text-sm font-normal text-indigo-400">점</span>
                      </p>
                    </button>
                  </div>

                  {/* ===== 역량별 탭 컨텐츠 ===== */}
                  {activeTab !== 'summary' && (() => {
                    const cat = activeTab as CompetencyCategory;
                    const annotation = evalResult.annotations?.find(a => a.category === cat);
                    const catMaterials = (evalResult.materials || [])
                      .map((m, idx) => ({ ...m, originalIndex: idx }))
                      .filter(m => m.category === cat);
                    const color = EVAL_COMPETENCY_COLORS[cat];
                    const qs = evalResult.questionScores || [];
                    const catGroups = SUB_CATEGORY_GROUPS.filter(g => g.category === cat);

                    // 소분류별 평균 점수 계산
                    const subCatData = catGroups.map(group => {
                      const scores = group.questionIds.map(qid => qs.find(q => q.questionId === qid)?.score || 0);
                      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                      return { name: group.name, avg: Math.round(avg * 10) / 10, questionIds: group.questionIds, fullMark: 7 };
                    });

                    // 대학 평가요소별 점수 계산
                    const catQuestionIds = catGroups.flatMap(g => g.questionIds);
                    const relevantFactors = UNIV_EVAL_FACTORS.filter(f =>
                      f.questionIds.some(qid => catQuestionIds.includes(qid))
                    ).map(f => {
                      const scores = f.questionIds.map(qid => qs.find(q => q.questionId === qid)?.score || 0).filter(s => s > 0);
                      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                      return { ...f, avgScore: Math.round(avg * 10) / 10 };
                    }).sort((a, b) => b.avgScore - a.avgScore).slice(0, 8);

                    // 낮은 점수 항목 (4점 이하)
                    const lowScoreItems = catGroups.flatMap(group =>
                      group.questionIds.map(qid => {
                        const qScore = qs.find(q => q.questionId === qid);
                        return qScore && qScore.score <= 4 ? { ...qScore, subCategory: group.name } : null;
                      }).filter(Boolean)
                    ) as Array<{ questionId: number; score: number; reason: string; subCategory: string }>;

                    const scoreColor = (s: number) => s >= 6 ? '#7C3AED' : s >= 5 ? '#2563EB' : s >= 4 ? '#059669' : s >= 3 ? '#D97706' : s >= 2 ? '#DC2626' : '#6B7280';

                    return (
                      <div className="space-y-5 rounded-2xl border-2 p-6" style={{ borderColor: `${color}40` }}>
                        {/* 섹션 헤더 */}
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
                          <h3 className="text-xl font-bold text-gray-900">{EVAL_COMPETENCY_LABELS[cat]}</h3>
                          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
                            {evalResult.scores?.[cat]}점
                          </span>
                        </div>

                        {/* 상세 코멘트 */}
                        {annotation && (
                          <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: `${color}30` }}>
                            <h4 className="mb-2 text-sm font-bold text-gray-800">📝 상세 코멘트</h4>
                            <p className="text-sm leading-relaxed text-gray-700">{annotation.comment}</p>
                          </div>
                        )}

                        {/* 레이더 차트 + 바 차트 */}
                        {subCatData.length > 0 && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* 레이더 차트 */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                              <h4 className="mb-2 text-sm font-bold text-gray-800">🕸️ 소분류 역량 레이더</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={subCatData}>
                                  <PolarGrid stroke="#e5e7eb" />
                                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 7]} tick={{ fontSize: 10 }} />
                                  <Radar name="점수" dataKey="avg" stroke={color} fill={color} fillOpacity={0.3} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                            {/* 바 차트 */}
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                              <h4 className="mb-2 text-sm font-bold text-gray-800">📊 소분류별 점수</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={subCatData} layout="vertical" margin={{ left: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                  <XAxis type="number" domain={[0, 7]} tick={{ fontSize: 11 }} />
                                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                                  <Tooltip formatter={(v: number) => [`${v}점`, '평균']} />
                                  <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                                    {subCatData.map((entry, idx) => (
                                      <Cell key={idx} fill={scoreColor(entry.avg)} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* 세부 질문별 점수 */}
                        {catGroups.map(group => (
                          <div key={group.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h4 className="mb-3 flex items-center justify-between text-sm font-bold text-gray-800">
                              <span>{group.name}</span>
                              <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: scoreColor(subCatData.find(d => d.name === group.name)?.avg || 0) }}>
                                평균 {subCatData.find(d => d.name === group.name)?.avg || 0}점
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {group.questionIds.map(qid => {
                                const qScore = qs.find(q => q.questionId === qid);
                                const score = qScore?.score || 0;
                                return (
                                  <div key={qid} className="rounded-lg bg-gray-50 p-3">
                                    <div className="mb-1 flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-600">Q{qid}</span>
                                      <span className="text-xs font-bold" style={{ color: scoreColor(score) }}>{score}/7</span>
                                    </div>
                                    <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-200">
                                      <div className="h-full rounded-full transition-all" style={{ width: `${(score / 7) * 100}%`, backgroundColor: scoreColor(score) }} />
                                    </div>
                                    {qScore?.reason && <p className="text-[11px] text-gray-500">{qScore.reason}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* 대학 평가요소별 예상 점수 */}
                        {relevantFactors.length > 0 && (
                          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h4 className="mb-3 text-sm font-bold text-gray-800">🏫 관련 대학 평가요소 예상 점수</h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {relevantFactors.map(f => (
                                <div key={f.code} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                  <span className="text-xs font-medium text-gray-700">{f.name}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                                      <div className="h-full rounded-full" style={{ width: `${(f.avgScore / 7) * 100}%`, backgroundColor: scoreColor(f.avgScore) }} />
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: scoreColor(f.avgScore) }}>{f.avgScore}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 그래프 뷰 */}
                        <MaterialForceGraph
                          category={cat}
                          materials={evalResult.materials || []}
                          onNodeClick={(idx) => {
                            setSelectedMaterialIdx(idx);
                            document.getElementById(`material-item-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                        />

                        {/* 소재 카드 목록 */}
                        {catMaterials.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-800">📋 추출된 소재 ({catMaterials.length}개)</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {catMaterials.map((mat) => (
                                <button
                                  key={mat.originalIndex}
                                  id={`material-item-${mat.originalIndex}`}
                                  onClick={() => setSelectedMaterialIdx(mat.originalIndex)}
                                  className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                    selectedMaterialIdx === mat.originalIndex
                                      ? "border-indigo-300 ring-2 ring-indigo-100"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: GRADE_LEVEL_COLORS[mat.gradeLevel] }}>{mat.gradeLevel}등급</span>
                                    <span className="text-xs text-gray-400">{mat.score}점</span>
                                  </div>
                                  <h5 className="text-sm font-bold text-gray-900">{mat.title}</h5>
                                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{mat.summary}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 역량별 강점 / 약점 / 조언 */}
                        {annotation && (
                          <div className="grid gap-3 md:grid-cols-3">
                            {annotation.strengths && annotation.strengths.length > 0 && (
                              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                <h4 className="mb-2 text-sm font-bold text-green-800">💪 강점</h4>
                                <ul className="space-y-1">{annotation.strengths.map((s, i) => (<li key={i} className="text-sm text-green-700">• {s}</li>))}</ul>
                              </div>
                            )}
                            {annotation.weaknesses && annotation.weaknesses.length > 0 && (
                              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <h4 className="mb-2 text-sm font-bold text-red-800">⚠️ 약점</h4>
                                <ul className="space-y-1">{annotation.weaknesses.map((w, i) => (<li key={i} className="text-sm text-red-700">• {w}</li>))}</ul>
                              </div>
                            )}
                            {annotation.advice && annotation.advice.length > 0 && (
                              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <h4 className="mb-2 text-sm font-bold text-blue-800">💡 조언</h4>
                                <ul className="space-y-1">{annotation.advice.map((a, i) => (<li key={i} className="text-sm text-blue-700">• {a}</li>))}</ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 개선 가이드 (낮은 점수 항목) */}
                        {lowScoreItems.length > 0 && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <h4 className="mb-3 text-sm font-bold text-amber-800">📈 개선 가이드 (4점 이하 항목)</h4>
                            <div className="space-y-3">
                              {[...new Set(lowScoreItems.map(i => i.subCategory))].map(subCat => {
                                const tips = IMPROVEMENT_TIPS[subCat] || [];
                                const items = lowScoreItems.filter(i => i.subCategory === subCat);
                                return (
                                  <div key={subCat} className="rounded-lg bg-white p-3">
                                    <div className="mb-1 flex items-center gap-2">
                                      <span className="text-xs font-bold text-amber-700">{subCat}</span>
                                      <span className="text-[10px] text-gray-400">({items.length}개 항목)</span>
                                    </div>
                                    {tips.length > 0 && (
                                      <ul className="space-y-0.5">
                                        {tips.map((tip, i) => (<li key={i} className="text-xs text-gray-600">💡 {tip}</li>))}
                                      </ul>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ===== 종합 탭 ===== */}
                  {activeTab === 'summary' && (
                    <div className="space-y-5 rounded-2xl border-2 border-indigo-200 p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-indigo-500" />
                        <h3 className="text-xl font-bold text-gray-900">🏆 종합 평가</h3>
                        <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                          {evalResult.totalScore}점
                        </span>
                      </div>

                      {/* 종합 요약 */}
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <p className="text-sm leading-relaxed text-gray-700">{evalResult.summary}</p>
                      </div>

                      {/* 역량별 코멘트 요약 */}
                      {evalResult.annotations && evalResult.annotations.length > 0 && (
                        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                          <h4 className="text-sm font-bold text-gray-800">📝 역량별 코멘트</h4>
                          <div className="space-y-3">
                            {evalResult.annotations.map((ann, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTab(ann.category)}
                                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                              >
                                <div
                                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                  style={{ backgroundColor: EVAL_COMPETENCY_COLORS[ann.category] }}
                                />
                                <div>
                                  <span className="text-xs font-semibold" style={{ color: EVAL_COMPETENCY_COLORS[ann.category] }}>
                                    {EVAL_COMPETENCY_LABELS[ann.category]} →
                                  </span>
                                  <p className="text-sm text-gray-700">{ann.comment}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 종합 강점 / 약점 / 조언 */}
                      <div className="grid gap-4 md:grid-cols-3">
                        {evalResult.strengths?.length > 0 && (
                          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <h4 className="mb-2 text-sm font-bold text-green-800">💪 종합 강점</h4>
                            <ul className="space-y-1">
                              {evalResult.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-green-700">• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evalResult.weaknesses?.length > 0 && (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <h4 className="mb-2 text-sm font-bold text-red-800">⚠️ 종합 약점</h4>
                            <ul className="space-y-1">
                              {evalResult.weaknesses.map((w, i) => (
                                <li key={i} className="text-sm text-red-700">• {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evalResult.advice?.length > 0 && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <h4 className="mb-2 text-sm font-bold text-blue-800">💡 종합 조언</h4>
                            <ul className="space-y-1">
                              {evalResult.advice.map((a, i) => (
                                <li key={i} className="text-sm text-blue-700">• {a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 전체 소재 목록 */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-800">📋 전체 소재 목록 ({(evalResult.materials || []).length}개)</h4>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {(evalResult.materials || []).map((mat, idx) => (
                            <button
                              key={idx}
                              id={`material-item-${idx}`}
                              onClick={() => setSelectedMaterialIdx(idx)}
                              className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                selectedMaterialIdx === idx
                                  ? "border-indigo-300 ring-2 ring-indigo-100"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: EVAL_COMPETENCY_COLORS[mat.category] }}
                                  />
                                  <span className="text-xs font-medium text-gray-500">
                                    {EVAL_COMPETENCY_LABELS[mat.category]}
                                  </span>
                                </div>
                                <span
                                  className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                                  style={{ backgroundColor: GRADE_LEVEL_COLORS[mat.gradeLevel] }}
                                >
                                  {mat.gradeLevel}등급
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-gray-900">{mat.title}</h5>
                              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{mat.summary}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 선택된 소재 상세 */}
                  {selectedMaterial && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
                      <div
                        className="px-6 py-4"
                        style={{ backgroundColor: `${EVAL_COMPETENCY_COLORS[selectedMaterial.category]}15` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: EVAL_COMPETENCY_COLORS[selectedMaterial.category] }}
                            />
                            <h3 className="text-lg font-bold text-gray-900">{selectedMaterial.title}</h3>
                            <span
                              className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                              style={{ backgroundColor: GRADE_LEVEL_COLORS[selectedMaterial.gradeLevel] }}
                            >
                              {GRADE_LEVEL_LABELS[selectedMaterial.gradeLevel]}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedMaterialIdx(null)}
                            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{selectedMaterial.summary}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <span>점수: <span className="font-bold">{selectedMaterial.score}점</span></span>
                          <span>역량: <span className="font-bold">{EVAL_COMPETENCY_LABELS[selectedMaterial.category]}</span></span>
                        </div>
                      </div>
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
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
