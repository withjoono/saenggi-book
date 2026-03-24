/**
 * * 가격을 원화 포맷으로 변경
 * @param price 변환할 가격
 * @returns 원화 형식의 문자열 (예: "10,000 원")
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ko-KR").format(price) + " 원";
};

/**
 * * 교과 반영학기 포맷 (31 -> 3학년 1학기)
 * @param text 변환할 텍스트
 * @returns 포맷된 학기 문자열
 */
export const formatCurriculumReflectionSemester = (
  text: string | null,
): string => {
  if (!text) return "";
  const temp = text.trim().split("");
  if (temp.length < 2) return "";
  return `${temp[0]}학년 ${temp[1]}학기`;
};

/**
 * * 전화번호 포맷 (하이픈 제거)
 * @param phoneNumber 변환할 전화번호
 * @returns 하이픈이 제거된 전화번호
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/-/g, "");
};

/**
 * * 1.00~9.00 사이의 등급을 9.00~1.00 사이의 등급으로 반전시키는 함수
 * * 소수점 둘째 자리까지 고려하며, 반올림하여 처리합니다.
 * @param grade 원래 등급 (1.00~9.00 사이의 숫자 또는 문자열)
 * @returns 반전된 등급 (9.00~1.00 사이의 숫자, 소수점 둘째 자리까지) 또는 유효하지 않은 입력의 경우 null
 */
export function reverseGrade(grade?: number | string | null): number | null {
  if (grade === undefined || grade === null) return null;

  const numericGrade = Number(grade);

  if (isNaN(numericGrade) || numericGrade < 1 || numericGrade > 9) {
    return null;
  }

  // 소수점 둘째 자리까지 반올림
  const roundedGrade = Math.round(numericGrade * 100) / 100;

  // 등급 반전 및 소수점 둘째 자리까지 반올림
  return Number((10 - roundedGrade).toFixed(2));
}

/**
 * * 0.00~totalScore 사이의 점수를 반전시키는 함수
 * * 소수점 둘째 자리까지 고려하며, 반올림하여 처리합니다.
 */
export function reverseScore(
  score?: number | string | null,
  totalScore?: number,
): number | null {
  if (score === undefined || score === null) return null;

  const numericScore = Number(score);

  // 소수점 둘째 자리까지 반올림
  const roundedScore = Math.round(numericScore * 100) / 100;

  // 등급 반전 및 소수점 둘째 자리까지 반올림
  return Number(((totalScore || 1000) - roundedScore).toFixed(2));
}

/**
 * * 문자열에서 첫 번째로 등장하는 숫자를 추출하여 반환
 * * 예: ["39%", "40(2배수)", "hi"] -> [39, 40, 0]
 */
export const extractFirstNumber = (text: string): number => {
  const match = text.match(/^\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

/**
 * * 평가 코드와 비율 문자열을 파싱하여 배열로 반환
 * * 예: ["30/40/30///", "A/CD/DE///"] -> [["30", "40", "30"], ["A", "CD", "DE"]]
 */
export function parseEvaluationInput(input: string): string[] {
  return input.split("/").filter((n) => n.trim() !== "");
}
