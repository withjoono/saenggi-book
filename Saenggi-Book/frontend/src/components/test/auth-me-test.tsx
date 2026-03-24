import React, { useState } from "react";
import { makeApiCall } from "@/stores/server/common-utils";
import { Button } from "@/components/custom/button";

/**
 * Auth Me API 테스트 컴포넌트
 * 무한 루프 문제가 해결되었으므로 실제 API 호출 테스트 가능
 */
export const AuthMeTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleTestRequest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Testing GET /api-nest/auth/me...');
      console.log('📡 Request URL:', `${window.location.origin}/api-nest/auth/me`);
      console.log('🔗 Proxy Target: http://localhost:4001/auth/me');
      console.log('🔑 Token in localStorage:', localStorage.getItem('accessToken') ? '있음' : '없음');

      // makeApiCall을 사용하여 일관된 토큰 처리
      const response = await makeApiCall<void, any>('GET', '/auth/me', undefined, undefined, 'nest');

      console.log('✅ API Response:', response);

      if (response.success) {
        console.log('📊 Response Data:', response.data);
        setResult(response.data);
      } else {
        // 백엔드에서 반환한 상세한 에러 정보 포함
        const errorInfo = {
          message: response.error || 'API 호출 실패',
          backendMessage: response.message,
          detailCode: response.detailCode,
          status: response.status
        };
        throw new Error(JSON.stringify(errorInfo));
      }
    } catch (err: any) {
      console.error('❌ API Error:', err);

      // 백엔드 에러 정보 파싱 시도
      let backendError;
      try {
        backendError = JSON.parse(err.message);
      } catch {
        backendError = null;
      }

      console.error('📋 Error details:', {
        message: err.message,
        name: err.name,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        isAxiosError: err.isAxiosError,
        backendError
      });

      // 에러 객체를 더 자세히 저장
      setError({
        ...err,
        _details: {
          message: err.message,
          name: err.name,
          code: err.code,
          status: err.response?.status || backendError?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          isAxiosError: err.isAxiosError,
          backendError
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-600">🚀 Auth Me API Test</h1>
      <p className="text-gray-600 mb-4">
        GET /api-nest/auth/me 요청을 Bearer 토큰과 함께 테스트합니다.
      </p>

      <div className="space-y-4">
        <Button onClick={handleTestRequest} disabled={loading}>
          {loading ? "🔄 테스트 중..." : "🎯 API 테스트 실행"}
        </Button>

        {loading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-700">⏳ API 요청을 보내는 중입니다...</p>
            <p className="text-sm text-blue-600 mt-1">
              브라우저 콘솔(F12)에서 자세한 로그를 확인하세요.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800">❌ API 호출 결과:</h3>
            <div className="mt-2 space-y-2">
              {(error._details?.status === 401 || error._details?.backendError?.status === false) ? (
                <div className="p-3 bg-orange-100 border border-orange-300 rounded">
                  <p className="text-orange-800 font-semibold">🔐 인증 실패 (401 Unauthorized)</p>
                  <p className="text-orange-700 text-sm mt-1">
                    액세스 토큰이 없거나 만료되었습니다.
                  </p>
                  {error._details?.backendError && (
                    <div className="mt-2 p-2 bg-orange-200 rounded">
                      <p className="text-orange-900 text-sm">
                        <strong>백엔드 메시지:</strong> {error._details.backendError.backendMessage}
                      </p>
                      <p className="text-orange-900 text-sm">
                        <strong>상세 코드:</strong> {error._details.backendError.detailCode}
                      </p>
                    </div>
                  )}
                  <p className="text-orange-700 text-sm">
                    백엔드에서 정상적으로 인증을 거부했습니다.
                  </p>
                </div>
              ) : error._details?.status ? (
                <>
                  <p className="text-red-700 text-sm">
                    상태 코드: {error._details.status} - {error._details.statusText}
                  </p>
                  <p className="text-red-700 text-sm">
                    메시지: {error._details.message}
                  </p>
                </>
              ) : (
                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-yellow-800 font-semibold">🌐 네트워크/연결 오류</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    상태 코드: {error._details?.status || 'N/A'}
                  </p>
                  <p className="text-yellow-700 text-sm">
                    메시지: {error._details?.message || error.message}
                  </p>
                  <p className="text-yellow-700 text-sm">
                    원인: CORS, 네트워크, 또는 백엔드 서버 문제일 수 있습니다.
                  </p>
                </div>
              )}

              {/* 디버깅 정보 */}
              <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded">
                <details>
                  <summary className="cursor-pointer font-semibold text-gray-700 text-sm">
                    🔍 디버깅 정보 (클릭해서 펼치기)
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p><strong>Error Name:</strong> {error._details?.name}</p>
                    <p><strong>Error Code:</strong> {error._details?.code}</p>
                    <p><strong>Is Axios Error:</strong> {error._details?.isAxiosError ? 'Yes' : 'No'}</p>
                    <p><strong>Token Exists:</strong> {localStorage.getItem('accessToken') ? 'Yes' : 'No'}</p>
                    {error._details?.backendError && (
                      <div>
                        <p><strong>Backend Error:</strong></p>
                        <pre className="text-xs bg-gray-200 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(error._details.backendError, null, 2)}
                        </pre>
                      </div>
                    )}
                    {error._details?.data && (
                      <div>
                        <p><strong>Response Data:</strong></p>
                        <pre className="text-xs bg-gray-200 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(error._details.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">✅ 성공!</h3>
            <p className="text-green-700 text-sm mb-2">사용자 정보가 성공적으로 조회되었습니다.</p>
            <pre className="text-green-700 text-sm bg-green-100 p-3 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">🔧 디버깅 정보:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>요청 URL:</strong> {window.location.origin}/api-nest/auth/me</p>
          <p><strong>프록시 대상:</strong> http://localhost:4001/auth/me</p>
          <p><strong>헤더:</strong> Authorization: Bearer {"{access-token}"}</p>
          <p><strong>브라우저 콘솔:</strong> F12 → Console 탭에서 상세 로그 확인</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 문제 해결됨:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>✅ Header 컴포넌트에서 로그인 페이지 API 호출 비활성화</li>
          <li>✅ API 클라이언트에서 로그인 페이지 401 리다이렉트 방지</li>
          <li>✅ 무한 루프 완전 해결</li>
        </ul>
      </div>
    </div>
  );
};
