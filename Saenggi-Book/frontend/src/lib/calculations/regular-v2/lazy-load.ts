import { 유불리Type, 점수표Type, 학교조건Type } from "./types";

export const lazy점수표 = (): Promise<점수표Type> =>
  import("./점수표-25-정시-1210-점수표.json").then(
    (module) => module.default as 점수표Type,
  );

export const lazy조건 = (): Promise<학교조건Type> =>
  import("./2509조건-2024-10-21.json").then(
    (module) => module.default as 학교조건Type,
  );

export const lazy유불리 = (): Promise<유불리Type> =>
  import("./2025정시유불리.json").then(
    (module) => module.default as 유불리Type,
  );
