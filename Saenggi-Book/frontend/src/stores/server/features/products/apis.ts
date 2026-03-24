import { makeApiCall } from "../../common-utils";
import { IProduct } from "./interfaces";

/**
 * 상품 목록 조회 API
 */
const fetchProductsAPI = async (): Promise<IProduct[]> => {
  const res = await makeApiCall<void, IProduct[]>("GET", "/store/available");
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 상품 하나 조회 API
 */
const fetchProductAPI = async (productId: string): Promise<IProduct | null> => {
  const res = await makeApiCall<void, IProduct>(
    "GET",
    `/store/available/${productId}`,
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

export const PRODUCT_APIS = {
  fetchProductsAPI,
  fetchProductAPI,
};
