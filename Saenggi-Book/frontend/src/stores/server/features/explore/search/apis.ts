import { makeApiCall } from "@/stores/server/common-utils";
import {
  IAdmissionWithCategory,
  IExploreSearchAdmissionResponse,
  IExploreSearchRecruitmentUnitResponse,
  IExploreSearchUniversityResponse,
  ISearchSusiComparison,
} from "./interfaces";

const fetchExploreSearchUniversityAPI = async ({ name }: { name: string }) => {
  const res = await makeApiCall<void, IExploreSearchUniversityResponse[]>(
    "GET",
    `/explore/search/university`,
    undefined,
    {
      params: { name },
    },
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchExploreSearchAdmissionAPI = async ({ name }: { name: string }) => {
  const res = await makeApiCall<void, IExploreSearchAdmissionResponse[]>(
    "GET",
    `/explore/search/admission`,
    undefined,
    {
      params: { name },
    },
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchExploreSearchRecruitmentUnitAPI = async ({
  name,
}: {
  name: string;
}) => {
  const res = await makeApiCall<void, IExploreSearchRecruitmentUnitResponse[]>(
    "GET",
    `/explore/search/recruitment-unit`,
    undefined,
    {
      params: { name },
    },
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchAllUniversitiesAPI = async () => {
  const res = await makeApiCall<
    void,
    { id: number; name: string; region: string }[]
  >("GET", `/explore/search/universities`);
  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchAdmissionsByUniversityIdAPI = async (universityId: number) => {
  const res = await makeApiCall<void, IAdmissionWithCategory[]>(
    "GET",
    `/explore/search/university/${universityId}/admissions`,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchRecruitmentUnitsByAdmissionIdAPI = async (admissionId: number) => {
  const res = await makeApiCall<void, { id: number; name: string }[]>(
    "GET",
    `/explore/search/admission/${admissionId}/recruitment-units`,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchRecruitmentUnitsByIdsAPI = async (recruitmentIds: number[]) => {
  const res = await makeApiCall<void, Array<ISearchSusiComparison>>(
    "GET",
    `/explore/search/recruitment-units`,
    undefined,
    {
      params: { ids: recruitmentIds.join(",") },
    },
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

export const EXPLORE_SEARCH_APIS = {
  fetchExploreSearchUniversityAPI,
  fetchExploreSearchAdmissionAPI,
  fetchExploreSearchRecruitmentUnitAPI,
  fetchAllUniversitiesAPI,
  fetchAdmissionsByUniversityIdAPI,
  fetchRecruitmentUnitsByAdmissionIdAPI,
  fetchRecruitmentUnitsByIdsAPI,
};
