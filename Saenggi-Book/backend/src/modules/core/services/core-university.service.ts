// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateUniversityDto, UpdateUniversityDto } from '../dtos/university.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

@Injectable()
export class CoreUniversityService {
  constructor(  ) {}

  async findAll(
    query: PaginationDto,
  ): Promise<{ universities: UniversityEntity[]; total: number }> {
    const [universities, total] = await this.universityRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { code: 'ASC' },
    });

    return { universities, total };
  }

  async findOne(id: number): Promise<UniversityEntity> {
    const university = await this.universityRepository.findOne({
      where: { id },
    });
    if (!university) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }
    return university;
  }

  async create(universityData: CreateUniversityDto): Promise<UniversityEntity> {
    const university = this.universityRepository.create(universityData);
    return this.universityRepository.save(university);
  }

  async update(id: number, universityData: UpdateUniversityDto): Promise<UniversityEntity> {
    await this.findOne(id); // 존재 여부 확인
    await this.universityRepository.update(id, universityData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.universityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }
  }

  async syncUniversitiesWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.universityRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 엑셀 파일 읽기
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const universitiesMap = new Map<string, UniversityEntity>();

      for (let i = 2; i < sheet.length; i++) {
        const row = sheet[i];
        const region = (row['C'] || '').trim();
        const name = (row['D'] || '').trim();
        const code = (row['E'] || '').trim();
        const establishmentType = (row['F'] || '').trim() as '국립' | '사립' | '';
        if (!code || !name) continue;

        if (!universitiesMap.has(code)) {
          const university = new UniversityEntity();
          university.region = region;
          university.name = name;
          university.code = code;
          university.establishment_type = establishmentType;

          universitiesMap.set(code, university);
        }
      }

      // 데이터베이스에서 기존 대학 정보 가져오기
      const existingUniversities = await this.universityRepository.find({
        where: { code: In([...universitiesMap.keys()]) },
      });

      const toUpdate: UniversityEntity[] = [];
      const toInsert: UniversityEntity[] = [];

      universitiesMap.forEach((university) => {
        const existingUniversity = existingUniversities.find((e) => e.code === university.code);
        if (existingUniversity) {
          // 기존 데이터가 있으면 업데이트
          existingUniversity.region = university.region;
          existingUniversity.name = university.name;
          existingUniversity.establishment_type = university.establishment_type;
          toUpdate.push(existingUniversity);
        } else {
          // 기존 데이터가 없으면 삽입
          toInsert.push(university);
        }
      });

      // 업데이트 및 삽입 수행
      if (toUpdate.length > 0) {
        await queryRunner.manager.save(UniversityEntity, toUpdate);
      }

      if (toInsert.length > 0) {
        await queryRunner.manager.insert(UniversityEntity, toInsert);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('대학 데이터 동기화 중 오류 발생:', error);
      throw error;
    } finally {
      await queryRunner.release();
      // 파일 삭제
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      });
    }
  }
}
