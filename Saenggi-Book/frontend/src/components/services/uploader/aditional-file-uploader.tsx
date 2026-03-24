import { Button } from "@/components/custom/button";
import { ADDITIONAL_FILE_APIS } from "@/stores/server/features/additional-file/apis";
import { IAdditionalFile } from "@/stores/server/features/additional-file/interfaces";
import {
  useDeleteAdditionalFile,
  useUploadAdditionalFile,
} from "@/stores/server/features/additional-file/mutations";
import { useGetAdditionalFiles } from "@/stores/server/features/additional-file/queries";
import { Download } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const AdditionalFileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: uploadFile, isPending: isUploading } =
    useUploadAdditionalFile();
  const { mutate: deleteFile, isPending: isDeleting } =
    useDeleteAdditionalFile();
  const { data: files, refetch: refetchFiles } = useGetAdditionalFiles();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile, {
        onSuccess: async () => {
          setSelectedFile(null);
          await refetchFiles();
          toast.success("파일이 성공적으로 업로드되었습니다.");
        },
        onError: (error) => {
          toast.error("파일 업로드 중 오류가 발생했습니다.");
          console.error("Upload error:", error);
        },
      });
    } else {
      toast.error("파일을 선택해주세요.");
    }
  };

  const handleDelete = (fileId: number) => {
    deleteFile(fileId, {
      onSuccess: async () => {
        await refetchFiles();
        toast.success("파일이 성공적으로 삭제되었습니다.");
      },
      onError: (error) => {
        toast.error("파일 삭제 중 오류가 발생했습니다.");
        console.error("Delete error:", error);
      },
    });
  };

  // 한글 파일명 디코딩 함수
  const decodeFileName = (fileName: string): string => {
    try {
      return decodeURIComponent(fileName.replace(/\+/g, " "));
    } catch {
      return fileName; // 디코딩 실패 시 원래 파일명 반환
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      const { url, fileName } =
        await ADDITIONAL_FILE_APIS.getAdditionalFileDownloadUrlAPI(fileId);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank"; // 새 탭에서 열기
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("파일 다운로드 중 오류가 발생했습니다.");
      console.error("Download error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">추가 자료 업로드</h2>
        <p className="text-sm text-gray-600">
          평가에 필요한 3학년 생기부, 모의고사 성적표 등을 한 번에 하나씩
          업로드해 주세요. (최대 5개 파일, 각 15MB 이하)
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2 py-10">
        <input
          type="file"
          onChange={handleFileChange}
          className="file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
        />
        <Button
          onClick={handleUpload}
          loading={isUploading}
          disabled={!selectedFile}
        >
          {isUploading ? "업로드 중..." : "업로드"}
        </Button>
      </div>

      <div className="">
        <h3 className="text-md mb-2 font-semibold">업로드된 파일 목록</h3>
        {files && files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((file: IAdditionalFile) => (
              <li key={file.id} className="flex items-center justify-between">
                <span>{decodeFileName(file.file_name)}</span>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDownload(file.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </Button>
                  <Button
                    onClick={() => handleDelete(file.id)}
                    loading={isDeleting}
                    variant="destructive"
                    size="sm"
                  >
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-accent-foreground">
            아직 업로드된 파일이 없어요 😢
          </p>
        )}
      </div>
    </div>
  );
};
