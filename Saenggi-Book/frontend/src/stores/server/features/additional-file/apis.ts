import { makeApiCall } from "../../common-utils";
import {
  IAdditionalFile,
  IUploadAdditionalFileResponse,
  IDeleteAdditionalFileResponse,
} from "./interfaces";

const uploadAdditionalFileAPI = async (file: File) => {
  const encodedFileName = encodeURIComponent(file.name);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", encodedFileName); // 파일명을 인코딩한 후 전송

  const res = await makeApiCall<FormData, IUploadAdditionalFileResponse>(
    "POST",
    "/additional-files/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (res.success) {
    return res.data;
  }
  throw new Error(res.error);
};

const fetchAdditionalFilesAPI = async () => {
  const res = await makeApiCall<void, IAdditionalFile[]>(
    "GET",
    "/additional-files/list",
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

const deleteAdditionalFileAPI = async (fileId: number) => {
  const res = await makeApiCall<void, IDeleteAdditionalFileResponse>(
    "DELETE",
    `/additional-files/${fileId}`,
  );
  if (res.success) {
    return res.data;
  }
  throw new Error(res.error);
};

const getAdditionalFileDownloadUrlAPI = async (fileId: number) => {
  const res = await makeApiCall<void, { url: string; fileName: string }>(
    "GET",
    `/additional-files/download/${fileId}`,
  );
  if (res.success) {
    return res.data;
  }
  throw new Error(res.error);
};

const fetchOfficerAdditionalFilesAPI = async (memberId: number) => {
  const res = await makeApiCall<void, IAdditionalFile[]>(
    "GET",
    `/additional-files/officer/list?memberId=${memberId}`,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};
const getOfficerAdditionalFileDownloadUrlAPI = async (fileId: number) => {
  const res = await makeApiCall<void, { url: string; fileName: string }>(
    "GET",
    `/additional-files/officer/download/${fileId}`,
  );
  if (res.success) {
    return res.data;
  }
  throw new Error(res.error);
};

export const ADDITIONAL_FILE_APIS = {
  uploadAdditionalFileAPI,
  fetchAdditionalFilesAPI,
  deleteAdditionalFileAPI,
  getAdditionalFileDownloadUrlAPI,
  fetchOfficerAdditionalFilesAPI,
  getOfficerAdditionalFileDownloadUrlAPI,
};
