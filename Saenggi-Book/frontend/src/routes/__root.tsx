import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MsHeader } from "@/components/ms-header";
import { GradeAnalysisHeader } from "@/components/grade-analysis-header";
import ScrollToTop from "@/components/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { processSSOLogin } from "@/lib/utils/sso-helper";
import { toast } from "sonner";

function RootLayout() {
  const location = useLocation();
  const [isSSOLoading, setIsSSOLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('sso_code');
  });

  // SSO 코드 처리 (Hub에서 넘어온 경우)
  useEffect(() => {
    const handleSSO = async () => {
      const ssoSuccess = await processSSOLogin();
      if (ssoSuccess) {
        toast.success('Hub에서 자동 로그인되었습니다.');
        setTimeout(() => {
          window.location.href = '/ms/dashboard';
        }, 500);
      }
      setIsSSOLoading(false);
    };

    handleSSO();
  }, []);

  const isTestPage = location.pathname === "/test/auth-me" || location.pathname === "/test/login-debug";
  const isAuthPage = location.pathname.startsWith("/auth/");
  const isMsMode = location.pathname.startsWith("/ms");
  const isGradeAnalysisMode = location.pathname.startsWith("/grade-analysis");

  const renderHeader = () => {
    if (isTestPage || isAuthPage) return null;
    if (isMsMode) return <MsHeader />;
    if (isGradeAnalysisMode) return <GradeAnalysisHeader />;
    return <Header />;
  };

  return (
    <>
      {isSSOLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            animation: 'spin 1.2s linear infinite',
          }}>⏳</div>
          <p style={{
            fontSize: '1.1rem',
            color: '#374151',
            fontWeight: 500,
          }}>자동 로그인 중입니다...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {renderHeader()}
      <div className="h-full min-h-screen py-4">
        <Outlet />
      </div>
      {!isTestPage && (
        <>
          <Toaster richColors position={"top-right"} duration={1200} />
          <Footer />
          <ScrollToTop />
        </>
      )}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
