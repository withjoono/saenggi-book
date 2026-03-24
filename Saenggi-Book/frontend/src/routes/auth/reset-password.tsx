import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useRequestPasswordReset,
  useResetPassword,
  useVerifyResetCode,
} from "@/stores/server/features/auth/mutations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const requestPasswordReset = useRequestPasswordReset();
  const verifyResetCode = useVerifyResetCode();
  const resetPassword = useResetPassword();

  const handleEmailPhoneSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const result = await requestPasswordReset.mutateAsync({ email, phone });
    if (result.success) {
      toast.success("인증번호가 발송되었습니다.");
      setStep(2);
    } else {
      toast.error(result.error);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const result = await verifyResetCode.mutateAsync({ phone, code });
    if (result.success) {
      setResetToken(result.data.token);
      toast.success("인증번호가 확인되었습니다.");
      setStep(3);
    } else {
      toast.error(result.error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    const result = await resetPassword.mutateAsync({
      token: resetToken,
      newPassword: password,
    });
    if (result.success) {
      toast.success("비밀번호가 성공적으로 재설정되었습니다.");
      setStep(1);
      setEmail("");
      setPhone("");
      setCode("");
      navigate({ to: "/auth/login" });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "40px auto" }}>
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}
      >
        비밀번호 재설정
      </h2>
      {step === 1 && (
        <form
          onSubmit={handleEmailPhoneSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div>
            <Label htmlFor="phone">휴대폰 번호</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <Button
            type="submit"
            style={{
              padding: "10px",
              color: "white",
              border: "none",
            }}
          >
            인증번호 받기
          </Button>
        </form>
      )}
      {step === 2 && (
        <form
          onSubmit={handleVerificationSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <Label htmlFor="code">인증번호</Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <Button
            type="submit"
            style={{
              padding: "10px",
              color: "white",
              border: "none",
            }}
          >
            확인
          </Button>
        </form>
      )}
      {step === 3 && (
        <form
          onSubmit={handlePasswordSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <Label htmlFor="password">새 비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <Button
            type="submit"
            style={{
              padding: "10px",
              color: "white",
              border: "none",
            }}
          >
            비밀번호 재설정
          </Button>
        </form>
      )}
    </div>
  );
}
