// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePostDto } from './dtos/post.dto';
import { MembersService } from '../members/services/members.service';
import { CreateCommentDto } from './dtos/comment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class BoardService {
  constructor(
    private readonly membersService: MembersService,
  ) {}

  async getAllBoards(): Promise<BoardEntity[]> {
    return this.boardRepository.find();
  }

  async getPostsByBoard(
    boardId: number,
    paginationDto: PaginationDto,
  ): Promise<{ posts: PostEntity[]; total: number }> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    const skip = (paginationDto.page - 1) * paginationDto.limit;
    const [posts, total] = await this.postRepository.findAndCount({
      where: {
        board: { id: boardId },
      },
      relations: ['member', 'board'],
      select: {
        id: true,
        title: true,
        content: true,
        created_at: true,
        updated_at: true,
        is_emphasized: true,
        member: {
          id: true,
          nickname: true,
        },
        board: {
          id: true,
          name: true,
        },
      },
      order: {
        created_at: 'DESC',
      },
      skip,
      take: paginationDto.limit,
    });

    return { posts, total };
  }

  async getEmphasizedPostsByBoard(boardId: number): Promise<PostEntity[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    const posts = await this.postRepository.find({
      where: {
        board: { id: boardId },
        is_emphasized: true,
      },
      relations: ['member', 'board'],
      select: {
        id: true,
        title: true,
        content: true,
        created_at: true,
        updated_at: true,
        is_emphasized: true,
        member: {
          id: true,
          nickname: true,
        },
        board: {
          id: true,
          name: true,
        },
      },
      order: {
        created_at: 'DESC',
      },
    });

    return posts;
  }

  async getPostById(boardId: number, postId: number): Promise<PostEntity> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        board: { id: boardId },
      },
      relations: ['member', 'board'],
      select: {
        id: true,
        title: true,
        content: true,
        created_at: true,
        updated_at: true,
        is_emphasized: true,
        member: {
          id: true,
          nickname: true,
        },
        board: {
          id: true,
          name: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  async createPost(
    boardId: number,
    createPostDto: CreatePostDto,
    memberId: string,
  ): Promise<PostEntity> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    const member = await this.membersService.findOneById(Number(memberId));

    if (!member) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (board.permission === 'ROLE_ADMIN' && member.role_type !== 'ROLE_ADMIN') {
      throw new ForbiddenException('이 게시판에 글을 작성할 권한이 없습니다.');
    }
    const post = this.postRepository.create({
      ...createPostDto,
      board,
      member: member,
    });

    return this.postRepository.save(post);
  }

  async editPost(
    boardId: number,
    postId: number,
    editPostDto: CreatePostDto,
    memberId: string,
  ): Promise<PostEntity> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    const member = await this.membersService.findOneById(Number(memberId));
    if (!member) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({
      where: { id: postId, board: { id: boardId } },
      relations: ['member'],
      select: {
        id: true,
        title: true,
        content: true,
        created_at: true,
        updated_at: true,
        is_emphasized: true,
        member: {
          id: true,
          nickname: true,
        },
      },
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.member.id !== member.id) {
      throw new ForbiddenException('자신의 게시글만 수정할 수 있습니다.');
    }

    if (board.permission === 'ROLE_ADMIN' && member.role_type !== 'ROLE_ADMIN') {
      throw new ForbiddenException('이 게시판에 글을 수정할 권한이 없습니다.');
    }

    post.title = editPostDto.title;
    post.content = editPostDto.content;
    post.is_emphasized = editPostDto.is_emphasized;

    await this.postRepository.save(post);
    return post;
  }

  async deletePost(boardId: number, postId: number, memberId: string): Promise<void> {
    // 게시판 존재 확인
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('게시판을 찾을 수 없습니다.');
    }

    // 게시글 존재 확인 및 작성자 정보 로드
    const post = await this.postRepository.findOne({
      where: { id: postId, board: { id: boardId } },
      relations: ['member'],
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 현재 사용자 정보 로드
    const member = await this.membersService.findOneById(Number(memberId));
    if (!member) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    // 권한 확인: 작성자 본인 또는 관리자만 삭제 가능
    if (post.member.id !== member.id && member.role_type !== 'ROLE_ADMIN') {
      throw new ForbiddenException('이 게시글을 삭제할 권한이 없습니다.');
    }

    // 게시글 삭제
    await this.postRepository.remove(post);
  }

  async createComment(
    postId: number,
    createCommentDto: CreateCommentDto,
    memberId: string,
  ): Promise<CommentEntity> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const member = await this.membersService.findOneById(Number(memberId));
    if (!member) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      post,
      member,
    });

    return this.commentRepository.save(comment);
  }

  async getCommentsByPost(postId: number): Promise<CommentEntity[]> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['member'],
      select: {
        id: true,
        content: true,
        created_at: true,
        updated_at: true,
        member: {
          id: true,
          nickname: true,
        },
      },
      order: { created_at: 'ASC' },
    });
  }
}
