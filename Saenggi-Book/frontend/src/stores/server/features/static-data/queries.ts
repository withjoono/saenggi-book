import { useQuery } from "@tanstack/react-query";
import { STATIC_DATA_APIS } from "./apis";
import {
  IStaticData,
  ISubjectCode,
  IGeneralFieldData,
  IMajorFieldData,
  IMidFieldData,
  IMinorFieldData,
  IAdmissionSubtype,
  IAdmissionSubtypeCategory,
} from "./interfaces";
import { IMainSubject, ISubject } from "@/types/subject.type";

export const staticDataQueryKeys = {
  all: ["staticData"] as const,
  data: () => [...staticDataQueryKeys.all, "data"] as const,
};

export interface ITransformedSubjects {
  MAIN_SUBJECTS: { [key: string]: IMainSubject };
  SUBJECTS: { [key: string]: ISubject };
}

export interface ITransformedMajorField extends IMajorFieldData {
  midFieldIds: number[];
}

export interface ITransformedMidField extends IMidFieldData {
  minorFieldIds: number[];
}

export interface ITransformedFields {
  GENERAL_FIELDS: { [key: number]: IGeneralFieldData };
  MAJOR_FIELDS: { [key: number]: ITransformedMajorField };
  MID_FIELDS: { [key: number]: ITransformedMidField };
  MINOR_FIELDS: { [key: number]: IMinorFieldData };
  ADMISSION_SUBTYPES: { [key: number]: IAdmissionSubtype };
  ADMISSION_SUBTYPE_CATEGORIES: { [key: number]: IAdmissionSubtypeCategory };
}

export interface ISearchSuggestions {
  universityNames: string[];
  admissionNames: string[];
  recruitmentUnitNames: string[];
}

export interface ITransformedStaticData {
  subjects: ITransformedSubjects;
  fields: ITransformedFields;
  searchSuggestions: ISearchSuggestions;
}

export const useGetStaticData = () => {
  return useQuery<IStaticData, Error, ITransformedStaticData>({
    queryKey: staticDataQueryKeys.data(),
    queryFn: STATIC_DATA_APIS.fetchStaticDataAPI,
    staleTime: 120 * 60 * 1000, // 120 minutes
    select: (data: IStaticData): ITransformedStaticData => {
      const subjects: ITransformedSubjects = {
        MAIN_SUBJECTS: {},
        SUBJECTS: {},
      };

      const fields: ITransformedFields = {
        GENERAL_FIELDS: {},
        MAJOR_FIELDS: {},
        MID_FIELDS: {},
        MINOR_FIELDS: {},
        ADMISSION_SUBTYPES: {},
        ADMISSION_SUBTYPE_CATEGORIES: {},
      };

      // 교과 코드 분류 (교과, 과목)
      // Note: humps에 의해 API 응답이 camelCase로 변환됨
      data.subjectCodes.forEach((subject: ISubjectCode) => {
        if (!subjects.MAIN_SUBJECTS[subject.mainSubjectCode]) {
          subjects.MAIN_SUBJECTS[subject.mainSubjectCode] = {
            code: subject.mainSubjectCode,
            name: subject.mainSubjectName,
            subjectList: [],
          };
        }

        if (
          !subjects.MAIN_SUBJECTS[
            subject.mainSubjectCode
          ].subjectList.includes(subject.subjectCode)
        ) {
          subjects.MAIN_SUBJECTS[subject.mainSubjectCode].subjectList.push(
            subject.subjectCode,
          );
        }

        subjects.SUBJECTS[subject.subjectCode] = {
          id: Number(subject.id),
          code: subject.subjectCode,
          name: subject.subjectName,
          type: subject.type || 0,
          courseType: subject.courseType,
          isRequired: subject.isRequired,
        };
      });

      // Transform fields
      data.generalFields.forEach((field: IGeneralFieldData) => {
        fields.GENERAL_FIELDS[field.id] = field;
      });

      // 대계열 변환
      data.majorFields.forEach((field: IMajorFieldData) => {
        fields.MAJOR_FIELDS[field.id] = {
          ...field,
          midFieldIds: [],
        };
      });

      // 중계열 변환
      // Note: humps에 의해 API 응답이 camelCase로 변환됨
      data.midFields.forEach((field: IMidFieldData) => {
        fields.MID_FIELDS[field.id] = {
          ...field,
          minorFieldIds: [],
        };
        // 대계열에 중계열 ID 추가
        if (fields.MAJOR_FIELDS[field.majorFieldId]) {
          fields.MAJOR_FIELDS[field.majorFieldId].midFieldIds.push(field.id);
        }
      });

      // 소계열 변환 및 중계열에 소계열 ID 추가
      // Note: humps에 의해 API 응답이 camelCase로 변환됨
      data.minorFields.forEach((field: IMinorFieldData) => {
        fields.MINOR_FIELDS[field.id] = field;
        if (fields.MID_FIELDS[field.midFieldId]) {
          fields.MID_FIELDS[field.midFieldId].minorFieldIds.push(field.id);
        }
      });

      data.admissionSubtypes.forEach((subtype: IAdmissionSubtype) => {
        fields.ADMISSION_SUBTYPES[subtype.id] = subtype;
      });

      // 특별전형 카테고리 변환
      (data.admissionSubtypeCategories || []).forEach(
        (category: IAdmissionSubtypeCategory) => {
          fields.ADMISSION_SUBTYPE_CATEGORIES[category.id] = category;
        },
      );

      const searchSuggestions: ISearchSuggestions = {
        universityNames: data.universityNames,
        admissionNames: data.admissionNames,
        recruitmentUnitNames: data.recruitmentUnitNames,
      };

      return { subjects, fields, searchSuggestions };
    },
  });
};
