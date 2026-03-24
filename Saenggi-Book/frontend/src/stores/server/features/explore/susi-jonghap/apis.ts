import { makeApiCall } from "@/stores/server/common-utils";
import {
  IExploreSusiJonghapDetailResponse,
  IExploreSusiJonghapStep1Response,
  IExploreSusiJonghapStep2Response,
  IExploreSusiJonghapStep3Response,
  IExploreSusiJonghapStep4Response,
} from "./interfaces";

const fetchExploreSusiJonghapStep1API = async ({
  year,
  basicType,
  minorFieldId,
  subtypeIds,
}: {
  year: number;
  basicType: string;
  minorFieldId: number | null;
  subtypeIds?: number[];
}) => {
  const res = await makeApiCall<void, IExploreSusiJonghapStep1Response>(
    "GET",
    `/explore/ms/jonghap/step-1`,
    undefined,
    {
      params: {
        year,
        basic_type: basicType,
        minorFieldId,
        subtype_ids: subtypeIds?.join(","),
      },
    },
  );
  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreSusiJonghapStep2API = async ({
  ids,
}: {
  ids: number[];
}) => {
  const res = await makeApiCall<void, IExploreSusiJonghapStep2Response>(
    "GET",
    `/explore/ms/jonghap/step-2`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreSusiJonghapStep3API = async ({
  ids,
}: {
  ids: number[];
}) => {
  const res = await makeApiCall<void, IExploreSusiJonghapStep3Response>(
    "GET",
    `/explore/ms/jonghap/step-3`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreSusiJonghapStep4API = async ({
  ids,
}: {
  ids: number[];
}) => {
  const res = await makeApiCall<void, IExploreSusiJonghapStep4Response>(
    "GET",
    `/explore/ms/jonghap/step-4`,
    undefined,
    { params: { ids } },
  );

  if (res.success) {
    return res.data;
  }
  return { items: [] };
};

const fetchExploreSusiJonghapDetailAPI = async ({
  id,
}: {
  id: number;
}) => {
  const res = await makeApiCall<void, IExploreSusiJonghapDetailResponse>(
    "GET",
    `/explore/ms/jonghap/detail/${id}`,
    undefined,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

export const EXPLORE_SUSI_JONGHAP_APIS = {
  fetchExploreSusiJonghapStep1API,
  fetchExploreSusiJonghapStep2API,
  fetchExploreSusiJonghapStep3API,
  fetchExploreSusiJonghapStep4API,
  fetchExploreSusiJonghapDetailAPI,
};
