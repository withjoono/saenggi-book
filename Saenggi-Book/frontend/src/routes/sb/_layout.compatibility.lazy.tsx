import { Button } from "@/components/custom/button";
import { RequireLoginMessage } from "@/components/require-login-message";
import { RequireSchoolRecordMessage } from "@/components/require-schoolrecord-message";
import { RowSeriesSearch } from "@/components/row-series-search";
import { MyCompatibility } from "@/components/services/evaluation/my-compatibility";
import { SeriesSelector } from "@/components/services/evaluation/series-selector";
import { Separator } from "@/components/ui/separator";
import { ICompatibilityData } from "@/constants/compatibility-series";
import { UNIVERSITY_COMPATIBILITY_LEVELS } from "@/constants/compatibility-univ";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { useGetUniversities } from "@/stores/server/features/univ-level/queries";
import { IUnivLevel } from "@/stores/server/features/univ-level/apis";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createLazyFileRoute("/sb/_layout/compatibility")({
  component: MsCompatibility,
});

function MsCompatibility() {
  // Queries
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords } = useGetSchoolRecords();
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
    UNIVERSITY_COMPATIBILITY_LEVELS[0],
  );

  // 대학 검색
  const [univSearchQuery, setUnivSearchQuery] = useState("");
  const [selectedUnivItem, setSelectedUnivItem] = useState<IUnivLevel | null>(null);
  const [isUnivDropdownOpen, setIsUnivDropdownOpen] = useState(false);

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
      const matchedLevel = UNIVERSITY_COMPATIBILITY_LEVELS.find(
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
        <h3 className="text-lg font-medium">계열 적합성 진단</h3>
        <p className="text-sm text-muted-foreground">
          내 생기부의 데이터를 분석하여 계열별 적합도를 진단하는 서비스입니다.
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : !schoolRecords || schoolRecords.isEmpty ? (
        <RequireSchoolRecordMessage />
      ) : (
        <div className="">
          <div className="space-y-2 py-4 pt-12">
            <p className="text-center text-lg font-semibold">
              목표 계열을 선택해주세요!
            </p>
            <p className="text-center text-sm">
              내 생기부가 선택한 계열에 적합한지 확인해요.
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
                      
                      if (val.trim()) {
                        setIsUnivDropdownOpen(true);
                        // 정확히 일치하는 대학이 있는지 확인
                        const exactMatch = universities.find(
                          (u) => u.univName === val.trim()
                        );
                        if (exactMatch) {
                          setSelectedUnivItem(exactMatch);
                          setIsUnivDropdownOpen(false);
                        } else {
                          setSelectedUnivItem(null);
                        }
                      } else {
                        setIsUnivDropdownOpen(false);
                        setSelectedUnivItem(null);
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
                {selectedUnivItem && (
                  <p className="text-center text-sm text-primary font-medium">
                    ✅ {selectedUnivItem.univName} (Lv{selectedUnivItem.univLevel} · {selectedUnivItem.region})
                  </p>
                )}
              </div>

              {/* 대학 레벨 선택 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  또는 대학 레벨 선택
                </p>
                <div className="flex flex-wrap gap-2">
                  {UNIVERSITY_COMPATIBILITY_LEVELS.map((n, idx) => {
                    return (
                      <Button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedUniv(n);
                          setSelectedUnivItem(null);
                          setUnivSearchQuery("");
                        }}
                        variant={
                          n.level === selectedUniv.level && !selectedUnivItem
                            ? "default"
                            : "outline"
                        }
                      >
                        Lv{n.level} - {n.text}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <MyCompatibility
                selectedSeries={selectedSeries}
                selectedUniv={selectedUniv}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
