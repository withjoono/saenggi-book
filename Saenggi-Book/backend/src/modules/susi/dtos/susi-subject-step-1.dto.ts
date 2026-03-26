import { SusiSubjectGroupData } from './susi-subject-group.dto';

// 대학명, 전형명, 지역, 세부전형, 모집단위(계열), 최초합컷, 추합컷
export class SusiSubjectStep1ResponseDto {
  grouped_data: Record<string, SusiSubjectGroupData>;
}
