import { COMPATIBILITY_DATA } from "@/constants/compatibility-series";
import { ITransformedSubjects } from "@/stores/server/features/static-data/queries";
import { ICompatibilityScores, ISeries } from "@/types/compatibility.type";
import { IMainSubject, ISubject } from "@/types/subject.type";

const normalizeSeries = (series: string) => series.replace(/[.・]/g, "");

export const findCompatibilityBySeries = (
  grand: string,
  middle: string,
  row: string,
) => {
  const normalizedGrand = normalizeSeries(grand);
  const normalizedMiddle = normalizeSeries(middle);
  const normalizedRow = normalizeSeries(row);

  const exist = COMPATIBILITY_DATA.find(
    (n) =>
      normalizeSeries(n.grandSeries) === normalizedGrand &&
      normalizeSeries(n.middleSeries) === normalizedMiddle &&
      normalizeSeries(n.rowSeries) === normalizedRow,
  );

  return exist || null;
};

export const getCompatibilityWithSubject = (
  series: ISeries,
  subjects: ITransformedSubjects,
): ICompatibilityScores => {
  const getMainSubjectByCode = (code: string) =>
    subjects.MAIN_SUBJECTS[code] || null;
  const getSubjectByCode = (code: string) => subjects.SUBJECTS[code] || null;

  const compatibility = findCompatibilityBySeries(
    series.grandSeries,
    series.middleSeries,
    series.rowSeries,
  );

  if (!compatibility) {
    return {
      requiredSubjects: [],
      encouragedSubjects: [],
      mainSubjects: [],
      referenceSubjects: [],
    };
  }

  const requiredSubjects = compatibility.requiredSubjects
    .map((n) => getSubjectByCode(n))
    .filter((n): n is ISubject => n !== null);
  const encouragedSubjects = compatibility.encouragedSubjects
    .map((n) => getSubjectByCode(n))
    .filter((n): n is ISubject => n !== null);
  const mainSubjects = compatibility.mainSubjects
    .map((n) => getMainSubjectByCode(n))
    .filter((n): n is IMainSubject => n !== null);
  const referenceSubjects = compatibility.referenceSubjects
    .map((n) => getMainSubjectByCode(n))
    .filter((n): n is IMainSubject => n !== null);

  return {
    requiredSubjects,
    encouragedSubjects,
    mainSubjects,
    referenceSubjects,
  };
};
