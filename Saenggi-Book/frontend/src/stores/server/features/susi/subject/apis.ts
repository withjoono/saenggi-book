import { makeApiCall } from "@/stores/server/common-utils";
import {
  ISusiSubjectDetail,
  ISusiSubjectStep1,
  ISusiSubjectStep2,
  ISusiSubjectStep3,
  ISusiSubjectStep4,
  ISusiSubjectStep5,
} from "./interfaces";

/**
 * [수시학종] Step 1 조회 API
 */
const fetchSusiSubjectStep1API = async ({
  year,
  basic_type,
}: {
  year: number;
  basic_type: string;
}) => {
  const res = await makeApiCall<void, ISusiSubjectStep1>(
    "GET",
    `/ms/subject/step-1`,
    undefined,
    {
      params: { year, basic_type },
    },
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

const fetchSusiSubjectStep2API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, ISusiSubjectStep2[]>(
    "GET",
    `/ms/subject/step-2`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchSusiSubjectStep3API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, ISusiSubjectStep3[]>(
    "GET",
    `/ms/subject/step-3`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchSusiSubjectStep4API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, ISusiSubjectStep4[]>(
    "GET",
    `/ms/subject/step-4`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchSusiSubjectStep5API = async ({ ids }: { ids: number[] }) => {
  const res = await makeApiCall<void, ISusiSubjectStep5[]>(
    "GET",
    `/ms/subject/step-5`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const fetchSusiSubjectDetailAPI = async ({ id }: { id: number }) => {
  const res = await makeApiCall<void, ISusiSubjectDetail>(
    "GET",
    `/ms/subject/detail/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

export const SUSI_SUBJECT_APIS = {
  fetchSusiSubjectStep1API,
  fetchSusiSubjectStep2API,
  fetchSusiSubjectStep3API,
  fetchSusiSubjectStep4API,
  fetchSusiSubjectStep5API,
  fetchSusiSubjectDetailAPI,
};
