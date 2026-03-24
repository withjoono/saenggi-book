import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploaderPDF from "./life-record-uploader-pdf";
// import FileUploaderHTML from "./life-record-uploader-html";

interface LifeRecordFileUploadFormProps {
  uploadFile: (type: "html" | "pdf", file: File) => Promise<void>;
}

export const LifeRecordUploader = ({
  uploadFile,
}: LifeRecordFileUploadFormProps) => {
  return (
    <div>
      <div className="space-y-2 py-4">
        <p className="text-center text-lg font-semibold">
          아직 생기부가 등록되어 있지 않아요 😭
        </p>
        <p className="text-center text-sm">
          하단의 업로드폼에서 PDF 혹은 HTML 중 하나를 선택해서 업로드해주세요!
        </p>
        <p className="text-center text-sm">
          (사정관 평가 서비스를 이용하지 않는다면 하단에서 성적만 입력해도
          무방합니다.)
        </p>
      </div>
      <div className="">
        <Tabs defaultValue="pdf" className="mx-auto w-full max-w-[500px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">PDF(추천)</TabsTrigger>
            <TabsTrigger value="html" disabled>
              HTML
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
            <FileUploaderPDF
              className="mx-auto w-full max-w-lg"
              uploadFile={uploadFile}
            />
          </TabsContent>
          <TabsContent value="html">
            {/* <FileUploaderHTML
              className="mx-auto w-full max-w-lg"
              uploadFile={uploadFile}
            /> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
