import { buttonVariants } from "@/components/custom/button";
import UnknownErrorPage from "@/components/errors/unknown-error";
import LoadingSpinner from "@/components/loading-spinner";
import { formatDateYYYYMMDDHHMMSS } from "@/lib/utils/common/date";
import { useGetNoticeBoardPost } from "@/stores/server/features/boards/queries";
import { Link } from "@tanstack/react-router";
import { createLazyFileRoute } from "@tanstack/react-router";
import DOMPurify from "dompurify";

export const Route = createLazyFileRoute("/official/notice/$postId")({
  component: NoticePostPage,
});

function NoticePostPage() {
  const {
    data: post,
    isLoading,
    isError,
  } = useGetNoticeBoardPost({ postId: Route.useParams().postId });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 py-6">
        <h2 className="pb-4 text-2xl font-semibold">공지사항</h2>
        <LoadingSpinner className="py-40" />
      </div>
    );
  }
  if (isError || !post) {
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

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{post.title}</h2>
        <p className="border-b-2 pb-4 text-sm">
          {formatDateYYYYMMDDHHMMSS(post.created_at)}
        </p>

        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(String(post.content)),
          }}
          className="ql-editor min-h-[600px] w-full whitespace-normal"
        />
        <div className="flex justify-center gap-4">
          <Link
            to="/official/notice"
            className={buttonVariants({ variant: "outline" })}
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
