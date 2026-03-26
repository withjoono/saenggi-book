// @ts-nocheck

export class StaticDataDto {
  subjectCodes: SubjectCodeListEntity[]; // 교과 코드
  generalFields: GeneralFieldEntity[]; // 일반 계열(인문,자연,의치한약수 등)
  majorFields: MajorFieldEntity[]; // 대계열
  midFields: MidFieldEntity[]; // 중계열
  minorFields: MinorFieldEntity[]; // 소계열
  admissionSubtypes: AdmissionSubtypeEntity[]; // 특별 전형 필터
  admissionSubtypeCategories: AdmissionSubtypeCategoryEntity[]; // 특별전형 카테고리
  // 검색어 추천(대학, 전형, 모집단위)
  universityNames: string[];
  admissionNames: string[];
  recruitmentUnitNames: string[];
}
