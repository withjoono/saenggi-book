import { buttonVariants } from "@/components/custom/button";
import NotFoundError from "@/components/errors/not-found-error";
import { cn } from "@/lib/utils";
import {
  formatDateYYYYMMDD,
  formatDateYYYYMMDDHHMMSS,
} from "@/lib/utils/common/date";
import { formatPrice } from "@/lib/utils/common/format";
import { useGetPaymentHistory } from "@/stores/server/features/payments/queries";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { CircleCheckIcon } from "lucide-react";

export const Route = createLazyFileRoute("/users/_layout/payment/$id")({
  component: PaymentDetail,
});

function PaymentDetail() {
  const { data: history } = useGetPaymentHistory(Route.useParams().id);

  if (!history) {
    return <NotFoundError />;
  }

  const isCompleted = history.order_state === "COMPLETE"; // 결제완료 / 환불
  const discountedPrice =
    Number(history.pay_service.product_price) - (history.paid_amount || 0);
  const isFree = history.paid_amount === 0;
  const isEasyPayment = !history.card_name && !history.card_number;

  return (
    <div className="mx-auto w-full max-w-screen-md px-2 py-20">
      <div className="flex flex-col items-center justify-center p-2 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center space-y-6">
            {history.order_state === "COMPLETE" ? (
              <CircleCheckIcon className="h-16 w-16 text-green-500" />
            ) : (
              <CircleCheckIcon className="h-16 w-16 text-red-500" />
            )}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">주문 영수증</h2>
              <p className="text-gray-500 dark:text-gray-400">
                결제하신 내역입니다.
              </p>
            </div>
            <div className="w-full rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-gray-500">구매상품</div>
                <div className="col-span-2 text-right font-medium">
                  {history.pay_service.product_nm}
                </div>
                <div className="text-gray-500">구매일</div>
                <div className="col-span-2 text-right text-sm font-medium">
                  {history.update_dt || history.create_dt
                    ? formatDateYYYYMMDDHHMMSS(
                        new Date(history.update_dt || history.create_dt || ""),
                      )
                    : "알수없음"}
                </div>
                <div className="text-gray-500">이용기간</div>
                <div className="col-span-2 text-right text-sm font-medium">
                  {history.pay_service.term
                    ? `${formatDateYYYYMMDD(history.pay_service.term.toString())} 까지`
                    : "알수없음"}
                </div>
                <div className="text-gray-500">결제 정보</div>
                <div className="col-span-2 text-right text-sm font-medium">
                  {isFree
                    ? "100% 할인 쿠폰 사용"
                    : isEasyPayment
                      ? "간편결제"
                      : `${history.card_name} / ${history.card_number}`}
                </div>
                <div className="text-gray-500">서비스 가격</div>
                <div className="col-span-2 text-right font-medium">
                  {formatPrice(Number(history.pay_service.product_price))}
                </div>
                {0 < discountedPrice ? (
                  <>
                    <div className="text-gray-500">할인</div>
                    <div className="col-span-2 text-right font-medium text-red-500">
                      - {formatPrice(discountedPrice)}
                    </div>
                  </>
                ) : null}
                <div className="text-gray-500">결제</div>
                <div className="col-span-2 text-right font-medium">
                  {formatPrice(history.paid_amount || 0)}
                </div>
                {!isCompleted ? (
                  <>
                    <div className="text-gray-500">환불처리</div>
                    <div className="col-span-2 text-right font-medium text-blue-500">
                      + {formatPrice(history.cancel_amount || 0)}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <Link
              to="/users/payment"
              className={cn(buttonVariants(), "w-full")}
            >
              결제 목록
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
