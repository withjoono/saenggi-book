/**
 * 엑셀 날짜 형식인지 확인하는 함수
 * 엑셀 날짜는 일반적으로 40000에서 60000 사이의 값입니다.
 */
export const isExcelDate = (value: any): boolean => {
  return !isNaN(value) && value > 40000 && value < 60000;
};

/**
 * 엑셀 시간 형식인지 확인하는 함수
 * 엑셀 시간은 일반적으로 0과 1 사이의 소수점 값입니다.
 */
export const isExcelTime = (value: any): boolean => {
  return !isNaN(value) && value >= 0 && value < 1;
};

/**
 * 엑셀 날짜를 JavaScript 날짜로 변환하는 함수
 */
export const convertExcelDate = (value: number): string => {
  const date = new Date((value - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0]; // yyyy-mm-dd 형식으로 변환
};

/**
 * 엑셀 시간을 HH:MM 형식으로 변환하는 함수
 * 시간은 0과 1 사이의 소수점 값으로 처리됩니다.
 */
export const convertExcelTime = (value: number): string => {
  const totalSeconds = Math.round(value * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; // HH:MM 형식으로 변환
};

/**
 * 소숫점을 자르는 함수
 */
export const parseFloatWithPrecision = (value: any, precision: number = 3): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const floatValue = parseFloat(value);
  return isNaN(floatValue) ? null : Number(floatValue.toFixed(precision));
};
