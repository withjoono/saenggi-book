import { useQuery } from "@tanstack/react-query";
import {
  ISusiKyokwaStep1Response,
  ISusiKyokwaStep2Response,
  ISusiKyokwaStep3Response,
  ISusiKyokwaStep4Response,
  ISusiKyokwaStep5Response,
  ISusiKyokwaDetailResponse,
} from "./interfaces";
import { SUSI_KYOKWA_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const susiKyokwaQueryKeys = {
  all: ["susi-kyokwa"] as const,
  step1: (params: { year: number; basicType: string; category?: string }) =>
    [...susiKyokwaQueryKeys.all, "step-1", params] as const,
  step2: (recruitmentUnitIds: number[]) =>
    [...susiKyokwaQueryKeys.all, "step-2", recruitmentUnitIds] as const,
  step3: (recruitmentUnitIds: number[]) =>
    [...susiKyokwaQueryKeys.all, "step-3", recruitmentUnitIds] as const,
  step4: (recruitmentUnitIds: number[]) =>
    [...susiKyokwaQueryKeys.all, "step-4", recruitmentUnitIds] as const,
  step5: (recruitmentUnitIds: number[]) =>
    [...susiKyokwaQueryKeys.all, "step-5", recruitmentUnitIds] as const,
  detail: (recruitmentUnitId: number) =>
    [...susiKyokwaQueryKeys.all, "detail", recruitmentUnitId] as const,
};

export const useGetSusiKyokwaStep1 = (params: {
  year: number;
  basicType: "일반" | "특별";
  category?: string;
}) => {
  return useQuery<ISusiKyokwaStep1Response>({
    queryKey: susiKyokwaQueryKeys.step1(params),
    queryFn: () => SUSI_KYOKWA_APIS.fetchSusiKyokwaStep1API(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetSusiKyokwaStep2 = (recruitmentUnitIds: number[]) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiKyokwaStep2Response>({
    queryKey: susiKyokwaQueryKeys.step2(recruitmentUnitIds),
    queryFn: () =>
      SUSI_KYOKWA_APIS.fetchSusiKyokwaStep2API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0,
  });
};

export const useGetSusiKyokwaStep3 = (recruitmentUnitIds: number[]) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiKyokwaStep3Response>({
    queryKey: susiKyokwaQueryKeys.step3(recruitmentUnitIds),
    queryFn: () =>
      SUSI_KYOKWA_APIS.fetchSusiKyokwaStep3API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0,
  });
};

export const useGetSusiKyokwaStep4 = (recruitmentUnitIds: number[]) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiKyokwaStep4Response>({
    queryKey: susiKyokwaQueryKeys.step4(recruitmentUnitIds),
    queryFn: () =>
      SUSI_KYOKWA_APIS.fetchSusiKyokwaStep4API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0,
  });
};

export const useGetSusiKyokwaStep5 = (recruitmentUnitIds: number[]) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiKyokwaStep5Response>({
    queryKey: susiKyokwaQueryKeys.step5(recruitmentUnitIds),
    queryFn: () =>
      SUSI_KYOKWA_APIS.fetchSusiKyokwaStep5API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0,
  });
};

export const useGetSusiKyokwaDetail = (recruitmentUnitId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiKyokwaDetailResponse | null>({
    queryKey: susiKyokwaQueryKeys.detail(recruitmentUnitId),
    queryFn: () =>
      SUSI_KYOKWA_APIS.fetchSusiKyokwaDetailAPI({
        id: recruitmentUnitId,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser,
  });
};
