import { useQuery } from "@tanstack/react-query";
import { EXPLORE_SEARCH_APIS } from "./apis";
import {
  IAdmissionWithCategory,
  IExploreSearchAdmissionResponse,
  IExploreSearchRecruitmentUnitResponse,
  IExploreSearchUniversityResponse,
  ISearchSusiComparison,
} from "./interfaces";

export const exploreSusiKyokwaQueryKeys = {
  all: ["explore-search"] as const,

  university: (name: string) =>
    [...exploreSusiKyokwaQueryKeys.all, "university", name] as const,
  admission: (name: string) =>
    [...exploreSusiKyokwaQueryKeys.all, "admission", name] as const,
  recruitmentUnit: (name: string) =>
    [...exploreSusiKyokwaQueryKeys.all, "recruitmentUnit", name] as const,
  admissionsByUniversity: (universityId: number) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "admissionsByUniversity",
      universityId,
    ] as const,
  recruitmentUnitsByAdmission: (admissionId: number) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "recruitmentUnitsByAdmission",
      admissionId,
    ] as const,

  allUniversities: () =>
    [...exploreSusiKyokwaQueryKeys.all, "allUniversities"] as const,
  recruitmentUnitsByIds: (ids: number[]) =>
    [
      ...exploreSusiKyokwaQueryKeys.all,
      "recruitmentUnitsByIds",
      ids,
    ] as const,
};

export const useGetExploreSearchUniversity = (params: { name: string }) => {
  return useQuery<IExploreSearchUniversityResponse[]>({
    queryKey: exploreSusiKyokwaQueryKeys.university(params.name),
    queryFn: () => EXPLORE_SEARCH_APIS.fetchExploreSearchUniversityAPI(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetExploreSearchAdmission = (params: { name: string }) => {
  return useQuery<IExploreSearchAdmissionResponse[]>({
    queryKey: exploreSusiKyokwaQueryKeys.admission(params.name),
    queryFn: () => EXPLORE_SEARCH_APIS.fetchExploreSearchAdmissionAPI(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetExploreSearchRecruitmentUnit = (params: {
  name: string;
}) => {
  return useQuery<IExploreSearchRecruitmentUnitResponse[]>({
    queryKey: exploreSusiKyokwaQueryKeys.recruitmentUnit(params.name),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchExploreSearchRecruitmentUnitAPI(params),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetAllUniversities = () => {
  return useQuery<{ id: number; name: string; region: string }[]>({
    queryKey: exploreSusiKyokwaQueryKeys.allUniversities(),
    queryFn: EXPLORE_SEARCH_APIS.fetchAllUniversitiesAPI,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetAdmissionsByUniversityId = (universityId: number) => {
  return useQuery<IAdmissionWithCategory[]>({
    queryKey: exploreSusiKyokwaQueryKeys.admissionsByUniversity(universityId),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchAdmissionsByUniversityIdAPI(universityId),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetRecruitmentUnitsByAdmissionId = (admissionId: number) => {
  return useQuery<{ id: number; name: string }[]>({
    queryKey:
      exploreSusiKyokwaQueryKeys.recruitmentUnitsByAdmission(admissionId),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchRecruitmentUnitsByAdmissionIdAPI(admissionId),
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetRecruitmentUnitsByIds = (recruitmentIds: number[]) => {
  return useQuery<Array<ISearchSusiComparison>>({
    queryKey:
      exploreSusiKyokwaQueryKeys.recruitmentUnitsByIds(recruitmentIds),
    queryFn: () =>
      EXPLORE_SEARCH_APIS.fetchRecruitmentUnitsByIdsAPI(recruitmentIds),
    staleTime: 60 * 60 * 1000, // 60 minutes
    enabled: recruitmentIds.length > 0, // recruitmentIds가 비어있지 않을 때만 쿼리 실행
  });
};
