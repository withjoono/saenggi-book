import { useQuery } from "@tanstack/react-query";
import {
  ISusiComprehensive,
  ISusiComprehensiveStep1,
  ISusiComprehensiveStep2,
  ISusiComprehensiveStep3,
  ISusiComprehensiveStep4,
} from "./interfaces";
import { SUSI_COMP_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const susiQueryKeys = {
  all: ["susi-comprehensive"] as const,
  step1: (params: {
    year: number;
    basic_type: string;
    large_department: string;
    medium_department: string;
    small_department: string;
  }) => [...susiQueryKeys.all, "step-1", params] as const,
  step2: (ids: number[]) => [...susiQueryKeys.all, "step-2", ids] as const,
  step3: (ids: number[]) => [...susiQueryKeys.all, "step-3", ids] as const,
  step4: (ids: number[]) => [...susiQueryKeys.all, "step-4", ids] as const,
  detail: (id: number) => [...susiQueryKeys.all, "detail", id] as const,
};

/**
 * [수시종합] Step 1 조회
 */
export const useGetSusiComprehensiveStep1 = (params: {
  year: number;
  basic_type: string;
  large_department: string;
  medium_department: string;
  small_department: string;
}) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiComprehensiveStep1[] | null>({
    queryKey: susiQueryKeys.step1(params),
    queryFn: () =>
      SUSI_COMP_APIS.fetchSusiComprehensiveStep1API({
        ...params,
        large_department: params.large_department.replace(/・/g, "."),
        medium_department: params.medium_department.replace(/・/g, "."),
        small_department: params.small_department.replace(/・/g, "."),
      }),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * [수시종합] Step 2 조회
 */
export const useGetSusiComprehensiveStep2 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiComprehensiveStep2[]>({
    queryKey: susiQueryKeys.step2(params.ids),
    queryFn: () => SUSI_COMP_APIS.fetchSusiComprehensiveStep2API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * [수시종합] Step 3 조회
 */
export const useGetSusiComprehensiveStep3 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiComprehensiveStep3[]>({
    queryKey: susiQueryKeys.step3(params.ids),
    queryFn: () => SUSI_COMP_APIS.fetchSusiComprehensiveStep3API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * [수시종합] Step 4 조회
 */
export const useGetSusiComprehensiveStep4 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiComprehensiveStep4[]>({
    queryKey: susiQueryKeys.step4(params.ids),
    queryFn: () => SUSI_COMP_APIS.fetchSusiComprehensiveStep4API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * [수시종합] 상세 조회
 */
export const useGetSusiComprehensiveDetail = (params: { id: number }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiComprehensive | null>({
    queryKey: susiQueryKeys.detail(params.id),
    queryFn: () => SUSI_COMP_APIS.fetchSusiComprehensiveDetailAPI(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
