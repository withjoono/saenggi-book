import { Button } from "@/components/custom/button";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import YouTube from "react-youtube";

export const Route = createLazyFileRoute("/official/faq")({
  component: FAQPage,
});

function FAQPage() {
  const [tab, setTab] = useState(1);
  const opts = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
    },
  };
  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-8">
      <h2 className="pb-4 text-2xl font-semibold">FAQ</h2>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => setTab(1)}
          variant={tab === 1 ? "default" : "outline"}
        >
          생기부 다운로드 방법
        </Button>
        <Button
          type="button"
          onClick={() => setTab(2)}
          variant={tab === 2 ? "default" : "outline"}
        >
          사정관 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(3)}
          variant={tab === 3 ? "default" : "outline"}
        >
          수시 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(4)}
          variant={tab === 4 ? "default" : "outline"}
        >
          정시 서비스
        </Button>
        <Button
          type="button"
          onClick={() => setTab(5)}
          variant={tab === 5 ? "default" : "outline"}
        >
          분석 서비스
        </Button>
      </div>
      <div className="m-auto flex w-full max-w-xl items-center justify-center pt-14">
        {tab === 1 && (
          <div className="flex w-full flex-col items-center">
            <h3 className="mb-4 text-xl font-semibold">
              생기부 다운로드 방법 안내
            </h3>
            <div className="w-full max-w-[640px]">
              <YouTube videoId="LHQ9j-3hHxA" opts={opts} className="w-full" />
            </div>
            <p className="pb-8 pt-4 text-center text-gray-600">
              위 동영상을 참고하여 생기부를 다운로드해 주세요.
            </p>
            <ol className="list-decimal space-y-4 pl-5">
              <li className="font-semibold">
                앱 설치
                <p className="mt-1 font-normal">
                  휴대폰 앱 스토어에서 다음 두 앱을 설치합니다:
                </p>
                <ul className="mt-2 list-disc pl-5">
                  <li>정부 24 앱</li>
                  <li>디지털문서유통(전자문서지갑) 앱</li>
                </ul>
              </li>

              <li className="font-semibold">
                생활기록부 신청
                <p className="mt-1 font-normal">
                  정부 24 앱에서 생활기록부를 검색 후 신청합니다.
                </p>
                <div className="mt-2 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
                  <p className="font-bold">주의사항</p>
                  <p>
                    대입용이 아닌,{" "}
                    <span className="underline">
                      일반용(학교생활기록부 초중고)
                    </span>
                    으로 신청하세요.
                  </p>
                  <p>
                    출력 옵션을 <span className="font-bold">전자문서지갑</span>
                    으로 지정하세요.
                  </p>
                </div>
              </li>

              <li className="font-semibold">
                생활기록부 열기
                <p className="mt-1 font-normal">
                  전자문서지갑 앱에 담긴 생활기록부를 더블클릭하여 엽니다.
                </p>
              </li>

              <li className="font-semibold">
                생활기록부 저장
                <p className="mt-1 font-normal">
                  생활기록부 상단 오른쪽의 다운로드 버튼을 눌러 휴대폰에
                  저장합니다.
                </p>
              </li>

              <li className="font-semibold">
                T Skool에 업로드
                <p className="mt-1 font-normal">
                  다음 단계를 따라 T Skool에 업로드합니다:
                </p>
                <ol className="list-alpha mt-2 pl-5">
                  <li>
                    1. T Skool 오른쪽 상단의 마이페이지(본인 이름)를
                    클릭합니다.
                  </li>
                  <li>2. 하단 메뉴에서 '생기부/성적 입력' 메뉴를 찾습니다.</li>
                  <li>3. 다운받은 생활기록부 파일을 업로드합니다.</li>
                </ol>
              </li>
            </ol>
          </div>
        )}
        {tab === 2 && (
          <div className="flex w-full flex-col">
            {faqList_2.map((item, idx) => {
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
        )}
        {tab === 3 && (
          <div className="flex w-full flex-col">
            {faqList_3.map((item, idx) => {
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
        )}
        {tab === 4 && (
          <div className="flex w-full flex-col">
            {faqList_4.map((item, idx) => {
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
        )}
        {tab === 5 && (
          <div className="flex w-full flex-col">
            {faqList_5.map((item, idx) => {
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
        )}
      </div>
    </div>
  );
}

const faqList_2 = [
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

const faqList_3 = [
  {
    title: "전형 탐색 시 내 등급이 다르게 나와요.",
    body: "성적은 문과/이과에 따라 변동이 있기 때문에 마이페이지(프로필 수정)에서 전공 여부를 체크하고 마이페이지(생기부 등록)에서 1, 2, 3학년 성적을 확인해 주세요.",
  },
  {
    title: "생기부 평가 내역이 없으면 학종 탐색을 하지 못하나요?",
    body: "사용하지 못합니다. 하지만 무료 서비스인 자가 평가를 통해 여러 계열을 충분히 탐색한 뒤 하나의 계열을 정하여 사정관 평가를 진행하는 것을 추천드립니다.",
  },
  {
    title: "각 위험도는 어떤 기준으로 계산되나요?",
    body: "위험도는 10단계로 결격, 위험, 소신, 적정, 안전으로 평가됩니다. 각 위험도의 기준은 입결, 합불 데이터, 대학별 성적 계산식 등을 통해 전형별로 계산되기 때문에 상위 대학으로 갈수록 위험도 간격이 좁아지는 경향이 있습니다.",
  },
  {
    title: "학종 전형에서 다른 계열을 검색할 수 있나요?",
    body: "자가 평가의 계열을 변경하여 다른 계열을 탐색할 수 있습니다. (사정관 평가는 선택한 계열에 맞춤 평가되었기 때문에 변경할 수 없음)",
  },
];

const faqList_4 = [
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

const faqList_5 = [
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
