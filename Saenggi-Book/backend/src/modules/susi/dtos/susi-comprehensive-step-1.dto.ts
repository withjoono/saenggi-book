// @ts-nocheck

// 대학명, 전형명, 지역, 세부전형, 모집단위(계열), 최초합컷, 추합컷
export class SusiComprehensiveStep1ResponseDto {
  id: SusiComprehensiveEntity['id'];
  university_name: SusiComprehensiveEntity['university_name'];
  basic_type: SusiComprehensiveEntity['basic_type'];
  type_name: SusiComprehensiveEntity['type_name'];
  region: SusiComprehensiveEntity['region'];
  detailed_type: SusiComprehensiveEntity['detailed_type'];
  department: SusiComprehensiveEntity['department'];
  recruitment_unit_name: SusiComprehensiveEntity['recruitment_unit_name'];
  cut_50: SusiComprehensiveEntity['cut_50'];
  cut_70: SusiComprehensiveEntity['cut_70'];

  risk_level_plus5: SusiComprehensiveEntity['risk_level_plus5']; // '등급컷위험도(+)5'
  risk_level_plus4: SusiComprehensiveEntity['risk_level_plus4']; // '위험도(+)4'
  risk_level_plus3: SusiComprehensiveEntity['risk_level_plus3']; // '위험도(+)3'
  risk_level_plus2: SusiComprehensiveEntity['risk_level_plus2']; // '위험도(+)2'
  risk_level_plus1: SusiComprehensiveEntity['risk_level_plus1']; // '위험도(+)1'
  risk_level_minus1: SusiComprehensiveEntity['risk_level_minus1']; // '위험도(-1)'
  risk_level_minus2: SusiComprehensiveEntity['risk_level_minus2']; // '위험도(-2)'
  risk_level_minus3: SusiComprehensiveEntity['risk_level_minus3']; // '위험도(-3)'
  risk_level_minus4: SusiComprehensiveEntity['risk_level_minus4']; // '위험도(-4)'
  risk_level_minus5: SusiComprehensiveEntity['risk_level_minus5']; // '위험도(-5)'
}
