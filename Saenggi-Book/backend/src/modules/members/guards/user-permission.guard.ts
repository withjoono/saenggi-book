import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../services/members.service';

// jwt 토큰에 담긴 userId가 요청한 유저의 주인이 맞는지 확인하는 가드
@Injectable()
export class MemberPermissionGuard implements CanActivate {
  constructor(private readonly membersService: MembersService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url_memberId = request.params.memberId || request.body.memberId;
    const memberId = request.memberId; // JWT에서 추출된 ID (string)

    const member = await this.membersService.findOneById(memberId);

    if (!member) {
      throw new NotFoundException('멤버가 존재하지 않습니다.');
    }

    // URL의 memberId와 토큰의 사용자 ID 비교 (둘 다 string)
    if (String(member.id) !== String(url_memberId)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
