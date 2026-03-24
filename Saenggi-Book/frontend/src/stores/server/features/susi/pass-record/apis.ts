import { makeApiCall } from "@/stores/server/common-utils";
import { IPassRecord, IRecruitmentUnitPassFailRecord } from "./interfaces";

/**
 * 수시 교과 합불 사례 조회 API
 */
const fetchSusiSubjectPassRecordAPI = async ({ id }: { id: number }) => {
  const res = await makeApiCall<void, IPassRecord[]>(
    "GET",
    `/ms/subject/pass-record/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 수시 학종 합불 사례 조회 API
 */
const fetchSusiComprehensivePassRecordAPI = async ({ id }: { id: number }) => {
  const res = await makeApiCall<void, IPassRecord[]>(
    "GET",
    `/ms/comprehensive/pass-record/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 수시 합불 사례 조회 API
 */
const fetchSusiPassRecordAPI = async ({
  recruitmentUnitId,
}: {
  recruitmentUnitId: number;
}) => {
  const res = await makeApiCall<void, IRecruitmentUnitPassFailRecord[]>(
    "GET",
    `/ms/pass-record/${recruitmentUnitId}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

export const SUSI_PASSRECORD_APIS = {
  fetchSusiSubjectPassRecordAPI,
  fetchSusiComprehensivePassRecordAPI,
  fetchSusiPassRecordAPI,
};
