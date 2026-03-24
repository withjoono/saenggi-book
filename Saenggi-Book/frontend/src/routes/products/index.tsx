import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetActiveServices } from "@/stores/server/features/me/queries";
import { useGetProducts } from "@/stores/server/features/products/queries";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { IProduct } from "@/stores/server/features/products/interfaces";

export const Route = createFileRoute("/products/")({
  component: Products,
});

function Products() {
  const activeServices = useGetActiveServices();
  const { data: products, isLoading, isError } = useGetProducts();

  // 정시 서비스 활성 여부
  const isJungsiActive = (activeServices.data || []).includes("J");

  // 상품별 features 매핑 (productCateCode 기반)
  const getFeaturesByCategory = (product: IProduct): string[] => {
    switch (product.productCateCode) {
      case "J": // 정시
        return [
          "초격차 정시 예측 분석",
          "대학별 유불리 분석 (특허)",
          "모의지원 시뮬레이션",
          "단계별 프로세스",
        ];
      case "S": // 수시
        return [
          "교과 전형 탐색",
          "학종 전형 탐색",
          "관심 대학 관리",
          "맞춤형 리포트",
        ];
      default:
        return [];
    }
  };

  // 상품이 활성화되어 있는지 확인
  const isProductActive = (product: IProduct): boolean => {
    if (!activeServices.data) return false;
    return activeServices.data.includes(product.productCateCode || "");
  };

  // 가격 포맷팅
  const formatPrice = (price: string): string => {
    const numPrice = parseInt(price, 10);
    return numPrice.toLocaleString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center py-20">
        <p className="text-red-500">상품 정보를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="flex justify-center">
        <section className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">이용권 구매</h2>
        </section>
      </div>

      {/* 현재 이용중인 서비스 표시 */}
      {isJungsiActive && (
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-medium text-green-800">
              현재 이용중인 서비스:
            </span>
            <Badge
              variant="outline"
              className="border-green-500 bg-green-100 text-green-700"
            >
              정시 서비스
            </Badge>
          </div>
        </div>
      )}

      <section className="px-2">
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {products && products.length > 0 ? (
            products.map((product) => {
              const features = getFeaturesByCategory(product);
              const isActive = isProductActive(product);

              return (
                <div
                  key={product.id}
                  className="flex w-full max-w-sm flex-col justify-between rounded-2xl border bg-white p-6 shadow-lg"
                >
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {product.productNm}
                      </h3>
                      <h3 className="mt-2 text-3xl font-bold text-blue-600">
                        {formatPrice(product.productPrice)} 원
                      </h3>
                      {product.explainComment && (
                        <p className="mt-3 text-sm text-gray-600">
                          {product.explainComment}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <p className="text-sm text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 border-t pt-4">
                    {isActive && (
                      <p className="mb-2 text-center text-sm font-medium text-green-600">
                        이미 활성화된 서비스입니다.
                      </p>
                    )}
                    <Link
                      to="/order/$productId"
                      params={{ productId: String(product.id) }}
                      className="block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      구매하기
                    </Link>
                    {product.availableTerm && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        {product.availableTerm}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">현재 구매 가능한 상품이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
