import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AdditionalFileUploader } from "@/components/services/uploader/aditional-file-uploader";

export const Route = createLazyFileRoute("/users/_layout/additional-file")({
  component: AdditionalFile,
});

function AdditionalFile() {
  const { data: currentUser } = useGetCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">추가자료 업로드</h3>
        <p className="text-sm text-muted-foreground">
          사정관 평가 요청 시 보다 정확한 평가를 위해 참고할 추가자료를
          업로드해주세요.
          <br /> 파일 삭제 시 서버에서 완전히 제거됩니다.
          <br /> (평가 완료 전까진 유지해주세요!)
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : (
        <div className="space-y-8 pt-4 md:pt-8">
          <AdditionalFileUploader />
        </div>
      )}
    </div>
  );
}
