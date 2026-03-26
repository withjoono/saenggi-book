// @ts-nocheck

export class GetOfficerListResponseDto {
  officer_id: OfficerListEntity['member_id'];
  officer_name: OfficerListEntity['officer_name'];
  officer_profile_image: OfficerListEntity['officer_profile_image'];
  officer_university: OfficerListEntity['university'];
  officer_education: OfficerListEntity['education'];
  remaining_evaluations: number;
}
