import { FAQArticles } from "@/components/faq-articles";
import { GradeBasedServices } from "@/components/grade-based-services";
import { HeroBanner } from "@/components/hero-banner";
import { RecentNoticeBoard } from "@/components/recent-notice-board";
import { Container } from "@/components/test/container";
import { Grade, useGradeStore } from "@/stores/client/use-grade-store";
import { useEffect } from "react";
import ReactPlayer from "react-player";

interface HomeContentProps {
  grade: Grade;
}

export function HomeContent({ grade }: HomeContentProps) {
  const { setGrade } = useGradeStore();

  // URL 기반으로 grade store 동기화
  useEffect(() => {
    setGrade(grade);
  }, [grade, setGrade]);

  return (
    <div className="relative">
      <HeroBanner />

      {/* 학년별 서비스 선택 (고3은 숨김) */}
      <GradeBasedServices />

      <Container className="flex flex-col items-center justify-between">

        {/* 공지사항 & FAQ (맨 아래로 이동) */}
        <div className="container relative flex flex-col items-start gap-x-20 lg:flex-row">
          <RecentNoticeBoard />
          <FAQArticles />
        </div>
      </Container>
    </div>
  );
}
