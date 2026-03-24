import { createMutation } from "@/stores/server/common-utils";
import { ICreateCombinationBody, IUpdateCombinationBody } from "./interfaces";
import { useGetCurrentUser } from "../me/queries";

export const useCreateCombination = () => {
  const { data: user } = useGetCurrentUser();
  return createMutation<ICreateCombinationBody, void>(
    "POST",
    `/members/${user?.id}/combinations`,
  );
};

export const useUpdateCombination = (combinationId: number) => {
  const { data: user } = useGetCurrentUser();
  return createMutation<IUpdateCombinationBody, void>(
    "PATCH",
    `/members/${user?.id}/combinations/${combinationId}`,
  );
};

export const useDeleteCombination = (combinationId: number) => {
  const { data: user } = useGetCurrentUser();
  return createMutation<void, void>(
    "DELETE",
    `/members/${user?.id}/combinations/${combinationId}`,
  );
};
