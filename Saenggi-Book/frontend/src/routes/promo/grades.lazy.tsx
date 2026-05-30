import { createLazyFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  Calculator,
  LineChart,
  Award,
  AlertTriangle,
  PieChart,
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

export const Route = createLazyFileRoute("/promo/grades")({
  component: PromoGradesPage,
});

function PromoGradesPage() {
  return (
    <main>
      <PromoHero
        badge="성적 분석"
        Icon={BarChart3}
        title="내신 등급, 한 화면에서"
        highlight="끝까지"
        body="학기별 등급 추이, 주요/탐구/예체능 가중 평균, 학년별 변동 — 학종에서 사정관이 본다는 핵심 지표를 같은 기준으로 자동 산출합니다."
        primaryHref="/sb/dashboard"
        primaryLabel="성적 분석 보기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="성적 분석, 이런 게 다 됩니다"
        subtitle="단순 평균이 아니라 학종 평가 관점의 지표로 변환합니다."
      >
        <FeatureGrid
          items={[
            {
              icon: Calculator,
              title: "가중 평균 등급",
              body: "이수단위 가중 · 주요 4과목 · 전 과목 · 사용자 정의 그룹별 계산",
            },
            {
              icon: TrendingUp,
              title: "학년·학기 트렌드",
              body: "학기별 등급 추이를 라인 차트로 시각화 · 상승/하락 자동 감지",
            },
            {
              icon: PieChart,
              title: "과목군 분석",
              body: "국어·수학·영어·탐구·예체능 그룹별 분포와 강·약점 파악",
            },
            {
              icon: LineChart,
              title: "원점수 분석",
              body: "원점수·표준편차·석차 등급을 함께 보여 절대평가/상대평가 비교",
            },
            {
              icon: Award,
              title: "강점 과목",
              body: "지속적으로 상위 등급을 받은 과목을 자동 강조 — 세특 연계 추천",
            },
            {
              icon: AlertTriangle,
              title: "약점 경보",
              body: "특정 학기 급락 · 특정 과목 정체를 색상으로 표시",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 내신 진단" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "생기부 업로드",
                body: "교과학습발달상황이 포함된 PDF 한 번 올리면 모든 등급/단위가 자동 추출.",
              },
              {
                title: "기준 선택",
                body: "전 과목 / 주요 4과목 / 사용자 정의 그룹 — 분석 기준을 자유롭게 선택.",
              },
              {
                title: "리포트 확인",
                body: "트렌드 · 강점 과목 · 약점 경보 · 학년 간 변동이 한 페이지에 정리됩니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "이수단위 가중 평균 등급 계산",
              "학기별 등급 트렌드 차트",
              "주요 4과목 · 전 과목 · 사용자 정의 그룹",
              "원점수 · 표준편차 · 석차 등급 비교",
              "과목군별 분포 시각화",
              "강점 과목 자동 추출",
              "급락/정체 경보",
              "학년 간 등급 변동 비교",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="등급은 계산기로 따로 두드리지 마세요"
        body="생기북이 같은 기준으로 자동 계산합니다. 분석에 쓰는 시간을 전략에 쓰세요."
        primaryHref="/sb/dashboard"
        primaryLabel="성적 분석 시작"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="거북스쿨 Hub"
      />
    </main>
  );
}
