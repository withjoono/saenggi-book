// @ts-nocheck
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateAdmissionSubtypeDto,
  UpdateAdmissionSubtypeDto,
} from '../dtos/admission-subtype.dto';

@Injectable()
export class CoreAdmissionSubtypeService {
  constructor(  ) {}

  async findAll(): Promise<AdmissionSubtypeEntity[]> {
    return this.admissionSubtypeRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<AdmissionSubtypeEntity> {
    const subtype = await this.admissionSubtypeRepository.findOne({
      where: { id },
    });
    if (!subtype) {
      throw new NotFoundException(`Admission subtype with ID ${id} not found`);
    }
    return subtype;
  }

  async create(dto: CreateAdmissionSubtypeDto): Promise<AdmissionSubtypeEntity> {
    const subtype = this.admissionSubtypeRepository.create(dto);
    return this.admissionSubtypeRepository.save(subtype);
  }

  async update(
    id: number,
    updateAdmissionSubtypeDto: UpdateAdmissionSubtypeDto,
  ): Promise<AdmissionSubtypeEntity> {
    const subtype = await this.findOne(id);
    subtype.name = updateAdmissionSubtypeDto.name;
    return this.admissionSubtypeRepository.save(subtype);
  }

  async remove(id: number): Promise<void> {
    const subtype = await this.findOne(id);
    await this.admissionSubtypeRepository.remove(subtype);
  }
}
