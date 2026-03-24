import { makeApiCall } from "../../common-utils";
import { IBoardPostData } from "./interfaces";

/**
 * 게시글 조회
 */
const fetchBoardPostsAPI = async (params: {
  boardId: string; // 1: 공지사항
  page: number;
  limit: number;
}) => {
  const res = await makeApiCall<
    void,
    {
      posts: IBoardPostData[];
      total: number;
      page: number;
      limit: number;
    } | null
  >("GET", `/boards/${params.boardId}/posts`, undefined, {
    page: params.page,
    limit: params.limit,
  });
  if (res.success) {
    return res.data;
  }
  return null;
};

/**
 * 강조된 게시글 조회
 */
const fetchBoardEmphasizedPostsAPI = async (params: {
  boardId: string; // 1: 공지사항
}) => {
  const res = await makeApiCall<void, IBoardPostData[]>(
    "GET",
    `/boards/${params.boardId}/posts/emphasis`,
  );
  if (res.success) {
    return res.data;
  }
  return [];
};

/**
 * 게시글 하나 조회
 */
const fetchBoardPostAPI = async (params: {
  boardId: string; // 1: 공지사항
  postId: string; // 1: 공지사항
}) => {
  const res = await makeApiCall<void, IBoardPostData | null>(
    "GET",
    `/boards/${params.boardId}/posts/${params.postId}`,
    undefined,
  );
  if (res.success) {
    return res.data;
  }
  return null;
};

export const BOARDS_API = {
  fetchBoardEmphasizedPostsAPI,
  fetchBoardPostsAPI,
  fetchBoardPostAPI,
};
