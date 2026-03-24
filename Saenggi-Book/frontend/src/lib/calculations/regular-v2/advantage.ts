import { lazy유불리 } from "./lazy-load";
import { 유불리Type } from "./types";

let 유불리: 유불리Type;

const ensureDataLoaded = async () => {
  if (!유불리) 유불리 = await lazy유불리();
};

export const calc정시유불리 = async (params: {
  표점합: number;
  학교: string;
}): Promise<{
  success: boolean;
  result?: string;
  점수?: number;
  누백?: number;
}> => {
  await ensureDataLoaded();
  const { 표점합, 학교 } = params;

  try {
    const sheet = 유불리["Sheet1"];
    for (let i = sheet.length - 1; 0 <= i; --i) {
      if (표점합 >= sheet[i]["점수환산"]) {
        const score = sheet[i][`${학교}`];
        if (score) {
          return { success: true, 점수: score };
        }
        break;
      }
    }

    return { success: false, result: "시스템 오류" };
  } catch (e) {
    console.log(e);
    return { success: false, result: "시스템 오류" };
  }
};
