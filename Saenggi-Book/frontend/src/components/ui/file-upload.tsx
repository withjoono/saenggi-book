import {
  Dispatch,
  SetStateAction,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useDropzone,
  DropzoneState,
  FileRejection,
  DropzoneOptions,
} from "react-dropzone";
import { toast } from "sonner";
import { Trash2 as RemoveIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../custom/button";

type DirectionOptions = "rtl" | "ltr" | undefined; // 방향 옵션 타입 정의 (오른쪽에서 왼쪽, 왼쪽에서 오른쪽, 정의되지 않음)

type FileUploaderContextType = {
  dropzoneState: DropzoneState; // Dropzone 상태
  isLOF: boolean; // 파일 제한 상태
  isFileTooBig: boolean; // 파일 크기 초과 상태
  removeFileFromSet: (index: number) => void; // 파일 제거 함수
  activeIndex: number; // 활성화된 인덱스
  setActiveIndex: Dispatch<SetStateAction<number>>; // 활성화된 인덱스 설정 함수
  orientation: "horizontal" | "vertical"; // 방향 (가로, 세로)
  direction: DirectionOptions; // 텍스트 방향 옵션
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
  const context = useContext(FileUploaderContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploaderProvider");
  }
  return context;
};

type FileUploaderProps = {
  value: File[] | null; // 파일 배열 또는 null 값
  reSelect?: boolean; // 재선택 가능 여부
  onValueChange: (value: File[] | null) => void; // 값 변경 시 호출되는 함수
  dropzoneOptions: DropzoneOptions; // Dropzone 옵션
  orientation?: "horizontal" | "vertical"; // 방향 (가로, 세로)
};

export const FileUploader = forwardRef<
  HTMLDivElement,
  FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      dropzoneOptions,
      value,
      onValueChange,
      reSelect,
      orientation = "vertical",
      children,
      dir,
      ...props
    },
    ref,
  ) => {
    const [isFileTooBig, setIsFileTooBig] = useState(false); // 파일 크기 초과 상태 관리
    const [isLOF, setIsLOF] = useState(false); // 파일 제한 상태 관리
    const [activeIndex, setActiveIndex] = useState(-1); // 활성화된 인덱스 상태 관리
    const {
      accept = {
        "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      }, // 기본적으로 이미지 파일만 허용
      maxFiles = 1, // 최대 파일 수
      maxSize = 4 * 1024 * 1024, // 최대 파일 크기 (4MB)
      multiple = true, // 다중 파일 업로드 허용
    } = dropzoneOptions;

    const reSelectAll = maxFiles === 1 ? true : reSelect; // 파일 재선택 여부 결정
    const direction: DirectionOptions = dir === "rtl" ? "rtl" : "ltr"; // 텍스트 방향 결정

    const removeFileFromSet = useCallback(
      (i: number) => {
        if (!value) return;
        const newFiles = value.filter((_, index) => index !== i); // 파일 배열에서 해당 인덱스 파일 제거
        onValueChange(newFiles);
      },
      [value, onValueChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!value) return;

        const moveNext = () => {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex); // 다음 인덱스로 이동
        };

        const movePrev = () => {
          const nextIndex = activeIndex - 1;
          setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex); // 이전 인덱스로 이동
        };

        const prevKey =
          orientation === "horizontal"
            ? direction === "ltr"
              ? "ArrowLeft"
              : "ArrowRight"
            : "ArrowUp"; // 이전 키 결정

        const nextKey =
          orientation === "horizontal"
            ? direction === "ltr"
              ? "ArrowRight"
              : "ArrowLeft"
            : "ArrowDown"; // 다음 키 결정

        if (e.key === nextKey) {
          moveNext();
        } else if (e.key === prevKey) {
          movePrev();
        } else if (e.key === "Enter" || e.key === "Space") {
          if (activeIndex === -1) {
            dropzoneState.inputRef.current?.click(); // 인덱스가 -1일 때 파일 선택
          }
        } else if (e.key === "Delete" || e.key === "Backspace") {
          if (activeIndex !== -1) {
            removeFileFromSet(activeIndex); // 파일 제거
            if (value.length - 1 === 0) {
              setActiveIndex(-1);
              return;
            }
            movePrev();
          }
        } else if (e.key === "Escape") {
          setActiveIndex(-1); // 인덱스 초기화
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [value, activeIndex, removeFileFromSet],
    );

    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        const files = acceptedFiles;

        if (!files) {
          toast.error("file error , probably too big"); // 파일 오류 메시지
          return;
        }

        const newValues: File[] = value ? [...value] : [];

        if (reSelectAll) {
          newValues.splice(0, newValues.length); // 재선택 시 모든 파일 제거
        }

        files.forEach((file) => {
          if (newValues.length < maxFiles) {
            newValues.push(file); // 새 파일 추가
          }
        });

        onValueChange(newValues);

        if (rejectedFiles.length > 0) {
          for (let i = 0; i < rejectedFiles.length; i++) {
            if (rejectedFiles[i].errors[0]?.code === "file-too-large") {
              toast.error(
                `File is too large. Max size is ${maxSize / 1024 / 1024}MB`,
              ); // 파일 크기 초과 메시지
              break;
            }
            if (rejectedFiles[i].errors[0]?.message) {
              toast.error(rejectedFiles[i].errors[0].message); // 기타 오류 메시지
              break;
            }
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [reSelectAll, value],
    );

    useEffect(() => {
      if (!value) return;
      if (value.length === maxFiles) {
        setIsLOF(true); // 파일 제한 설정
        return;
      }
      setIsLOF(false); // 파일 제한 해제
    }, [value, maxFiles]);

    const opts = dropzoneOptions
      ? dropzoneOptions
      : { accept, maxFiles, maxSize, multiple }; // Dropzone 옵션 설정

    const dropzoneState = useDropzone({
      ...opts,
      onDrop,
      onDropRejected: () => setIsFileTooBig(true), // 파일 거부 시 파일 크기 초과 상태 설정
      onDropAccepted: () => setIsFileTooBig(false), // 파일 수락 시 파일 크기 초과 상태 해제
    });

    return (
      <FileUploaderContext.Provider
        value={{
          dropzoneState,
          isLOF,
          isFileTooBig,
          removeFileFromSet,
          activeIndex,
          setActiveIndex,
          orientation,
          direction,
        }}
      >
        <div
          ref={ref}
          tabIndex={0}
          onKeyDownCapture={handleKeyDown}
          className={cn(
            "grid w-full overflow-hidden focus:outline-none",
            className,
            {
              "gap-2": value && value.length > 0,
            },
          )}
          dir={dir}
          {...props}
        >
          {children}
        </div>
      </FileUploaderContext.Provider>
    );
  },
);

FileUploader.displayName = "FileUploader";

export const FileUploaderContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { orientation } = useFileUpload();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn("w-full px-1")}
      ref={containerRef}
      aria-description="content file holder"
    >
      <div
        {...props}
        ref={ref}
        className={cn(
          "flex gap-1 rounded-xl",
          orientation === "horizontal" ? "flex-raw flex-wrap" : "flex-col",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
});

FileUploaderContent.displayName = "FileUploaderContent";

export const FileUploaderItem = forwardRef<
  HTMLDivElement,
  { index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, children, ...props }, ref) => {
  const { removeFileFromSet, activeIndex, direction } = useFileUpload();
  const isSelected = index === activeIndex;
  return (
    <div
      ref={ref}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative h-6 cursor-pointer justify-between p-1",
        className,
        isSelected ? "bg-muted" : "",
      )}
      {...props}
    >
      <div className="flex h-full w-full items-center gap-1.5 font-medium leading-none tracking-tight">
        {children}
      </div>
      <button
        type="button"
        className={cn(
          "absolute",
          direction === "rtl" ? "left-1 top-1" : "right-1 top-1",
        )}
        onClick={() => removeFileFromSet(index)}
      >
        <span className="sr-only">remove item {index}</span>
        <RemoveIcon className="h-4 w-4 duration-200 ease-in-out hover:stroke-destructive" />
      </button>
    </div>
  );
});

FileUploaderItem.displayName = "FileUploaderItem";

export const FileInput = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
  const rootProps = isLOF ? {} : dropzoneState.getRootProps();
  return (
    <div
      ref={ref}
      {...props}
      className={`relative w-full ${isLOF ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div
        className={cn(
          `w-full rounded-lg duration-300 ease-in-out ${
            dropzoneState.isDragAccept
              ? "border-green-500"
              : dropzoneState.isDragReject || isFileTooBig
                ? "border-red-500"
                : "border-gray-300"
          }`,
          className,
        )}
        {...rootProps}
      >
        {children}
      </div>
      <Input
        ref={dropzoneState.inputRef}
        disabled={isLOF}
        {...dropzoneState.getInputProps()}
        className={`${isLOF ? "cursor-not-allowed" : ""}`}
      />
    </div>
  );
});

FileInput.displayName = "FileInput";
