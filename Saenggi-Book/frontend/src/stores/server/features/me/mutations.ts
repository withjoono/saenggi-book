import { createMutation } from "../../common-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hubApiClient } from "@/stores/server/hub-api-client";
import { useGetCurrentUser, meQueryKeys } from "./queries";
import { IEditLifeRecordBody, IEditProfileBody } from "./interfaces";

/**
 * 프로필 수정
 */
export const useEditProfile = () => {
  return createMutation<IEditProfileBody, void>("PATCH", "/members/profile");
};

/**
 * [Hub DB 이전] 생기부 수동 편집 (Hub 백엔드 API 사용)
 * Hub-Backend의 PATCH /schoolrecord/:memberId/life-record 엔드포인트 호출
 */
export const useEditLifeRecord = () => {
  const { data: currentUser } = useGetCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: IEditLifeRecordBody) => {
      if (!currentUser) {
        throw new Error("로그인이 필요합니다.");
      }
      const res = await hubApiClient.patch(
        `/schoolrecord/${currentUser.id}/life-record`,
        body,
      );
      return { success: true, data: res.data };
    },
    onSuccess: () => {
      // 생기부 데이터 캐시 무효화
      queryClient.invalidateQueries({ queryKey: meQueryKeys.schoolRecords() });
    },
    onError: (e) => {
      console.error("생기부 수정 실패:", e);
    },
  });
};
