import { Button, buttonVariants } from "./custom/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGetStaticData } from "@/stores/server/features/static-data/queries";
import { SearchableDropdown } from "./custom/searchable-dropdown";
import { toast } from "sonner";

export const Hero = () => {
  const { data: staticData } = useGetStaticData();
  const navigate = useNavigate();
  const [universitySearch, setUniversitySearch] = useState("");
  const [recruitmentUnitSearch, setRecruitmentUnitSearch] = useState("");
  const [admissionSearch, setAdmissionSearch] = useState("");

  const handleUniversitySearch = (university: string | null) => {
    if (
      !staticData?.searchSuggestions.universityNames.includes(university || "")
    ) {
      toast.info("해당 대학은 존재하지 않아요 😭");
      return;
    }
    setUniversitySearch(university || "");
    navigate({
      to: "/explore/university",
      search: { search: university || "" },
    });
  };

  const handleRecruitmentUnitSearch = (recruitmentUnit: string | null) => {
    if (
      !staticData?.searchSuggestions.recruitmentUnitNames.includes(
        recruitmentUnit || "",
      )
    ) {
      toast.info("해당 전형은 존재하지 않아요 😭");
      return;
    }
    setRecruitmentUnitSearch(recruitmentUnit || "");
    navigate({
      to: "/explore/recruitment-unit",
      search: { search: recruitmentUnit || "" },
    });
  };

  const handleAdmissionSearch = (admission: string | null) => {
    if (
      !staticData?.searchSuggestions.admissionNames.includes(admission || "")
    ) {
      toast.info("해당 전형은 존재하지 않아요 😭");
      return;
    }
    setAdmissionSearch(admission || "");
    navigate({ to: "/explore/admission", search: { search: admission || "" } });
  };

  return (
    <section className="container grid place-items-center gap-10 py-20 md:py-32">
      <div className="w-full max-w-2xl space-y-6 text-center lg:text-start">
        <main className="space-y-4 text-5xl font-bold md:text-6xl">
          <h1 className="text-center">대학 전형 검색</h1>
        </main>

        <div>
          <p className="mx-auto text-center text-2xl text-muted-foreground lg:mx-0">
            수시 예측 서비스는 현재 진행 중!
          </p>
          <p className="mx-auto text-center text-lg text-muted-foreground lg:mx-0">
            (상단 수시 서비스 메뉴에서 절차대로 진행하세요)
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full space-y-2">
            {/* 대학 검색 */}
            <div className="flex items-center gap-2">
              <SearchableDropdown
                items={staticData?.searchSuggestions.universityNames || []}
                placeholder="대학 검색"
                onSelect={handleUniversitySearch}
                className="w-full"
              />
              <Button
                className="h-10"
                onClick={() => handleUniversitySearch(universitySearch)}
              >
                대학 검색하기
              </Button>
            </div>
            {/* 전형 검색 */}
            <div className="flex items-center gap-2">
              <SearchableDropdown
                items={staticData?.searchSuggestions.admissionNames || []}
                placeholder="전형 검색"
                onSelect={handleAdmissionSearch}
                className="w-full"
              />
              <Button
                className="h-10 bg-green-500 hover:bg-green-500/90"
                onClick={() => handleAdmissionSearch(admissionSearch)}
              >
                전형 검색하기
              </Button>
            </div>
            {/* 학과 검색 */}
            <div className="flex items-center gap-2">
              <SearchableDropdown
                items={staticData?.searchSuggestions.recruitmentUnitNames || []}
                placeholder="학과 검색"
                onSelect={handleRecruitmentUnitSearch}
                className="w-full"
              />
              <Button
                className="h-10 bg-red-500 hover:bg-red-500/90"
                onClick={() =>
                  handleRecruitmentUnitSearch(recruitmentUnitSearch)
                }
              >
                학과 검색하기
              </Button>
            </div>
          </div>
        </div>
        <div className="space-x-2 space-y-4 md:space-x-4 md:space-y-0">
          <Link
            to="/susi"
            className={`${buttonVariants({
              variant: "outline",
            })}`}
          >
            🧐 수시 서비스 사용방법
          </Link>

          <Link
            to="/evaluation"
            className={`${buttonVariants({
              variant: "outline",
            })}`}
          >
            🙋 사정관 평가 사용방법
          </Link>
        </div>
      </div>
    </section>
  );
};
