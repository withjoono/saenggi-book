import { buttonVariants } from "@/components/custom/button";
import { cn } from "@/lib/utils";
import { formatDateYYYYMMDDHHMMSS } from "@/lib/utils/common/date";
import { formatPrice } from "@/lib/utils/common/format";
import { useGetPaymentHistories } from "@/stores/server/features/payments/queries";
import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/users/_layout/payment/")({
  component: Payment,
});

function Payment() {
  const { data: history } = useGetPaymentHistories();
  return (
    <div className="mx-auto w-full max-w-screen-md space-y-6 px-4">
      <h3 className="text-center text-xl font-semibold">결제 내역</h3>
      <ul className="w-full divide-y">
        {history?.map((item) => {
          const isCompleted = item.order_state === "COMPLETE";
          return (
            <li
              key={item.id}
              className="flex w-full items-center justify-between py-4"
            >
              <div className="w-full">
                <p className="text-sm text-foreground/60">
                  {formatDateYYYYMMDDHHMMSS(
                    new Date(item.update_dt || item.create_dt || ""),
                  )}
                </p>
                <p className="text-lg font-semibold">
                  {item.pay_service.product_nm}
                </p>
                <div className="flex gap-2">
                  <span className={cn("text-blue-500")}>
                    {formatPrice(item.paid_amount || 0)} 결제
                  </span>

                  {!isCompleted ? (
                    <>
                      <span> | </span>
                      <span className={cn("text-red-500")}>
                        {formatPrice(item.cancel_amount || 0)} 환불
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="">
                <Link
                  to={"/users/payment/$id"}
                  params={{ id: item.id + "" }}
                  className={buttonVariants({ variant: "outline" })}
                >
                  상세보기
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
