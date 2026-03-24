/**
 * 날짜 입력을 파싱하여 Date 객체로 변환
 * @param input 날짜 문자열 또는 Date 객체
 * @returns 변환된 Date 객체
 * @throws 유효하지 않은 날짜일 경우 에러
 */
const parseDateInput = (input: string | Date): Date => {
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
};

/**
 * Date 객체를 지정된 형식의 문자열로 변환
 * @param date 변환할 Date 객체
 * @param includeTime 시간 포함 여부
 * @returns 포맷된 날짜 문자열
 */
const formatDateComponent = (
  date: Date,
  includeTime: boolean = false,
): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  if (includeTime) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return `${year}-${month}-${day}`;
};

/**
 * * 날짜를 YYYY-MM-DD 형식으로 포맷
 * @param input 변환할 날짜 (문자열 또는 Date 객체)
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDateYYYYMMDD = (input: string | Date): string => {
  try {
    const date = parseDateInput(input);
    return formatDateComponent(date);
  } catch (error) {
    return "0000-00-00";
  }
};

/**
 * * 날짜를 YYYY-MM-DD HH:MM:SS 형식으로 포맷
 * @param input 변환할 날짜 (문자열 또는 Date 객체)
 * @returns YYYY-MM-DD HH:MM:SS 형식의 문자열
 */
export const formatDateYYYYMMDDHHMMSS = (input: string | Date): string => {
  try {
    const date = parseDateInput(input);
    return formatDateComponent(date, true);
  } catch (error) {
    return "0000-00-00 00:00:00";
  }
};
