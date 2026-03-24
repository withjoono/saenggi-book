import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PRODUCT_APIS } from "./apis";
import { IProduct } from "./interfaces";

export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
};

/**
 * 상품 목록 조회
 */
export const useGetProducts = () =>
  useQuery<IProduct[]>({
    queryKey: productQueryKeys.lists(),
    queryFn: PRODUCT_APIS.fetchProductsAPI,
  });

/**
 * 상품 하나 조회
 */
export const useGetProduct = (productId: string) =>
  useQuery<IProduct | null>({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => PRODUCT_APIS.fetchProductAPI(productId),
    placeholderData: keepPreviousData, // 로딩되는 동안 이전 데이터를 유지
  });
