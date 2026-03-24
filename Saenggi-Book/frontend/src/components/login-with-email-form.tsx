import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/utils/firebase/firebase";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./custom/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setTokens } from "@/lib/api/token-manager";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { env } from "@/lib/config/env";

interface Props {
  className?: string;
}

const loginFormSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

export function LoginWithEmailForm({ className }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = useGetCurrentUser();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 1. Firebase 이메일/비밀번호 로그인
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // 2. Firebase ID 토큰 가져오기
      const idToken = await userCredential.user.getIdToken();

      // 3. 백엔드 로그인
      const response = await fetch(`${env.apiUrlHub}/auth/firebase/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      const loginData = await response.json();

      // 404: 신규 사용자 (회원가입 필요) - 이메일은 Firebase에 있지만 백엔드에 없음
      if (response.status === 404) {
        toast.error("회원가입이 필요합니다. Hub 회원가입 페이지로 이동합니다.", {
          duration: 5000,
        });
        window.location.href = `${env.hubUrl}/auth/register`;
        return;
      }

      if (!response.ok) {
        throw new Error(loginData.error || '로그인 실패');
      }

      if (loginData.success) {
        // 토큰 저장
        const { accessToken, refreshToken } = loginData.data;
        setTokens(accessToken, refreshToken);

        toast.success("환영합니다. T Skool입니다. 😄");
        await user.refetch();

        // Hub 메인으로 이동
        window.location.href = env.hubUrl;
      } else {
        toast.error(loginData.error || "로그인에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("로그인 에러:", error);

      // Firebase 에러 처리
      if (error.code && error.code.startsWith('auth/')) {
        if (error.code === "auth/user-not-found") {
          form.setError("email", {
            type: "manual",
            message: "존재하지 않는 이메일입니다.",
          });
        } else if (error.code === "auth/wrong-password") {
          form.setError("password", {
            type: "manual",
            message: "비밀번호가 일치하지 않습니다.",
          });
        } else if (error.code === "auth/invalid-email") {
          form.setError("email", {
            type: "manual",
            message: "유효하지 않은 이메일 형식입니다.",
          });
        } else if (error.code === "auth/too-many-requests") {
          toast.error("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.", {
            duration: 5000,
          });
        } else if (error.code === "auth/invalid-credential") {
          form.setError("password", {
            type: "manual",
            message: "이메일 또는 비밀번호가 일치하지 않습니다.",
          });
        } else {
          toast.error("로그인 중 오류가 발생했습니다.");
        }
      }
      // 백엔드 에러 처리
      else {
        const errorMessage = error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
        toast.error(errorMessage, { duration: 5000 });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <div className={cn("space-y-4", className)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    placeholder="이메일 주소"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="비밀번호"
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            로그인
          </Button>
        </form>
      </div>
    </Form>
  );
}
