import { hubApiClient } from "../../hub-api-client";
import { ILoginResponse } from "./interfaces";

interface ISocialLoginReturn {
  accessToken: {
    accessToken: string;
    refreshToken: string;
  };
  message: string | null;
  tokenType: "Bearer";
  status: boolean;
}
/**
 * 소셜 로그인
 * Hub 인증 서버를 통해 소셜 로그인을 수행합니다.
 */
export const socialLoginFetch = async ({
  socialType,
  accessToken,
}: {
  socialType: 'naver' | 'google';
  accessToken: string;
}): Promise<ISocialLoginReturn> => {
  const res = await hubApiClient.post("/auth/login/social", {
    socialType,
    accessToken,
  });

  return res.data;
};

/**
 * 이메일 로그인
 * Hub 인증 서버를 통해 이메일/비밀번호로 로그인합니다.
 */
export const emailLoginFetch = async ({
  email,
  password,
}: {
  email: string | null;
  password: string | null;
}): Promise<ILoginResponse> => {
  const res = await hubApiClient.post("/auth/login/email", {
    email,
    password,
  });

  return res.data;
};

interface ITokenRefetchReturn {
  accessToken: {
    accessToken: string;
    refreshToken: null;
  };
  message: null;
  status: boolean;
  tokenType: null;
}

/**
 * 토큰 갱신
 * Hub 인증 서버를 통해 만료된 Access Token을 갱신합니다.
 */
export const tokenReissueFetch = async (
  refreshToken: string,
): Promise<ITokenRefetchReturn> => {
  const res = await hubApiClient.post("/auth/refresh", {
    refreshToken,
  });

  return res.data;
};

/**
 * 로그아웃
 * Hub 인증 서버를 통해 로그아웃합니다.
 */
export const logoutFetch = async (refreshToken?: string): Promise<void> => {
  await hubApiClient.post("/auth/logout", {
    refreshToken,
  });
};

/**
 * 내 정보 조회
 * Hub 인증 서버를 통해 현재 로그인한 사용자 정보를 조회합니다.
 */
export const getMeFetch = async (): Promise<any> => {
  const res = await hubApiClient.get("/auth/me");
  return res.data;
};
