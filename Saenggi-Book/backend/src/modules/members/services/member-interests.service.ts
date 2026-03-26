import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { InterestSusiSubjectResponse } from '../dtos/interest-susi-subject-response';
import { InterestSusiComprehensiveResponse } from '../dtos/interest-susi-comprehensive-response';

@Injectable()
export class MemberInterestsService {
  constructor(private readonly prisma: PrismaService) {}

  async addInterest(
    memberId: number | string,
    targetTable:
      | 'susi_comprehensive_tb'
      | 'susi_subject_tb'
      | 'early_subject'
      | 'early_comprehensive',
    targetIds: number[],
    evaluation_id?: number,
  ) {
    const memberIdStr = String(memberId);

    // 이미 존재하는 관심 항목 조회
    const existingInterests = await this.prisma.ss_user_university_interest.findMany({
      where: {
        member_id: memberIdStr,
        target_table: targetTable,
        target_id: { in: targetIds.map(BigInt) },
      },
    });

    const existingTargetIds = existingInterests.map((interest) => Number(interest.target_id));
    const newTargetIds = targetIds.filter((id) => !existingTargetIds.includes(id));

    // 새 항목만 추가
    if (newTargetIds.length > 0) {
      await this.prisma.ss_user_university_interest.createMany({
        data: newTargetIds.map((targetId) => ({
          member_id: memberIdStr,
          target_table: targetTable,
          target_id: BigInt(targetId),
          evaluation_id: evaluation_id ?? null,
        })),
      });
    }

    return this.prisma.ss_user_university_interest.findMany({
      where: {
        member_id: memberIdStr,
        target_table: targetTable,
        target_id: { in: targetIds.map(BigInt) },
      },
    });
  }

  async removeInterest(
    memberId: number | string,
    targetTable:
      | 'susi_comprehensive_tb'
      | 'susi_subject_tb'
      | 'early_subject'
      | 'early_comprehensive',
    targetIds: number[],
  ): Promise<void> {
    await this.prisma.ss_user_university_interest.deleteMany({
      where: {
        member_id: String(memberId),
        target_table: targetTable,
        target_id: { in: targetIds.map(BigInt) },
      },
    });
  }

  // 수시교과 관심목록 조회
  async getSusiSubject(memberId: number | string): Promise<InterestSusiSubjectResponse[]> {
    const interestItems = await this.prisma.ss_user_university_interest.findMany({
      where: { member_id: String(memberId), target_table: 'early_subject' },
    });

    if (interestItems.length === 0) return [];

    const data = await this.prisma.susi_subject_tb.findMany({
      where: { id: { in: interestItems.map((n) => Number(n.target_id)) } },
      select: {
        id: true,
        university_name: true,
        type_name: true,
        recruitment_unit_name: true,
        converted_score_cut: true,
        converted_score_total: true,
        non_subject_cut: true,
        risk_level_minus1: true,
        risk_level_minus2: true,
        risk_level_minus3: true,
        risk_level_minus4: true,
        risk_level_minus5: true,
        risk_level_plus1: true,
        risk_level_plus2: true,
        risk_level_plus3: true,
        risk_level_plus4: true,
        risk_level_plus5: true,
      },
    });

    return data as unknown as InterestSusiSubjectResponse[];
  }

  // 수시학종 관심목록 조회
  async getSusiComprehensive(memberId: number | string): Promise<InterestSusiComprehensiveResponse[]> {
    const interestItems = await this.prisma.ss_user_university_interest.findMany({
      where: { member_id: String(memberId), target_table: 'susi_comprehensive_tb' },
    });

    if (interestItems.length === 0) return [];

    const data = await this.prisma.susi_comprehensive_tb.findMany({
      where: { id: { in: interestItems.map((n) => Number(n.target_id)) } },
    });

    return data.map((d) => {
      return {
        susi_comprehensive: d,
        evaluation_id: interestItems.find((n) => Number(n.target_id) === d.id)?.evaluation_id ?? null,
      };
    }) as unknown as InterestSusiComprehensiveResponse[];
  }

  // 관심목록 조회
  async getIntersetRecruitmentUnits(
    memberId: number | string,
    admissionType:
      | 'susi_subject_tb'
      | 'susi_comprehensive_tb'
      | 'early_subject'
      | 'early_comprehensive',
  ) {
    const memberIdStr = String(memberId);
    console.log(`[getIntersetRecruitmentUnits] memberId: ${memberIdStr}, admissionType: ${admissionType}`);

    // early_subject 요청이 들어오면 susi_subject_tb로 저장된 것도 같이 조회 (하위 호환성)
    let targetTables = [admissionType];
    if (admissionType === 'early_subject' || admissionType === 'susi_subject_tb') {
      targetTables = ['early_subject', 'susi_subject_tb'];
    }

    const interestItems = await this.prisma.ss_user_university_interest.findMany({
      where: {
        member_id: memberIdStr,
        target_table: { in: targetTables },
      },
    });
    console.log(`[getIntersetRecruitmentUnits] Found ${interestItems.length} interest items for tables: ${targetTables.join(', ')}`);

    // 교과전형(legacy)인 경우 susi_subject_tb에서 조회 후 매핑
    if (admissionType === 'early_subject' || admissionType === 'susi_subject_tb') {
      const targetIds = interestItems.map((n) => Number(n.target_id));
      console.log(`[getIntersetRecruitmentUnits] Target IDs for legacy: ${targetIds.join(', ')}`);

      if (targetIds.length === 0) {
        return [];
      }

      const susiSubjects = await this.prisma.susi_subject_tb.findMany({
        where: { id: { in: targetIds } },
      });
      console.log(`[getIntersetRecruitmentUnits] Found ${susiSubjects.length} susi subjects.`);

      return susiSubjects.map((item) => {
        const interestItem = interestItems.find((n) => Number(n.target_id) === item.id);
        return {
          evaluation_id: interestItem?.evaluation_id,
          recruitmentUnit: {
            id: item.id,
            name: item.recruitment_unit_name,
            recruitment_number: item.recruitment_number ? parseInt(item.recruitment_number) : null,
            general_field: {
              id: this.getDepartmentId(item.department),
              name: item.department,
            },
            fields: {
              major: item.large_department ? { id: 0, name: item.large_department } : null,
              mid: item.medium_department ? { id: 0, name: item.medium_department } : null,
              minor: item.small_department ? { id: 0, name: item.small_department } : null,
            },
            university: {
              id: 0,
              name: item.university_name,
              region: item.region,
              code: item.university_code,
              establishment_type: item.national_or_private,
            },
            admission: {
              id: 0,
              name: item.type_name,
              year: 2025,
              basic_type: item.basic_type as '일반' | '특별',
            },
            admission_method: {
              method_description: item.selection_method,
              subject_ratio: item.curriculum,
              document_ratio: item.document_non_academic,
              interview_ratio: item.interview,
              practical_ratio: item.practical_skills,
              other_details: item.step2_other_details,
              second_stage_first_ratio: item.step1_score,
              second_stage_interview_ratio: item.step2_interview,
              second_stage_other_ratio: item.step2_others,
              second_stage_other_details: item.step2_other_details,
              eligibility: item.application_eligibility_text,
              school_record_evaluation_score: null,
              school_record_evaluation_elements: null,
            },
            scores: {
              grade_50_cut: item.grade_cut ? parseFloat(item.grade_cut) : null,
              grade_70_cut: item.grade_cut_70 ? parseFloat(item.grade_cut_70) : null,
              convert_50_cut: item.converted_score_cut
                ? parseFloat(item.converted_score_cut)
                : null,
              convert_70_cut: null,
              risk_plus_5: item.risk_level_plus5,
              risk_plus_4: item.risk_level_plus4,
              risk_plus_3: item.risk_level_plus3,
              risk_plus_2: item.risk_level_plus2,
              risk_plus_1: item.risk_level_plus1,
              risk_minus_1: item.risk_level_minus1,
              risk_minus_2: item.risk_level_minus2,
              risk_minus_3: item.risk_level_minus3,
              risk_minus_4: item.risk_level_minus4,
              risk_minus_5: item.risk_level_minus5,
            },
          },
        };
      });
    }

    // 학종 전형 (susi_comprehensive_tb) - 현재 프론트에서 잘 안 쓰이는 경로이지만 유지
    const targetIds = interestItems.map((n) => Number(n.target_id));
    if (targetIds.length === 0) return [];

    const comprehensiveData = await this.prisma.susi_comprehensive_tb.findMany({
      where: { id: { in: targetIds } },
    });

    return comprehensiveData.map((item) => {
      const interestItem = interestItems.find((n) => Number(n.target_id) === item.id);
      return {
        evaluation_id: interestItem?.evaluation_id,
        recruitmentUnit: {
          id: item.id,
          name: item.recruitment_unit_name,
          recruitment_number: item.recruitment_number ? parseInt(item.recruitment_number) : null,
          general_field: {
            id: this.getDepartmentId(item.department),
            name: item.department,
          },
          university: {
            id: 0,
            name: item.university_name,
            region: item.region,
            code: item.university_code,
            establishment_type: item.national_or_private,
          },
          admission: {
            id: 0,
            name: item.type_name,
            year: 2025,
            basic_type: item.basic_type as '일반' | '특별',
          },
        },
      };
    });
  }

  private getDepartmentId(department: string | null): number {
    if (!department) return 0;
    const normalizedDept = department.replace('계열', '').trim();
    const departmentMap: Record<string, number> = {
      인문: 1,
      사회: 2,
      자연: 3,
      공학: 4,
      의약: 5,
      예체능: 6,
      교육: 7,
      무전공: 8,
    };
    return departmentMap[normalizedDept] || 0;
  }
}
