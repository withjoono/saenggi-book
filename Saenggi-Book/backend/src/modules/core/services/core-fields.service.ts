// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateGeneralFieldDto,
  CreateMajorFieldDto,
  CreateMidFieldDto,
  CreateMinorFieldDto,
  UpdateGeneralFieldDto,
  UpdateMajorFieldDto,
  UpdateMidFieldDto,
  UpdateMinorFieldDto,
} from '../dtos/fields.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

@Injectable()
export class CoreFieldsService {
  // NOTE: This service was migrated from TypeORM but the repositories are no longer available.
  // These are typed as `any` to allow compilation. Service needs full Prisma rewrite if used.
  private majorFieldRepository: any;
  private midFieldRepository: any;
  private minorFieldRepository: any;
  private generalFieldRepository: any;
  private dataSource: any;

  constructor(private readonly prisma: PrismaService) {
    // Stub: TypeORM repositories are no longer injected.
    // This service needs to be rewritten for Prisma if it is to be used.
  }

  // MajorField CRUD
  async getAllMajorFields(): Promise<MajorFieldEntity[]> {
    return this.majorFieldRepository.find({
      relations: ['mid_fields'],
      order: {
        id: 'asc',
      },
    });
  }

  async getMajorFieldById(id: number): Promise<MajorFieldEntity> {
    const majorField = await this.majorFieldRepository.findOne({
      where: { id },
      relations: ['mid_fields'],
    });
    if (!majorField) {
      throw new NotFoundException(`Major field with ID ${id} not found`);
    }
    return majorField;
  }

  async createMajorField(dto: CreateMajorFieldDto): Promise<MajorFieldEntity> {
    const majorField = this.majorFieldRepository.create(dto);
    return this.majorFieldRepository.save(majorField);
  }

  async updateMajorField(id: number, dto: UpdateMajorFieldDto): Promise<MajorFieldEntity> {
    const majorField = await this.getMajorFieldById(id);
    majorField.name = dto.name;
    return this.majorFieldRepository.save(majorField);
  }

  async deleteMajorField(id: number): Promise<void> {
    const result = await this.majorFieldRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Major field with ID ${id} not found`);
    }
  }

  // MidField CRUD
  async getAllMidFields(): Promise<MidFieldEntity[]> {
    return this.midFieldRepository.find({
      relations: ['minor_fields'],
      order: {
        id: 'asc',
      },
    });
  }

  async getMidFieldById(id: number): Promise<MidFieldEntity> {
    const midField = await this.midFieldRepository.findOne({
      where: { id },
      relations: ['minor_fields'],
    });
    if (!midField) {
      throw new NotFoundException(`Mid field with ID ${id} not found`);
    }
    return midField;
  }

  async createMidField(createMidFieldDto: CreateMidFieldDto): Promise<MidFieldEntity> {
    const { majorFieldId, ...midFieldData } = createMidFieldDto;
    const majorField = await this.getMajorFieldById(majorFieldId);
    const midField = this.midFieldRepository.create({
      ...midFieldData,
      major_field: majorField,
    });
    return this.midFieldRepository.save(midField);
  }

  async updateMidField(id: number, updateMidFieldDto: UpdateMidFieldDto): Promise<MidFieldEntity> {
    const { majorFieldId, ...midFieldData } = updateMidFieldDto;
    const midField = await this.getMidFieldById(id);
    const majorField = await this.getMajorFieldById(majorFieldId);
    Object.assign(midField, midFieldData);
    midField.major_field = majorField;
    return this.midFieldRepository.save(midField);
  }

  async deleteMidField(id: number): Promise<void> {
    const result = await this.midFieldRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mid field with ID ${id} not found`);
    }
  }

  // MinorField CRUD
  async getAllMinorFields(): Promise<MinorFieldEntity[]> {
    return this.minorFieldRepository.find({
      relations: ['mid_field'],
      order: {
        id: 'asc',
      },
    });
  }

  async getMinorFieldById(id: number): Promise<MinorFieldEntity> {
    const minorField = await this.minorFieldRepository.findOne({
      where: { id },
      relations: ['mid_field'],
    });
    if (!minorField) {
      throw new NotFoundException(`Minor field with ID ${id} not found`);
    }
    return minorField;
  }

  // MinorField methods
  async createMinorField(createMinorFieldDto: CreateMinorFieldDto): Promise<MinorFieldEntity> {
    const { midFieldId, ...minorFieldData } = createMinorFieldDto;
    const midField = await this.getMidFieldById(midFieldId);
    const minorField = this.minorFieldRepository.create({
      ...minorFieldData,
      mid_field: midField,
    });
    return this.minorFieldRepository.save(minorField);
  }

  async updateMinorField(
    id: number,
    updateMinorFieldDto: UpdateMinorFieldDto,
  ): Promise<MinorFieldEntity> {
    const { midFieldId, ...minorFieldData } = updateMinorFieldDto;
    const minorField = await this.getMinorFieldById(id);
    const midField = await this.getMidFieldById(midFieldId);
    Object.assign(minorField, minorFieldData);
    minorField.mid_field = midField;
    return this.minorFieldRepository.save(minorField);
  }

  async deleteMinorField(id: number): Promise<void> {
    const result = await this.minorFieldRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Minor field with ID ${id} not found`);
    }
  }

  // GeneralField CRUD
  async getAllGeneralFields(): Promise<GeneralFieldEntity[]> {
    return this.generalFieldRepository.find({
      order: {
        id: 'asc',
      },
    });
  }

  async getGeneralFieldById(id: number): Promise<GeneralFieldEntity> {
    const generalField = await this.generalFieldRepository.findOne({
      where: { id },
    });
    if (!generalField) {
      throw new NotFoundException(`General field with ID ${id} not found`);
    }
    return generalField;
  }

  async createGeneralField(
    createGeneralFieldDto: CreateGeneralFieldDto,
  ): Promise<GeneralFieldEntity> {
    const generalField = this.generalFieldRepository.create(createGeneralFieldDto);
    return this.generalFieldRepository.save(generalField);
  }

  async updateGeneralField(
    id: number,
    updateGeneralFieldDto: UpdateGeneralFieldDto,
  ): Promise<GeneralFieldEntity> {
    const generalField = await this.getGeneralFieldById(id);
    Object.assign(generalField, updateGeneralFieldDto);
    return this.generalFieldRepository.save(generalField);
  }
  async deleteGeneralField(id: number): Promise<void> {
    const result = await this.generalFieldRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`General field with ID ${id} not found`);
    }
  }

  async syncFieldsWithExcel(filePath: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 엑셀 파일 읽기
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 'A',
      });

      const CHUNK_SIZE = 300;
      let chunk = [];

      const majorFields = new Map<string, MajorFieldEntity>();
      const midFields = new Map<string, MidFieldEntity>();

      for (let i = 1; i < sheet.length; i++) {
        const row = sheet[i];
        const majorName = (row['B'] || '자유전공').trim();
        const midName = (row['C'] || '자유전공').trim();
        const minorName = (row['D'] || '자유전공').trim();

        // 대계열 처리
        let majorField = majorFields.get(majorName);
        if (!majorField) {
          majorField = await queryRunner.manager.findOne(MajorFieldEntity, {
            where: { name: majorName },
          });
          if (!majorField) {
            majorField = new MajorFieldEntity();
            majorField.name = majorName;
          }
          majorField = await queryRunner.manager.save(MajorFieldEntity, majorField);
          majorFields.set(majorName, majorField);
        }

        // 중계열 처리
        let midField = midFields.get(`${majorName}-${midName}`);
        if (!midField) {
          midField = await queryRunner.manager.findOne(MidFieldEntity, {
            where: { name: midName, major_field: majorField },
          });
          if (!midField) {
            midField = new MidFieldEntity();
            midField.name = midName;
            midField.major_field = majorField;
          }
          midField = await queryRunner.manager.save(MidFieldEntity, midField);
          midFields.set(`${majorName}-${midName}`, midField);
        }

        // 소계열 처리
        let minorField = await queryRunner.manager.findOne(MinorFieldEntity, {
          where: { name: minorName, mid_field: midField },
        });
        if (!minorField) {
          minorField = new MinorFieldEntity();
          minorField.name = minorName;
          minorField.mid_field = midField;
          chunk.push(minorField);
        }

        if (chunk.length === CHUNK_SIZE || i === sheet.length - 1) {
          await queryRunner.manager.save(MinorFieldEntity, chunk);
          chunk = [];
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('데이터 동기화 중 오류 발생:', error);
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
