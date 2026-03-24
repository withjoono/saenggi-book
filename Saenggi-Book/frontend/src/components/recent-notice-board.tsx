import { Link } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { useGetNoticeBoardGetEmphasizedPosts } from "@/stores/server/features/boards/queries";
import { formatDateYYYYMMDD } from "@/lib/utils/common/date";

export const RecentNoticeBoard = () => {
  const { data: noticePosts } = useGetNoticeBoardGetEmphasizedPosts();

  return (
    <article className="min-h-[300px] w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">공지사항</h3>
        <Link to="/official/notice" className="text-sm underline">
          더보기
        </Link>
      </div>
      <Separator className="my-4" />
      <div className="space-y-3">
        {noticePosts?.length ? (
          noticePosts.slice(0, 5).map((item) => {
            return (
              <Link
                to="/official/notice/$postId"
                params={{
                  postId: item.id + "",
                }}
                key={item.id}
                className="group flex w-full cursor-pointer items-center justify-between gap-4"
              >
                <span className="line-clamp-1 w-full group-hover:underline">
                  {item.title}
                </span>
                <span className="shrink-0 text-sm text-foreground/60 group-hover:underline">
                  {formatDateYYYYMMDD(item.created_at)}
                </span>
              </Link>
            );
          })
        ) : (
          <p className="text-sm">게시글이 없습니다.</p>
        )}
      </div>
    </article>
  );
};
