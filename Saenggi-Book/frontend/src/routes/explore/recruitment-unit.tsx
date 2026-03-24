import { Button } from "@/components/custom/button";
import { Badge } from "@/components/ui/badge";
import { useGetExploreSearchRecruitmentUnit } from "@/stores/server/features/explore/search/queries";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type ISearchParams = {
  search: string;
};

export const Route = createFileRoute("/explore/recruitment-unit")({
  component: ExploreRecruitmentUnit,
  validateSearch: (search: Record<string, unknown>): ISearchParams => {
    return {
      search: (search.search as string) || "",
    };
  },
});

function ExploreRecruitmentUnit() {
  const search = Route.useSearch().search;
  const { data: recruitmentUnits } = useGetExploreSearchRecruitmentUnit({
    name: search,
  });

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(
    null,
  );
  const [highlightedUniversity, setHighlightedUniversity] = useState<
    string | null
  >(null);
  const [highlightedAdmission, setHighlightedAdmission] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (recruitmentUnits && recruitmentUnits.length > 0) {
      setSelectedYear(recruitmentUnits[0].admission.year);
      setSelectedCategory(recruitmentUnits[0].admission.category?.name || "");
    }
  }, [recruitmentUnits]);

  const years = [
    ...new Set(recruitmentUnits?.map((unit) => unit.admission.year) || []),
  ].sort((a, b) => b - a);
  const categories = [
    ...new Set(
      recruitmentUnits
        ?.filter((unit) => unit.admission.year === selectedYear)
        .map((unit) => unit.admission.category?.name)
        .filter(Boolean) as string[],
    ),
  ];

  const filteredUnits =
    recruitmentUnits?.filter(
      (unit) =>
        unit.admission.year === selectedYear &&
        (selectedCategory === "" ||
          unit.admission.category?.name === selectedCategory),
    ) || [];

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const categoriesForYear = [
      ...new Set(
        recruitmentUnits
          ?.filter((unit) => unit.admission.year === year)
          .map((unit) => unit.admission.category?.name)
          .filter(Boolean) as string[],
      ),
    ];
    setSelectedCategory(categoriesForYear[0] || "");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const toggleHighlight = (
    type: "region" | "university" | "admission",
    value: string,
  ) => {
    switch (type) {
      case "region":
        setHighlightedRegion(highlightedRegion === value ? null : value);
        break;
      case "university":
        setHighlightedUniversity(
          highlightedUniversity === value ? null : value,
        );
        break;
      case "admission":
        setHighlightedAdmission(highlightedAdmission === value ? null : value);
        break;
    }
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-8 px-4 py-20 pb-8">
      <div className="space-y-2">
        <h3 className="text-center text-3xl font-medium">
          <b className="text-primary">{search}</b> 학과 검색 결과 🌱
        </h3>
        <p className="text-center text-foreground/70">
          총 {recruitmentUnits?.length}개의 [ {search} ]를 발견했습니다!
        </p>
        <p className="text-center text-foreground/70">
          각 전형별 점수 예측 및 가장 유리한 전형을 찾고 싶다면{" "}
          <Link to="/susi" className="text-blue-500">
            사용 설명서
          </Link>
          를 참고해주세요
        </p>
      </div>
      {recruitmentUnits?.length ? (
        <>
          <div className="space-y-3">
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
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-wrap">
            <div className="flex items-center justify-center space-y-4 font-semibold text-primary">
              <span className="w-full max-w-[200px]">대학명</span>
              <span className="w-full max-w-[120px]">지역</span>
              <span className="w-full max-w-[80px]">모집인원</span>
              <span className="w-full max-w-[320px]">전형명</span>
            </div>
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-center space-y-4 text-base"
              >
                <span className="w-full max-w-[200px]">
                  <Badge
                    variant={
                      highlightedUniversity === unit.admission.university?.name
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                    onClick={() =>
                      toggleHighlight(
                        "university",
                        unit.admission.university?.name || "",
                      )
                    }
                  >
                    {unit.admission.university?.name}
                  </Badge>
                </span>
                <span className="w-full max-w-[120px]">
                  <Badge
                    variant={
                      highlightedRegion === unit.admission.university?.region
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                    onClick={() =>
                      toggleHighlight(
                        "region",
                        unit.admission.university?.region || "",
                      )
                    }
                  >
                    {unit.admission.university?.region}
                  </Badge>
                </span>
                <span className="line-clamp-1 w-full max-w-[80px]">
                  {unit.recruitment_number}
                </span>
                <span className="w-full max-w-[320px]">
                  <Badge
                    variant={
                      highlightedAdmission === unit.admission.name
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer text-sm hover:bg-primary hover:text-primary-foreground"
                    onClick={() =>
                      toggleHighlight("admission", unit.admission.name || "")
                    }
                  >
                    {unit.admission.name}
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-lg">검색 결과가 없어요 😢</p>
      )}
    </div>
  );
}

export default ExploreRecruitmentUnit;
