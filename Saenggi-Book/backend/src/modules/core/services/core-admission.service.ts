// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { CreateAdmissionDto, UpdateAdmissionDto } from '../dtos/admission.dto';

@Injectable()
export class CoreAdmissionService {
  constructor(  ) {}

  async findAllByUniversity(universityId: number): Promise<AdmissionEntity[]> {
    return this.admissionRepository.find({
      where: { university: { id: universityId } },
      relations: ['category', 'method', 'subtypes', 'university', 'recruitment_units'],
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<AdmissionEntity> {
    const admission = await this.admissionRepository.findOne({
      where: { id },
      relations: ['category', 'method', 'university', 'subtypes', 'recruitment_units'],
    });
    if (!admission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
    return admission;
  }

  async create(createAdmissionDto: CreateAdmissionDto): Promise<AdmissionEntity> {
    const { method, subtype_ids, university_id, category_id, ...admissionData } =
      createAdmissionDto;

    const university = await this.universityRepository.findOneOrFail({
      where: { id: university_id },
    });
    const category = await this.admissionCategoryRepository.findOneOrFail({
      where: { id: category_id },
    });

    const admission = this.admissionRepository.create({
      ...admissionData,
      university,
      category,
    });

    const admissionMethod = this.admissionMethodRepository.create(method);
    admission.method = admissionMethod;

    if (subtype_ids && subtype_ids.length > 0) {
      const subtypes = await this.admissionSubtypeRepository.find({
        where: { id: In(subtype_ids) },
      });
      admission.subtypes = subtypes;
    }

    await this.admissionRepository.save(admission);
    return this.findOne(admission.id);
  }

  async update(id: number, updateAdmissionDto: UpdateAdmissionDto): Promise<AdmissionEntity> {
    const admission = await this.findOne(id);
    const { method, subtype_ids, university_id, category_id, ...admissionData } =
      updateAdmissionDto;

    if (university_id) {
      const university = await this.universityRepository.findOneOrFail({
        where: { id: university_id },
      });
      admission.university = university;
    }

    if (category_id) {
      const category = await this.admissionCategoryRepository.findOneOrFail({
        where: {
          id: category_id,
        },
      });
      admission.category = category;
    }

    Object.assign(admission, admissionData);

    if (method) {
      if (admission.method) {
        Object.assign(admission.method, method);
      } else {
        admission.method = this.admissionMethodRepository.create(method);
      }
    }

    if (subtype_ids) {
      const subtypes = await this.admissionSubtypeRepository.find({
        where: { id: In(subtype_ids) },
      });
      admission.subtypes = subtypes;
    }

    await this.admissionRepository.save(admission);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const admission = await this.findOne(id);
    if (admission.method) {
      await this.admissionMethodRepository.delete(admission.method.id);
    }
    await this.admissionRepository.delete(id);
  }

  async syncSubjectAdmissionsWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.admissionRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      console.log(`총 ${sheet.length}개 데이터 처리 시작`);

      // 대학, 카테고리, 서브타입 정보 가져오기
      const universities = await this.universityRepository.find();
      const categories = await this.admissionCategoryRepository.find();
      const subtypes = await this.admissionSubtypeRepository.find();

      const universitiesMap = new Map(universities.map((u) => [u.code, u]));
      const categoriesMap = new Map(categories.map((c) => [c.name, c]));
      const subtypesMap = new Map(subtypes.map((s) => [s.id, s]));

      const admissionsMap = new Map<
        string,
        Map<string, { admission: AdmissionEntity; method: AdmissionMethodEntity }>
      >();

      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const universityCode = (row['E'] + '' || '').trim();
        const year = parseInt(row['B']) || null;
        const name = (row['I'] + '' || '').trim();
        const basicType = (row['G'] + '' || '').trim() as '일반' | '특별';
        const categoryName = (row['J'] + '' || '').trim();

        if (!universityCode || !year || !name) continue;

        const key = `${universityCode}-${year}-${categoryName}`;
        const admissionKey = `${name}`;

        if (!admissionsMap.has(key)) {
          admissionsMap.set(key, new Map());
        }

        const universityAdmissions = admissionsMap.get(key);

        if (!universityAdmissions.has(admissionKey)) {
          const admission = new AdmissionEntity();
          admission.year = year;
          admission.name = name;
          admission.basic_type = basicType;
          admission.university = universitiesMap.get(universityCode);
          admission.category = categoriesMap.get(categoryName);

          // 중복 제거를 위해 Set 사용
          const subtypeIds = [
            ...new Set(
              (row['H'] + '' || '')
                .split(',')
                .filter((id) => id.trim() !== '')
                .map((id) => parseInt(id.trim())),
            ),
          ];
          admission.subtypes = subtypeIds.map((id) => subtypesMap.get(id)).filter(Boolean);

          const method = new AdmissionMethodEntity();
          method.method_description = (row['T'] || '').trim() || '';
          method.subject_ratio = parseFloat(row['U']) || null;
          method.document_ratio = parseFloat(row['Y']) || null;
          method.interview_ratio = parseFloat(row['V']) || null;
          method.practical_ratio = parseFloat(row['Z']) || null;
          method.other_details = (row['AE'] || '').trim() || '';
          method.second_stage_first_ratio = parseFloat(row['AA']) || null;
          method.second_stage_interview_ratio = parseFloat(row['AB']) || null;
          method.eligibility = (row['AF'] || '').trim() || '';

          universityAdmissions.set(admissionKey, { admission, method });
        }
      }

      console.log(`${admissionsMap.size}개 대학의 전형 정보 처리`);

      // 기존 데이터 확인 및 업데이트/삽입
      for (const [universityKey, universityAdmissions] of admissionsMap) {
        const [universityCode, year, categoryName] = universityKey.split('-');
        const existingAdmissions = await this.admissionRepository.find({
          where: {
            university: { code: universityCode },
            year: parseInt(year),
            category: { name: categoryName },
          },
          relations: ['university', 'method', 'category', 'subtypes'],
        });

        for (const { admission, method } of universityAdmissions.values()) {
          const existingAdmission = existingAdmissions.find(
            (e) =>
              e.name === admission.name &&
              e.year === admission.year &&
              e.university.id === admission.university.id,
          );

          if (existingAdmission) {
            // 기존 관계 제거
            await queryRunner.manager
              .createQueryBuilder()
              .delete()
              .from('ts_admission_subtype_relations')
              .where('admission_id = :id', { id: existingAdmission.id })
              .execute();

            // 새로운 관계 설정
            for (const subtype of admission.subtypes) {
              await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into('ts_admission_subtype_relations')
                .values({
                  admission_id: existingAdmission.id,
                  subtype_id: subtype.id,
                })
                .execute();
            }

            if (existingAdmission) {
              // 기존 method 업데이트 또는 새로 생성
              if (existingAdmission.method) {
                Object.assign(existingAdmission.method, method);
              } else {
                existingAdmission.method = this.admissionMethodRepository.create(method);
              }

              // admission 업데이트
              Object.assign(existingAdmission, admission);
              await queryRunner.manager.save(AdmissionEntity, existingAdmission);
            } else {
              // 새 admission과 method 생성
              const newAdmission = this.admissionRepository.create(admission);
              newAdmission.method = this.admissionMethodRepository.create(method);
              await queryRunner.manager.save(AdmissionEntity, newAdmission);
            }

            // admission 업데이트
            const updateData = {};
            if (admission.name !== existingAdmission.name) updateData['name'] = admission.name;
            if (admission.year !== existingAdmission.year) updateData['year'] = admission.year;
            if (admission.basic_type !== existingAdmission.basic_type)
              updateData['basic_type'] = admission.basic_type;
            if (admission.university.id !== existingAdmission.university.id)
              updateData['university'] = admission.university;
            if (admission.category.id !== existingAdmission.category.id)
              updateData['category'] = admission.category;

            if (Object.keys(updateData).length > 0) {
              await queryRunner.manager.update(AdmissionEntity, existingAdmission.id, updateData);
            }
          } else {
            // 새 admission과 method 생성
            const newAdmission = this.admissionRepository.create(admission);
            const newMethod = this.admissionMethodRepository.create(method);
            newAdmission.method = newMethod;
            newMethod.admission = newAdmission;
            await queryRunner.manager.save(AdmissionEntity, newAdmission);
          }
        }

        console.log(`${universityKey}: 전형 정보 업데이트 및 삽입 완료`);
      }

      await queryRunner.commitTransaction();
      console.log('전형 데이터 동기화 완료');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('전형 데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }

  async syncComprehensiveAdmissionsWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.admissionRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[1];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      console.log(`총 ${sheet.length}개 데이터 처리 시작`);

      // 대학, 카테고리, 서브타입 정보 가져오기
      const universities = await this.universityRepository.find();
      const categories = await this.admissionCategoryRepository.find();
      const subtypes = await this.admissionSubtypeRepository.find();

      const universitiesMap = new Map(universities.map((u) => [u.code, u]));
      const categoriesMap = new Map(categories.map((c) => [c.name, c]));
      const subtypesMap = new Map(subtypes.map((s) => [s.id, s]));

      const admissionsMap = new Map<
        string,
        Map<string, { admission: AdmissionEntity; method: AdmissionMethodEntity }>
      >();

      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const universityCode = (row['E'] + '' || '').trim();
        const year = parseInt(row['B']) || null;
        const name = (row['I'] + '' || '').trim();
        const basicType = (row['G'] + '' || '').trim() as '일반' | '특별';
        const categoryName = (row['J'] + '' || '').trim();

        if (!universityCode || !year || !name) continue;

        const key = `${universityCode}-${year}-${categoryName}`;
        const admissionKey = `${name}`;

        if (!admissionsMap.has(key)) {
          admissionsMap.set(key, new Map());
        }

        const universityAdmissions = admissionsMap.get(key);

        if (!universityAdmissions.has(admissionKey)) {
          const admission = new AdmissionEntity();
          admission.year = year;
          admission.name = name;
          admission.basic_type = basicType;
          admission.university = universitiesMap.get(universityCode);
          admission.category = categoriesMap.get(categoryName);

          // 중복 제거를 위해 Set 사용
          const subtypeIds = [
            ...new Set(
              (row['H'] + '' || '')
                .split(',')
                .filter((id) => id.trim() !== '')
                .map((id) => parseInt(id.trim())),
            ),
          ];
          admission.subtypes = subtypeIds.map((id) => subtypesMap.get(id)).filter(Boolean);

          const method = new AdmissionMethodEntity();
          method.method_description = (row['T'] || '').trim() || '';
          method.document_ratio = parseFloat(row['U']) || null;
          method.interview_ratio = parseFloat(row['V']) || null;
          method.other_details = (row['W'] || '').trim() || '';
          method.eligibility = (row['AC'] || '').trim() || '';
          method.school_record_evaluation_elements = (row['BF'] || '').split('/').join('/');
          if (method.school_record_evaluation_elements === 'N')
            method.school_record_evaluation_elements = null;
          method.school_record_evaluation_score = (row['BG'] || '').trim() || '';
          if (method.school_record_evaluation_score === 'N')
            method.school_record_evaluation_score = null;

          universityAdmissions.set(admissionKey, { admission, method });
        }
      }

      console.log(`${admissionsMap.size}개 대학의 전형 정보 처리`);

      // 기존 데이터 확인 및 업데이트/삽입
      for (const [universityKey, universityAdmissions] of admissionsMap) {
        const [universityCode, year, categoryName] = universityKey.split('-');
        const existingAdmissions = await this.admissionRepository.find({
          where: {
            university: { code: universityCode },
            year: parseInt(year),
            category: { name: categoryName },
          },
          relations: ['university', 'method', 'category', 'subtypes'],
        });

        for (const { admission, method } of universityAdmissions.values()) {
          const existingAdmission = existingAdmissions.find(
            (e) =>
              e.name === admission.name &&
              e.year === admission.year &&
              e.university.id === admission.university.id,
          );

          if (existingAdmission) {
            // 기존 관계 제거
            await queryRunner.manager
              .createQueryBuilder()
              .delete()
              .from('ts_admission_subtype_relations')
              .where('admission_id = :id', { id: existingAdmission.id })
              .execute();

            // 새로운 관계 설정
            existingAdmission.subtypes = admission.subtypes;

            // 기존 method 업데이트 또는 새로 생성
            if (existingAdmission.method) {
              Object.assign(existingAdmission.method, method);
            } else {
              existingAdmission.method = this.admissionMethodRepository.create(method);
            }

            // admission 업데이트
            Object.assign(existingAdmission, admission);

            // save를 사용하여 한 번에 업데이트
            await queryRunner.manager.save(AdmissionEntity, existingAdmission);
          } else {
            // 새 admission과 method 생성
            const newAdmission = this.admissionRepository.create(admission);
            const newMethod = this.admissionMethodRepository.create(method);
            newAdmission.method = newMethod;
            await queryRunner.manager.save(AdmissionEntity, newAdmission);
          }
        }

        console.log(`${universityKey}: 전형 정보 업데이트 및 삽입 완료`);
      }

      await queryRunner.commitTransaction();
      console.log('전형 데이터 동기화 완료');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('전형 데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }
}
