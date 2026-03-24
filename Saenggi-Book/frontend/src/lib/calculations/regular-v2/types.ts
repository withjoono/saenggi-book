export interface 점수표Type {
  [과목: string]: {
    [표준점수: string]: {
      백분위: number;
      등급: number;
      "누적(%)": number;
      [학교: string]: number | string;
    };
  };
}

export interface 학교조건Type {
  [key: string]: {
    필수과목: {
      미적기하: boolean;
      확통: boolean;
      과탐: boolean;
      사탐: boolean;
    };
    환산식코드: number;
    탐구과목수: number;
    기본점수: number;
  };
}

export interface 과목점수Type {
  과목: string;
  표준점수?: number;
  등급?: number;
  백분위?: number;
}

export interface 정시점수계산Params {
  학교: string;
  이문과: string;
  국어: 과목점수Type;
  수학: 과목점수Type;
  영어: 과목점수Type;
  한국사: 과목점수Type;
  과탐1?: 과목점수Type;
  과탐2?: 과목점수Type;
  사탐1?: 과목점수Type;
  사탐2?: 과목점수Type;
  제2외국어?: 과목점수Type;
}

export interface 정시점수계산결과 {
  success: boolean;
  result?: string;
  내점수?: number;
  퍼센트순위?: number;
  표점합?: number;
}

export interface 환산점수계산Params {
  학교: string;
  국어환산점수: number;
  수학환산점수: number;
  영어환산점수: number;
  한국사환산점수: number;
  과탐1환산점수: number | null;
  과탐2환산점수: number | null;
  사탐1환산점수: number | null;
  사탐2환산점수: number | null;
  제2외국어환산점수: number | null;
  국어: 과목점수Type;
  수학: 과목점수Type;
  영어: 과목점수Type;
  한국사: 과목점수Type;
  과탐1?: 과목점수Type;
  과탐2?: 과목점수Type;
  사탐1?: 과목점수Type;
  사탐2?: 과목점수Type;
  제2외국어?: 과목점수Type;
}

export interface 유불리Type {
  [시트: string]: {
    점수환산: number;
    [학교: string]: number;
  }[];
}
