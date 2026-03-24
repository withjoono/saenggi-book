/**
 * ============================================
 * 생활기록부 업로드 훅 (Hub 중앙 API 사용)
 * Hub-Backend의 schoolrecord 모듈을 통해 업로드합니다.
 * 수시/정시와 동일한 패턴으로 크로스앱 공유를 지원합니다.
 * ============================================
 */

import { hubApiClient } from "@/stores/server/hub-api-client";
import { useAuthStore } from "@/stores/client/use-auth-store";
import {
  useGetCurrentUser,
  useGetSchoolRecords,
} from "@/stores/server/features/me/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const useLifeRecordUpload = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: schoolRecords, refetch: _refetchSchoolRecord } = useGetSchoolRecords();

  // 생기부 데이터가 없으면 업로드 가능 (isEmpty가 true면 canUpload도 true)
  const canUpload = schoolRecords?.isEmpty ?? true;
  // 기존 생기부 데이터가 있는지 여부
  const hasExistingRecord = !(schoolRecords?.isEmpty ?? true);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Zustand
  const { clearTokens } = useAuthStore();

  const _handleLogout = () => {
    clearTokens();
    queryClient.clear();
    toast.success("토큰이 만료되어 로그아웃됩니다.");
    navigate({ to: "/auth/login" });
  };

  /**
   * 생기부 파일 업로드 (Hub 중앙 API)
   * - HTML: POST /schoolrecord/:memberId/parse/html (파싱 + 저장 한 번에 처리)
   * - PDF: POST /schoolrecord/:memberId/parse/pdf (AI 파싱 + 저장 한 번에 처리)
   */
  const uploadFile = async (type: "html" | "pdf", file: File) => {
    if (!currentUser) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (type === "html") {
        // Hub-Backend에서 HTML 파싱 + 저장을 한 번에 처리
        const res = await hubApiClient.post(
          `/schoolrecord/${currentUser.id}/parse/html`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        if (res.data) {
          toast.success("생활기록부(HTML) 업로드에 성공하였습니다.");
          await _refetchSchoolRecord();
        }
      } else if (type === "pdf") {
        // Hub-Backend에서 PDF AI 파싱 + 저장을 한 번에 처리
        toast.info("PDF 파싱 중입니다. 최대 5분 정도 걸릴 수 있습니다...");
        const res = await hubApiClient.post(
          `/schoolrecord/${currentUser.id}/parse/pdf`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 300000, // 5분 타임아웃 (AI 파싱이 오래 걸릴 수 있음)
          },
        );
        if (res.data) {
          toast.success("생활기록부(PDF) 업로드에 성공하였습니다.");
          await _refetchSchoolRecord();
        }
      }
    } catch (e: unknown) {
      console.error("[useLifeRecordUpload] 업로드 실패:", e);
      const error = e as { response?: { data?: { message?: string } }, code?: string };

      // 타임아웃 에러인 경우 특별한 메시지 표시
      if (error.code === "ECONNABORTED") {
        toast.error(
          "파일 처리 시간이 초과되었습니다. 파일 크기가 크거나 서버가 혼잡할 수 있습니다. 잠시 후 다시 시도해주세요.",
          { duration: 5000 }
        );
      } else {
        toast.error(error.response?.data?.message || "파일 업로드에 실패했습니다.");
      }
    }
  };

  /**
   * 생기부 재업로드 (기존 성적 삭제 → 새 파일 업로드)
   * - 사정관 평가(officer evaluation)는 보존됨
   * - 교과 성적(subjects, selectSubjects, attendance, volunteers)만 삭제 후 재등록
   */
  const deleteAndReupload = async (type: "html" | "pdf", file: File) => {
    if (!currentUser) return;

    try {
      toast.info("기존 생기부 데이터를 삭제하고 재등록합니다...");

      // 1. 기존 성적 데이터 삭제 (Hub DELETE API)
      await hubApiClient.delete(`/schoolrecord/${currentUser.id}`);

      // 2. 캐시 무효화
      await _refetchSchoolRecord();

      // 3. 새 파일 업로드
      await uploadFile(type, file);
    } catch (e: unknown) {
      console.error("[useLifeRecordUpload] 재업로드 실패:", e);
      const error = e as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "생기부 재등록에 실패했습니다.");
    }
  };

  return { canUpload, hasExistingRecord, uploadFile, deleteAndReupload };
};
