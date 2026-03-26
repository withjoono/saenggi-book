// @ts-nocheck
import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CoreAdmissionSubtypeService } from '../services/core-admission-subtype.service';
import {
  CreateAdmissionSubtypeDto,
  UpdateAdmissionSubtypeDto,
} from '../dtos/admission-subtype.dto';

@ApiTags('core')
@Controller('core/admission-subtypes')
export class CoreAdmissionSubtypeController {
  constructor(private readonly admissionSubtypeService: CoreAdmissionSubtypeService) {}

  @ApiOperation({
    summary: '전형 서브타입 목록 조회',
    description: '모든 전형 서브타입(일반전형, 학교장추천 등) 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전형 서브타입 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiBearerAuth('access-token')
  @Get()
  async findAll(): Promise<any[]> {
    return this.admissionSubtypeService.findAll();
  }

  @ApiOperation({
    summary: '전형 서브타입 상세 조회',
    description: '특정 전형 서브타입의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 서브타입 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 서브타입 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형 서브타입을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.admissionSubtypeService.findOne(id);
  }

  @ApiOperation({
    summary: '전형 서브타입 추가',
    description: '새로운 전형 서브타입을 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '전형 서브타입 추가 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiBearerAuth('access-token')
  @Post()
  async create(
    @Body() createAdmissionSubtypeDto: CreateAdmissionSubtypeDto,
  ): Promise<any> {
    return this.admissionSubtypeService.create(createAdmissionSubtypeDto);
  }

  @ApiOperation({
    summary: '전형 서브타입 수정',
    description: '기존 전형 서브타입 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 서브타입 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 서브타입 수정 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형 서브타입을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdmissionSubtypeDto: UpdateAdmissionSubtypeDto,
  ): Promise<any> {
    return this.admissionSubtypeService.update(id, updateAdmissionSubtypeDto);
  }

  @ApiOperation({
    summary: '전형 서브타입 삭제',
    description: '전형 서브타입을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '전형 서브타입 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '전형 서브타입 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '전형 서브타입을 찾을 수 없음',
  })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.admissionSubtypeService.remove(id);
  }
}
