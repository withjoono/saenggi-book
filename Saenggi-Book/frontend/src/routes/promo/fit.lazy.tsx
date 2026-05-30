import { createLazyFileRoute } from "@tanstack/react-router";
import {
  Target,
  Brain,
  Compass,
  Sparkles,
  Microscope,
  PenTool,
  Gauge,
  Wand2,
} from "lucide-react";
import {
  PromoHero,
  PromoSection,
  FeatureGrid,
  StepList,
  CheckList,
  FinalCTA,
} from "./_components";

export const Route = createLazyFileRoute("/promo/fit")({
  component: PromoFitPage,
});

function PromoFitPage() {
  return (
    <main>
      <PromoHero
        badge="계열 적합성 진단"
        Icon={Target}
        title="나에게 맞는 계열,"
        highlight="데이터로"
        body="진로희망·교과 성적 분포·세특 키워드·창체 활동 패턴을 AI가 종합해 인문/사회/자연/공학/의약/예체능 등 계열별 적합도와 추천 학과를 제시합니다."
        primaryHref="/sb/dashboard"
        primaryLabel="계열 진단 받기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="계열 적합성, 이렇게 진단합니다"
        subtitle="진로 막연함을 데이터로 좁힙니다."
      >
        <FeatureGrid
          items={[
            {
              icon: Brain,
              title: "AI 종합 분석",
              body: "성적·세특·활동·진로희망 4축을 동시에 학습한 모델이 적합도 산출",
            },
            {
              icon: Gauge,
              title: "계열별 점수",
              body: "인문/사회/자연/공학/의약/예체능 등 주요 계열별 0~100 적합도",
            },
            {
              icon: Compass,
              title: "추천 학과",
              body: "상위 적합 계열 안에서 본인 학생부와 매칭되는 학과 Top 10",
            },
            {
              icon: Microscope,
              title: "근거 시각화",
              body: "왜 이 계열이 적합한지 — 세특 문장·활동 기록까지 근거 제시",
            },
            {
              icon: PenTool,
              title: "보완 가이드",
              body: "적합도를 더 높이려면 어떤 활동·세특이 필요한지 액션 아이템",
            },
            {
              icon: Sparkles,
              title: "주기적 재진단",
              body: "학년이 올라가 생기부가 누적되면 재진단으로 변화를 추적",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 진단" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "생기부 업로드 + 진로희망 입력",
                body: "PDF 업로드만으로 대부분 자동 채워지고, 진로희망/관심 분야만 직접 선택.",
              },
              {
                title: "AI 종합 분석",
                body: "성적·세특·활동·진로 4축을 분석해 계열별 적합도와 근거 문장을 추출.",
              },
              {
                title: "전형 탐색으로 연결",
                body: "상위 적합 계열을 그대로 전형 탐색·관심 대학 추천 단계로 이어갑니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "AI 계열 적합성 점수 산출",
              "인문·사회·자연·공학·의약·예체능 분류",
              "추천 학과 Top 10",
              "세특·활동 기반 근거 문장 제시",
              "적합도 향상을 위한 보완 가이드",
              "학년별 재진단·변화 추적",
              "관심 학과 저장",
              "전형 탐색으로 원클릭 이동",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="진로희망 하나로 끝내지 마세요"
        body="생기북은 학생부 전체 데이터를 보고 계열 적합도를 판단합니다."
        primaryHref="/sb/dashboard"
        primaryLabel="계열 진단 받기"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="거북스쿨 Hub"
      />
    </main>
  );
}
