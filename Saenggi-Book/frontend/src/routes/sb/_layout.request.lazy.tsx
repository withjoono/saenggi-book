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
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconRotate } from "@tabler/icons-react";
import {
  ComprehensiveEvalResult,
  ComprehensiveEvalRequestDto,
} from "@/types/evaluation.type";
import { useQueryClient } from "@tanstack/react-query";
import { aiEvaluationQueryKeys } from "@/stores/server/features/ai-evaluation/queries";

export const Route = createLazyFileRoute("/sb/_layout/request")({
  component: SusiRequest,
});

function SusiRequest() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();
  const queryClient = useQueryClient();

  const [selectedSeries, setSelectedSeries] = useState({
    grandSeries: "",
    middleSeries: "",
    rowSeries: "",
  });
  const [searchSeries, setSearchSeries] = useState<ICompatibilityData | null>(
    null,
  );

  // AI 평가 상태
  const [evalCompleted, setEvalCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const resetSeries = () => {
    setSelectedSeries({ grandSeries: "", middleSeries: "", rowSeries: "" });
    setSearchSeries(null);
    setEvalCompleted(false);
    setEvalError(null);
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
    setEvalCompleted(false);

    try {
      const res = await nestApiClient.post("/schoolrecord/eval/comprehensive", dto);
      let result = res.data;
      while (result?.data && !result.scores && !result.materials) {
        result = result.data;
      }
      if (result && (result.scores || result.materials)) {
        // 분석 성공 → evaluation-list 캐시 갱신
        queryClient.invalidateQueries({ queryKey: aiEvaluationQueryKeys.all });
        setEvalCompleted(true);
      } else {
        setEvalError("AI 평가 결과가 올바르지 않습니다. 콘솔을 확인해주세요.");
      }
    } catch (err: any) {
      console.error("AI 평가 실패:", err);
      setEvalError(err?.response?.data?.message || err?.message || "AI 평가에 실패했습니다.");
    } finally {
      setIsEvaluating(false);
    }
  }, [buildEvalRequest, queryClient]);

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

              {/* ===== 분석 완료 성공 화면 ===== */}
              {evalCompleted && (
                <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-8 md:p-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl">
                    🎉
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">AI 생기부 분석이 완료되었습니다!</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-indigo-600">「{seriesLabel}」</span> 관점으로
                    </p>
                    <p className="text-sm text-gray-600">
                      4대 역량 빌드업 리포트가 생성되었습니다.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <Link
                      to="/sb/evaluation-list"
                      search={{ tab: "overview" }}
                      className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      📊 역량 분석 리포트 보기
                    </Link>
                    <button
                      onClick={resetSeries}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-0.5"
                    >
                      🔄 다른 계열로 다시 분석하기
                    </button>
                  </div>

                  <div className="mt-2 max-w-md rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center">
                    <p className="text-xs text-blue-700">
                      💡 역량별(학업/진로/공동체/기타) 상세 분석, 소재 네트워크 그래프, 성장 타임라인 등은
                      <span className="font-bold"> 역량 분석 리포트</span> 페이지에서 언제든 다시 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {/* AI 평가 버튼 (분석 전) */}
              {!evalCompleted && (
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
