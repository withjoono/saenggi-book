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

export const Route = createLazyFileRoute("/grade-analysis/_layout/request")({
  component: GradeAnalysisRequest,
});

const SOURCE_TYPE_LABELS: Record<string, string> = {
  subject: "세특",
  creative: "창체",
  behavior: "행특",
};

function GradeAnalysisRequest() {
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
      const result = res.data?.data as ComprehensiveEvalResult;
      setEvalResult(result);
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
                        <div key={cat} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
                        </div>
                      ),
                    )}
                    <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500" />
                        <span className="text-xs font-semibold text-indigo-600">총점</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-indigo-700">
                        {evalResult.totalScore}
                        <span className="ml-1 text-sm font-normal text-indigo-400">점</span>
                      </p>
                    </div>
                  </div>

                  {/* 역량별 주석 */}
                  {evalResult.annotations && evalResult.annotations.length > 0 && (
                    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-800">📝 역량별 상세 코멘트</h4>
                      <div className="space-y-3">
                        {evalResult.annotations.map((ann, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div
                              className="mt-1 h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: EVAL_COMPETENCY_COLORS[ann.category] }}
                            />
                            <div>
                              <span className="text-xs font-semibold text-gray-600">
                                {EVAL_COMPETENCY_LABELS[ann.category]}
                              </span>
                              <p className="text-sm text-gray-700">{ann.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 강점 / 약점 / 조언 */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {evalResult.strengths?.length > 0 && (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-green-800">💪 강점</h4>
                        <ul className="space-y-1">
                          {evalResult.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-green-700">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evalResult.weaknesses?.length > 0 && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-red-800">⚠️ 약점</h4>
                        <ul className="space-y-1">
                          {evalResult.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-red-700">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evalResult.advice?.length > 0 && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-blue-800">💡 조언</h4>
                        <ul className="space-y-1">
                          {evalResult.advice.map((a, i) => (
                            <li key={i} className="text-sm text-blue-700">• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 소재 목록 */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-gray-900">7등급 소재 평가</h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(evalResult.materials || []).map((mat, idx) => (
                        <button
                          key={idx}
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
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              {mat.score}점 · 근거 {mat.sources.length}건
                            </p>
                            {mat.relatedKeywords?.length > 0 && (
                              <div className="flex gap-1">
                                {mat.relatedKeywords.slice(0, 2).map((kw, ki) => (
                                  <span key={ki} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

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
