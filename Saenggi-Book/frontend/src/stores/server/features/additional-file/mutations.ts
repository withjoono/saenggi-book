import { ADDITIONAL_FILE_APIS } from "./apis";
import { useMutation } from "@tanstack/react-query";

export const useUploadAdditionalFile = () => {
  return useMutation({
    mutationFn: ADDITIONAL_FILE_APIS.uploadAdditionalFileAPI,
  });
};

export const useDeleteAdditionalFile = () => {
  return useMutation({
    mutationFn: (fileId: number) =>
      ADDITIONAL_FILE_APIS.deleteAdditionalFileAPI(fileId),
  });
};
