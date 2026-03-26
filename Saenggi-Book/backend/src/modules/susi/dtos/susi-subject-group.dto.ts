export class SusiSubjectGroupData {
  university_name: string; // 대학명
  type_name: string; // 전형명
  department: string; // 계열
  detailed_type: number[]; // 상세전형
  min_cut: number; // 최소컷
  max_cut: number; // 최대컷
  ids: number[]; // 해당 그룹에 포함된 전형 id 목록
  region: string; //지역
}
