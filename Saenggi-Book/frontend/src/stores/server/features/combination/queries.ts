import { useQuery } from "@tanstack/react-query";
import { COMBINATION_API } from "./apis";
import { useGetCurrentUser } from "../me/queries";

export const combinationQueryKeys = {
  all: ["combinations"] as const,
  list: () => [...combinationQueryKeys.all, "list"] as const,
  detail: (id: number) => [...combinationQueryKeys.all, "detail", id] as const,
};

export const useGetCombinations = () => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: combinationQueryKeys.list(),
    queryFn: () => COMBINATION_API.fetchCombinationsAPI(currentUser?.id || ""),
    enabled: !!currentUser,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};

export const useGetCombination = (combinationId: number) => {
  const { data: currentUser } = useGetCurrentUser();
  return useQuery({
    queryKey: combinationQueryKeys.detail(combinationId),
    queryFn: () =>
      COMBINATION_API.fetchCombinationsAPI(currentUser?.id || "").then(
        (combinations) => combinations.find((c) => c.id === combinationId),
      ),
    enabled: !!currentUser && !!combinationId,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });
};
