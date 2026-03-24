import { useRouter } from "@tanstack/react-router";
import { Button } from "../custom/button";

export default function NotFoundError() {
  const router = useRouter();

  return (
    <div className="h-[calc(100svh-220px)]">
      <div className="m-auto flex h-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">404</h1>
        <span className="font-medium">이런! 페이지를 찾을 수 없습니다!</span>
        <p className="text-center text-muted-foreground">
          찾고 있는 페이지가 존재하지 않거나 <br />
          삭제되었을 수 있습니다.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.history.back()}>
            돌아가기
          </Button>
          <Button onClick={() => router.navigate({ to: "/" })}>
            홈으로 가기
          </Button>
        </div>
      </div>
    </div>
  );
}
