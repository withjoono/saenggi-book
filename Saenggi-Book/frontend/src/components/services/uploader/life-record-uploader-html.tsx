import { useState } from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/file-upload";
import { Paperclip, XIcon } from "lucide-react";
import { Button } from "@/components/custom/button";

import htmlGuide from "@/assets/images/guide_html.png";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="mb-3 h-8 w-8 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">업로드 하려면 클릭</span>
        &nbsp;또는 파일을 드래그 해주세요.
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        HTML 파일만 업로드 가능합니다.
      </p>
    </>
  );
};

interface LifeRecordUploaderHTMLProps {
  className?: string;
  uploadFile: (type: "html" | "pdf", file: File) => Promise<void>;
}

const LifeRecordUploaderHTML = ({
  className,
  uploadFile,
}: LifeRecordUploaderHTMLProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 15,
    multiple: false, // 다중 파일 업로드를 허용하지 않음
    accept: {
      "text/html": [".html", ".htm"], // HTML 파일 허용
    },
  };
  const handleSubmit = async () => {
    if (isLoading) return;
    if (!files || !files[0]) {
      toast.error("파일을 선택해주세요.");
      return;
    }
    try {
      setIsLoading(true);
      await uploadFile("html", files[0]);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-8 rounded-md border p-4", className)}>
      <FileUploader
        value={files}
        onValueChange={setFiles}
        dropzoneOptions={dropZoneConfig}
        className="relative rounded-lg bg-background p-2"
      >
        <FileInput className="outline-dashed outline-1 outline-white">
          <div className="flex w-full flex-col items-center justify-center pb-4 pt-3">
            <FileSvgDraw />
          </div>
        </FileInput>
        <FileUploaderContent>
          {files &&
            files.length > 0 &&
            files.map((file, i) => (
              <FileUploaderItem key={i} index={i}>
                <Paperclip className="h-4 w-4 stroke-current" />
                <span>{file.name}</span>
              </FileUploaderItem>
            ))}
        </FileUploaderContent>
      </FileUploader>
      <div className="text-sm">
        <p>생기부 파일은 오남용 방지를 위해 1회만 업로드 할 수 있습니다.</p>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!files || !files[0] || isLoading}
        className="w-full"
      >
        저장하기
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <p className="cursor-pointer text-sm text-blue-500">
            나이스플러스 생기부 HTML 다운로드 안내
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-screen h-screen overflow-scroll rounded-none p-0 sm:rounded-none">
          <div className="sticky left-0 top-0 flex w-full items-center gap-4 border-b bg-primary px-4 py-4 text-primary-foreground shadow-md">
            <DialogClose>
              <XIcon />
            </DialogClose>
            <p>나이스플러스 HTML 다운로드 안내</p>
          </div>
          <img
            src={htmlGuide}
            alt="html-guide"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LifeRecordUploaderHTML;
