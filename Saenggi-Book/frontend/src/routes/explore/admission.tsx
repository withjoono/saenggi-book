import { Button } from "@/components/custom/button";
import { Badge } from "@/components/ui/badge";
import { useGetExploreSearchAdmission } from "@/stores/server/features/explore/search/queries";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type ISearchParams = {
  search: string;
};

export const Route = createFileRoute("/explore/admission")({
  component: ExploreAdmission,
  validateSearch: (search: Record<string, unknown>): ISearchParams => {
    return {
      search: (search.search as string) || "",
    };
  },
});

function ExploreAdmission() {
  const search = Route.useSearch().search;
  const { data: admissions } = useGetExploreSearchAdmission({ name: search });
  const { data: staticData } = useGetStaticData();

  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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
    if (admissions && admissions.length > 0) {
      setSelectedUniversity(admissions[0].university.name);
      setSelectedRegion(admissions[0].university.region);
      setSelectedYear(admissions[0].year);
      setSelectedCategory(admissions[0].category?.name || "");
    }
  }, [admissions]);

  const universities = [
    ...new Set(admissions?.map((a) => a.university.name) || []),
  ];
  const regions = [
    ...new Set(
      admissions
        ?.filter((a) => a.university.name === selectedUniversity)
        .map((a) => a.university.region) || [],
    ),
  ];
  const years = [
    ...new Set(
      admissions
        ?.filter(
          (a) =>
            a.university.name === selectedUniversity &&
            a.university.region === selectedRegion,
        )
        .map((a) => a.year) || [],
    ),
  ].sort((a, b) => b - a);
  const categories = [
    ...new Set(
      admissions
        ?.filter(
          (a) =>
            a.university.name === selectedUniversity &&
            a.university.region === selectedRegion &&
            a.year === selectedYear,
        )
        .map((a) => a.category?.name)
        .filter(Boolean) as string[],
    ),
  ];

  const filteredAdmissions = admissions?.filter(
    (a) =>
      a.university.name === selectedUniversity &&
      a.university.region === selectedRegion &&
      a.year === selectedYear &&
      a.category?.name === selectedCategory,
  );

  const filteredRecruitmentUnits = filteredAdmissions?.flatMap(
    (a) => a.recruitment_units || [],
  );

  const handleUniversityChange = (uni: string) => {
    setSelectedUniversity(uni);
    const regionsForUniversity = [
      ...new Set(
        admissions
          ?.filter((a) => a.university.name === uni)
          .map((a) => a.university.region) || [],
      ),
    ];
    setSelectedRegion(regionsForUniversity[0] || "");
    const yearsForUniversityAndRegion = [
      ...new Set(
        admissions
          ?.filter(
            (a) =>
              a.university.name === uni &&
              a.university.region === regionsForUniversity[0],
          )
          .map((a) => a.year) || [],
      ),
    ].sort((a, b) => b - a);
    setSelectedYear(yearsForUniversityAndRegion[0] || null);
    const categoriesForUniversityRegionAndYear = [
      ...new Set(
        admissions
          ?.filter(
            (a) =>
              a.university.name === uni &&
              a.university.region === regionsForUniversity[0] &&
              a.year === yearsForUniversityAndRegion[0],
          )
          .map((a) => a.category?.name)
          .filter(Boolean) as string[],
      ),
    ];
    setSelectedCategory(categoriesForUniversityRegionAndYear[0] || "");
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const yearsForUniversityAndRegion = [
      ...new Set(
        admissions
          ?.filter(
            (a) =>
              a.university.name === selectedUniversity &&
              a.university.region === region,
          )
          .map((a) => a.year) || [],
      ),
    ].sort((a, b) => b - a);
    setSelectedYear(yearsForUniversityAndRegion[0] || null);
    const categoriesForUniversityRegionAndYear = [
      ...new Set(
        admissions
          ?.filter(
            (a) =>
              a.university.name === selectedUniversity &&
              a.university.region === region &&
              a.year === yearsForUniversityAndRegion[0],
          )
          .map((a) => a.category?.name)
          .filter(Boolean) as string[],
      ),
    ];
    setSelectedCategory(categoriesForUniversityRegionAndYear[0] || "");
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const categoriesForYear = [
      ...new Set(
        admissions
          ?.filter(
            (a) =>
              a.university.name === selectedUniversity &&
              a.university.region === selectedRegion &&
              a.year === year,
          )
          .map((a) => a.category?.name)
          .filter(Boolean) as string[],
      ),
    ];
    setSelectedCategory(categoriesForYear[0] || "");
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

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-8 px-4 py-20 pb-8">
      <div className="space-y-2">
        <h3 className="text-center text-3xl font-medium">
          <b className="text-primary">{search}</b> 전형 검색 결과 🌳
        </h3>
        <p className="text-center text-foreground/70">
          총 {universities.length}개의 대학에 [ {search} ]를 발견했습니다!
        </p>
        <p className="text-center text-foreground/70">
          각 전형별 점수 예측 및 가장 유리한 전형을 찾고 싶다면{" "}
          <Link to="/susi" className="text-blue-500">
            사용 설명서
          </Link>
          를 참고해주세요
        </p>
      </div>
      {admissions?.length ? (
        <>
          <div className="space-y-3">
            <p className="text-center text-sm text-foreground/80">대학 선택</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {universities.map((uni) => (
                <Button
                  key={uni}
                  variant={uni === selectedUniversity ? "default" : "outline"}
                  onClick={() => handleUniversityChange(uni)}
                >
                  {uni}
                </Button>
              ))}
            </div>
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
              {years.map((year) => (
                <Button
                  key={year}
                  variant={year === selectedYear ? "default" : "outline"}
                  onClick={() => handleYearChange(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-foreground/80">
              전형 유형 선택
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    category === selectedCategory ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
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
            {filteredRecruitmentUnits?.map((item) => {
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
