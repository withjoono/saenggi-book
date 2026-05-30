import { createLazyFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Tags,
  Search,
  Link2,
  Highlighter,
  ListFilter,
  FileSearch,
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

export const Route = createLazyFileRoute("/promo/setuk")({
  component: PromoSetukPage,
});

function PromoSetukPage() {
  return (
    <main>
      <PromoHero
        badge="세특 관리"
        Icon={BookOpen}
        title="세부능력 및 특기사항,"
        highlight="과목 너머로"
        body="세특(세부능력 및 특기사항)을 과목별·키워드별·계열별로 재구성합니다. 어떤 주제가 어떤 활동과 이어지는지 한눈에 보이는 토픽 그래프까지."
        primaryHref="/sb/dashboard"
        primaryLabel="세특 보러 가기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="세특 관리, 이런 게 다 됩니다"
        subtitle="긴 텍스트 덩어리에서 의미 있는 패턴을 뽑아냅니다."
      >
        <FeatureGrid
          items={[
            {
              icon: Tags,
              title: "키워드 자동 추출",
              body: "각 과목 세특에서 활동·개념·주제 키워드를 자동 추출",
            },
            {
              icon: Link2,
              title: "토픽 그래프",
              body: "관련 키워드끼리 연결된 그래프로 학생부 서사를 시각화",
            },
            {
              icon: Search,
              title: "전 학년 검색",
              body: "키워드 한 번에 1~3학년 모든 세특·창체에서 동시 검색",
            },
            {
              icon: Highlighter,
              title: "강조 하이라이트",
              body: "지원 계열과 관련 있는 문구를 자동 강조 — 사정관 관점 시뮬레이션",
            },
            {
              icon: ListFilter,
              title: "과목·교사별 정리",
              body: "긴 줄글을 카드 단위로 잘라 과목·교사·학기로 필터링",
            },
            {
              icon: FileSearch,
              title: "활동 연계",
              body: "세특 키워드를 창체(자율·동아리·진로)와 자동 매칭",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 세특 분석" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "생기부 입력",
                body: "PDF만 올리면 세특이 학기·과목별로 자동 카드화됩니다.",
              },
              {
                title: "키워드 확인",
                body: "추출된 키워드를 확인하고, 필요하면 직접 추가/제외 가능.",
              },
              {
                title: "토픽 그래프 탐색",
                body: "키워드 간 연결을 그래프로 보면서 본인 학생부의 핵심 서사를 발견.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "과목별 세특 카드화",
              "활동·개념·주제 키워드 자동 추출",
              "키워드 토픽 그래프 시각화",
              "전 학년 통합 키워드 검색",
              "지원 계열 관련 문구 자동 하이라이트",
              "교사·학기 필터링",
              "세특 ↔ 창체 활동 자동 연계",
              "키워드 직접 추가·제외",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="세특이 길수록, 정리는 짧아야 합니다"
        body="생기북은 흩어진 세특을 한 장의 지도로 그려줍니다."
        primaryHref="/sb/dashboard"
        primaryLabel="세특 관리 시작"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="거북스쿨 Hub"
      />
    </main>
  );
}
