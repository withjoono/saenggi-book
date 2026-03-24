import { Button } from "@/components/custom/button";
import { Card } from "@/components/ui/card";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/evaluation/")({
  component: EvaluationIntro,
});

function EvaluationIntro() {
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-20 px-4 py-12 pb-8 md:px-8">
      {/* 계열 적합성 진단 */}
      <div className="flex flex-col items-center justify-between gap-x-12 gap-y-4 md:flex-row">
        <div className="flex w-full flex-col space-y-8 lg:w-6/12">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <h2 className="font-heading scroll-m-20 border-l-4 border-primary pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                계열 적합성 진단
              </h2>
              <h3>
                <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                  내 생기부의 계열 유불리를 판단하는 서비스
                </span>
              </h3>
            </div>
            <p>
              국내 최고의 대학들이 계열마다 지정한 필수/장려 과목에 따라 내
              이수현황과 성적의 위험도를 측정하는{" "}
              <b className="text-primary">무료 서비스</b>
              입니다.
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
                  to="/evaluation/compatibility"
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
            alt="intro_evaluation_1"
            loading="lazy"
            width="626"
            height="683"
            decoding="async"
            data-nimg="1"
            className="rounded-2xl"
            src="/images/intro-evaluation-1.png"
          />
        </Card>
      </div>

      {/* 사정관 평가 서비스 */}
      <div className="flex flex-col-reverse items-center justify-between gap-x-12 gap-y-4 md:flex-row">
        <Card className="flex w-full p-4 lg:w-6/12">
          <img
            alt="intro_evaluation_2"
            loading="lazy"
            width="626"
            height="683"
            decoding="async"
            data-nimg="1"
            className="rounded-2xl"
            src="/images/intro-evaluation-2.png"
          />
        </Card>
        <div className="flex w-full flex-col space-y-8 lg:w-6/12">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <h2 className="font-heading scroll-m-20 border-l-4 border-primary pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                사정관 평가 서비스
              </h2>
              <h3>
                <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                  [국내 유일] 전직 입사관 생기부 평가 서비스
                </span>
              </h3>
            </div>
            <p>
              AI가 아닌 실제 평가자가 생기부를 평가하고 점수 및 꼼꼼한 주석을
              통해 나에게 맞는 입시 전략을 세우는{" "}
              <b className="text-red-500">유료 서비스</b> 입니다. 해당 평가는{" "}
              <Link to="/ms/comprehensive" className="text-blue-500">
                학종 탐색
              </Link>
              과 연계되어 각 대학별 평가요소에 따른 점수를 예측하는데
              사용됩니다.
            </p>
            <p className="text-foreground/80">
              서비스를 이용하려면{" "}
              <Link to="/users/school-record" className="text-blue-500">
                마이페이지
              </Link>
              에서 생기부 입력이 필요합니다.
            </p>
            <div>
              <Button type="button">
                <Link
                  className="flex h-full w-full items-center transition-transform duration-500 ease-out"
                  to="/evaluation/request"
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

      {/* 자가 평가 */}
      <div className="flex flex-col items-center justify-between gap-x-12 gap-y-4 md:flex-row">
        <div className="flex w-full flex-col space-y-8 lg:w-6/12">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <h2 className="font-heading scroll-m-20 border-l-4 border-primary pb-2 pl-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                생기부 자가 평가
              </h2>
              <h3>
                <span className="flex flex-col space-y-1 bg-gradient-to-br bg-clip-text text-xl font-normal text-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-400 dark:text-transparent lg:text-2xl">
                  내 생기부를 자가 평가하는 서비스
                </span>
              </h3>
            </div>
            <p>
              학종 탐색을 위해 내 생기부의 점수를 자가 평가하는{" "}
              <b className="text-primary">무료 서비스</b>
              입니다. 근처에 생기부를 평가해 줄 선생님이 계시거나 스스로 내
              생기부를 평가합니다.
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
                  to="/evaluation/self"
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
            alt="intro_evaluation_3"
            loading="lazy"
            width="626"
            height="683"
            decoding="async"
            data-nimg="1"
            className="rounded-2xl"
            src="/images/intro-evaluation-3.png"
          />
        </Card>
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
    title: "계열 적합성 진단에서 필수/장려 과목이 안 나와요",
    body: "계열 적합성은 합/불 여부에 영향이 많이 가는 계열을 위한 것이라 필수/장려 과목이 없는 경우도 많습니다.",
  },
  {
    title: "사정관 평가는 며칠 정도 소요되나요?",
    body: "보통 대기자 수에 따라 1~3일 정도 소요됩니다.",
  },
  {
    title:
      "학종 탐색 서비스를 이용할 때 자가 평가/사정관 평가의 차이가 있나요?",
    body: "학종 탐색 서비스를 이용하는 데 차이는 없지만 주관적으로 평가하는 자가 평가의 경우 정확도가 많이 떨어지기 때문에 참고용으로 보는 것이 맞습니다.",
  },
  {
    title: "사정관 평가 후 계열을 변경할 수 있나요?",
    body: "자가 평가와 달리 사정관 평가는 평가자 선생님이 해당 계열을 기준으로 많은 자료와 합/불 여부 등을 꼼꼼하게 참고하여 평가하기 때문에 다른 계열로 평가받고 싶다면 다시 신청해야 하니 신중하게 결정해 주세요.",
  },
];
