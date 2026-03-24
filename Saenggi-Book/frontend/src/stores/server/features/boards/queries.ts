import { useQuery } from "@tanstack/react-query";
import { BOARDS_API } from "./apis";

export const boardsQueryKeys = {
  all: ["boards"] as const,
  noticeBoardPosts: (page: number, limit: number) =>
    [...boardsQueryKeys.all, "noticeBoardPosts", page, limit] as const,
  noticeBoardEmphasizedPosts: () =>
    [...boardsQueryKeys.all, "emphasizedNoticeBoardPosts"] as const,
  noticeBoardPost: (postId: string) =>
    [...boardsQueryKeys.all, "noticeBoardPost", postId] as const,
};

/**
 * 공지사항 게시글 조회
 */
export const useGetNoticeBoardPosts = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) =>
  useQuery({
    queryKey: boardsQueryKeys.noticeBoardPosts(page, limit),
    queryFn: () =>
      BOARDS_API.fetchBoardPostsAPI({
        page,
        limit,
        boardId: "1",
      }),
  });

/**
 * 강조된 공지사항 게시글 조회
 */
export const useGetNoticeBoardGetEmphasizedPosts = () =>
  useQuery({
    queryKey: boardsQueryKeys.noticeBoardEmphasizedPosts(),
    queryFn: () =>
      BOARDS_API.fetchBoardEmphasizedPostsAPI({
        boardId: "1",
      }),
  });

/**
 *  공지사항 게시글 조회
 */
export const useGetNoticeBoardPost = ({ postId }: { postId: string }) =>
  useQuery({
    queryKey: boardsQueryKeys.noticeBoardPost(postId),
    queryFn: () => BOARDS_API.fetchBoardPostAPI({ boardId: "1", postId }),
  });
