import React, { useState } from "react";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { useLoginWithEmail } from "@/stores/server/features/auth/mutations";

/**
 * 로그인 디버깅 컴포넌트
 * 로그인 API 호출과 토큰 저장 과정을 상세히 확인
 */
export const LoginDebug: React.FC = () => {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("test123");
  const [logs, setLogs] = useState<string[]>([]);

  const loginWithEmail = useLoginWithEmail();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const handleLogin = async () => {
    setLogs([]);
    addLog("🚀 로그인 시도 시작");
    addLog(`📧 이메일: ${email}`);
    addLog(`🔑 비밀번호: ${password}`);

    try {
      addLog("📡 API 호출 중...");
      const result = await loginWithEmail.mutateAsync({
        email,
        password,
      });

      addLog("✅ API 응답 수신");
      addLog(`📊 응답 데이터: ${JSON.stringify(result, null, 2)}`);

      if (result.success) {
        addLog("✅ 로그인 성공!");
        addLog(`🔑 AccessToken: ${result.data.accessToken.substring(0, 30)}...`);
        addLog(`🔄 RefreshToken: ${result.data.refreshToken.substring(0, 30)}...`);
        addLog(`⏰ TokenExpiry: ${result.data.tokenExpiry}`);

        // localStorage 확인
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        addLog("📦 localStorage 확인:");
        addLog(`  - accessToken: ${storedAccessToken ? storedAccessToken.substring(0, 30) + '...' : '❌ 없음'}`);
        addLog(`  - refreshToken: ${storedRefreshToken ? storedRefreshToken.substring(0, 30) + '...' : '❌ 없음'}`);

        // 모든 localStorage 키 확인
        addLog("📦 전체 localStorage 키:");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            addLog(`  - ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
          }
        }
      } else {
        addLog(`❌ 로그인 실패: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`❌ 에러 발생: ${error.message}`);
      addLog(`📋 에러 상세: ${JSON.stringify(error, null, 2)}`);
    }
  };

  const checkTokens = () => {
    addLog("🔍 현재 토큰 상태 확인:");
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    addLog(`  - accessToken: ${accessToken ? '✅ 존재 (' + accessToken.substring(0, 30) + '...)' : '❌ 없음'}`);
    addLog(`  - refreshToken: ${refreshToken ? '✅ 존재 (' + refreshToken.substring(0, 30) + '...)' : '❌ 없음'}`);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    addLog("🗑️ 토큰 삭제 완료");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">🔍 로그인 디버깅 도구</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleLogin}
            disabled={loginWithEmail.isPending}
          >
            {loginWithEmail.isPending ? "로그인 중..." : "🚀 로그인 테스트"}
          </Button>
          <Button onClick={checkTokens} variant="outline">
            🔍 토큰 확인
          </Button>
          <Button onClick={clearTokens} variant="outline">
            🗑️ 토큰 삭제
          </Button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-300 rounded">
        <h3 className="font-semibold text-gray-800 mb-2">📋 실행 로그:</h3>
        <div className="space-y-1 text-sm font-mono text-gray-700 max-h-96 overflow-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">로그인 버튼을 눌러 테스트를 시작하세요.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-all">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">✅ 체크리스트:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>□ 로그인 API가 accessToken 반환하는지</li>
          <li>□ 로그인 성공 후 localStorage.setItem('accessToken', ...) 실행되는지</li>
          <li>□ makeApiCall 함수에서 Authorization: Bearer 헤더 추가하는지</li>
          <li>□ 토큰 키 이름이 일치하는지 (accessToken vs access_token vs token)</li>
        </ul>
      </div>
    </div>
  );
};








