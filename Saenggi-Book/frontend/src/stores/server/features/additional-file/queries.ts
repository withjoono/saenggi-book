import { useQuery } from "@tanstack/react-query";
import { IAdditionalFile } from "./interfaces";
import { ADDITIONAL_FILE_APIS } from "./apis";
import { useGetCurrentUser } from "../me/queries";

export const additionalFileQueryKeys = {
  all: ["additionalFile"] as const,
  list: () => [...additionalFileQueryKeys.all, "list"] as const,
  officerList: (memberId: number) =>
    [...additionalFileQueryKeys.all, "officerList", memberId] as const,
};

export const useGetAdditionalFiles = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IAdditionalFile[]>({
    queryKey: additionalFileQueryKeys.list(),
    queryFn: ADDITIONAL_FILE_APIS.fetchAdditionalFilesAPI,
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetOfficerAdditionalFiles = (memberId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery<IAdditionalFile[]>({
    queryKey: additionalFileQueryKeys.officerList(memberId),
    queryFn: () =>
      ADDITIONAL_FILE_APIS.fetchOfficerAdditionalFilesAPI(memberId),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
