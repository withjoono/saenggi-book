import { createLazyFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  BookCheck,
  ScrollText,
  FileQuestion,
  Heart,
  Building2,
  Filter,
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

export const Route = createLazyFileRoute("/promo/explore")({
  component: PromoExplorePage,
});

function PromoExplorePage() {
  return (
    <main>
      <PromoHero
        badge="전형 탐색"
        Icon={GraduationCap}
        title="교과·학종·논술,"
        highlight="모두 한 곳에"
        body="교과 전형, 학생부종합 전형, 논술 전형의 대학·학과별 조건을 한 화면에서 비교하세요. 내 생기부와 자동으로 매칭됩니다."
        primaryHref="/sb/dashboard"
        primaryLabel="전형 탐색 시작"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="전형 탐색, 이런 게 다 됩니다"
        subtitle="대학별·전형별 조건을 따로 검색할 필요 없습니다."
      >
        <FeatureGrid
          items={[
            {
              icon: BookCheck,
              title: "교과 전형",
              body: "대학별 반영 교과·등급 컷·최저 학력 기준을 표로 비교",
            },
            {
              icon: ScrollText,
              title: "학종 전형",
              body: "내 생기부 데이터와 학종 평가요소를 자동 매칭",
            },
            {
              icon: FileQuestion,
              title: "논술 전형",
              body: "수능 최저·논술 비중·기출 경향을 학과별로 정리",
            },
            {
              icon: Filter,
              title: "조건 매칭",
              body: "내 등급/세특/활동에 맞는 전형만 자동 필터링",
            },
            {
              icon: Heart,
              title: "관심 대학 저장",
              body: "관심 학과 모아두고 6번 카드(수시 6장)로 시뮬레이션",
            },
            {
              icon: Building2,
              title: "모의지원",
              body: "안정·적정·소신·도전으로 분류해 합격 가능성 시각화",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 전형 탐색" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "관심 계열 선택",
                body: "계열 적합성 진단 결과에서 바로 이어가거나, 직접 계열·학과를 선택.",
              },
              {
                title: "전형 자동 매칭",
                body: "내 등급·세특·활동을 기준으로 교과·학종·논술 전형이 자동 필터링됩니다.",
              },
              {
                title: "6장 시뮬레이션",
                body: "관심 학과를 저장하고 수시 6장 카드를 안정/적정/도전으로 배치.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "교과 전형 대학별 비교",
              "학종 전형 평가요소 매칭",
              "논술 전형 기출·최저 정리",
              "수능 최저 학력 기준 조회",
              "내 조건에 맞는 전형 자동 필터",
              "관심 대학·학과 저장",
              "수시 6장 카드 시뮬레이션",
              "안정·적정·소신·도전 분류 시각화",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="전형은 따로 검색하지 마세요"
        body="생기북이 내 생기부에 맞는 전형만 골라서 보여줍니다."
        primaryHref="/sb/dashboard"
        primaryLabel="전형 탐색 시작"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="거북스쿨 Hub"
      />
    </main>
  );
}
