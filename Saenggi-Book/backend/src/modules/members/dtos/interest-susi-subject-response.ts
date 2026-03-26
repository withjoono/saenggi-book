// @ts-nocheck
import { ApiProperty } from '@nestjs/swagger';

// 관심대학 관련 데이터 조회
export class InterestSusiSubjectResponse {
  @ApiProperty({ example: 1 })
  id: SuSiSubjectEntity['id'];

  @ApiProperty({ example: '강서대' })
  university_name: SuSiSubjectEntity['university_name']; // 대학명
  @ApiProperty({ example: '학생부교과' })
  type_name: SuSiSubjectEntity['type_name']; // 전형명
  @ApiProperty({ example: '데이터학과' })
  recruitment_unit_name: SuSiSubjectEntity['recruitment_unit_name']; // 모집단위명

  @ApiProperty({ example: '820' })
  converted_score_cut: SuSiSubjectEntity['converted_score_cut']; // 환산점수컷(교과컷)
  @ApiProperty({ example: '1000' })
  converted_score_total: SuSiSubjectEntity['converted_score_total']; // 환산점수총점
  @ApiProperty({ example: '800' })
  non_subject_cut: SuSiSubjectEntity['non_subject_cut']; // 비교과컷

  @ApiProperty({ example: '800' })
  risk_level_minus1: SuSiSubjectEntity['risk_level_minus1']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_minus2: SuSiSubjectEntity['risk_level_minus2']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_minus3: SuSiSubjectEntity['risk_level_minus3']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_minus4: SuSiSubjectEntity['risk_level_minus4']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_minus5: SuSiSubjectEntity['risk_level_minus5']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_plus1: SuSiSubjectEntity['risk_level_plus1']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_plus2: SuSiSubjectEntity['risk_level_plus2']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_plus3: SuSiSubjectEntity['risk_level_plus3']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_plus4: SuSiSubjectEntity['risk_level_plus4']; // 위험도
  @ApiProperty({ example: '800' })
  risk_level_plus5: SuSiSubjectEntity['risk_level_plus5']; // 위험도
}
