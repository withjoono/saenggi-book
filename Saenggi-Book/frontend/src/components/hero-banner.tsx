"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import Autoplay from "embla-carousel-autoplay";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/custom/button";
import { USER_API } from "@/stores/server/features/me/apis";
import { PAYMENT_APIS } from "@/stores/server/features/payments/apis";
import { IconUser } from "@tabler/icons-react";
import { useGradeStore, gradeThemes } from "@/stores/client/use-grade-store";

// 고3 정시 배너 슬라이드 데이터
const grade3Slides = [
  {
    id: 1,
    title: "T Skool 예측의 정확성",
    description: "타사와는 다른 T Skool만의 정확한 정시 예측 시스템",
    features: ["타사 현황 환산으로 실제 지원자 표본 수집", "무료 모의지원 어플로 무장한 표본 확대", "과거 컷라인 데이터 분석에 7차에 걸친 예측컷 업데이트"],
    image: "/images/3D/우승 트로피.png",
    bgColor: "#fe5e41", // 주황색
  },
  {
    id: 2,
    title: "정시 합격 예측 서비스",
    description: "수능 성적 기반 맞춤형 정시 지원 전략을 제공합니다.",
    features: ["실시간 환산점수 계산", "가/나/다군 최적 배치", "위험도 분석 리포트"],
    image: "/images/3D/인강 컴퓨터.png",
    bgColor: "#2dd4c8", // 파란색/하늘색
  },
  {
    id: 3,
    title: "거북쌤 대면 컨설팅",
    description: "대치동 20년 경력의 거북쌤이 직접 컨설팅합니다.",
    features: ["비대면 컨설팅 3회", "최종 대면 컨설팅 1회", "카톡채널 수시 질의응답"],
    image: "/images/3D/스탠드 조명.png",
    bgColor: "#f7b538", // 노란색
  },
];

// 고1, 고2 수시 배너 슬라이드 데이터 (이미지 배너)
interface ImageBannerSlide {
  id: number;
  image: string;
  href: string;
  alt: string;
}

const gradeBannerSlides: Record<"0" | "1" | "2", ImageBannerSlide[]> = {
  "0": [
    { id: 1, image: "/banner/grade1/hakjong.jpg", href: "/ms/hakjong", alt: "학종 예측 시스템" },
    { id: 2, image: "/banner/grade1/gyogwa.jpg", href: "/ms/gyogwa", alt: "교과 예측 시스템" },
    { id: 3, image: "/banner/grade1/nonsul.jpg", href: "/ms/nonsul", alt: "논술 예측 시스템" },
  ],
  "1": [
    { id: 1, image: "/banner/grade1/hakjong.jpg", href: "/ms/hakjong", alt: "학종 예측 시스템" },
    { id: 2, image: "/banner/grade1/gyogwa.jpg", href: "/ms/gyogwa", alt: "교과 예측 시스템" },
    { id: 3, image: "/banner/grade1/nonsul.jpg", href: "/ms/nonsul", alt: "논술 예측 시스템" },
  ],
  "2": [
    { id: 1, image: "/banner/grade2/hakjong.jpg", href: "/ms/hakjong", alt: "학종 예측 시스템" },
    { id: 2, image: "/banner/grade2/gyogwa.jpg", href: "/ms/gyogwa", alt: "교과 예측 시스템" },
    { id: 3, image: "/banner/grade2/nonsul.jpg", href: "/ms/nonsul", alt: "논술 예측 시스템" },
  ],
};

export const HeroBanner = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { grade } = useGradeStore();
  const theme = gradeThemes[grade];

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 결제 내역 조회 (활성 구독 확인용)
  const { data: paymentHistories } = useQuery({
    queryKey: ["payments", "history"],
    queryFn: PAYMENT_APIS.fetchPaymentHistoriesAPI,
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 현재 이용 중인 서비스 필터링 (term이 현재보다 미래인 것)
  const activeServices = paymentHistories?.filter((payment) => {
    if (!payment.pay_service?.term) return false;
    const termDate = new Date(payment.pay_service.term);
    return termDate > new Date() && payment.order_state === "paid";
  }) || [];

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // 고1, 고2는 이미지 배너, 고3은 텍스트 배너
  const isImageBanner = grade === "0" || grade === "1" || grade === "2";
  const imageSlides = isImageBanner ? gradeBannerSlides[grade as "0" | "1" | "2"] : [];
  const textSlides = grade3Slides;
  const slides = isImageBanner ? imageSlides : textSlides;

  return (
    <div className="w-full py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* 캐러셀 영역 */}
          <div className="flex-1 lg:flex-[2]">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {isImageBanner ? (
                  // 고1, 고2: 이미지 배너
                  imageSlides.map((slide) => (
                    <CarouselItem key={slide.id}>
                      <Link to={slide.href} className="block">
                        <div className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                          <img
                            src={slide.image}
                            alt={slide.alt}
                            className="w-full h-[280px] object-cover"
                          />
                        </div>
                      </Link>
                    </CarouselItem>
                  ))
                ) : (
                  // 고3: 다양한 배경색 + 3D 이미지 배너 (2027 스타일과 동일한 사이즈)
                  textSlides.map((slide) => (
                    <CarouselItem key={slide.id}>
                      <div
                        className="rounded-2xl overflow-hidden h-[280px] flex items-center"
                        style={{ backgroundColor: slide.bgColor }}
                      >
                        {/* 왼쪽: 텍스트 영역 */}
                        <div className="flex-1 p-6 md:p-8">
                          <h2 className="mb-2 text-xl font-bold text-white md:text-2xl">
                            {slide.title}
                          </h2>
                          <p className="mb-4 text-sm text-white/80">
                            {slide.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {slide.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-block rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* 오른쪽: 3D 이미지 */}
                        <div className="flex-shrink-0 w-[180px] h-[220px] md:w-[220px] md:h-[260px] pr-4">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-contain drop-shadow-lg"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <div className="mt-3 flex items-center justify-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: current === index ? "24px" : "8px",
                      backgroundColor: current === index ? theme.primary : "#d1d5db",
                    }}
                    onClick={() => api?.scrollTo(index)}
                  />
                ))}
              </div>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* 사용자 정보 패널 */}
          <div className="lg:flex-1">
            <Card className="h-[280px] border-gray-100 shadow-sm flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-sm text-gray-500">
                  T Skool에 오신걸 환영합니다
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
                {user ? (
                  <>
                    {/* 사용자 이름 */}
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${theme.primary}15` }}
                      >
                        <IconUser className="h-6 w-6" style={{ color: theme.primary }} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">{user.nickname}님</span>
                        <span className="text-sm text-gray-400">
                          ({user.memberType === 'teacher' ? '멘토' : user.memberType === 'parent' ? '학부모' : '학생'})
                        </span>
                      </div>
                    </div>

                    {/* 이용 중인 서비스 */}
                    <div className="space-y-1">
                      <p className="text-center text-xs font-medium text-gray-500">
                        현재 이용 중인 서비스
                      </p>
                      {activeServices.length > 0 ? (
                        <div className="space-y-1">
                          {activeServices.slice(0, 2).map((service, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-gray-50 px-3 py-1.5 text-center text-sm font-medium text-gray-700"
                            >
                              {service.pay_service.product_nm}
                              <span className="ml-2 text-xs text-gray-400">
                                (~{new Date(service.pay_service.term!).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                          {activeServices.length > 2 && (
                            <p className="text-center text-xs text-gray-400">
                              외 {activeServices.length - 2}개 서비스 이용 중
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gray-50 px-3 py-1.5 text-center text-sm text-gray-500">
                          이용 중인 서비스가 없습니다
                        </div>
                      )}
                    </div>

                    {/* 바로가기 버튼 */}
                    <div className="flex gap-2 pt-1">
                      <Link to="/messages" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full text-sm"
                        >
                          쪽지 확인
                        </Button>
                      </Link>
                      <Link to="/admission-info" className="flex-1">
                        <Button
                          className="w-full text-sm text-white"
                          style={{ backgroundColor: theme.primary }}
                        >
                          맞춤입시정보
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 비로그인 상태 */}
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <IconUser className="h-7 w-7 text-gray-400" />
                      </div>
                      <p className="text-center text-sm text-gray-500">
                        로그인하시면 더 많은 서비스를
                        <br />
                        이용하실 수 있습니다.
                      </p>
                      <Link to="/auth/login" className="w-full">
                        <Button
                          className="w-full text-white"
                          style={{ backgroundColor: theme.primary }}
                        >
                          로그인
                        </Button>
                      </Link>
                      <Link to="/auth/register" className="w-full">
                        <Button variant="outline" className="w-full">
                          회원가입
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
