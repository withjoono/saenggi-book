const fs = require('fs');

const content = `import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetActiveServices } from "@/stores/server/features/me/queries";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export const Route = createFileRoute("/products/")({
  component: Products,
});

function Products() {
  const activeServices = useGetActiveServices();

  // 정시 서비스 활성 여부
  const isJungsiActive = (activeServices.data || []).includes("J");

  const features = [
    "초격차 정시 예측 분석",
    "대학별 유불리 분석 (특허)",
    "모의지원 시뮬레이션",
    "단계별 프로세스",
  ];

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
          <div className="flex w-full max-w-sm flex-col justify-between rounded-2xl border bg-white p-6 shadow-lg">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  정시 예측 서비스 (정시원서마감일까지)
                </h3>
                <h3 className="mt-2 text-3xl font-bold text-blue-600">
                  59,000 원
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  2026 정시 합격 예측 서비스입니다. 대학별 유불리 분석, 모의지원 시뮬레이션을 제공합니다.
                </p>
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
              {isJungsiActive && (
                <p className="mb-2 text-center text-sm font-medium text-green-600">
                  이미 활성화된 서비스입니다.
                </p>
              )}
              <Link
                to="/order/3"
                className="block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                구매하기
              </Link>
              <p className="mt-2 text-center text-xs text-gray-500">
                정시 원서 마감일까지
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('src/routes/products/index.tsx', content);
console.log('Updated: src/routes/products/index.tsx');
