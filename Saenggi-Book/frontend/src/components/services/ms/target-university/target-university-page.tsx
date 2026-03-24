import { useState, useMemo, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Layers, Search, X, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/custom/button";
import {
    useGetExploreSearchUniversity,
    useGetAllUniversities,
    useGetExploreSearchRecruitmentUnit,
} from "@/stores/server/features/explore/search/queries";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import {
    IExploreSearchUniversityResponse,
    IExploreSearchRecruitmentUnitResponse,
} from "@/stores/server/features/explore/search/interfaces";

/* ─────────────────────────────────────────────
 * 선택된 모집단위 아이템 타입
 * ───────────────────────────────────────────── */
export interface ISelectedRecruitmentUnit {
    id: number;
    name: string;
    universityName: string;
    universityRegion: string;
    admissionName?: string;
    fieldName?: string;
}

/* ─────────────────────────────────────────────
 * 메인 페이지
 * ───────────────────────────────────────────── */
export const TargetUniversityPage = () => {
    const [selectedUnits, setSelectedUnits] = useState<ISelectedRecruitmentUnit[]>([]);

    const handleAddUnit = useCallback(
        (unit: ISelectedRecruitmentUnit) => {
            setSelectedUnits((prev) => {
                if (prev.some((u) => u.id === unit.id)) return prev;
                return [...prev, unit];
            });
        },
        [],
    );

    const handleRemoveUnit = useCallback((id: number) => {
        setSelectedUnits((prev) => prev.filter((u) => u.id !== id));
    }, []);

    const handleAddUnits = useCallback(
        (units: ISelectedRecruitmentUnit[]) => {
            setSelectedUnits((prev) => {
                const existingIds = new Set(prev.map((u) => u.id));
                const newUnits = units.filter((u) => !existingIds.has(u.id));
                return [...prev, ...newUnits];
            });
        },
        [],
    );

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    🎯 목표대학 설정
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    목표 대학을 직접 검색하거나, 관심 계열로 한번에 찾아보세요
                </p>
            </div>

            {/* 탭 영역 */}
            <Tabs defaultValue="university" className="w-full">
                <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="university" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        목표 대학
                    </TabsTrigger>
                    <TabsTrigger value="field" className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        목표 계열
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="university" className="mt-6">
                    <UniversityTab
                        selectedUnits={selectedUnits}
                        onAddUnit={handleAddUnit}
                        onRemoveUnit={handleRemoveUnit}
                    />
                </TabsContent>
                <TabsContent value="field" className="mt-6">
                    <FieldTab
                        selectedUnits={selectedUnits}
                        onAddUnits={handleAddUnits}
                        onRemoveUnit={handleRemoveUnit}
                    />
                </TabsContent>
            </Tabs>

            {/* 선택된 목록 */}
            {selectedUnits.length > 0 && (
                <SelectedUnitsSummary
                    units={selectedUnits}
                    onRemove={handleRemoveUnit}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
 * 탭 1: 목표 대학
 * ───────────────────────────────────────────── */
const UniversityTab = ({
    selectedUnits,
    onAddUnit,
    onRemoveUnit,
}: {
    selectedUnits: ISelectedRecruitmentUnit[];
    onAddUnit: (u: ISelectedRecruitmentUnit) => void;
    onRemoveUnit: (id: number) => void;
}) => {
    const [uniSearch, setUniSearch] = useState("");
    const [debouncedUniSearch, setDebouncedUniSearch] = useState("");
    const [selectedUni, setSelectedUni] = useState<{
        id: number;
        name: string;
        region: string;
    } | null>(null);
    const [unitSearch, setUnitSearch] = useState("");

    // 대학 목록 (전체)
    const { data: allUniversities } = useGetAllUniversities();

    // debounce 대학검색
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedUniSearch(uniSearch), 300);
        return () => clearTimeout(timer);
    }, [uniSearch]);

    // 대학 autocomplete 필터
    const filteredUniversities = useMemo(() => {
        if (!debouncedUniSearch || debouncedUniSearch.length < 1) return [];
        return (allUniversities || [])
            .filter((u) =>
                u.name.toLowerCase().includes(debouncedUniSearch.toLowerCase()),
            )
            .slice(0, 20);
    }, [allUniversities, debouncedUniSearch]);

    // 선택한 대학의 상세정보 (admissions + recruitment_units)
    const { data: universityDetail, isLoading: isDetailLoading } =
        useGetExploreSearchUniversity({
            name: selectedUni?.name || "",
        });

    // 해당 대학의 모집단위들
    const recruitmentUnits = useMemo(() => {
        if (!universityDetail || universityDetail.length === 0) return [];
        const uni = universityDetail[0];
        const units: {
            id: number;
            name: string;
            admissionName: string;
            fieldName: string;
        }[] = [];

        uni.admissions?.forEach((adm) => {
            adm.recruitment_units?.forEach((ru) => {
                units.push({
                    id: ru.id,
                    name: ru.name,
                    admissionName: adm.name,
                    fieldName: ru.general_field?.name || "",
                });
            });
        });

        // 모집단위 검색 필터
        if (unitSearch) {
            return units.filter((u) =>
                u.name.toLowerCase().includes(unitSearch.toLowerCase()),
            );
        }
        return units;
    }, [universityDetail, unitSearch]);

    const handleSelectUniversity = (uni: {
        id: number;
        name: string;
        region: string;
    }) => {
        setSelectedUni(uni);
        setUniSearch(uni.name);
        setDebouncedUniSearch(""); // 자동완성 닫기
        setUnitSearch("");
    };

    return (
        <div className="space-y-6">
            {/* Step 1: 대학 검색 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        1
                    </span>
                    대학 검색
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={uniSearch}
                        onChange={(e) => {
                            setUniSearch(e.target.value);
                            setSelectedUni(null);
                        }}
                        placeholder="대학명을 입력하세요 (예: 서울대학교)"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                    {uniSearch && (
                        <button
                            onClick={() => {
                                setUniSearch("");
                                setSelectedUni(null);
                                setDebouncedUniSearch("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* 자동완성 드롭다운 */}
                    {filteredUniversities.length > 0 && !selectedUni && (
                        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {filteredUniversities.map((uni) => (
                                <button
                                    key={uni.id}
                                    onClick={() => handleSelectUniversity(uni)}
                                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-primary/5"
                                >
                                    <span className="font-medium text-gray-800">{uni.name}</span>
                                    <span className="text-xs text-gray-400">{uni.region}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Step 2: 모집단위 선택 */}
            {selectedUni && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                            2
                        </span>
                        모집단위 선택
                        <span className="ml-auto text-xs text-gray-400">
                            {selectedUni.name} ({selectedUni.region})
                        </span>
                    </h3>

                    {/* 모집단위 검색 입력 */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={unitSearch}
                            onChange={(e) => setUnitSearch(e.target.value)}
                            placeholder="모집단위명을 검색하세요 (예: 의학)"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {isDetailLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-gray-500">불러오는 중...</span>
                        </div>
                    ) : recruitmentUnits.length > 0 ? (
                        <div className="max-h-96 space-y-1 overflow-y-auto">
                            {recruitmentUnits.map((ru) => {
                                const isSelected = selectedUnits.some((u) => u.id === ru.id);
                                return (
                                    <button
                                        key={ru.id}
                                        onClick={() =>
                                            isSelected
                                                ? onRemoveUnit(ru.id)
                                                : onAddUnit({
                                                    id: ru.id,
                                                    name: ru.name,
                                                    universityName: selectedUni.name,
                                                    universityRegion: selectedUni.region,
                                                    admissionName: ru.admissionName,
                                                    fieldName: ru.fieldName,
                                                })
                                        }
                                        className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-all ${isSelected
                                                ? "border border-primary/30 bg-primary/5 text-primary"
                                                : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{ru.name}</span>
                                            <span className="text-xs text-gray-400">
                                                {ru.admissionName}
                                                {ru.fieldName && ` · ${ru.fieldName}`}
                                            </span>
                                        </div>
                                        {isSelected ? (
                                            <Check className="h-4 w-4 text-primary" />
                                        ) : (
                                            <span className="text-xs text-gray-300">선택</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="py-6 text-center text-sm text-gray-400">
                            모집단위가 없습니다
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
 * 탭 2: 목표 계열
 * ───────────────────────────────────────────── */
const FieldTab = ({
    selectedUnits,
    onAddUnits,
    onRemoveUnit,
}: {
    selectedUnits: ISelectedRecruitmentUnit[];
    onAddUnits: (units: ISelectedRecruitmentUnit[]) => void;
    onRemoveUnit: (id: number) => void;
}) => {
    const [fieldSearch, setFieldSearch] = useState("");
    const [debouncedFieldSearch, setDebouncedFieldSearch] = useState("");
    const [expandedUni, setExpandedUni] = useState<string | null>(null);

    const { data: staticData } = useGetStaticData();

    // debounce 검색
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedFieldSearch(fieldSearch), 300);
        return () => clearTimeout(timer);
    }, [fieldSearch]);

    // 계열 검색: 입력어로 모집단위 검색 (API)
    const { data: searchResults, isLoading: isSearching } =
        useGetExploreSearchRecruitmentUnit({
            name: debouncedFieldSearch,
        });

    // 계열 매칭: 입력어가 소계열/중계열에 해당하면 해당 모집단위들을 그룹화
    // 예: "의대" → 의학 관련 소계열의 모든 모집단위
    const matchedFieldResults = useMemo(() => {
        if (!staticData || !debouncedFieldSearch) return null;

        const searchLower = debouncedFieldSearch.toLowerCase();

        // 1. 소계열에서 매칭
        const matchedMinorIds: number[] = [];
        Object.values(staticData.fields.MINOR_FIELDS).forEach((minor) => {
            if (minor.name.toLowerCase().includes(searchLower)) {
                matchedMinorIds.push(minor.id);
            }
        });

        // 2. 중계열에서 매칭 → 중계열의 모든 소계열 포함
        Object.values(staticData.fields.MID_FIELDS).forEach((mid) => {
            if (mid.name.toLowerCase().includes(searchLower)) {
                mid.minorFieldIds.forEach((id) => {
                    if (!matchedMinorIds.includes(id)) matchedMinorIds.push(id);
                });
            }
        });

        // 3. 대계열에서 매칭 → 대계열의 모든 중→소계열 포함
        Object.values(staticData.fields.MAJOR_FIELDS).forEach((major) => {
            if (major.name.toLowerCase().includes(searchLower)) {
                major.midFieldIds.forEach((midId) => {
                    const mid = staticData.fields.MID_FIELDS[midId];
                    if (mid) {
                        mid.minorFieldIds.forEach((minorId) => {
                            if (!matchedMinorIds.includes(minorId))
                                matchedMinorIds.push(minorId);
                        });
                    }
                });
            }
        });

        return matchedMinorIds.length > 0 ? matchedMinorIds : null;
    }, [staticData, debouncedFieldSearch]);

    // 검색 결과를 대학별로 그룹화
    const groupedByUniversity = useMemo(() => {
        if (!searchResults || searchResults.length === 0) return {};

        let filtered = searchResults;

        // 계열 매칭이 있으면 해당 소계열의 모집단위만 필터
        if (matchedFieldResults) {
            filtered = searchResults.filter(
                (ru) =>
                    ru.minor_field && matchedFieldResults.includes(ru.minor_field.id),
            );
        }

        const grouped: Record<
            string,
            {
                universityName: string;
                universityRegion: string;
                units: IExploreSearchRecruitmentUnitResponse[];
            }
        > = {};

        filtered.forEach((ru) => {
            const uniName = ru.admission?.university?.name || "알 수 없음";
            const uniRegion = ru.admission?.university?.region || "";
            const key = `${uniName}-${uniRegion}`;
            if (!grouped[key]) {
                grouped[key] = {
                    universityName: uniName,
                    universityRegion: uniRegion,
                    units: [],
                };
            }
            grouped[key].units.push(ru);
        });

        return grouped;
    }, [searchResults, matchedFieldResults]);

    const groupEntries = Object.entries(groupedByUniversity);

    const handleSelectAllForUni = (
        key: string,
        uniGroup: {
            universityName: string;
            universityRegion: string;
            units: IExploreSearchRecruitmentUnitResponse[];
        },
    ) => {
        const unitsToAdd: ISelectedRecruitmentUnit[] = uniGroup.units.map(
            (ru) => ({
                id: ru.id,
                name: ru.name,
                universityName: uniGroup.universityName,
                universityRegion: uniGroup.universityRegion,
                admissionName: ru.admission?.name,
                fieldName: ru.general_field?.name || "",
            }),
        );
        onAddUnits(unitsToAdd);
    };

    return (
        <div className="space-y-6">
            {/* 계열 검색 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        1
                    </span>
                    계열 검색
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={fieldSearch}
                        onChange={(e) => setFieldSearch(e.target.value)}
                        placeholder="검색어를 입력하세요 (예: 의대, 약학, 컴퓨터공학)"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                    {fieldSearch && (
                        <button
                            onClick={() => {
                                setFieldSearch("");
                                setDebouncedFieldSearch("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {debouncedFieldSearch && matchedFieldResults && (
                    <p className="mt-2 text-xs text-primary">
                        ✨ 관련 계열이 발견되었습니다 — 해당 계열의 모집단위를 표시합니다
                    </p>
                )}
            </div>

            {/* 검색 결과 */}
            {isSearching && debouncedFieldSearch && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-gray-500">검색 중...</span>
                </div>
            )}

            {!isSearching && debouncedFieldSearch && groupEntries.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">
                    검색 결과가 없습니다
                </p>
            )}

            {groupEntries.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                2
                            </span>
                            검색 결과
                            <span className="text-xs font-normal text-gray-400">
                                ({groupEntries.length}개 대학)
                            </span>
                        </h3>
                    </div>

                    <div className="max-h-[600px] space-y-2 overflow-y-auto">
                        {groupEntries.map(([key, group]) => {
                            const isExpanded = expandedUni === key;
                            const allSelected = group.units.every((ru) =>
                                selectedUnits.some((u) => u.id === ru.id),
                            );

                            return (
                                <div
                                    key={key}
                                    className="rounded-lg border border-gray-100 bg-gray-50/50"
                                >
                                    {/* 대학 헤더 */}
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <button
                                            onClick={() =>
                                                setExpandedUni(isExpanded ? null : key)
                                            }
                                            className="flex flex-1 items-center gap-2 text-left"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span className="font-medium text-gray-800">
                                                {group.universityName}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({group.universityRegion})
                                            </span>
                                            <span className="ml-1 text-xs text-primary">
                                                {group.units.length}개 모집단위
                                            </span>
                                        </button>
                                        <Button
                                            size="sm"
                                            variant={allSelected ? "outline" : "default"}
                                            className="h-7 text-xs"
                                            onClick={() =>
                                                allSelected
                                                    ? group.units.forEach((ru) => onRemoveUnit(ru.id))
                                                    : handleSelectAllForUni(key, group)
                                            }
                                        >
                                            {allSelected ? "전체 해제" : "전체 선택"}
                                        </Button>
                                    </div>

                                    {/* 모집단위 목록 */}
                                    {isExpanded && (
                                        <div className="space-y-0.5 border-t border-gray-100 px-2 py-2">
                                            {group.units.map((ru) => {
                                                const isSelected = selectedUnits.some(
                                                    (u) => u.id === ru.id,
                                                );
                                                return (
                                                    <button
                                                        key={ru.id}
                                                        onClick={() =>
                                                            isSelected
                                                                ? onRemoveUnit(ru.id)
                                                                : onAddUnits([
                                                                    {
                                                                        id: ru.id,
                                                                        name: ru.name,
                                                                        universityName:
                                                                            group.universityName,
                                                                        universityRegion:
                                                                            group.universityRegion,
                                                                        admissionName: ru.admission?.name,
                                                                        fieldName:
                                                                            ru.general_field?.name || "",
                                                                    },
                                                                ])
                                                        }
                                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-all ${isSelected
                                                                ? "bg-primary/5 text-primary"
                                                                : "hover:bg-white"
                                                            }`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{ru.name}</span>
                                                            <span className="text-xs text-gray-400">
                                                                {ru.admission?.name}
                                                                {ru.general_field?.name &&
                                                                    ` · ${ru.general_field.name}`}
                                                            </span>
                                                        </div>
                                                        {isSelected && (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
 * 선택 요약 영역
 * ───────────────────────────────────────────── */
const SelectedUnitsSummary = ({
    units,
    onRemove,
}: {
    units: ISelectedRecruitmentUnit[];
    onRemove: (id: number) => void;
}) => {
    // 대학별 그룹화
    const grouped = useMemo(() => {
        const map: Record<string, ISelectedRecruitmentUnit[]> = {};
        units.forEach((u) => {
            const key = `${u.universityName} (${u.universityRegion})`;
            if (!map[key]) map[key] = [];
            map[key].push(u);
        });
        return map;
    }, [units]);

    return (
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
                    🎓 선택된 목표대학
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                        {units.length}
                    </span>
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => units.forEach((u) => onRemove(u.id))}
                >
                    전체 해제
                </Button>
            </div>

            <div className="space-y-3">
                {Object.entries(grouped).map(([uniLabel, uniUnits]) => (
                    <div key={uniLabel}>
                        <p className="mb-1 text-sm font-semibold text-gray-700">
                            {uniLabel}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {uniUnits.map((u) => (
                                <span
                                    key={u.id}
                                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-all hover:border-red-200 hover:bg-red-50"
                                >
                                    {u.name}
                                    <button
                                        onClick={() => onRemove(u.id)}
                                        className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
