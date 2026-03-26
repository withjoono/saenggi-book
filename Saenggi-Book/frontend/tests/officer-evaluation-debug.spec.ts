import { test, expect } from '@playwright/test';

test.describe('사정관 평가 시스템 디버깅', () => {
  test('로그인 시도 및 에러 확인', async ({ page }) => {
    // 콘솔 로그 수집
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log(text);
    });

    // 네트워크 요청 수집
    const networkRequests: Array<{ url: string; status: number; method: string }> = [];
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();

      networkRequests.push({ url, status, method });

      // API 요청만 로그
      if (url.includes('/api-') || url.includes('/auth/')) {
        console.log(`[Network] ${method} ${url} - ${status}`);

        // 응답 본문 로그 (JSON인 경우)
        try {
          if (response.headers()['content-type']?.includes('application/json')) {
            const body = await response.json();
            console.log(`[Response] ${JSON.stringify(body)}`);
          }
        } catch (e) {
          // JSON이 아닌 경우 무시
        }
      }
    });

    // 페이지 에러 수집
    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}`);
    });

    // 1. 로그인 페이지로 이동
    console.log('\n=== 로그인 페이지로 이동 ===');
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'tests/screenshots/debug-01-login-page.png', fullPage: true });

    // 2. 로그인 폼 입력
    console.log('\n=== 로그인 폼 입력 ===');
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('withjuno6@naver.com');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('123456');

    await page.screenshot({ path: 'tests/screenshots/debug-02-filled.png', fullPage: true });

    // 3. 로그인 버튼 클릭
    console.log('\n=== 로그인 버튼 클릭 ===');
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
    await loginButton.click();

    // 4. 로그인 처리 대기 (10초)
    console.log('\n=== 로그인 처리 대기 ===');
    await page.waitForTimeout(10000);

    // 5. 현재 상태 확인
    console.log('\n=== 현재 상태 확인 ===');
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);

    await page.screenshot({ path: 'tests/screenshots/debug-03-after-login.png', fullPage: true });

    // 6. 토스트 메시지 확인
    const toastMessages = await page.locator('[data-sonner-toast]').allTextContents();
    if (toastMessages.length > 0) {
      console.log('토스트 메시지:', toastMessages);
    }

    // 7. 에러 메시지 확인
    const errorElements = await page.locator('.text-red-500, [role="alert"]').allTextContents();
    if (errorElements.length > 0) {
      console.log('에러 메시지:', errorElements);
    }

    // 8. 로그 요약
    console.log('\n=== 수집된 로그 요약 ===');
    console.log(`콘솔 메시지 수: ${consoleMessages.length}`);
    console.log(`네트워크 요청 수: ${networkRequests.length}`);

    // API 요청만 필터링
    const apiRequests = networkRequests.filter(r => r.url.includes('/api-') || r.url.includes('firebase'));
    console.log('\nAPI 요청:');
    apiRequests.forEach(r => {
      console.log(`  ${r.method} ${r.url} - ${r.status}`);
    });

    // Firebase 관련 에러 확인
    const firebaseErrors = consoleMessages.filter(m => m.includes('firebase') || m.includes('auth'));
    if (firebaseErrors.length > 0) {
      console.log('\nFirebase 관련 로그:');
      firebaseErrors.forEach(m => console.log(`  ${m}`));
    }

    // 9. 평가 페이지 접근 시도
    console.log('\n=== 평가 페이지 접근 시도 ===');
    await page.goto('/evaluation', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const evaluationUrl = page.url();
    console.log('평가 페이지 URL:', evaluationUrl);

    await page.screenshot({ path: 'tests/screenshots/debug-04-evaluation-page.png', fullPage: true });

    // 페이지 내용 확인
    const bodyText = await page.textContent('body');
    console.log('페이지에 "404" 포함:', bodyText?.includes('404'));
    console.log('페이지에 "사정관" 포함:', bodyText?.includes('사정관'));
    console.log('페이지에 "로그인" 버튼:', await page.locator('button', { hasText: '로그인' }).count() > 0);
  });

  test('직접 브라우저에서 확인 가능한 테스트', async ({ page }) => {
    console.log('\n=== 브라우저를 열고 수동으로 확인할 수 있도록 30초 대기 ===');

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('withjuno6@naver.com');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
    await loginButton.click();

    // 30초 대기 - 브라우저에서 수동으로 확인 가능
    console.log('30초 대기 중... 브라우저에서 결과를 확인하세요');
    await page.waitForTimeout(30000);

    const finalUrl = page.url();
    console.log('최종 URL:', finalUrl);
  });
});
