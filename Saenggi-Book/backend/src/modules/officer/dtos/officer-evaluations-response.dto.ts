// @ts-nocheck

export interface GetOfficerEvaluationsResponseDto {
  id: OfficerEvaluationEntity['id'];
  series: OfficerEvaluationEntity['series'];
  status: OfficerEvaluationEntity['status'];
  update_dt: OfficerEvaluationEntity['update_dt'];

  officer_id: number;
  officer_name: string;
  officer_profile_image: string;
  remaining_evaluations: number; // 남은 평가 수
}
