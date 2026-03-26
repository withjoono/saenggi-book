const fs = require('fs');

// New Jungsi home with banner, 3 program cards, and 2 YouTube videos
const jungsiHomeContent = `import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { IconChevronRight, IconDeviceMobile, IconChartBar, IconUserCheck, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import ReactPlayer from "react-player";
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

export const Route = createLazyFileRoute("/jungsi/")({
  component: JungsiHome,
});

// 배너 슬라이드 데이터
const bannerSlides = [
  {
    id: 1,
    title: "G Skool 예측의 정확성",
    description: "타사와는 다른 G Skool만의 정확한 정시 예측 시스템",
    features: ["타사 현황 환산으로 실제 지원자 표본 수집", "무료 모의지원 어플로 무장한 표본 확대", "과거 컷라인 데이터 분석에 7차에 걸친 예측컷 업데이트"],
    image: "/images/3D/우승 트로피.png",
    bgColor: "#fe5e41",
  },
  {
    id: 2,
    title: "정시 합격 예측 서비스",
    description: "수능 성적 기반 맞춤형 정시 지원 전략을 제공합니다.",
    features: ["실시간 환산점수 계산", "가/나/다군 최적 배치", "위험도 분석 리포트"],
    image: "/images/3D/인강 컴퓨터.png",
    bgColor: "#2dd4c8",
  },
  {
    id: 3,
    title: "거북쌤 대면 컨설팅",
    description: "대치동 20년 경력의 거북쌤이 직접 컨설팅합니다.",
    features: ["비대면 컨설팅 3회", "최종 대면 컨설팅 1회", "카톡채널 수시 질의응답"],
    image: "/images/3D/스탠드 조명.png",
    bgColor: "#f7b538",
  },
];

// 프로그램 카드 데이터
const programs = [
  {
    title: "무료 모의지원 앱 '거북 정모'",
    description: "국내유일 모의지원 전문 앱\\n앱기반의 신속, 편리성\\n사용자 확대와 데이터 교류를 위한 협력 고교 확대중",
    price: "무료",
    imageUrl: "/images/ETC/무료 모의지원 앱.jpg",
    href: "/products",
    icon: IconDeviceMobile,
  },
  {
    title: "2026 정시합격예측",
    description: "예측은 당근, 단계별 프로세스식 최적 조합 제시\\n무료 모의지원 앱 '거북정모'에서 교차지원률, 연쇄이동률 파악 예측컷에 반영",
    price: "유료 - 59,000원",
    imageUrl: "/images/ETC/정시.jpg",
    href: "/products",
    icon: IconChartBar,
  },
  {
    title: "거북쌤 강준의 대면 컨설팅",
    description: "비대면 컨설팅 3회 + 최종 대면 컨설팅 1회 + 교차지원, 연쇄이동 현황에 따른 예측컷 변동 1~3일 업데이트",
    price: "유료 - 490,000원",
    imageUrl: "/images/ETC/거북쌤.png",
    href: "/products",
    icon: IconUserCheck,
  },
];

// 컨설팅 특장점
const consultingFeatures = [
  { title: "단계별 필터링 프로세스로 본인에게 최적의 대학 제시(특허출원)" },
  { title: "특정 대학/학과의 나에게 '유불리한 점수 차이' 제시(특허출원)" },
  { title: "계정 공유로 주변 선생님, 지인과 함께 G Skool 정시 서비스를 공유하면서 협의 가능" },
  { title: "AI 정시 컨설팅 챗봇 이용 가능(12월 둘째주까지)" },
  { title: "대치동 22년 학원장의 '정시 컨설팅 노하우'를 집대성" },
];

function JungsiHome() {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const primaryColor = "#f59e0b"; // amber-500

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: USER_API.fetchCurrentUserAPI,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 결제 내역 조회
  const { data: paymentHistories } = useQuery({
    queryKey: ["payments", "history"],
    queryFn: PAYMENT_APIS.fetchPaymentHistoriesAPI,
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 현재 이용 중인 서비스
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner Section */}
      <div className="w-full py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* 캐러셀 영역 */}
            <div className="flex-1 lg:flex-[2]">
              <Carousel
                setApi={setApi}
                opts={{ align: "start", loop: true }}
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
                  {bannerSlides.map((slide) => (
                    <CarouselItem key={slide.id}>
                      <div
                        className="rounded-2xl overflow-hidden h-[280px] flex items-center"
                        style={{ backgroundColor: slide.bgColor }}
                      >
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
                        <div className="flex-shrink-0 w-[180px] h-[220px] md:w-[220px] md:h-[260px] pr-4">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-contain drop-shadow-lg"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {bannerSlides.map((_, index) => (
                    <button
                      key={index}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: current === index ? "24px" : "8px",
                        backgroundColor: current === index ? primaryColor : "#d1d5db",
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
                    2026 정시 서비스
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
                  {user ? (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: \`\${primaryColor}15\` }}
                        >
                          <IconUser className="h-6 w-6" style={{ color: primaryColor }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-gray-900">{user.nickname}님</span>
                          <span className="text-sm text-gray-400">
                            ({user.memberType === 'teacher' ? '멘토' : user.memberType === 'parent' ? '학부모' : '학생'})
                          </span>
                        </div>
                      </div>
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
                          </div>
                        ) : (
                          <div className="rounded-lg bg-gray-50 px-3 py-1.5 text-center text-sm text-gray-500">
                            이용 중인 서비스가 없습니다
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Link to="/jungsi/score-input" className="flex-1">
                          <Button className="w-full text-sm text-white" style={{ backgroundColor: primaryColor }}>
                            성적 입력하기
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-3 py-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <IconUser className="h-7 w-7 text-gray-400" />
                        </div>
                        <p className="text-center text-sm text-gray-500">
                          로그인하시면 정시 서비스를
                          <br />
                          이용하실 수 있습니다.
                        </p>
                        <Link to="/auth/login" className="w-full">
                          <Button className="w-full text-white" style={{ backgroundColor: primaryColor }}>
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

      {/* 프로그램 카드 섹션 */}
      <div className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              2026년 <span style={{ color: primaryColor }}>정시 프로그램</span>
            </h2>
            <p className="text-gray-500">G Skool만의 차별화된 정시 예측 서비스</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <Link
                  key={index}
                  to={program.href}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative w-full h-96 overflow-hidden">
                    <img
                      src={program.imageUrl}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: \`\${primaryColor}15\` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <span
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: \`\${primaryColor}15\`, color: primaryColor }}
                      >
                        {program.price}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-gray-500 text-sm whitespace-pre-line line-clamp-3 mb-4">
                      {program.description}
                    </p>
                    <div
                      className="flex items-center text-sm font-medium group-hover:gap-2 transition-all"
                      style={{ color: primaryColor }}
                    >
                      <span>자세히 보기</span>
                      <IconChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 컨설팅 특장점 */}
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              정시 컨설팅 <span style={{ color: primaryColor }}>특장점</span>
            </h3>
            <div className="space-y-4">
              {consultingFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 flex items-start gap-2">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {index + 1}
                    </span>
                    {feature.title}
                  </h4>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/products">
                <button
                  className="px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  정시 프로그램 신청하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube 영상 섹션 */}
      <div className="w-full bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              정시 서비스 <span style={{ color: primaryColor }}>영상 안내</span>
            </h2>
            <p className="text-gray-500">G Skool 정시 서비스 사용법을 영상으로 확인하세요</p>
          </div>
          <div className="flex flex-col gap-8 md:flex-row max-w-5xl mx-auto">
            <div className="flex-1">
              <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=K7ZGIsuYISo"
                  width="100%"
                  controls
                  height="100%"
                  className="absolute inset-0 left-0 top-0 h-full w-full"
                />
              </div>
              <p className="mt-4 text-center text-muted-foreground font-medium">
                정시 서비스 사용안내
              </p>
            </div>

            <div className="flex-1">
              <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=PO_GI9diEvc"
                  width="100%"
                  controls
                  height="100%"
                  className="absolute inset-0 left-0 top-0 h-full w-full"
                />
              </div>
              <p className="mt-4 text-center text-muted-foreground font-medium">
                정시 지원 시 나에게 유리한 대학 찾는 법
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/routes/jungsi/index.lazy.tsx', jungsiHomeContent, 'utf8');
console.log('Jungsi home page updated with YouTube videos!');
