const fs = require('fs');

const content = `import { useGetProducts } from "@/stores/server/features/products/queries";
import { createFileRoute } from "@tanstack/react-router";
import { PricingCard } from "@/components/pricing-card";
import { useGetActiveServices } from "@/stores/server/features/me/queries";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/products/")({
  component: Products,
});

function Products() {
  const products = useGetProducts();
  const activeServices = useGetActiveServices();

  // 정시 서비스 중 59,000원 상품만 필터링
  const jungsiProduct = (products.data || [])
    .filter((product) => product.productCateCode === "J" && Number(product.productPrice) === 59000)
    .map((product) => ({
      id: product.id,
      title: "정시 예측 서비스 (정시원서마감일까지)",
      price: 59000,
      description: "2026 정시 합격 예측 서비스입니다. 대학별 유불리 분석, 모의지원 시뮬레이션을 제공합니다.",
      features: [
        "초격차 정시 예측 분석",
        "대학별 유불리 분석 (특허)",
        "모의지원 시뮬레이션",
        "단계별 프로세스",
      ],
      actionLabel: "구매하기",
      footerLabel: "정시 원서 마감일까지",
      serviceRange: product.serviceRangeCode,
    }))[0];

  // 정시 서비스 활성 여부
  const isJungsiActive = (activeServices.data || []).includes("J");

  if (products.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full py-20">
      <div className="flex justify-center">
        <section className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            정시 예측 분석 이용권
          </h2>
        </section>
      </div>

      {/* 현재 이용중인 서비스 표시 */}
      {isJungsiActive && (
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-medium text-green-800">현재 이용중인 서비스:</span>
            <Badge variant="outline" className="border-green-500 bg-green-100 text-green-700">
              정시 서비스
            </Badge>
          </div>
        </div>
      )}

      <section className="px-2">
        <div className="mt-8 flex justify-center">
          {jungsiProduct ? (
            <PricingCard
              {...jungsiProduct}
              isActive={isJungsiActive}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <p className="text-lg font-semibold text-gray-600">
                현재 구매 가능한 상품이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('src/routes/products/index.tsx', content);
console.log('Updated: src/routes/products/index.tsx');
