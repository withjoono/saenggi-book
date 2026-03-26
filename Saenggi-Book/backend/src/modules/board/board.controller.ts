// @ts-nocheck
import { Controller, Get, Post, Body, Param, Patch, Query, Delete } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreatePostDto } from './dtos/post.dto';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { CreateCommentDto } from './dtos/comment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async getAllBoards() {
    return this.boardService.getAllBoards();
  }

  @Get(':boardId/posts')
  @Public()
  async getPostsByBoard(
    @Param('boardId') boardId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<{
    posts: PostEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { posts, total } = await this.boardService.getPostsByBoard(boardId, paginationDto);
    return {
      posts,
      total,
      page: paginationDto.page,
      limit: paginationDto.limit,
    };
  }

  @Get(':boardId/posts/emphasis')
  @Public()
  async getEmphasizedPostsByBoard(@Param('boardId') boardId: number): Promise<any[]> {
    const posts = await this.boardService.getEmphasizedPostsByBoard(boardId);
    return posts;
  }

  @Post(':boardId/posts')
  async createPost(
    @Param('boardId') boardId: number,
    @Body() createPostDto: CreatePostDto,
    @CurrentMemberId() memberId: string,
  ): Promise<any> {
    return this.boardService.createPost(boardId, createPostDto, memberId);
  }

  @Get(':boardId/posts/:postId')
  @Public()
  async getPost(
    @Param('boardId') boardId: number,
    @Param('postId') postId: number,
  ): Promise<any> {
    return this.boardService.getPostById(boardId, postId);
  }

  @Patch(':boardId/posts/:postId')
  async editPost(
    @Param('boardId') boardId: number,
    @Param('postId') postId: number,
    @Body() createPostDto: CreatePostDto,
    @CurrentMemberId() memberId: string,
  ): Promise<any> {
    return this.boardService.editPost(boardId, postId, createPostDto, memberId);
  }

  @Delete(':boardId/posts/:postId')
  async deletePost(
    @Param('boardId') boardId: number,
    @Param('postId') postId: number,
    @CurrentMemberId() memberId: string,
  ): Promise<void> {
    return this.boardService.deletePost(boardId, postId, memberId);
  }

  @Post(':boardId/posts/:postId/comments')
  async createComment(
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentMemberId() memberId: string,
  ): Promise<any> {
    return this.boardService.createComment(postId, createCommentDto, memberId);
  }

  @Get(':boardId/posts/:postId/comments')
  async getCommentsByPost(@Param('postId') postId: number): Promise<any[]> {
    return this.boardService.getCommentsByPost(postId);
  }
}
