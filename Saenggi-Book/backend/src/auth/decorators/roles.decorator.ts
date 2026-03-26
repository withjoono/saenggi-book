import { SetMetadata } from '@nestjs/common';

export const Roles = (roles: ('ROLE_USER' | 'ROLE_ADMIN')[]) => SetMetadata('roles', roles);
