import { createLazyFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Brain,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  Eye,
  UserCheck,
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

export const Route = createLazyFileRoute("/promo/evaluation")({
  component: PromoEvaluationPage,
});

function PromoEvaluationPage() {
  return (
    <main>
      <PromoHero
        badge="AI 사정관 평가"
        Icon={Sparkles}
        title="입학사정관의 눈으로"
        highlight="내 생기부를"
        body="학종 평가요소(학업역량·진로역량·공동체역량)를 기준으로 AI가 생기부를 분석합니다. 강점 문장은 강조하고, 보완할 영역은 구체적인 액션으로 제안합니다."
        primaryHref="/sb/dashboard"
        primaryLabel="AI 평가 받기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="AI 사정관 평가, 이런 게 다 됩니다"
        subtitle="감(感)이 아니라 평가요소 기준으로."
      >
        <FeatureGrid
          items={[
            {
              icon: Brain,
              title: "학업역량 분석",
              body: "내신 추이·세특·탐구 활동을 종합한 학업역량 점수",
            },
            {
              icon: ClipboardCheck,
              title: "진로역량 분석",
              body: "진로 일관성·전공 적합성·심화 활동을 평가",
            },
            {
              icon: UserCheck,
              title: "공동체역량 분석",
              body: "협력·나눔·리더십·규칙 준수 등 정성 요소를 텍스트 근거로 평가",
            },
            {
              icon: Eye,
              title: "강점 자동 강조",
              body: "사정관이 주목할 만한 문장을 하이라이트로 표시",
            },
            {
              icon: MessageSquare,
              title: "개선 코멘트",
              body: "약한 영역은 구체적인 보완 활동을 액션 아이템으로 제시",
            },
            {
              icon: TrendingUp,
              title: "재평가 추적",
              body: "생기부가 누적될수록 영역별 점수 변화를 그래프로 추적",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 평가받기" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "생기부 + 지원 계열",
                body: "이미 업로드한 생기부 위에 지원 계열·관심 대학만 추가 선택.",
              },
              {
                title: "AI 사정관 분석",
                body: "학업·진로·공동체 3개 영역의 점수와 근거 문장을 추출합니다.",
              },
              {
                title: "개선 액션 받기",
                body: "약점 영역마다 구체적인 보완 활동·세특 방향을 액션 카드로 제공.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "학업역량 평가 점수",
              "진로역량 평가 점수",
              "공동체역량 평가 점수",
              "근거 문장 하이라이트",
              "약점 보완 액션 카드",
              "지원 계열별 맞춤 평가",
              "재평가·변화 추적 그래프",
              "전문 사정관 평가 요청 연계",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="제출 전에, 사정관 한 명 더 보세요"
        body="AI 사정관이 먼저 보고, 보완할 곳을 알려줍니다."
        primaryHref="/sb/dashboard"
        primaryLabel="AI 평가 받기"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="거북스쿨 Hub"
      />
    </main>
  );
}
