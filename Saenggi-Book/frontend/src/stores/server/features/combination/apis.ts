import { makeApiCall } from "@/stores/server/common-utils";
import {
  ICombination,
  ICreateCombinationBody,
  IUpdateCombinationBody,
} from "./interfaces";

const fetchCombinationsAPI = async (memberId: string) => {
  const res = await makeApiCall<void, ICombination[]>(
    "GET",
    `/members/${memberId}/combinations`,
  );

  if (res.success) {
    return res.data;
  }
  return [];
};

const createCombinationAPI = async (
  memberId: string,
  body: ICreateCombinationBody,
) => {
  const res = await makeApiCall<ICreateCombinationBody, ICombination>(
    "POST",
    `/members/${memberId}/combinations`,
    body,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

const updateCombinationAPI = async (
  memberId: string,
  combinationId: number,
  body: IUpdateCombinationBody,
) => {
  const res = await makeApiCall<IUpdateCombinationBody, ICombination>(
    "PATCH",
    `/members/${memberId}/combinations/${combinationId}`,
    body,
  );

  if (res.success) {
    return res.data;
  }
  return null;
};

const deleteCombinationAPI = async (
  memberId: string,
  combinationId: number,
) => {
  const res = await makeApiCall<void, void>(
    "DELETE",
    `/members/${memberId}/combinations/${combinationId}`,
  );

  return res.success;
};

export const COMBINATION_API = {
  fetchCombinationsAPI,
  createCombinationAPI,
  updateCombinationAPI,
  deleteCombinationAPI,
};
