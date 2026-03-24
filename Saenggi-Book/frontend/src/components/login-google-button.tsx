import { Button } from "./custom/button";
import googleIcon from "@/assets/icon/login-google.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useSocialSignUp } from "@/stores/client/use-social-sign-up";
import { useLoginWithSocial } from "@/stores/server/features/auth/mutations";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { socialLoginFetch } from "@/stores/server/features/auth/apis";
import { auth, provider } from "@/lib/utils/firebase/firebase";
import { USER_API } from "@/stores/server/features/me/apis";
import { setTokens } from "@/lib/api/token-manager";
import { env } from "@/lib/config/env";

interface Props {
  isPending?: boolean;
  buttonText?: string;
}

export const GoogleLoginButton = ({ isPending, buttonText = "구글 로그인" }: Props) => {
  const setData = useSocialSignUp((state) => state.setData);
  const loginWithSocial = useLoginWithSocial();
  const navigate = useNavigate();
  const user = useGetCurrentUser();

  const handleGoogleLoginClick = async () => {
    try {
      // 1. Firebase Google 로그인
      const result = await signInWithPopup(auth, provider);

      // 2. Firebase ID 토큰 가져오기
      const idToken = await result.user.getIdToken();

      // 3. Firebase 토큰으로 백엔드 로그인
      const response = await fetch(`${env.apiUrlHub}/auth/firebase/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      const loginData = await response.json();

      // 404 에러: 신규 사용자 -> Hub 회원가입 페이지로 이동
      if (response.status === 404) {
        // Firebase 토큰과 사용자 정보를 저장해서 회원가입 시 사용
        setData({
          socialType: "google",
          token: idToken,
          email: result.user.email || '',
          name: result.user.displayName || '',
          profileImage: result.user.photoURL || '',
        });
        toast.warning("🎓 회원가입이 필요합니다.\n추가 정보를 입력해주세요.", {
          duration: 6000,
        });
        window.location.href = `${env.hubUrl}/auth/register`;
        return;
      }

      if (!response.ok) {
        throw new Error(loginData.message || '로그인 실패');
      }

      if (loginData.success) {
        // 토큰을 localStorage에 저장 (쿠키는 포트 간 공유 안 됨)
        setTokens(loginData.data.accessToken, loginData.data.refreshToken);

        toast.success("환영합니다. T Skool입니다. 😄");
        await user.refetch();

        // Hub 메인으로 이동
        window.location.href = env.hubUrl;
      } else {
        toast.error(loginData.message || "로그인에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Google 로그인 에러:", err);

      // 사용자 친화적 에러 메시지
      let errorMessage = "구글 로그인 중 오류가 발생했습니다.";

      if (err.code === "auth/popup-closed-by-user") {
        // 사용자가 팝업을 닫은 경우 - 에러 토스트 표시하지 않음
        return;
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "팝업이 차단되었습니다. 팝업 차단을 해제해주세요.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "네트워크 연결을 확인해주세요.";
      } else if (err.code === "auth/cancelled-popup-request") {
        // 이전 팝업 요청 취소 - 에러 토스트 표시하지 않음
        return;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <Button
      type="button"
      className="h-auto w-full space-x-2 py-2.5 hover:opacity-90"
      variant={"outline"}
      onClick={handleGoogleLoginClick}
      loading={isPending}
    >
      <img src={googleIcon} className="size-4" />
      <span>{buttonText}</span>
    </Button>
  );
};
