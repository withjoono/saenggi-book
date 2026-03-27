import { Button } from "@/components/custom/button";
import { RequireLoginMessage } from "@/components/require-login-message";
import { RowSeriesSearch } from "@/components/row-series-search";
import { SubjectRoadmap } from "@/components/services/evaluation/subject-roadmap";
import { SeriesSelector } from "@/components/services/evaluation/series-selector";
import { Separator } from "@/components/ui/separator";
import { ICompatibilityData } from "@/constants/compatibility-series";
import { UNIVERSITY_COMPATIBILITY_LEVELS_2022 } from "@/constants/compatibility-univ";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { useGetUniversities } from "@/stores/server/features/univ-level/queries";
import { IUnivLevel } from "@/stores/server/features/univ-level/apis";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

/**
 * 2022 개정과정(현 고2 이하) vs 2015 개정과정(현 고3 이상) 기준 졸업년도
 * graduateYear >= 2026 → 고2 이하 (2022 개정과정) → 생기북에서 계열적합성진단
 * graduateYear <= 2025 → 고3 이상 (2015 개정과정) → 수시에서 계열적합성진단
 */
const CURRICULUM_2022_MIN_GRADUATE_YEAR = 2026;

export const Route = createLazyFileRoute("/sb/_layout/compatibility")({
  component: MsCompatibility,
});

function MsCompatibility() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: universities = [] } = useGetUniversities();

  const [selectedSeries, setSelectedSeries] = useState({
    grandSeries: "",
    middleSeries: "",
    rowSeries: "",
  });

  const [searchSeries, setSearchSeries] = useState<ICompatibilityData | null>(
    null,
  );

  const [selectedUniv, setSelectedUniv] = useState(
    UNIVERSITY_COMPATIBILITY_LEVELS_2022[0],
  );

  const [univSearchQuery, setUnivSearchQuery] = useState("");
  const [selectedUnivItem, setSelectedUnivItem] = useState<IUnivLevel | null>(null);
  const [isUnivDropdownOpen, setIsUnivDropdownOpen] = useState(false);
  const [isDiagnosisStarted, setIsDiagnosisStarted] = useState(false);

  // 계열이나 대학 정보가 바뀌면 진단 화면을 숨김
  useEffect(() => {
    setIsDiagnosisStarted(false);
  }, [selectedSeries, selectedUnivItem]);

  // 대학 검색 결과 필터링
  const filteredUniversities = useMemo(() => {
    if (!univSearchQuery.trim()) return [];
    const query = univSearchQuery.trim().toLowerCase();
    return universities.filter(
      (u) =>
        u.univName.toLowerCase().includes(query) ||
        u.region.toLowerCase().includes(query),
    ).slice(0, 20); // 최대 20개 표시
  }, [universities, univSearchQuery]);

  // 대학 선택 시 해당 레벨로 자동 매핑
  useEffect(() => {
    if (selectedUnivItem) {
      const matchedLevel = UNIVERSITY_COMPATIBILITY_LEVELS_2022.find(
        (l) => l.level === selectedUnivItem.univLevel,
      );
      if (matchedLevel) {
        setSelectedUniv(matchedLevel);
      }
    }
  }, [selectedUnivItem]);

  useEffect(() => {
    if (searchSeries) {
      setSelectedSeries({
        grandSeries: searchSeries.grandSeries,
        middleSeries: searchSeries.middleSeries,
        rowSeries: searchSeries.rowSeries,
      });
    }
  }, [searchSeries]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">전공별 과목 로드맵</h3>
        <p className="text-sm text-muted-foreground">
          원하는 대학과 전공에 진학하기 위해 필요한 과목 이수 로드맵과 내신 관리 목표를 가이드해드립니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : Number(currentUser.graduateYear) < CURRICULUM_2022_MIN_GRADUATE_YEAR ? (
        /* 고3 이상 (2015 개정과정) → 수시 계열적합성진단으로 안내 */
        <div className="flex flex-col items-center gap-6 py-16">
          <div className="rounded-full bg-amber-100 p-4 text-4xl">📋</div>
          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold">
              고3 이상 학생은 수시 계열적합성진단을 이용해주세요
            </p>
            <p className="text-sm text-muted-foreground">
              2015 개정과정 교과 기반의 계열적합성진단은
              <br />
              수시 앱에서 제공됩니다.
            </p>
          </div>
          <Link
            to="/evaluation/compatibility"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            수시 계열적합성진단 바로가기 →
          </Link>
          <p className="text-xs text-muted-foreground">
            생기북의 다른 기능은 이 앱에서 계속 이용할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="">
          <div className="space-y-2 py-4 pt-12">
            <p className="text-center text-lg font-semibold">
              목표 전공을 설계해보세요!
            </p>
            <p className="text-center text-sm">
              목표 전공에 필요한 추천 이수 과목들을 확인해봐요.
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

          {selectedSeries.rowSeries ? (
            <div className="space-y-8 py-8">
              {/* 대학 검색 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  🔍 대학 검색
                </p>
                <div className="relative mx-auto max-w-md">
                  <input
                    type="text"
                    placeholder="대학명을 입력하세요 (예: 서울대, 연세대...)"
                    value={univSearchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUnivSearchQuery(val);
                      setSelectedUnivItem(null); // 입력값이 변경되면 선택된 대학 초기화 (리스트에서 클릭 필수)

                      if (val.trim()) {
                        setIsUnivDropdownOpen(true);
                      } else {
                        setIsUnivDropdownOpen(false);
                      }
                    }}
                    onFocus={() => {
                      if (univSearchQuery.trim()) setIsUnivDropdownOpen(true);
                    }}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {isUnivDropdownOpen && filteredUniversities.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border bg-popover shadow-lg">
                      {filteredUniversities.map((univ, idx) => (
                        <button
                          key={`${univ.univCode}-${idx}`}
                          type="button"
                          onClick={() => {
                            setSelectedUnivItem(univ);
                            setUnivSearchQuery(univ.univName);
                            setIsUnivDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors ${
                            selectedUnivItem?.univCode === univ.univCode
                              ? "bg-accent font-semibold"
                              : ""
                          }`}
                        >
                          <span>{univ.univName}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {univ.region} · Lv{univ.univLevel}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* removed manual rank selection UI and univ label */}
              
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="w-full max-w-sm font-semibold"
                  disabled={!selectedUnivItem}
                  onClick={() => setIsDiagnosisStarted(true)}
                >
                  과목 로드맵 확인
                </Button>
              </div>

              {isDiagnosisStarted && (
                <SubjectRoadmap
                  selectedSeries={selectedSeries}
                  selectedUniv={selectedUniv}
                />
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
