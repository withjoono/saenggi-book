import { makeApiCall } from "@/stores/server/common-utils";
import {
  ISusiComprehensive,
  ISusiComprehensiveStep1,
  ISusiComprehensiveStep2,
  ISusiComprehensiveStep3,
  ISusiComprehensiveStep4,
} from "./interfaces";

/**
 * [수시종합] Step 1 조회 API
 */
const fetchSusiComprehensiveStep1API = async ({
  year,
  basic_type,
  large_department,
  medium_department,
  small_department,
}: {
  year: number;
  basic_type: string;
  large_department: string;
  medium_department: string;
  small_department: string;
}): Promise<ISusiComprehensiveStep1[] | null> => {
  const res = await makeApiCall<void, ISusiComprehensiveStep1[]>(
    "GET",
    `/ms/comprehensive/step-1`,
    undefined,
    {
      params: {
        year,
        basic_type,
        large_department,
        medium_department,
        small_department,
      },
    },
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

/**
 * [수시종합] Step 2 조회 API
 */
const fetchSusiComprehensiveStep2API = async ({
  ids,
}: {
  ids: number[];
}): Promise<ISusiComprehensiveStep2[]> => {
  const res = await makeApiCall<void, ISusiComprehensiveStep2[]>(
    "GET",
    `/ms/comprehensive/step-2`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [수시종합] Step 3 조회 API
 */
const fetchSusiComprehensiveStep3API = async ({
  ids,
}: {
  ids: number[];
}): Promise<ISusiComprehensiveStep3[]> => {
  const res = await makeApiCall<void, ISusiComprehensiveStep3[]>(
    "GET",
    `/ms/comprehensive/step-3`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [수시종합] Step 4 조회 API
 */
const fetchSusiComprehensiveStep4API = async ({
  ids,
}: {
  ids: number[];
}): Promise<ISusiComprehensiveStep4[]> => {
  const res = await makeApiCall<void, ISusiComprehensiveStep4[]>(
    "GET",
    `/ms/comprehensive/step-4`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * [수시종합] 상세 조회 API
 */
const fetchSusiComprehensiveDetailAPI = async ({
  id,
}: {
  id: number;
}): Promise<ISusiComprehensive | null> => {
  const res = await makeApiCall<void, ISusiComprehensive>(
    "GET",
    `/ms/comprehensive/detail/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

export const SUSI_COMP_APIS = {
  fetchSusiComprehensiveStep1API,
  fetchSusiComprehensiveStep2API,
  fetchSusiComprehensiveStep3API,
  fetchSusiComprehensiveStep4API,
  fetchSusiComprehensiveDetailAPI,
};
