// @ts-nocheck
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SusiSubjectService } from '../services/susi-subject.service';
import { SusiSubjectStep1ResponseDto } from '../dtos/susi-subject-step-1.dto';
import {
  SusiSubjectStep2QueryDto,
  SusiSubjectStep2ResponseDto,
} from '../dtos/susi-subject-step-2.dto';
import {
  SusiSubjectStep3QueryDto,
  SusiSubjectStep3ResponseDto,
} from '../dtos/susi-subject-step-3.dto';
import {
  SusiSubjectStep4QueryDto,
  SusiSubjectStep4ResponseDto,
} from '../dtos/susi-subject-step-4.dto';
import {
  SusiSubjectStep5QueryDto,
  SusiSubjectStep5ResponseDto,
} from '../dtos/susi-subject-step-5.dto';
import { SusiSubjectDetailResponseDto } from '../dtos/susi-subject-detail.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('[유저] 수시 교과 Step 1 ~ 5')
@Controller('ms/subject')
export class SusiSubjectController {
  constructor(private readonly susiSubjectService: SusiSubjectService) {}

  @Get('step-1')
  @ApiOperation({
    summary: '[수시 교과] Step 1 (년도 별 일반/특별 데이터 조회)',
  })
  @Public()
  async getSusiSubjectStep_1(
    @Query('basic_type') basic_type,
    @Query('year') year,
  ): Promise<SusiSubjectStep1ResponseDto> {
    const data = await this.susiSubjectService.getSusiSubjectStep_1({
      basic_type,
      year,
    });
    return data;
  }

  @Get('step-2')
  @ApiOperation({
    summary: '[수시 교과] Step 2 (최저관련 데이터 조회)',
  })
  async getSusiSubjectStep_2(
    @Query() dto: SusiSubjectStep2QueryDto,
  ): Promise<SusiSubjectStep2ResponseDto[]> {
    const data = await this.susiSubjectService.getSusiSubjectStep_2({
      ids: dto.ids,
    });
    return data;
  }

  @Get('step-3')
  @ApiOperation({
    summary: '[수시 교과] Step 3 (비교과 관련 데이터 조회)',
  })
  async getSusiSubjectStep_3(
    @Query() dto: SusiSubjectStep3QueryDto,
  ): Promise<SusiSubjectStep3ResponseDto[]> {
    const data = await this.susiSubjectService.getSusiSubjectStep_3({
      ids: dto.ids,
    });
    return data;
  }

  @Get('step-4')
  @ApiOperation({
    summary: '[수시 교과] Step 4 (모집단위 관련 데이터 조회)',
  })
  async getSusiSubjectStep_4(
    @Query() dto: SusiSubjectStep4QueryDto,
  ): Promise<SusiSubjectStep4ResponseDto[]> {
    const data = await this.susiSubjectService.getSusiSubjectStep_4({
      ids: dto.ids,
    });
    return data;
  }

  @Get('step-5')
  @ApiOperation({
    summary: '[수시 교과] Step 5 (전형일자 관련 데이터 조회)',
  })
  async getSusiSubjectStep_5(
    @Query() dto: SusiSubjectStep5QueryDto,
  ): Promise<SusiSubjectStep5ResponseDto[]> {
    const data = await this.susiSubjectService.getSusiSubjectStep_5({
      ids: dto.ids,
    });
    return data;
  }

  @Get('detail/:id')
  @ApiOperation({
    summary: '[수시 교과] 상세 페이지 조회',
  })
  async getSusiSubjectDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SusiSubjectDetailResponseDto> {
    const data = await this.susiSubjectService.getSusiSubjectDetail(id);
    return data;
  }

  @Get('pass-record/:id')
  @ApiOperation({
    summary: '[수시 교과] 합불 사례 조회',
  })
  async getSusiSubjectPassRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any[]> {
    const data = await this.susiSubjectService.getSusiSubjectPassRecords(id);
    return data;
  }
}
