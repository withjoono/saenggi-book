import { Button } from '@/components/custom/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/common/format';
import { useGetProducts } from '@/stores/server/features/products/queries';
import { useNavigate } from '@tanstack/react-router';
import { IconCheck, IconSparkles } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function PricingPage() {
  const { data: products, isLoading } = useGetProducts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 특정 상품만 필터링 (2027 수시 예측 분석 서비스, 추가 AI 생기부 평가/컨설팅)
  const pricingProducts = products?.filter(
    (product) =>
      product.productNm === '2027 수시 예측 분석 서비스' ||
      product.productNm === '추가 AI 생기부 평가/컨설팅'
  );

  const handlePurchase = (productId: number) => {
    navigate({ to: '/order/$productId', params: { productId: String(productId) } });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          수시 서비스 플랜
        </h1>
        <p className="text-lg text-muted-foreground">
          2027학년도 수시 전형을 위한 최적의 플랜을 선택하세요
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {pricingProducts?.map((product, index) => {
          const isPremium = product.productNm === '2027 수시 예측 분석 서비스';
          const features = product.explainComment
            ?.split('\n')
            .filter((line) => line.trim());
          const hasDiscount = product.promotionDiscount > 0;
          const originalPrice = hasDiscount
            ? Math.round(
                parseInt(product.productPrice) / (1 - product.promotionDiscount / 100)
              )
            : null;

          return (
            <Card
              key={product.id}
              className={cn(
                'relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg',
                isPremium && 'border-primary shadow-md'
              )}
            >
              {/* Premium Badge */}
              {isPremium && (
                <div className="absolute right-4 top-4">
                  <Badge className="gap-1 bg-primary">
                    <IconSparkles className="h-3 w-3" />
                    인기
                  </Badge>
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute left-4 top-4">
                  <Badge variant="destructive" className="font-bold">
                    {product.promotionDiscount}% 할인
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-8 pt-12">
                <CardTitle className="text-2xl">{product.productNm}</CardTitle>
                <CardDescription className="text-base">
                  {product.term &&
                    `${new Date(product.term).toLocaleDateString('ko-KR')} 까지`}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* Price */}
                <div className="space-y-1">
                  {hasDiscount && originalPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatPrice(originalPrice)}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {formatPrice(parseInt(product.productPrice))}
                    </span>
                    {product.productTypeCode === 'TICKET' && (
                      <span className="text-muted-foreground">/ 1회</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">
                    포함 서비스
                  </div>
                  <ul className="space-y-2">
                    {features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Refund Policy */}
                {product.refundPolicy && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {product.refundPolicy}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={isPremium ? 'default' : 'outline'}
                  onClick={() => handlePurchase(product.id)}
                >
                  구매하기
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mx-auto mt-12 max-w-3xl rounded-lg bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          모든 플랜은 안전한 결제 시스템을 통해 구매하실 수 있습니다.
          <br />
          결제 관련 문의사항은 고객센터로 연락주세요.
        </p>
      </div>
    </div>
  );
}
