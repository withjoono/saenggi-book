import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRoleEnum } from 'src/modules/members/enums/member-role.enum';
import { MembersService } from 'src/modules/members/services/members.service';

// Roles Guard를 사용하면 jwt 인증으로 인해 저장된 req.memberId 필드를 통해 멤버를 조회한 후 권한을 체크함
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly membersService: MembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!roles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const member = await this.membersService.findOneById(request.memberId);

    // 로그인된 유저가 어드민이면 전부 허용
    if (member.role_type === MemberRoleEnum.admin) {
      return true;
    }

    return roles.includes(member.role_type);
  }
}
