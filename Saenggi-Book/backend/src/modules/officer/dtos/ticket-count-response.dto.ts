import { IsNumber } from 'class-validator';

export class GetTicketCountResponseDto {
  @IsNumber()
  count: number;
}
