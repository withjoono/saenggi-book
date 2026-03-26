// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';

export class RecruitmentUnitResponseDto {
  @ApiProperty({ description: '복합 ID (예: 26-U001211)' })
  id: string;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '대학코드 (예: U001)' })
  universityCode: string;

  @ApiProperty({ description: '전형타입 (종합, 교과, 논술, 실기, 특기자)' })
  admissionType: string;

  @ApiProperty({ description: '전형타입코드' })
  admissionTypeCode: number;

  @ApiProperty({ description: '전형명 (예: 고른기회전형)' })
  admissionName: string;

  @ApiProperty({ description: '모집단위명 (예: 기초학부)' })
  unitName: string;

  @ApiProperty({ description: '지역(광역)', nullable: true })
  region: string | null;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}

export class RecruitmentUnitListResponseDto {
  @ApiProperty({ description: '모집단위 목록', type: [RecruitmentUnitResponseDto] })
  data: SusiRecruitmentUnitEntity[];

  @ApiProperty({ description: '전체 항목 수' })
  totalCount: number;

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지당 항목 수' })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}

export class AdmissionTypeDto {
  @ApiProperty({ description: '전형타입' })
  admissionType: string;

  @ApiProperty({ description: '전형타입코드' })
  admissionTypeCode: number;
}

export class UniversityDto {
  @ApiProperty({ description: '대학코드' })
  universityCode: string;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '지역' })
  region: string;
}

export class StatisticsResponseDto {
  @ApiProperty({ description: '전체 모집단위 수' })
  totalRecruitmentUnits: number;

  @ApiProperty({ description: '전체 대학 수' })
  totalUniversities: number;

  @ApiProperty({ description: '전형타입 수' })
  totalAdmissionTypes: number;

  @ApiProperty({ description: '지역 수' })
  totalRegions: number;
}
