import { useRouter } from "@tanstack/react-router";
import { Button } from "../custom/button";
import { cn } from "@/lib/utils";

export default function UnknownErrorPage({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={cn("h-[calc(100svh-220px)]", className)}>
      <div className="m-auto flex h-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">Oops!</h1>
        <span className="font-medium">알 수 없는 오류가 발생했습니다.</span>
        <p className="text-center text-muted-foreground">
          죄송합니다. 예기치 않은 문제가 발생했습니다. <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.history.back()}>
            이전 페이지로
          </Button>
          <Button onClick={() => window.location.reload()}>
            페이지 새로고침
          </Button>
          <Button onClick={() => router.navigate({ to: "/" })}>
            홈으로 가기
          </Button>
        </div>
      </div>
    </div>
  );
}
