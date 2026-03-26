// @ts-nocheck
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EditLifeRecordDto } from '../members/dtos/edit-life-record.dto';
// import { AwsUploadService } from 'src/aws-upload/aws-upload.service';

@Injectable()
export class SchoolRecordService {
  private readonly logger = new Logger(SchoolRecordService.name);
  constructor(    // private readonly awsUploadService: AwsUploadService,
  ) { }

  async getMemberUploadFiles(
    skip: number,
    limit: number,
    searchKey?: string,
  ): Promise<
    [
      {
        id: string;
        file_path: string;
        file_type: string;
        create_dt: Date;
        member_id: string;
        member_nickname: string | null;
        member_email: string | null;
      }[],
      number,
    ]
  > {
    let whereClause = '';
    let params: any[] = [limit, skip];

    if (searchKey) {
      whereClause = 'WHERE m.email LIKE ?';
      params = [`%${searchKey}%`, ...params];
    }

    const filesQuery = `
      SELECT 
          mufl.id,
          mufl.file_path,
          mufl.file_type,
          mufl.create_dt,
          m.id AS member_id,
          m.email AS member_email,
          m.nickname AS member_nickname
      FROM 
          member_upload_file_list_tb mufl
      LEFT JOIN 
          member_tb m ON mufl.member_id = m.id
      ${whereClause}
      ORDER BY 
          mufl.create_dt DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM member_upload_file_list_tb mufl
      LEFT JOIN member_tb m ON mufl.member_id = m.id
      ${whereClause}
    `;

    const [files, totalResult] = await Promise.all([
      this.dataSource.query(filesQuery, params),
      this.dataSource.query(countQuery, searchKey ? [`%${searchKey}%`] : []),
    ]);

    const total = totalResult[0].count;

    return [files, total];
  }
  async getAttendanceDetails(memberId: string): Promise<SchoolRecordAttendanceDetailEntity[]> {
    try {
      return await this.attendanceRepository.find({
        where: { member: { id: String(memberId) } },
      });
    } catch (error) {
      // 데이터가 없거나 에러 발생 시 빈 배열 반환
      return [];
    }
  }

  async getSelectSubjects(memberId: string): Promise<SchoolRecordSelectSubjectEntity[]> {
    try {
      return await this.selectSubjectRepository.find({
        where: { member: { id: String(memberId) } },
      });
    } catch (error) {
      // 데이터가 없거나 에러 발생 시 빈 배열 반환
      return [];
    }
  }

  async getSubjectLearnings(memberId: string): Promise<SchoolRecordSubjectLearningEntity[]> {
    try {
      return await this.subjectLearningRepository.find({
        where: { member: { id: String(memberId) } },
      });
    } catch (error) {
      // 데이터가 없거나 에러 발생 시 빈 배열 반환
      return [];
    }
  }

  async getVolunteers(memberId: string): Promise<SchoolRecordVolunteerEntity[]> {
    try {
      return await this.volunteerRepository.find({
        where: { member: { id: String(memberId) } },
      });
    } catch (error) {
      // 데이터가 없거나 에러 발생 시 빈 배열 반환
      return [];
    }
  }

  async getSportArts(memberId: string): Promise<SchoolrecordSportsArtEntity[]> {
    return await this.sportArtRepository.find({
      where: { member: { id: String(memberId) } },
    });
  }

  async editLifeRecord(memberId: string, editLifeRecordDto: EditLifeRecordDto): Promise<void> {
    const { attendances, subjects, selectSubjects } = editLifeRecordDto;

    const member = await this.memberRepository.findOne({
      where: { id: String(memberId) },
    });
    if (!member) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 기존 기록 삭제
      await transactionalEntityManager.delete(SchoolRecordAttendanceDetailEntity, {
        member: { id: member.id },
      });
      await transactionalEntityManager.delete(SchoolRecordSubjectLearningEntity, {
        member: { id: member.id },
      });
      await transactionalEntityManager.delete(SchoolRecordSelectSubjectEntity, {
        member: { id: member.id },
      });

      // 새로운 기록 생성
      const newAttendances = attendances.map((attendance) =>
        this.attendanceRepository.create({ ...attendance, member }),
      );
      await transactionalEntityManager.save(SchoolRecordAttendanceDetailEntity, newAttendances);

      const newSubjects = subjects.map((subject) =>
        this.subjectLearningRepository.create({ ...subject, member }),
      );
      await transactionalEntityManager.save(SchoolRecordSubjectLearningEntity, newSubjects);

      const newSelectSubjects = selectSubjects.map((selectSubject) =>
        this.selectSubjectRepository.create({ ...selectSubject, member }),
      );
      await transactionalEntityManager.save(SchoolRecordSelectSubjectEntity, newSelectSubjects);
    });

    this.logger.log(`Updated life record for member ${member.id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSchoolRecordFile(_fileKey: string) {
    // const uploadedFileUrl = await this.awsUploadService.getSignedUrl(fileKey);
    // return uploadedFileUrl;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteSchoolRecordById(_schoolRecordId: string) {
    // const file = await this.memberUploadFileListRepository.findOne({
    //   where: {
    //     id: Number(schoolRecordId),
    //   },
    // });
    // if (!file) {
    //   throw new NotFoundException('파일이 존재하지 않습니다.');
    // }
    // await this.awsUploadService.deleteFile(file.file_key);
    // await this.memberUploadFileListRepository.delete({
    //   id: file.id,
    // });
  }

  /**
   * PDF 파싱 결과를 DB에 저장
   */
  async saveParsedPdfData(
    memberId: string,
    data: {
      subjectLearnings: Array<{
        grade: string;
        semester: string;
        mainSubjectCode: string;
        mainSubjectName: string;
        subjectCode: string;
        subjectName: string;
        unit: string;
        rawScore: string;
        subSubjectAverage: string;
        standardDeviation: string;
        achievement: string;
        studentsNum: string;
        ranking: string;
        etc: string;
      }>;
      selectSubjects: Array<{
        grade: string;
        semester: string;
        mainSubjectCode: string;
        mainSubjectName: string;
        subjectCode: string;
        subjectName: string;
        unit: string;
        rawScore: string;
        subSubjectAverage: string;
        achievement: string;
        studentsNum: string;
        achievementA: string;
        achievementB: string;
        achievementC: string;
        etc: string;
      }>;
      attendances?: Array<{
        grade: string;
        class_days: number | null;
        absent_disease: number | null;
        absent_unrecognized: number | null;
        absent_etc: number | null;
        late_disease: number | null;
        late_unrecognized: number | null;
        late_etc: number | null;
        leave_early_disease: number | null;
        leave_early_unrecognized: number | null;
        leave_early_etc: number | null;
        result_disease: number | null;
        result_unrecognized: number | null;
        result_early_etc: number | null;
        etc: string | null;
      }>;
    },
  ): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { id: String(memberId) },
    });
    if (!member) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 기존 기록 삭제 (PDF 재업로드 시)
      await transactionalEntityManager.delete(SchoolRecordSubjectLearningEntity, {
        member: { id: member.id },
      });
      await transactionalEntityManager.delete(SchoolRecordSelectSubjectEntity, {
        member: { id: member.id },
      });
      await transactionalEntityManager.delete(SchoolRecordAttendanceDetailEntity, {
        member: { id: member.id },
      });

      // 일반 교과목 저장
      if (data.subjectLearnings.length > 0) {
        const subjectLearnings = data.subjectLearnings.map((item) =>
          this.subjectLearningRepository.create({
            member,
            grade: item.grade,
            semester: item.semester,
            main_subject_code: item.mainSubjectCode,
            main_subject_name: item.mainSubjectName,
            subject_code: item.subjectCode,
            subject_name: item.subjectName,
            unit: item.unit,
            raw_score: item.rawScore,
            sub_subject_average: item.subSubjectAverage,
            standard_deviation: item.standardDeviation,
            achievement: item.achievement,
            students_num: item.studentsNum,
            ranking: item.ranking,
            etc: item.etc,
          }),
        );
        await transactionalEntityManager.save(SchoolRecordSubjectLearningEntity, subjectLearnings);
      }

      // 진로선택 과목 저장
      if (data.selectSubjects.length > 0) {
        const selectSubjects = data.selectSubjects.map((item) =>
          this.selectSubjectRepository.create({
            member,
            grade: item.grade,
            semester: item.semester,
            main_subject_code: item.mainSubjectCode,
            main_subject_name: item.mainSubjectName,
            subject_code: item.subjectCode,
            subject_name: item.subjectName,
            unit: item.unit,
            raw_score: item.rawScore,
            sub_subject_average: item.subSubjectAverage,
            achievement: item.achievement,
            students_num: item.studentsNum,
            achievementa: item.achievementA,
            achievementb: item.achievementB,
            achievementc: item.achievementC,
            etc: item.etc,
          }),
        );
        await transactionalEntityManager.save(SchoolRecordSelectSubjectEntity, selectSubjects);
      }

      // 출결 저장
      if (data.attendances && data.attendances.length > 0) {
        const attendances = data.attendances.map((item) =>
          this.attendanceRepository.create({
            member,
            grade: item.grade,
            class_days: item.class_days,
            absent_disease: item.absent_disease,
            absent_unrecognized: item.absent_unrecognized,
            absent_etc: item.absent_etc,
            late_disease: item.late_disease,
            late_unrecognized: item.late_unrecognized,
            late_etc: item.late_etc,
            leave_early_disease: item.leave_early_disease,
            leave_early_unrecognized: item.leave_early_unrecognized,
            leave_early_etc: item.leave_early_etc,
            result_disease: item.result_disease,
            result_unrecognized: item.result_unrecognized,
            result_early_etc: item.result_early_etc,
            etc: item.etc,
          }),
        );
        await transactionalEntityManager.save(SchoolRecordAttendanceDetailEntity, attendances);
      }
    });

    this.logger.log(
      `Saved PDF parsed data for member ${member.id}: ${data.subjectLearnings.length} subjects, ${data.selectSubjects.length} select subjects, ${data.attendances?.length || 0} attendances`,
    );
  }

  async uploadSchoolRecordPdf(memberId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('PDF파일만 업로드 가능합니다.');
    }

    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    // try {
    //   // AWS S3에 파일 업로드
    //   const filename = await this.awsUploadService.uploadFile(
    //     file,
    //     'school-records',
    //   );

    //   // DB에 파일 정보 저장
    //   await this.savePdfFileInfo(queryRunner, memberId, file, filename);

    //   await queryRunner.commitTransaction();
    //   return filename;
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();
    //   throw error;
    // } finally {
    //   await queryRunner.release();
    // }
    return 'Not implemented';
  }

  private async savePdfFileInfo(
    queryRunner: QueryRunner,
    memberId: string,
    file: Express.Multer.File,
    filename: string,
  ) {
    const uploadInfo = queryRunner.manager.create(MemberUploadFileListEntity, {
      update_dt: new Date(),
      create_dt: new Date(),
      file_key: filename,
      file_name: file.originalname,
      file_path: filename,
      file_size: file.size,
      file_type: 'school-record-pdf',
      member_id: memberId,
    });
    await queryRunner.manager.save(MemberUploadFileListEntity, uploadInfo);
  }
}
