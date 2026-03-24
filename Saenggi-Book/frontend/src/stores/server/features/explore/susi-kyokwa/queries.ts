import { useQuery } from "@tanstack/react-query";
import {
  IExploreSusiKyokwaDetailResponse,
  IExploreSusiKyokwaStep1Response,
  IExploreSusiKyokwaStep2Response,
  IExploreSusiKyokwaStep3Response,
  IExploreSusiKyokwaStep4Response,
  IExploreSusiKyokwaStep5Response,
} from "./interfaces";
import { EXPLORE_SUSI_KYOKWA_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const exploreSusiKyokwaQueryKeys = {
  all: ["explore-susi-kyokwa"] as const,
  step1: (params: { year: number; basicType: string; category?: string; subtypeIds?: number[] }) =>
    [...exploreSusiKyokwaQueryKeys.all, "step-1", params] as const,
  step2: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "step-2",
      recruitmentUnitIds,
    ] as const,
  step3: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "step-3",
      recruitmentUnitIds,
    ] as const,
  step4: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "step-4",
      recruitmentUnitIds,
    ] as const,
  step5: (recruitmentUnitIds: number[]) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "step-5",
      recruitmentUnitIds,
    ] as const,
  detail: (recruitmentUnitId: number) =>
    [...exploreSusiKyokwaQueryKeys.all, "detail", recruitmentUnitId] as const,
};

export const useGetExploreSusiKyokwaStep1 = (params: {
  year: number;
  basicType: string;
  category?: string;
  subtypeIds?: number[];
}) => {
  return useQuery<IExploreSusiKyokwaStep1Response>({
    queryKey: exploreSusiKyokwaQueryKeys.step1(params),
    queryFn: () =>
      EXPLORE_SUSI_KYOKWA_APIS.fetchExploreSusiKyokwaStep1API(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
    // 특별전형인 경우 특정 subtype을 선택하기 전까지는 API 호출하지 않음
    enabled: params.basicType === '일반' || (params.basicType === '특별' && params.subtypeIds && params.subtypeIds.length > 0),
  });
};

export const useGetExploreSusiKyokwaStep2 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiKyokwaStep2Response>({
    queryKey: exploreSusiKyokwaQueryKeys.step2(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_KYOKWA_APIS.fetchExploreSusiKyokwaStep2API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiKyokwaStep3 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiKyokwaStep3Response>({
    queryKey: exploreSusiKyokwaQueryKeys.step3(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_KYOKWA_APIS.fetchExploreSusiKyokwaStep3API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiKyokwaStep4 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiKyokwaStep4Response>({
    queryKey: exploreSusiKyokwaQueryKeys.step4(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_KYOKWA_APIS.fetchExploreSusiKyokwaStep4API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiKyokwaStep5 = (
  recruitmentUnitIds: number[],
) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiKyokwaStep5Response>({
    queryKey: exploreSusiKyokwaQueryKeys.step5(recruitmentUnitIds),
    queryFn: () =>
      EXPLORE_SUSI_KYOKWA_APIS.fetchExploreSusiKyokwaStep5API({
        ids: recruitmentUnitIds,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser && recruitmentUnitIds.length > 0, // 로그인중 && 선택된 recruitmentUnitIds가 있을 때만 쿼리 실행
  });
};

export const useGetExploreSusiKyokwaDetail = (recruitmentUnitId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IExploreSusiKyokwaDetailResponse | null>({
    queryKey: exploreSusiKyokwaQueryKeys.detail(recruitmentUnitId),
    queryFn: () =>
      EXPLORE_SUSI_KYOKWA_APIS.fetchExploreSusiKyokwaDetailAPI({
        id: recruitmentUnitId,
      }),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!currentUser,
  });
};
