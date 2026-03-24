import { useQuery } from "@tanstack/react-query";
import { PAYMENT_APIS } from "./apis";
import { IPaymentHistory } from "./interfaces";

export const paymentQueryKeys = {
  all: ["payment"] as const,
  storeCode: () => [...paymentQueryKeys.all, "store-code"] as const, // 상점 코드 조회
  histories: () => [...paymentQueryKeys.all, "histories"] as const, // 결제 내역 조회
  historyById: (historyId: string) =>
    [...paymentQueryKeys.all, "histories", historyId] as const, // 결제 내역 하나 조회
};

/**
 * [iamport] 상점코드 조회
 */
export const useGetStoreCode = () =>
  useQuery<{ storeCode: string } | null>({
    queryKey: paymentQueryKeys.storeCode(),
    queryFn: PAYMENT_APIS.fetchStoreCodeAPI,
  });

/**
 * 결제 내역 조회
 */
export const useGetPaymentHistories = () =>
  useQuery<IPaymentHistory[]>({
    queryKey: paymentQueryKeys.histories(),
    queryFn: PAYMENT_APIS.fetchPaymentHistoriesAPI,
  });

/**
 * 결제 내역 하나 조회
 */
export const useGetPaymentHistory = (historyId: string) =>
  useQuery<IPaymentHistory | null>({
    queryKey: paymentQueryKeys.historyById(historyId),
    queryFn: () => PAYMENT_APIS.fetchPaymentHistoryAPI(historyId),
  });
