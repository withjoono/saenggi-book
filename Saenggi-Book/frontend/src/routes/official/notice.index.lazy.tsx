import { Button } from "@/components/custom/button";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";
import {
  useGetNoticeBoardPosts,
  useGetNoticeBoardGetEmphasizedPosts,
} from "@/stores/server/features/boards/queries";
import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createLazyFileRoute("/official/notice/")({
  component: NoticeBoardPage,
});

function NoticeBoardPage() {
  const [page, setPage] = useState(1);
  const {
    data: board,
    isLoading,
    isError,
  } = useGetNoticeBoardPosts({ page: page, limit: 15 });
  const {
    data: emphasizedPosts,
    isLoading: isLoadingEmphasizedPosts,
    isError: isErrorEemphasizedPosts,
  } = useGetNoticeBoardGetEmphasizedPosts();

  const lastPages = useMemo(() => {
    if (!board) return 1;
    return Math.ceil(board.total / 15);
  }, [board]);

  if (isLoading || isLoadingEmphasizedPosts) {
    return (
      <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-6">
        <h2 className="pb-4 text-2xl font-semibold">공지사항</h2>
        <LoadingSpinner className="py-40" />
      </div>
    );
  }
  if (isError || !board || isErrorEemphasizedPosts || !emphasizedPosts) {
    return (
      <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-6">
        <h2 className="pb-4 text-2xl font-semibold">공지사항</h2>
        <UnknownErrorPage className="h-auto py-40" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-6">
      <h2 className="pb-4 text-2xl font-semibold">공지사항</h2>

      <div>
        <div className="flex items-center divide-x bg-muted/50 py-2 font-semibold">
          <div className="w-[100px] shrink-0 px-4">번호</div>
          <div className="w-full px-4">제목</div>
          <div className="w-[150px] shrink-0 px-4">작성일</div>
        </div>

        <div>
          {emphasizedPosts.map((item) => {
            return (
              <Link
                to="/official/notice/$postId"
                params={{
                  postId: item.id + "",
                }}
                key={item.id}
                className="group flex items-center border-b py-6"
              >
                <div className="w-[100px] shrink-0 px-4">
                  <Badge>공지</Badge>
                </div>
                <div className="line-clamp-1 w-full items-center px-4 group-hover:underline">
                  {item.title}
                </div>
                <div className="w-[150px] shrink-0 px-4 text-foreground/50">
                  {formatDateYYYYMMDD(item.created_at)}
                </div>
              </Link>
            );
          })}
          {board.posts.length ? (
            board.posts
              .filter((n) => !emphasizedPosts.map((t) => t.id).includes(n.id))
              .map((item) => {
                return (
                  <Link
                    to="/official/notice/$postId"
                    params={{
                      postId: item.id + "",
                    }}
                    key={item.id}
                    className="group flex items-center border-b py-6"
                  >
                    <div className="w-[100px] shrink-0 px-4">{item.id}</div>
                    <div className="line-clamp-1 w-full items-center px-4 group-hover:underline">
                      {item.title}
                    </div>
                    <div className="w-[150px] shrink-0 px-4 text-foreground/50">
                      {formatDateYYYYMMDD(item.created_at)}
                    </div>
                  </Link>
                );
              })
          ) : (
            <p className="py-20 text-center text-2xl">게시글이 없어요 ㅜㅜ</p>
          )}
        </div>
      </div>
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(1)}
          disabled={page <= 1}
        >
          처음으로
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page <= 1}
        >
          이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={board.total <= (page - 1) * 15 + board.posts.length}
        >
          다음
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(lastPages)}
          disabled={board.total <= (page - 1) * 15 + board.posts.length}
        >
          마지막으로
        </Button>
      </div>
    </div>
  );
}
