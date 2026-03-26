// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExploreSearchService {
  constructor(  ) {}

  async findUniversityByName(name: string) {
    return this.universityRepository.find({
      where: { name: name },
      relations: [
        'admissions',
        'admissions.category',
        'admissions.recruitment_units',
        'admissions.recruitment_units.general_field',
        'admissions.recruitment_units.minor_field',
      ],
    });
  }

  async findAdmissionByName(name: string) {
    return this.admissionRepository.find({
      where: { name: name },
      relations: [
        'university',
        'category',
        'recruitment_units',
        'recruitment_units.general_field',
        'recruitment_units.minor_field',
      ],
    });
  }

  async findRecruitUnitByName(name: string) {
    return this.recruitmentUnitRepository.find({
      where: { name: name },
      relations: [
        'admission',
        'general_field',
        'minor_field',
        'admission.university',
        'admission.category',
      ],
    });
  }

  async findAllUniversities() {
    return this.universityRepository.find({
      select: ['id', 'name', 'region'],
    });
  }

  async findAdmissionsByUniversityId(universityId: number) {
    return this.admissionRepository.find({
      where: { university: { id: universityId } },
      relations: ['category'],
      select: {
        id: true,
        name: true,
        category: {
          name: true,
        },
      },
    });
  }

  async findRecruitmentUnitsByAdmissionId(admissionId: number) {
    return this.recruitmentUnitRepository.find({
      where: { admission: { id: admissionId } },
      select: ['id', 'name'],
    });
  }

  async findRecruitmentUnitsByIds(recruitmentIds: number[]) {
    const recruitmentUnits = await this.recruitmentUnitRepository.find({
      where: { id: In(recruitmentIds) },
      relations: [
        'admission',
        'admission.university',
        'admission.method',
        'admission.category',
        'general_field',
        'minor_field',
        'minor_field.mid_field',
        'minor_field.mid_field.major_field',
        'scores',
      ],
    });

    const result = await Promise.all(
      recruitmentUnits.map(async (unit) => {
        const regularAdmission = await this.regularAdmissionRepository.findOne({
          where: {
            university: { id: unit.admission.university.id },
            recruitment_name: unit.name,
          },
          relations: ['university'],
        });

        return {
          recruitmentUnit: {
            id: unit.id,
            name: unit.name,
            recruitment_number: unit.recruitment_number,
            general_field: unit.general_field,
            fields: {
              major: unit?.minor_field?.mid_field?.major_field,
              mid: unit?.minor_field?.mid_field,
              minor: unit?.minor_field,
            },
            university: {
              id: unit.admission.university.id,
              name: unit.admission.university.name,
              region: unit.admission.university.region,
              code: unit.admission.university.code,
              establishment_type: unit.admission.university.establishment_type,
            },
            admission: {
              id: unit.admission.id,
              name: unit.admission.name,
              year: unit.admission.year,
              basic_type: unit.admission.basic_type,
              category: unit.admission.category,
            },
            admission_method: {
              method_description: unit.admission.method.method_description,
              subject_ratio: unit.admission.method.subject_ratio,
              document_ratio: unit.admission.method.document_ratio,
              interview_ratio: unit.admission.method.interview_ratio,
              practical_ratio: unit.admission.method.practical_ratio,
              other_details: unit.admission.method.other_details,
              second_stage_first_ratio: unit.admission.method.second_stage_first_ratio,
              second_stage_interview_ratio: unit.admission.method.second_stage_interview_ratio,
              second_stage_other_ratio: unit.admission.method.second_stage_other_ratio,
              second_stage_other_details: unit.admission.method.second_stage_other_details,
              eligibility: unit.admission.method.eligibility,
              school_record_evaluation_score: unit.admission.method.school_record_evaluation_score,
              school_record_evaluation_elements:
                unit.admission.method.school_record_evaluation_elements,
            },
            scores: unit.scores
              ? {
                  grade_50_cut: unit.scores.grade_50_cut,
                  grade_70_cut: unit.scores.grade_70_cut,
                  convert_50_cut: unit.scores.convert_50_cut,
                  convert_70_cut: unit.scores.convert_70_cut,
                  risk_plus_5: unit.scores.risk_plus_5,
                  risk_plus_4: unit.scores.risk_plus_4,
                  risk_plus_3: unit.scores.risk_plus_3,
                  risk_plus_2: unit.scores.risk_plus_2,
                  risk_plus_1: unit.scores.risk_plus_1,
                  risk_minus_1: unit.scores.risk_minus_1,
                  risk_minus_2: unit.scores.risk_minus_2,
                  risk_minus_3: unit.scores.risk_minus_3,
                  risk_minus_4: unit.scores.risk_minus_4,
                  risk_minus_5: unit.scores.risk_minus_5,
                }
              : null,
          },
          regularAdmission: regularAdmission || null,
        };
      }),
    );

    return result;
  }
}
