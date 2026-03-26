import { PrismaService } from '../../../database/prisma.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GetOfficerEvaluationsResponseDto } from '../dtos/officer-evaluations-response.dto';
import { GetOfficerListResponseDto } from '../dtos/officer-list-response.dto';
import { GetTicketCountResponseDto } from '../dtos/ticket-count-response.dto';
import { UseTicketReqDto } from '../dtos/use-ticket.dto';
import { SmsService } from '../../sms/sms.service';
import { SelfEvaluationBodyDto } from '../dtos/self-evaluation.dto';
import { OfficerEvaluationBodyDto } from '../dtos/officer-evaluation.dto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class OfficerEvaluationService {
  private readonly logger = new Logger(OfficerEvaluationService.name);
  private readonly gcsPublicUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private smsService: SmsService,
    private configService: ConfigService<AllConfigType>,
  ) {
    const gcsConfig = this.configService.get('gcsUpload', { infer: true });
    this.gcsPublicUrl =
      gcsConfig?.publicUrl || `https://storage.googleapis.com/${gcsConfig?.bucketName || ''}`;
  }

  async getEvaluationsByMemberId(memberId: number): Promise<GetOfficerEvaluationsResponseDto[]> {
    try {
      const evaluations = await this.prisma.$queryRaw<any[]>`
        SELECT 
          e.id, e.series, e.status, e.update_dt, e.member_id as officer_id,
          o.officer_name, o.officer_profile_image
        FROM officer_student_evaludate_relation_tb e
        LEFT JOIN officer_list_tb o ON e.member_id = o.member_id
        WHERE e.student_id = ${String(memberId)}
        ORDER BY e.update_dt DESC
      `;
      return evaluations.map((e: any) => ({
        id: e.id,
        series: e.series,
        status: e.status,
        update_dt: e.update_dt,
        officer_id: e.officer_id,
        officer_name: e.officer_name,
        officer_profile_image: e.officer_profile_image,
        remaining_evaluations: 0,
      }));
    } catch (err) {
      this.logger.error('getEvaluationsByMemberId failed:', err);
      return [];
    }
  }

  async getOfficerList(): Promise<GetOfficerListResponseDto[]> {
    try {
      const officers = await this.prisma.$queryRaw<any[]>`
        SELECT member_id, officer_name, officer_profile_image, university, education
        FROM officer_list_tb
        WHERE del_yn = 'N'
      `;
      return officers.map((o: any) => ({
        officer_id: o.member_id,
        officer_name: o.officer_name,
        officer_profile_image: o.officer_profile_image,
        officer_university: o.university,
        officer_education: o.education,
        remaining_evaluations: 0,
      }));
    } catch (err) {
      this.logger.error('getOfficerList failed:', err);
      return [];
    }
  }

  async getEvaluationsForOfficer(officerMemberId: string): Promise<{
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
    try {
      const evaluations = await this.prisma.$queryRaw<any[]>`
        SELECT 
          e.id as evaluation_id, e.student_id, s.nickname as student_name,
          e.series, e.status as progress_status, e.update_dt,
          s.phone, s.email
        FROM officer_student_evaludate_relation_tb e
        LEFT JOIN auth_member s ON e.student_id = s.id
        WHERE e.member_id = ${officerMemberId}
        ORDER BY e.update_dt DESC
      `;
      return evaluations.map((e: any) => ({
        evaluationId: e.evaluation_id,
        studentId: e.student_id,
        studentName: e.student_name || '이름 없음',
        series: e.series,
        progressStatus: e.progress_status,
        readyCount: 0,
        phone: e.phone || '',
        email: e.email || '',
        updateDt: e.update_dt,
      }));
    } catch (err) {
      this.logger.error('getEvaluationsForOfficer failed:', err);
      return [];
    }
  }

  async getEvaluationCommentsByID(id: number): Promise<any[]> {
    try {
      return await this.prisma.$queryRaw<any[]>`
        SELECT * FROM officer_evaluation_comment_tb WHERE officer_relation_id = ${id}
      `;
    } catch (err) {
      this.logger.error('getEvaluationCommentsByID failed:', err);
      return [];
    }
  }

  async getEvaluationScoresByID(id: number): Promise<any[]> {
    try {
      return await this.prisma.$queryRaw<any[]>`
        SELECT * FROM officer_evaluation_score_tb WHERE officer_relation_id = ${id}
      `;
    } catch (err) {
      this.logger.error('getEvaluationScoresByID failed:', err);
      return [];
    }
  }

  async getEvaluationSurvey(): Promise<any[]> {
    try {
      return await this.prisma.$queryRaw<any[]>`SELECT * FROM officer_evaluation_survey_tb`;
    } catch (err) {
      this.logger.error('getEvaluationSurvey failed:', err);
      return [];
    }
  }

  async getTicketCount(memberId: string): Promise<GetTicketCountResponseDto> {
    try {
      const result = await this.prisma.$queryRaw<{ ticket_count: number }[]>`
        SELECT ticket_count FROM officer_ticket_tb WHERE member_id = ${memberId} LIMIT 1
      `;
      return { count: result.length > 0 ? Number(result[0].ticket_count) : 0 };
    } catch (err) {
      this.logger.error('getTicketCount failed:', err);
      return { count: 0 };
    }
  }

  async useTicket(memberId: string, body: UseTicketReqDto): Promise<void> {
    const ticketResult = await this.prisma.$queryRaw<any[]>`
      SELECT ticket_count FROM officer_ticket_tb WHERE member_id = ${memberId} LIMIT 1
    `;
    if (!ticketResult.length || ticketResult[0].ticket_count < 1) {
      throw new BadRequestException('사용가능한 이용권이 없습니다.');
    }

    // 생기부 존재 확인
    const schoolRecords = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM school_record_subject_learning_tb WHERE member_id = ${memberId} LIMIT 1
    `;
    if (schoolRecords.length < 1) {
      throw new BadRequestException('등록된 생기부가 존재하지 않습니다.');
    }

    // 사정관 확인
    const officers = await this.prisma.$queryRaw<any[]>`
      SELECT o.member_id, m.id, m.phone FROM officer_list_tb o
      LEFT JOIN auth_member m ON o.member_id = m.id
      WHERE o.member_id = ${body.officerId} LIMIT 1
    `;
    if (!officers.length) {
      throw new BadRequestException('해당 평가자가 존재하지 않습니다.');
    }
    const officer = officers[0];

    // 이미 진행중인 평가 확인
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM officer_student_evaludate_relation_tb
      WHERE student_id = ${memberId} AND member_id = ${officer.member_id} AND status = 'READY'
      LIMIT 1
    `;
    if (existing.length) {
      throw new BadRequestException('이미 진행중인 평가가 존재합니다.');
    }

    // 평가 생성
    await this.prisma.$executeRaw`
      INSERT INTO officer_student_evaludate_relation_tb (member_id, student_id, series, status, create_dt, update_dt)
      VALUES (${officer.member_id}, ${memberId}, ${body.series}, 'READY', NOW(), NOW())
    `;

    // 티켓 차감
    await this.prisma.$executeRaw`
      UPDATE officer_ticket_tb SET ticket_count = ticket_count - 1 WHERE member_id = ${memberId}
    `;

    try {
      await this.smsService.sendMessage(
        '학생이 학생부 평가를 신청하였습니다. 확인바랍니다.',
        officer.phone,
      );
    } catch (e) {
      this.logger.error(`평가자에게 메세지 발송에 실패했습니다. 에러 내용 ${e}`);
    }
  }

  async saveEvaluationBySelf(memberId: string, dto: SelfEvaluationBodyDto): Promise<void> {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, series FROM officer_student_evaludate_relation_tb
      WHERE member_id = ${memberId} AND student_id = ${memberId} AND status = 'COMPLETE'
      LIMIT 1
    `;

    let evaluationId: number;

    if (existing.length) {
      evaluationId = existing[0].id;
      await this.prisma.$executeRaw`
        UPDATE officer_student_evaludate_relation_tb
        SET series = ${dto.series}, update_dt = NOW()
        WHERE id = ${evaluationId}
      `;
      await this.prisma.$executeRaw`
        DELETE FROM officer_evaluation_score_tb WHERE officer_relation_id = ${evaluationId}
      `;
    } else {
      const inserted = await this.prisma.$queryRaw<any[]>`
        INSERT INTO officer_student_evaludate_relation_tb (member_id, student_id, status, series, create_dt, update_dt)
        VALUES (${memberId}, ${memberId}, 'COMPLETE', ${dto.series}, NOW(), NOW())
        RETURNING id
      `;
      evaluationId = inserted[0].id;
    }

    for (const score of dto.scores) {
      await this.prisma.$executeRaw`
        INSERT INTO officer_evaluation_score_tb (officer_relation_id, bottom_survey_id, score)
        VALUES (${evaluationId}, ${score.surveyId}, ${score.score})
      `;
    }
  }

  async saveEvaluationByOfficer(memberId: string, dto: OfficerEvaluationBodyDto): Promise<void> {
    const officers = await this.prisma.$queryRaw<any[]>`
      SELECT member_id FROM officer_list_tb WHERE member_id = ${memberId} LIMIT 1
    `;
    if (!officers.length) {
      throw new BadRequestException('평가자가 아닙니다.');
    }

    const evaluations = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM officer_student_evaludate_relation_tb
      WHERE member_id = ${memberId} AND student_id = ${String(dto.studentId)} AND series = ${dto.series}
      LIMIT 1
    `;
    if (!evaluations.length) {
      throw new BadRequestException('평가 신청이 존재하지 않습니다.');
    }
    const evaluationId = evaluations[0].id;

    const newStatus = dto.saveType === 0 ? 'PROGRESS' : 'COMPLETE';
    await this.prisma.$executeRaw`
      UPDATE officer_student_evaludate_relation_tb SET status = ${newStatus}, update_dt = NOW() WHERE id = ${evaluationId}
    `;
    await this.prisma.$executeRaw`
      DELETE FROM officer_evaluation_score_tb WHERE officer_relation_id = ${evaluationId}
    `;
    await this.prisma.$executeRaw`
      DELETE FROM officer_evaluation_comment_tb WHERE officer_relation_id = ${evaluationId}
    `;

    for (const score of dto.scores) {
      await this.prisma.$executeRaw`
        INSERT INTO officer_evaluation_score_tb (officer_relation_id, bottom_survey_id, score)
        VALUES (${evaluationId}, ${score.surveyId}, ${score.score})
      `;
    }

    for (const comment of dto.comments) {
      await this.prisma.$executeRaw`
        INSERT INTO officer_evaluation_comment_tb (officer_relation_id, main_survey_type, comment)
        VALUES (${evaluationId}, ${comment.mainSurveyType}, ${comment.comment})
      `;
    }
  }

  async getStudentSchoolRecordFile(
    officerMemberId: string,
    studentId: string,
  ): Promise<{ url: string; fileName: string }> {
    const officers = await this.prisma.$queryRaw<any[]>`
      SELECT member_id FROM officer_list_tb WHERE member_id = ${officerMemberId} LIMIT 1
    `;
    if (!officers.length) {
      throw new BadRequestException('평가자가 아닙니다.');
    }

    const evaluations = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM officer_student_evaludate_relation_tb
      WHERE member_id = ${officerMemberId} AND student_id = ${studentId}
      LIMIT 1
    `;
    if (!evaluations.length) {
      throw new BadRequestException('해당 학생에 대한 평가 신청이 존재하지 않습니다.');
    }

    const files = await this.prisma.$queryRaw<any[]>`
      SELECT file_path, file_name FROM member_upload_file_list_tb
      WHERE member_id = ${studentId} AND file_type = 'school-record-pdf'
      ORDER BY create_dt DESC LIMIT 1
    `;
    if (!files.length) {
      throw new NotFoundException('학생의 생기부 파일이 존재하지 않습니다.');
    }

    const url = `${this.gcsPublicUrl}/${files[0].file_path}`;
    return { url, fileName: files[0].file_name };
  }
}
