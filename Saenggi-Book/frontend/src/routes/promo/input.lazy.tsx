import { createLazyFileRoute } from "@tanstack/react-router";
import {
  Upload,
  FileText,
  Scan,
  Edit3,
  ShieldCheck,
  Layers,
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

export const Route = createLazyFileRoute("/promo/input")({
  component: PromoInputPage,
});

function PromoInputPage() {
  return (
    <main>
      <PromoHero
        badge="생기부 입력"
        Icon={Upload}
        title="생기부 PDF 한 번 올리면"
        highlight="구조화 끝"
        body="나이스에서 받은 생활기록부 PDF를 그대로 업로드하세요. 학년·학기·교과·세특·창체·출결까지 자동으로 인식되어 분석 가능한 데이터로 변환됩니다."
        primaryHref="/sb/dashboard"
        primaryLabel="생기부 업로드 하러 가기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="입력에서 막히지 않게"
        subtitle="복잡한 양식·표·페이지 분할까지 알아서 처리합니다."
      >
        <FeatureGrid
          items={[
            {
              icon: FileText,
              title: "PDF 자동 파싱",
              body: "나이스/학교 발급 PDF 모두 지원. 학년·학기 단위로 자동 분리",
            },
            {
              icon: Scan,
              title: "표 구조 인식",
              body: "교과학습발달상황 표를 자동 인식 — 등급·이수단위·원점수 추출",
            },
            {
              icon: Layers,
              title: "영역별 분류",
              body: "교과 · 세특 · 창체(자율·동아리·진로·봉사) · 행특 · 출결 자동 분류",
            },
            {
              icon: Edit3,
              title: "수기 보정",
              body: "OCR이 잘못 읽은 항목은 그 자리에서 직접 편집 가능",
            },
            {
              icon: ShieldCheck,
              title: "안전한 보관",
              body: "Hub 계정에 종속 · 학생 본인만 열람 · 암호화 저장",
            },
            {
              icon: Upload,
              title: "다년치 누적",
              body: "1~3학년 생기부를 누적 업로드하면 학년 간 비교가 자동 활성화",
            },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 입력 완료" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "PDF 업로드",
                body: "대시보드 '생기부 입력'에서 PDF 드래그&드롭. 1~3학년 누적도 한 번에 가능.",
              },
              {
                title: "자동 파싱 확인",
                body: "교과·세특·창체·출결이 표/카드 형태로 미리보기 — 잘못 읽힌 항목은 인라인 편집.",
              },
              {
                title: "분석 시작",
                body: "저장 즉시 성적 분석·세특 관리·계열 진단·전형 탐색 메뉴가 활성화됩니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "나이스 PDF 자동 파싱",
              "학년·학기 단위 자동 분리",
              "교과학습발달상황 표 추출",
              "세부능력 및 특기사항 자동 정리",
              "창의적 체험활동 4개 영역 분류",
              "출결 누계 자동 산출",
              "OCR 오인식 항목 수기 보정",
              "1~3학년 누적 업로드 · 학년 간 비교",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="PDF 한 번이면 분석이 시작됩니다"
        body="생기부를 입력하는 데 5분도 걸리지 않습니다. 나머지는 생기북이 알아서 분석합니다."
        primaryHref="/sb/dashboard"
        primaryLabel="생기부 업로드"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="거북스쿨 Hub"
      />
    </main>
  );
}
