import { makeApiCall } from "../../common-utils";
import { IGetStoreCodeResponse, IPaymentHistory } from "./interfaces";

/**
 * [iamport] 상점 코드 조회
 */
const fetchStoreCodeAPI = async () => {
  const res = await makeApiCall<void, IGetStoreCodeResponse>(
    "GET",
    "/payments/store-code",
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

/**
 * 결제 내역 목록 조회
 */
const fetchPaymentHistoriesAPI = async () => {
  const res = await makeApiCall<void, IPaymentHistory[]>(
    "GET",
    "/payments/history",
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 결제 내역 한개 조회
 */
const fetchPaymentHistoryAPI = async (orderId: string) => {
  const res = await makeApiCall<void, IPaymentHistory>(
    "GET",
    `/payments/history/${orderId}`,
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

export const PAYMENT_APIS = {
  fetchStoreCodeAPI,
  fetchPaymentHistoriesAPI,
  fetchPaymentHistoryAPI,
};
