import { Button } from "@/components/custom/button";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/analysis/")({
  component: AnalysisIntro,
});

function AnalysisIntro() {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-20 px-4 py-12 pb-8 md:px-8">
      {/* 교과 전형 탐색 */}
      <div className="flex flex-col items-center justify-between gap-x-12 gap-y-4 md:flex-row">
        <div className="flex w-full flex-col space-y-8 lg:w-6/12">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <h2 className="font-heading scroll-m-20 border-l-4 border-primary pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                수시/정시 지원전략
              </h2>
              <h3>
                <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                  선택한 수시 전형의 정시 전형이 존재하는지 확인하고 어떤게 더
                  유리한지 비교하는 서비스
                </span>
              </h3>
            </div>
            <p>
              내가 지원한 수시 전형이 정시로 지원했을때 더 유리한지 파악할 수
              있는 <b className="text-primary">무료 서비스</b>
              입니다. (학종 점수는{" "}
              <Link to="/evaluation/list" className="text-blue-500">
                사정관 평가
              </Link>{" "}
              or{" "}
              <Link to="/evaluation/self" className="text-blue-500">
                자가 평가
              </Link>{" "}
              필요)
            </p>
            <p className="text-foreground/80">
              서비스를 이용하려면{" "}
              <Link to="/users/school-record" className="text-blue-500">
                마이페이지
              </Link>
              에서 생기부 혹은 성적 입력이 필요합니다.
            </p>
            <div>
              <Button type="button">
                <Link
                  className="flex h-full w-full items-center transition-transform duration-500 ease-out"
                  to="/analysis/comparison"
                >
                  <span className="flex w-full flex-1 items-center justify-center">
                    <span className="flex items-center space-x-2">
                      <span>바로가기</span>
                    </span>
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <Card className="flex w-full p-4 lg:w-6/12">
          <img
            alt="intro-analysis-1"
            loading="lazy"
            width="626"
            height="683"
            decoding="async"
            data-nimg="1"
            className="rounded-2xl"
            src="/images/intro-analysis-1.png"
          />
        </Card>
      </div>

      {/* 성적 분석 */}
      <div className="flex flex-col-reverse items-center justify-between gap-x-12 gap-y-4 md:flex-row">
        <Card className="flex w-full p-4 lg:w-6/12">
          <img
            alt="intro_analysis_2"
            loading="lazy"
            width="626"
            height="683"
            decoding="async"
            data-nimg="1"
            className="rounded-2xl"
            src="/images/intro-analysis-2.png"
          />
        </Card>
        <div className="flex w-full flex-col space-y-8 lg:w-6/12">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <h2 className="font-heading scroll-m-20 border-l-4 border-primary pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                성적 분석
              </h2>
              <h3>
                <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                  내 생기부 성적을 한눈에 파악하고 각 과목별, 학년별 추이를
                  확인하는 서비스
                </span>
              </h3>
            </div>
            <p>
              각 과목 조합별 등급 평균, (공통/일반) 교과별 성적, 교과별 평균
              등급, 학년별 성적 추이, (진로선택) 교과별 성취도 등을 파악할 수
              있는
              <b className="text-primary">무료 서비스</b>입니다.
            </p>

            <p className="text-foreground/80">
              서비스를 이용하려면{" "}
              <Link to="/users/school-record" className="text-blue-500">
                마이페이지
              </Link>
              에서 생기부 혹은 성적 입력이 필요합니다.
            </p>
            <div>
              <Button type="button">
                <Link
                  className="flex h-full w-full items-center transition-transform duration-500 ease-out"
                  to="/analysis/performance"
                >
                  <span className="flex w-full flex-1 items-center justify-center">
                    <span className="flex items-center space-x-2">
                      <span>바로가기</span>
                    </span>
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="my-8 flex flex-col space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="font-heading scroll-m-20 text-4xl font-bold tracking-tight dark:text-white">
            FAQ
          </h1>
          <h2>
            <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
              자주 묻는 질문
            </span>
          </h2>
        </div>
        <div className="m-auto flex w-full max-w-xl items-center justify-center">
          <div className="flex w-full flex-col">
            {faqList.map((item, idx) => {
              return (
                <details
                  key={idx}
                  className="group border-b border-gray-100 px-2 py-4"
                >
                  <summary className="flex items-center justify-between hover:cursor-pointer">
                    <h2 className="cursor-pointer font-sans text-lg font-medium text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                      {item.title}
                    </h2>
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        data-slot="icon"
                        className="h-5 transition duration-300 group-open:-rotate-180"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        ></path>
                      </svg>
                    </div>
                  </summary>
                  <div className="flex flex-col space-y-2 py-1 text-gray-500 dark:text-gray-400">
                    {item.body}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqList = [
  {
    title: "내 점수가 계산식 오류로 나와요.",
    body: "매년 모집요강에 따라 계산식에 변동이 생기기 때문에 순차적으로 처리될 예정입니다.",
  },
  {
    title: "내 점수가 다르게 나오는 것 같아요",
    body: "성적은 문과/이과에 따라 변동이 있기 때문에 마이페이지(프로필 수정)에서 전공 여부를 체크하고 마이페이지(생기부 등록)에서 1, 2, 3학년 성적을 확인해 주세요.",
  },
  {
    title: "각 위험도는 어떤 기준으로 계산되나요?",
    body: "위험도는 10단계로 결격, 위험, 소신, 적정, 안전으로 평가됩니다. 각 위험도의 기준은 입결, 합불 데이터, 대학별 성적 계산식 등을 통해 전형별로 계산되기 때문에 상위 대학으로 갈수록 위험도 간격이 좁아지는 경향이 있습니다.",
  },
];
