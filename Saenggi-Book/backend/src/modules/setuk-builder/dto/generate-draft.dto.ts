import { IsString, IsArray, IsOptional } from 'class-validator';

export class GenerateDraftDto {
    @IsString()
    selectedTopic: string;

    @IsArray()
    @IsString({ each: true })
    studentActivities: string[];

    /** 서사 연결 키워드 (초안에 자연스럽게 녹여넣기 위함) */
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    storylineKeywords?: string[];
}
