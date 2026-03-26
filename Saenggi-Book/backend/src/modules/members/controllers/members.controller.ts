import { Body, Controller, Patch, SerializeOptions } from '@nestjs/common';
import { MembersService } from '../services/members.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CurrentMemberId } from 'src/auth/decorators/current-member_id.decorator';
import { EditProfileDto } from '../dtos/edit-profile.dto';
import { EditLifeRecordDto } from '../dtos/edit-life-record.dto';
import { SchoolRecordService } from 'src/modules/schoolrecord/schoolrecord.service';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly schoolRecordService: SchoolRecordService,
  ) {}

  @ApiOperation({
    summary: '유저 프로필 수정',
    description:
      '현재 로그인한 사용자의 프로필 정보를 수정합니다. 닉네임, 전화번호, 학교 정보 등을 변경할 수 있습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 수정 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 데이터)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (JWT 토큰 없음 또는 유효하지 않음)',
  })
  @ApiBearerAuth('access-token')
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('profile')
  async editProfile(@Body() body: EditProfileDto, @CurrentMemberId() memberId: string) {
    await this.membersService.editProfile(memberId, body);
    return null;
  }

  @ApiOperation({
    summary: '유저 생기부 수정',
    description:
      '현재 로그인한 사용자의 생활기록부 기본 정보를 수정합니다. 학년, 반, 번호 등의 정보를 변경할 수 있습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '생기부 수정 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 데이터)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (JWT 토큰 없음 또는 유효하지 않음)',
  })
  @ApiBearerAuth('access-token')
  @Patch('life-record')
  async editLifeRecord(
    @CurrentMemberId() memberId: string,
    @Body() editLifeRecordDto: EditLifeRecordDto,
  ) {
    await this.schoolRecordService.editLifeRecord(memberId, editLifeRecordDto);
    return null;
  }
}
