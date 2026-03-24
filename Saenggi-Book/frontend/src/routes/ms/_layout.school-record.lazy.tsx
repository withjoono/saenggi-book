import { useState } from "react";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { LifeRecordUploader } from "@/components/services/uploader/life-record-uploader";
import { useLifeRecordUpload } from "@/hooks/use-life-record-upload";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LifeRecordInputTabs } from "@/components/services/life-record/life-record-input-tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/custom/button";
import { RefreshCcw, Upload, AlertTriangle } from "lucide-react";

export const Route = createLazyFileRoute("/ms/_layout/school-record")({
  component: SchoolRecord,
});

function SchoolRecord() {
  const { data: currentUser } = useGetCurrentUser();
  const { canUpload, hasExistingRecord, uploadFile, deleteAndReupload } =
    useLifeRecordUpload();
  const [showReuploader, setShowReuploader] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">생기부 입력</h3>
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
          {canUpload && !showReuploader ? (
            <LifeRecordUploader uploadFile={uploadFile} />
          ) : hasExistingRecord && !showReuploader ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-center text-lg font-semibold">
                  내 생기부가 등록되었어요!
                </p>
                <p className="text-center text-sm">
                  하단에서 성적이 제대로 입력되었는지 확인하고, 추가 성적이
                  있으면 작성해주세요!
                </p>
                <p className="text-center text-sm">
                  (열람용이 아닌 진본을 업로드한 경우 수동으로 성적을
                  입력해야합니다)
                </p>
              </div>

              {/* 재업로드 버튼 + 확인 모달 */}
              <div className="flex justify-center pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      생기부 재업로드
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        생기부를 다시 업로드하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3">
                          <p>
                            학년이 올라가거나 새로운 생기부를 등록할 때 사용하세요.
                          </p>
                          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
                            <p className="font-semibold text-amber-800 dark:text-amber-200">
                              ⚠️ 다음 데이터가 초기화됩니다:
                            </p>
                            <ul className="mt-1 list-inside list-disc text-amber-700 dark:text-amber-300">
                              <li>기존 교과 성적 (재파싱됩니다)</li>
                              <li>AI 소재 분석 결과 (다시 분석 필요)</li>
                              <li>빌드 분석 결과 (다시 분석 필요)</li>
                            </ul>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            사정관 평가(Officer Evaluation)는 보존됩니다.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => setShowReuploader(true)}
                        className="gap-2 bg-amber-600 hover:bg-amber-700"
                      >
                        <Upload className="h-4 w-4" />
                        재업로드 진행
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : showReuploader ? (
            <div className="space-y-4 py-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <p className="text-center text-sm font-semibold text-amber-800 dark:text-amber-200">
                  🔄 새 생기부 파일을 업로드해주세요.
                </p>
                <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                  기존 교과 성적이 삭제되고 새 파일로 대체됩니다. AI 분석 결과는
                  초기화되며, 다시 분석을 실행해야 합니다.
                </p>
              </div>
              <LifeRecordUploader uploadFile={deleteAndReupload} />
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setShowReuploader(false)}
                >
                  취소하고 돌아가기
                </Button>
              </div>
            </div>
          ) : null}

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
