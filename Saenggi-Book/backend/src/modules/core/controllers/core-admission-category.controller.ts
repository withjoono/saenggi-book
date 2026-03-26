// @ts-nocheck
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CoreAdmissionCategoryService } from '../services/core-admission-category.service';
import {
  CreateAdmissionCategoryDto,
  UpdateAdmissionCategoryDto,
} from '../dtos/admission-category.dto';

@ApiTags('core')
@Controller('core/admission-categories')
export class CoreAdmissionCategoryController {
  constructor(private readonly admissionCategoryService: CoreAdmissionCategoryService) {}

  @ApiOperation({
    summary: '전형 카테고리 목록 조회',
    description: '모든 전형 카테고리(수시, 정시 등) 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전형 카테고리 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get()
  async findAll(): Promise<any[]> {
    return this.admissionCategoryService.findAll();
  }

  @ApiOperation({
    summary: '전형 카테고리 상세 조회',
    description: '특정 전형 카테고리의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 카테고리 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 카테고리 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형 카테고리를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.admissionCategoryService.findOne(id);
  }

  @ApiOperation({
    summary: '전형 카테고리 추가',
    description: '새로운 전형 카테고리를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '전형 카테고리 추가 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiBearerAuth('access-token')
  @Post()
  async create(
    @Body() createAdmissionCategoryDto: CreateAdmissionCategoryDto,
  ): Promise<any> {
    return this.admissionCategoryService.create(createAdmissionCategoryDto);
  }

  @ApiOperation({
    summary: '전형 카테고리 수정',
    description: '기존 전형 카테고리 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 카테고리 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 카테고리 수정 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형 카테고리를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdmissionCategoryDto: UpdateAdmissionCategoryDto,
  ): Promise<any> {
    return this.admissionCategoryService.update(id, updateAdmissionCategoryDto);
  }

  @ApiOperation({
    summary: '전형 카테고리 삭제',
    description: '전형 카테고리를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 카테고리 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 카테고리 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형 카테고리를 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admissionCategoryService.remove(id);
  }
}
