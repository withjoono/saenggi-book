import { IsString } from 'class-validator';

export class UseTicketReqDto {
  @IsString()
  officerId: string;

  @IsString()
  series: string;
}
