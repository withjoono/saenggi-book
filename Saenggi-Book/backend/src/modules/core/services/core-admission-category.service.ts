// @ts-nocheck
// core-admission-category.service.ts
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateAdmissionCategoryDto,
  UpdateAdmissionCategoryDto,
} from '../dtos/admission-category.dto';

@Injectable()
export class CoreAdmissionCategoryService {
  constructor(  ) {}

  async findAll(): Promise<AdmissionCategoryEntity[]> {
    return this.admissionCategoryRepository.find();
  }

  async findOne(id: number): Promise<AdmissionCategoryEntity> {
    const category = await this.admissionCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Admission category with ID ${id} not found`);
    }
    return category;
  }

  async create(
    createAdmissionCategoryDto: CreateAdmissionCategoryDto,
  ): Promise<AdmissionCategoryEntity> {
    const category = this.admissionCategoryRepository.create(createAdmissionCategoryDto);
    return this.admissionCategoryRepository.save(category);
  }

  async update(
    id: number,
    updateAdmissionCategoryDto: UpdateAdmissionCategoryDto,
  ): Promise<AdmissionCategoryEntity> {
    const category = await this.findOne(id);
    Object.assign(category, updateAdmissionCategoryDto);
    return this.admissionCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.admissionCategoryRepository.remove(category);
  }
}
