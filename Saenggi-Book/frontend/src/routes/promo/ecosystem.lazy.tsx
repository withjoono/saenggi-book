import { createLazyFileRoute } from "@tanstack/react-router";
import {
  Network,
  KeyRound,
  School,
  Calculator,
  ClipboardList,
  Trophy,
  Users,
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

export const Route = createLazyFileRoute("/promo/ecosystem")({
  component: PromoEcosystemPage,
});

const ECOSYSTEM = [
  {
    name: "Hub",
    desc: "통합 계정·SSO·일정",
    url: "https://www.tskool.kr",
  },
  {
    name: "Susi",
    desc: "수시 전형·합격 분석",
    url: "https://susi-front.web.app",
  },
  {
    name: "Jungsi",
    desc: "정시 합격 예측",
    url: "https://jungsi-front.web.app",
  },
  {
    name: "ExamHub",
    desc: "모의고사·시험 분석",
    url: "https://examhub.kr",
  },
  {
    name: "StudyPlanner",
    desc: "학습 플래너·시간 관리",
    url: "https://studyplanner.kr",
  },
  {
    name: "StudyArena",
    desc: "그룹 학습·랭킹",
    url: "https://studyarena-front-479305.web.app",
  },
];

function PromoEcosystemPage() {
  return (
    <main>
      <PromoHero
        badge="거북스쿨 생태계"
        Icon={Network}
        title="생기북은 혼자 작동하지"
        highlight="않습니다"
        body="생기북은 거북스쿨 생태계의 학종 허브입니다. Hub로 한 번 가입하면 생기북·수시·정시·모의고사·플래너가 같은 계정·같은 데이터로 이어집니다."
        primaryHref="https://www.tskool.kr"
        primaryLabel="Hub에서 가입하기"
        secondaryHref="/sb/dashboard"
        secondaryLabel="생기북 시작하기"
      />

      <PromoSection
        title="한 학생이 여섯 앱을 따로 쓰지 않습니다"
        subtitle="Hub가 인증·일정·계정을 묶고, 각 위성앱이 자기 영역을 담당합니다."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-olive-600 p-6 text-white sm:col-span-2 lg:col-span-1">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <School className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              현재 위치
            </p>
            <p className="mt-1 text-xl font-bold">생기북</p>
            <p className="mt-2 text-sm opacity-90">
              생기부 · 계열 진단 · 학종 전형 · AI 사정관
            </p>
          </div>
          {ECOSYSTEM.map((e) => (
            <a
              key={e.name}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-olive-200 hover:shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                위성앱
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 group-hover:text-olive-700">
                {e.name}
              </p>
              <p className="mt-2 text-sm text-gray-600">{e.desc}</p>
            </a>
          ))}
        </div>
      </PromoSection>

      <PromoSection
        title="연동되면 이런 게 자동입니다"
        tone="muted"
        subtitle="앱끼리 데이터를 옮길 필요가 없습니다."
      >
        <FeatureGrid
          items={[
            {
              icon: KeyRound,
              title: "Hub SSO 한 계정",
              body: "Hub에서 한 번 로그인하면 모든 위성앱에 자동 로그인",
            },
            {
              icon: ClipboardList,
              title: "생기부 → 학종 분석",
              body: "생기북에 올린 생기부가 Susi 학종 분석에서 그대로 활용",
            },
            {
              icon: Calculator,
              title: "모의고사 → 정시 예측",
              body: "ExamHub 모의고사 결과가 Jungsi 정시 합격 예측으로 연결",
            },
            {
              icon: Trophy,
              title: "학습 데이터 통합",
              body: "StudyPlanner·StudyArena의 학습 시간이 생기북 활동 데이터로 누적",
            },
            {
              icon: Users,
              title: "마이클래스 공유",
              body: "Hub의 학습 그룹 멤버십이 모든 앱에 공통 적용",
            },
            {
              icon: Network,
              title: "데이터 일관성",
              body: "한 계정 · 한 진실의 소스 — 앱마다 다시 입력할 필요 없음",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 생태계 활용">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "Hub 가입",
                body: "tskool.kr에서 거북스쿨 통합 계정을 만듭니다. 1분이면 끝.",
              },
              {
                title: "생기북에서 학생부 업로드",
                body: "생기부 PDF만 올리면 모든 분석·평가가 한 번에 활성화.",
              },
              {
                title: "필요한 위성앱 추가",
                body: "수시·정시·모의고사 등 필요할 때 그 위성앱만 켜면 데이터는 자동으로 따라옵니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것" tone="muted">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "Hub SSO 통합 로그인",
              "생기북 ↔ Susi 학종 데이터 공유",
              "Susi ↔ Jungsi 수시·정시 통합 전략",
              "ExamHub 성적 → Jungsi 합격 예측",
              "StudyPlanner 학습 데이터 누적",
              "Hub 마이클래스 공통 멤버십",
              "통합 결제 · 통합 환불 정책",
              "한 계정으로 모든 위성앱 이용",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="앱마다 다시 입력하지 마세요"
        body="Hub 계정 하나로 거북스쿨의 모든 위성앱이 같은 데이터로 움직입니다."
        primaryHref="/sb/dashboard"
        primaryLabel="생기북 시작하기"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="Hub로 이동"
      />
    </main>
  );
}
