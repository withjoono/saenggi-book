import { useQuery } from "@tanstack/react-query";
import {
  ISusiSubjectDetail,
  ISusiSubjectStep1,
  ISusiSubjectStep2,
  ISusiSubjectStep3,
  ISusiSubjectStep4,
  ISusiSubjectStep5,
} from "./interfaces";
import { SUSI_SUBJECT_APIS } from "./apis";
import { useGetCurrentUser } from "../../me/queries";

export const susiQueryKeys = {
  all: ["susi-subject"] as const,
  step1: (params: { year: number; basic_type: string }) =>
    [...susiQueryKeys.all, "step-1", params] as const,
  step2: (ids: number[]) => [...susiQueryKeys.all, "step-2", ids] as const,
  step3: (ids: number[]) => [...susiQueryKeys.all, "step-3", ids] as const,
  step4: (ids: number[]) => [...susiQueryKeys.all, "step-4", ids] as const,
  step5: (ids: number[]) => [...susiQueryKeys.all, "step-5", ids] as const,
  detail: (id: number) => [...susiQueryKeys.all, "detail", id] as const,
};

export const useGetSusiSubjectStep1 = (params: {
  year: number;
  basic_type: string;
}) => {
  return useQuery<ISusiSubjectStep1 | null>({
    queryKey: susiQueryKeys.step1(params),
    queryFn: () => SUSI_SUBJECT_APIS.fetchSusiSubjectStep1API(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetSusiSubjectStep2 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiSubjectStep2[]>({
    queryKey: susiQueryKeys.step2(params.ids),
    queryFn: () => SUSI_SUBJECT_APIS.fetchSusiSubjectStep2API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetSusiSubjectStep3 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiSubjectStep3[]>({
    queryKey: susiQueryKeys.step3(params.ids),
    queryFn: () => SUSI_SUBJECT_APIS.fetchSusiSubjectStep3API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetSusiSubjectStep4 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiSubjectStep4[]>({
    queryKey: susiQueryKeys.step4(params.ids),
    queryFn: () => SUSI_SUBJECT_APIS.fetchSusiSubjectStep4API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetSusiSubjectStep5 = (params: { ids: number[] }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiSubjectStep5[]>({
    queryKey: susiQueryKeys.step5(params.ids),
    queryFn: () => SUSI_SUBJECT_APIS.fetchSusiSubjectStep5API(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetSusiSubjectDetail = (params: { id: number }) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<ISusiSubjectDetail | null>({
    queryKey: susiQueryKeys.detail(params.id),
    queryFn: () => SUSI_SUBJECT_APIS.fetchSusiSubjectDetailAPI(params),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
