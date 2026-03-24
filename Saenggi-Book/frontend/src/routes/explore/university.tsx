import { Button } from "@/components/custom/button";
import { Badge } from "@/components/ui/badge";
import { useGetExploreSearchUniversity } from "@/stores/server/features/explore/search/queries";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

type ISearchParams = {
  search: string;
};

export const Route = createFileRoute("/explore/university")({
  component: ExploreUniversity,
  validateSearch: (search: Record<string, unknown>): ISearchParams => {
    return {
      search: (search.search as string) || "",
    };
  },
});

export interface IExploreSearchUniversityResponse {
  id: number;
  name: string;
  region: string;
  code: string;
  establishment_type: string;
  admissions:
    | {
        id: number;
        name: string;
        year: number;
        basic_type: "일반" | "특별";
        category: {
          id: number;
          name: string;
        } | null;
        recruitment_units:
          | {
              code: string;
              general_field: {
                id: number;
                name: string;
              } | null;
              id: number;
              minor_field: {
                id: number;
                name: string;
                mid_field_id: number;
              } | null;
              name: string;
              recruitment_number: number;
            }[]
          | null;
      }[]
    | null;
}

function ExploreUniversity() {
  const search = Route.useSearch().search;
  const { data: universities } = useGetExploreSearchUniversity({
    name: search,
  });
  const { data: staticData } = useGetStaticData();
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] =
    useState<IExploreSearchUniversityResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");

  const [highlightedGeneralField, setHighlightedGeneralField] = useState<
    string | null
  >(null);
  const [highlightedMajorField, setHighlightedMajorField] = useState<
    string | null
  >(null);
  const [highlightedMidField, setHighlightedMidField] = useState<string | null>(
    null,
  );
  const [highlightedMinorField, setHighlightedMinorField] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (universities && universities.length > 0) {
      setSelectedRegion(universities[0].region);
      setSelectedUniversity(universities[0]);
      const years = [
        ...new Set(universities[0].admissions?.map((n) => n.year) || []),
      ].sort((a, b) => b - a);
      const initialYear = years[0] || 2025;
      setSelectedYear(initialYear);
      updateSelections(universities[0], initialYear);
    }
  }, [universities]);

  const updateSelections = (
    university: IExploreSearchUniversityResponse,
    year: number,
  ) => {
    const admissionsForYear =
      university?.admissions?.filter((n) => n.year === year) || [];
    const categories = [
      ...new Set(admissionsForYear.map((n) => n.category?.name)),
    ];
    const initialCategory = categories[0] || "";
    setSelectedCategory(initialCategory);

    const admissionsForCategory = admissionsForYear.filter(
      (n) => n.category?.name === initialCategory,
    );
    const initialAdmission = admissionsForCategory[0]?.name || "";
    setSelectedAdmission(initialAdmission);
  };

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    const universityInRegion = universities?.find(
      (u) => u.region === newRegion,
    );
    if (universityInRegion) {
      setSelectedUniversity(universityInRegion);
      updateSelections(universityInRegion, selectedYear);
    }
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    if (selectedUniversity) {
      updateSelections(selectedUniversity, newYear);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    const admissionsForCategory =
      selectedUniversity?.admissions?.filter(
        (n) => n.year === selectedYear && n.category?.name === newCategory,
      ) || [];
    setSelectedAdmission(admissionsForCategory[0]?.name || "");
  };

  const handleFieldHighlight = (
    fieldType: "general" | "major" | "mid" | "minor",
    fieldName: string,
  ) => {
    switch (fieldType) {
      case "general":
        setHighlightedGeneralField(
          highlightedGeneralField === fieldName ? null : fieldName,
        );
        setHighlightedMajorField(null);
        setHighlightedMidField(null);
        setHighlightedMinorField(null);
        break;
      case "major":
        setHighlightedMajorField(
          highlightedMajorField === fieldName ? null : fieldName,
        );
        setHighlightedMidField(null);
        setHighlightedMinorField(null);
        break;
      case "mid":
        setHighlightedMidField(
          highlightedMidField === fieldName ? null : fieldName,
        );
        setHighlightedMinorField(null);
        break;
      case "minor":
        setHighlightedMinorField(
          highlightedMinorField === fieldName ? null : fieldName,
        );
        break;
    }
  };

  const regions = [...new Set(universities?.map((u) => u.region) || [])];
  const years = [
    ...new Set(selectedUniversity?.admissions?.map((n) => n.year) || []),
  ].sort((a, b) => b - a);
  const categories = [
    ...new Set(
      selectedUniversity?.admissions
        ?.filter((n) => n.year === selectedYear)
        .map((n) => n.category?.name),
    ),
  ];
  const admissions =
    selectedUniversity?.admissions?.filter(
      (n) => n.year === selectedYear && n.category?.name === selectedCategory,
    ) || [];

  const totalAdmission =
    universities?.reduce((acc, n) => acc + (n.admissions?.length || 0), 0) || 0;

  const totalRecruitmentUnits = useMemo(
    () =>
      universities?.reduce(
        (acc, uni) =>
          acc +
          (uni.admissions?.reduce(
            (admAcc, adm) => admAcc + (adm.recruitment_units?.length || 0),
            0,
          ) || 0),
        0,
      ) || 0,
    [universities],
  );

  const filteredRecruitments =
    selectedUniversity?.admissions?.find(
      (n) =>
        n.category?.name === selectedCategory && n.name === selectedAdmission,
    )?.recruitment_units || [];

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-8 px-4 py-20 pb-8">
      <div className="space-y-2">
        <h3 className="text-center text-3xl font-medium">
          <b className="text-primary">{search}</b> 대학 검색 결과 🌏
        </h3>
        <p className="text-center text-foreground/70">
          총 {universities?.length || 0}개의 대학, {totalAdmission}개의 전형,{" "}
          {totalRecruitmentUnits}개의 모집단위를 발견했습니다!
        </p>
        <p className="text-center text-foreground/70">
          각 전형별 점수 예측 및 가장 유리한 전형을 찾고 싶다면{" "}
          <Link to="/susi" className="text-blue-500">
            사용 설명서
          </Link>
          를 참고해주세요
        </p>
      </div>
      {universities?.length ? (
        <>
          <div className="space-y-3">
            <p className="text-center text-sm text-foreground/80">지역 선택</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {regions.map((region) => (
                <Button
                  key={region}
                  variant={region === selectedRegion ? "default" : "outline"}
                  onClick={() => handleRegionChange(region)}
                >
                  {region}
                </Button>
              ))}
            </div>

            <p className="text-center text-sm text-foreground/80">년도 선택</p>
            <div className="flex items-center justify-center gap-2">
              {years.map((item) => (
                <Button
                  key={item}
                  variant={item === selectedYear ? "default" : "outline"}
                  onClick={() => handleYearChange(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-foreground/80">
              전형 유형 선택
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  variant={item === selectedCategory ? "default" : "outline"}
                  onClick={() => handleCategoryChange(item || "")}
                >
                  {item}
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-foreground/80">전형 선택</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {admissions.map((item) => (
                <Button
                  key={item.name}
                  variant={
                    item.name === selectedAdmission ? "default" : "outline"
                  }
                  onClick={() => setSelectedAdmission(item.name || "")}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-wrap">
            <div className="flex items-center justify-center space-y-4 font-semibold text-primary">
              <span className="w-full max-w-[320px]">모집단위</span>
              <span className="w-full max-w-[80px]">모집인원</span>
              <span className="hidden w-full max-w-[520px] md:block">계열</span>
            </div>
            {filteredRecruitments.map((item) => {
              const minor = item.minor_field;
              const mid = minor
                ? staticData?.fields.MID_FIELDS[minor.mid_field_id]
                : undefined;
              const major = mid
                ? staticData?.fields.MAJOR_FIELDS[mid.major_field_id]
                : undefined;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-center space-y-4 text-base"
                >
                  <span className="line-clamp-1 w-full max-w-[320px]">
                    {item.name}
                  </span>
                  <span className="line-clamp-1 w-full max-w-[80px]">
                    {item.recruitment_number}
                  </span>
                  <div className="hidden w-full max-w-[120px] md:block">
                    <Badge
                      variant={
                        highlightedGeneralField === item.general_field?.name
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleFieldHighlight(
                          "general",
                          item.general_field?.name || "",
                        )
                      }
                    >
                      {item.general_field?.name}
                    </Badge>
                  </div>
                  <div className="hidden w-full max-w-[400px] items-center gap-2 md:flex">
                    <Badge
                      variant={
                        highlightedMajorField === major?.name
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleFieldHighlight("major", major?.name || "")
                      }
                    >
                      {major?.name}
                    </Badge>
                    <Badge
                      variant={
                        highlightedMidField === mid?.name
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleFieldHighlight("mid", mid?.name || "")
                      }
                    >
                      {mid?.name}
                    </Badge>
                    <Badge
                      variant={
                        highlightedMinorField === minor?.name
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleFieldHighlight("minor", minor?.name || "")
                      }
                    >
                      {minor?.name}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-lg">검색 결과가 없어요 😢</p>
      )}
    </div>
  );
}

export default ExploreUniversity;
