import { test, expect } from '@playwright/test';

test.describe('사정관 평가 시스템', () => {
  test('로그인 및 사정관 평가 신청 플로우', async ({ page }) => {
    // 1. 로그인 페이지로 이동 및 스크린샷
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/01-login-page.png', fullPage: true });

    // 2. 로그인 폼 필드 찾기 및 입력
    await test.step('로그인', async () => {
      // 이메일 입력 - name 속성으로 찾기
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toBeVisible();
      await emailInput.fill('withjuno6@naver.com');

      // 비밀번호 입력 - name 속성으로 찾기
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill('123456');

      await page.screenshot({ path: 'tests/screenshots/02-login-filled.png', fullPage: true });

      // 로그인 버튼 클릭 - submit 타입 버튼 찾기
      const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
      await expect(loginButton).toBeVisible();
      await loginButton.click();

      console.log('로그인 버튼 클릭 완료');

      // 로그인 처리 대기 (최대 15초)
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/03-after-login-click.png', fullPage: true });

      // URL 변경 확인 (로그인 성공 시 리다이렉트)
      const currentUrl = page.url();
      console.log('현재 URL:', currentUrl);

      // 로그인 성공 확인 - 로그인 페이지를 벗어났는지 확인
      if (currentUrl.includes('/auth/login')) {
        console.log('경고: 로그인 페이지에서 벗어나지 못했습니다');

        // 에러 메시지 확인
        const errorMessages = await page.locator('[role="alert"], .text-red-500, .error-message').allTextContents();
        if (errorMessages.length > 0) {
          console.log('에러 메시지:', errorMessages);
        }

        // 페이지 내용 확인
        const pageContent = await page.textContent('body');
        console.log('페이지 내용 일부:', pageContent?.substring(0, 500));
      } else {
        console.log('로그인 성공: 페이지 이동됨');
      }
    });

    // 3. 사정관 평가 페이지로 이동
    await test.step('사정관 평가 페이지 이동', async () => {
      await page.goto('/evaluation');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/04-evaluation-page.png', fullPage: true });

      const currentUrl = page.url();
      console.log('평가 페이지 URL:', currentUrl);
    });

    // 4. 페이지 내용 확인
    await test.step('사정관 목록 페이지 확인', async () => {
      // 페이지에 표시된 텍스트 확인
      const bodyText = await page.textContent('body');

      if (bodyText?.includes('사정관')) {
        console.log('✓ 사정관 관련 콘텐츠 발견');
      }

      if (bodyText?.includes('평가')) {
        console.log('✓ 평가 관련 콘텐츠 발견');
      }

      if (bodyText?.includes('이용권')) {
        console.log('✓ 이용권 관련 콘텐츠 발견');
      }

      // 모든 버튼 찾기
      const buttons = await page.getByRole('button').allTextContents();
      console.log('페이지의 버튼들:', buttons);

      // 모든 링크 찾기
      const links = await page.getByRole('link').allTextContents();
      console.log('페이지의 링크들:', links);
    });

    // 5. 최종 스크린샷
    await page.screenshot({ path: 'tests/screenshots/05-final-state.png', fullPage: true });
  });

  test('로그인 페이지 구조 확인', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 이메일 입력 필드 확인
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // 비밀번호 입력 필드 확인
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // 로그인 버튼 확인
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
    await expect(loginButton).toBeVisible();

    console.log('✓ 로그인 페이지 구조 확인 완료');
  });

  test('사정관 평가 페이지 직접 접근 (로그인 후)', async ({ page }) => {
    // 먼저 로그인
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('withjuno6@naver.com');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
    await loginButton.click();

    // 로그인 처리 대기
    await page.waitForTimeout(5000);

    // 평가 페이지로 이동
    await page.goto('/evaluation', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 페이지 스크린샷
    await page.screenshot({ path: 'tests/screenshots/evaluation-page-logged-in.png', fullPage: true });

    // 페이지 내용 로그
    const url = page.url();
    const title = await page.title();
    const bodyText = await page.textContent('body');

    console.log('URL:', url);
    console.log('페이지 제목:', title);
    console.log('페이지에 "사정관" 포함:', bodyText?.includes('사정관'));
    console.log('페이지에 "평가" 포함:', bodyText?.includes('평가'));
  });
});
