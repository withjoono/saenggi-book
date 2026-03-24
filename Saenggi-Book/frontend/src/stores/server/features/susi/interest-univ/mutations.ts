import { createMutation } from "@/stores/server/common-utils";
import { useGetCurrentUser } from "../../me/queries";
import { IAddInterestUnivBody } from "./interfaces";

/**
 * 관심대학 추가
 */
export const useAddInterestUniv = () => {
  const { data: user } = useGetCurrentUser();
  return createMutation<IAddInterestUnivBody, void>(
    "POST",
    `/members/${user?.id}/interests`,
  );
};

/**
 * 관심대학 삭제
 */
export const useRemoveInterestUniv = () => {
  const { data: user } = useGetCurrentUser();
  return createMutation<
    {
      targetIds: number[];
      targetTable:
        | "susi_subject_tb"
        | "susi_comprehensive_tb"
        | "early_subject"
        | "early_comprehensive";
    },
    void
  >("DELETE", `/members/${user?.id}/interests`);
};
