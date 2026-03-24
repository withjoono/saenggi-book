// 로그인, 회원가입 응답
export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
}

// 이메일 로그인 Body
export interface ILoginWithEmailBody {
  email: string;
  password: string;
}

// 이메일 회원가입 Body
export interface IRegisterWithEmailBody {
  email: string;
  password: string;
  nickname: string;
  phone: string;
  ckSmsAgree: boolean;
  isMajor: string;
  hstTypeId?: number;
  graduateYear: string;
  memberType: "student" | "teacher" | "parent";
}

// 소셜 로그인 Body
export interface ILoginWithSocialBody {
  socialType: "naver" | "google";
  accessToken: string;
}

// 소셜 회원가입 Body
export interface IRegisterWithSocialBody {
  socialType: "naver" | "google";
  accessToken: string;
  nickname: string;
  phone: string;
  ckSmsAgree: boolean;
  isMajor: string;
  hstTypeId?: number;
  graduateYear: string;
  memberType: "student" | "teacher" | "parent";
}

// 휴대폰 인증번호 요청
export interface ISendSignupCodeBody {
  email?: string; // 있으면 이메일 중복검사를 수행 (소셜 가입은 로그인 시 이메일 중복체크가 진행됨)
  phone: string;
}

// 인증번호 확인
export interface IVerifyCodeBody {
  code: string;
  phone: string;
}
