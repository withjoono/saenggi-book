import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { LifeRecordUploader } from "@/components/services/uploader/life-record-uploader";
import { useLifeRecordUpload } from "@/hooks/use-life-record-upload";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LifeRecordInputTabs } from "@/components/services/life-record/life-record-input-tabs";

export const Route = createLazyFileRoute("/users/_layout/school-record")({
  component: SchoolRecord,
});

function SchoolRecord() {
  const { data: currentUser } = useGetCurrentUser();
  const { canUpload, uploadFile } = useLifeRecordUpload();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">생기부 등록</h3>
        <p className="text-sm text-muted-foreground">
          안내에 따라 PDF혹은 HTML로 생기부를 등록하세요. T Skool 시스템을 통해
          대학별 환산식에 따라 내 성적을 계산해서 한눈에 표시할 수 있어요.
          생기부 등록 후 사정관 평가를 진행한 뒤{" "}
          <Link className="text-blue-500" to="/ms/comprehensive">
            학종
          </Link>{" "}
          탭에서 내 평가점수에 맞는 대학들을 탐색해보세요!
        </p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : (
        <div className="space-y-8 pt-4 md:pt-8">
          {canUpload ? (
            <LifeRecordUploader uploadFile={uploadFile} />
          ) : (
            <div className="space-y-2 py-4">
              <p className="text-center text-lg font-semibold">
                내 생기부가 등록되었어요!
              </p>
              <p className="text-center text-sm">
                하단에서 성적이 제대로 입력되었는지 확인하고, 추가 성적이 있으면
                작성해주세요!
              </p>
              <p className="text-center text-sm">
                (열람용이 아닌 진본을 업로드한 경우 수동으로 성적을
                입력해야합니다)
              </p>
              <p className="text-center text-sm">
                생기부를 수정하려면 우측 하단의 문의하기를 통해 상담해주세요.
              </p>
            </div>
          )}

          <Separator />
          <div>
            <h3 className="text-lg font-medium">성적 입력</h3>
            <p className="text-sm text-muted-foreground">
              아래의 형식에 맞춰 생기부를 입력해주세요!
            </p>
            <p className="text-sm text-muted-foreground">
              필드 형식이 다르거나 범위에서 벗어난 경우 계산식에서 제외되니 다시
              한번 확인해주세요.
            </p>
          </div>
          <LifeRecordInputTabs />
        </div>
      )}
    </div>
  );
}
