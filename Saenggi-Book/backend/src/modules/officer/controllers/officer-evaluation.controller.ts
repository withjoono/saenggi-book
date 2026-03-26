// @ts-nocheck
import { UseTicketReqDto } from '../dtos/use-ticket.dto';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OfficerEvaluationService } from '../services/officer-evaluation.service';
import { GetOfficerEvaluationsResponseDto } from '../dtos/officer-evaluations-response.dto';
import { MemberPermissionGuard } from '../../members/guards/user-permission.guard';
import { GetOfficerListResponseDto } from '../dtos/officer-list-response.dto';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { GetTicketCountResponseDto } from '../dtos/ticket-count-response.dto';
import { SelfEvaluationBodyDto } from '../dtos/self-evaluation.dto';
import { OfficerEvaluationBodyDto } from '../dtos/officer-evaluation.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('officer-evaluation')
export class OfficerEvaluationController {
  constructor(private readonly officerEvaluationService: OfficerEvaluationService) {}

  /**
   * 사정관 목록 조회
   */
  @Public()
  @Get('officer')
  async getOfficerList(): Promise<GetOfficerListResponseDto[]> {
    return this.officerEvaluationService.getOfficerList();
  }

  /**
   * 사정관이 받은 평가 신청 목록 조회
   * @returns 평가 신청 목록
   */
  @Get('pending')
  async getEvaluationsForOfficer(@CurrentMemberId() memberId: string): Promise<{
    studentId: number;
    studentName: string;
    series: string;
    progressStatus: string;
    readyCount: number;
    phone: string;
    email: string;
    evaluationId: number;
    updateDt: Date;
  }[]> {
    return this.officerEvaluationService.getEvaluationsForOfficer(memberId);
  }

  /**
   * 주어진 member_id로 평가 목록을 가져오기
   * @param memberId - 멤버 ID
   * @returns 평가 목록
   */
  @Get('member/:memberId')
  @UseGuards(MemberPermissionGuard)
  async getEvaluationsByMemberId(
    @Param('memberId') memberId: number,
  ): Promise<GetOfficerEvaluationsResponseDto[]> {
    return this.officerEvaluationService.getEvaluationsByMemberId(memberId);
  }

  /**
   * 주어진 id로 평가의 comments를 가져옴
   * @param id - 평가 ID
   */
  @Get(':id/comments')
  async getEvaluationCommentsByID(
    @Param('id') id: number,
  ): Promise<any[]> {
    return this.officerEvaluationService.getEvaluationCommentsByID(id);
  }

  /**
   * 주어진 id로 평가의 scores를 가져옴
   * @param id - 평가 ID
   */
  @Get(':id/scores')
  async getEvaluationScoresByID(@Param('id') id: number): Promise<any[]> {
    return this.officerEvaluationService.getEvaluationScoresByID(id);
  }

  /**
   * 평가의 질문목록을 가져옴
   */
  @Public()
  @Get('survey')
  async getEvaluationSurvey(): Promise<any[]> {
    return this.officerEvaluationService.getEvaluationSurvey();
  }

  /**
   * 티켓 갯수를 조회
   */
  @Get('ticket')
  async getTicketCount(@CurrentMemberId() memberId: string): Promise<GetTicketCountResponseDto> {
    return this.officerEvaluationService.getTicketCount(memberId);
  }

  /**
   * 티켓 사용(평가 신청)
   */
  @Post('ticket')
  async useTicket(
    @CurrentMemberId() memberId: string,
    @Body() body: UseTicketReqDto,
  ): Promise<void> {
    return this.officerEvaluationService.useTicket(memberId, body);
  }

  /**
   * 자가평가
   */
  @Post('self')
  async saveEvaluationBySelf(
    @CurrentMemberId() memberId: string,
    @Body() body: SelfEvaluationBodyDto,
  ): Promise<void> {
    return this.officerEvaluationService.saveEvaluationBySelf(memberId, body);
  }

  /**
   * 평가자 평가
   */
  @Post('add')
  async saveEvaluationByOfficer(
    @CurrentMemberId() memberId: string,
    @Body() body: OfficerEvaluationBodyDto,
  ): Promise<void> {
    return this.officerEvaluationService.saveEvaluationByOfficer(memberId, body);
  }

  /**
   * 학생의 생기부 파일 다운로드 URL 조회 (사정관용)
   * @param studentId - 학생의 member_id
   * @returns 다운로드 URL 및 파일명
   */
  @Get('schoolrecord/:studentId')
  async getStudentSchoolRecordFile(
    @CurrentMemberId() memberId: string,
    @Param('studentId') studentId: string,
  ): Promise<{ url: string; fileName: string }> {
    return this.officerEvaluationService.getStudentSchoolRecordFile(memberId, studentId);
  }
}
