import { useAuthStore } from "@/stores/client/use-auth-store";
import {
  ILoginWithEmailBody,
  IRegisterWithEmailBody,
  ILoginResponse,
  ISendSignupCodeBody,
  ILoginWithSocialBody,
  IRegisterWithSocialBody,
  IVerifyCodeBody,
} from "./interfaces";
import { BaseResponse } from "../../common-interface";
import { createMutation } from "../../common-utils";
import { useMutation } from "@tanstack/react-query";
import { hubApiClient } from "../../hub-api-client";

// 로그인/회원가입 후 인증토큰 처리
const authSuccessHandler = (data: BaseResponse<ILoginResponse>) => {
  const { setTokens, clearTokens } = useAuthStore.getState();
  if (data.success) {
    const { accessToken, refreshToken, tokenExpiry } = data.data;
    setTokens(accessToken, refreshToken, tokenExpiry);
    
    // localStorage에도 저장 (makeApiCall에서 사용)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    console.log('✅ 로그인 성공! 토큰 저장됨:', {
      accessToken: accessToken.substring(0, 20) + '...',
      refreshToken: refreshToken.substring(0, 20) + '...',
      tokenExpiry
    });
  } else {
    clearTokens();
    // localStorage에서도 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// 이메일로 로그인 (Hub 인증 서버 사용)
export const useLoginWithEmail = () => {
  return useMutation({
    mutationFn: async (body: ILoginWithEmailBody) => {
      const res = await hubApiClient.post<BaseResponse<ILoginResponse>>("/auth/login/email", body);
      return res.data;
    },
    onSuccess: authSuccessHandler,
    onError: (e) => {
      console.error("로그인 에러", e);
    },
  });
};

// 소셜로 로그인 (Hub 인증 서버 사용)
export const useLoginWithSocial = () => {
  return useMutation({
    mutationFn: async (body: ILoginWithSocialBody) => {
      const res = await hubApiClient.post<BaseResponse<ILoginResponse>>("/auth/login/social", body);
      return res.data;
    },
    onSuccess: authSuccessHandler,
    onError: (e) => {
      console.error("소셜 로그인 에러", e);
    },
  });
};

// 이메일로 회원가입 (Hub 인증 서버 사용)
export const useRegisterWithEmail = () => {
  return useMutation({
    mutationFn: async (body: IRegisterWithEmailBody) => {
      const res = await hubApiClient.post<BaseResponse<ILoginResponse>>("/auth/register/email", body);
      return res.data;
    },
    onSuccess: authSuccessHandler,
    onError: (e) => {
      console.error("회원가입 에러", e);
    },
  });
};

// 소셜로 회원가입 (Hub 인증 서버 사용)
export const useRegisterWithSocial = () => {
  return useMutation({
    mutationFn: async (body: IRegisterWithSocialBody) => {
      const res = await hubApiClient.post<BaseResponse<ILoginResponse>>("/auth/register/social", body);
      return res.data;
    },
    onSuccess: authSuccessHandler,
    onError: (e) => {
      console.error("소셜 회원가입 에러", e);
    },
  });
};

// 회원가입 휴대폰 인증코드 발송 (Hub 인증 서버 사용)
export const useSendRegisterCode = () => {
  return useMutation({
    mutationFn: async (body: ISendSignupCodeBody) => {
      const res = await hubApiClient.post<BaseResponse<null>>("/auth/register/send-code", body);
      return res.data;
    },
    onError: (e) => {
      console.error("인증코드 발송 에러", e);
    },
  });
};

// 휴대폰 인증코드 확인 (Hub 인증 서버 사용)
export const useVerifyCode = () => {
  return useMutation({
    mutationFn: async (body: IVerifyCodeBody) => {
      const res = await hubApiClient.post<BaseResponse<null>>("/auth/verify-code", body);
      return res.data;
    },
    onError: (e) => {
      console.error("인증코드 확인 에러", e);
    },
  });
};

// 비밀번호 재설정 요청 (Hub 인증 서버 사용)
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (body: { email: string; phone: string }) => {
      const res = await hubApiClient.post<BaseResponse<null>>("/auth/password-reset-request", body);
      return res.data;
    },
    onError: (e) => {
      console.error("비밀번호 재설정 요청 에러", e);
    },
  });
};

// 인증번호 확인 및 재설정 토큰 발급 (Hub 인증 서버 사용)
export const useVerifyResetCode = () => {
  return useMutation({
    mutationFn: async (body: { phone: string; code: string }) => {
      const res = await hubApiClient.post<BaseResponse<{ token: string }>>("/auth/verify-reset-code", body);
      return res.data;
    },
    onError: (e) => {
      console.error("인증번호 확인 에러", e);
    },
  });
};

// 새 비밀번호 설정 (Hub 인증 서버 사용)
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (body: { token: string; newPassword: string }) => {
      const res = await hubApiClient.post<BaseResponse<null>>("/auth/password-reset", body);
      return res.data;
    },
    onError: (e) => {
      console.error("비밀번호 재설정 에러", e);
    },
  });
};
