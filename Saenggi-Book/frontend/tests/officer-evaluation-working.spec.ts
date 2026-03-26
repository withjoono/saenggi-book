import { test, expect } from '@playwright/test';

test.describe('사정관 평가 시스템 - 작동 버전', () => {
  test('로그인 후 사정관 평가 페이지 접근 및 테스트', async ({ page, context }) => {
    console.log('\n=== 1단계: 로그인 ===');

    // 로그인 페이지로 이동
    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');

    // 로그인 폼 입력
    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');

    await page.screenshot({ path: 'tests/screenshots/working-01-login-ready.png', fullPage: true });

    // 로그인 버튼 클릭
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
    await loginButton.click();

    console.log('로그인 버튼 클릭 완료');

    // 로그인 후 리다이렉트 대기 (Hub 메인으로 이동)
    await page.waitForURL('http://localhost:3000/**', { timeout: 10000 });
    console.log('Hub 메인으로 리다이렉트됨:', page.url());

    await page.screenshot({ path: 'tests/screenshots/working-02-hub-main.png', fullPage: true });

    console.log('\n=== 2단계: 평가 페이지로 이동 ===');

    // 다시 포트 3001의 평가 페이지로 이동 (토큰은 쿠키에 저장되어 있음)
    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tests/screenshots/working-03-evaluation-page.png', fullPage: true });

    const evaluationUrl = page.url();
    console.log('평가 페이지 URL:', evaluationUrl);

    // 페이지 내용 확인
    const bodyText = await page.textContent('body');

    console.log('\n=== 페이지 내용 확인 ===');
    console.log('404 에러:', bodyText?.includes('404'));
    console.log('"사정관" 키워드:', bodyText?.includes('사정관'));
    console.log('"평가" 키워드:', bodyText?.includes('평가'));
    console.log('"이용권" 키워드:', bodyText?.includes('이용권'));

    if (bodyText?.includes('404')) {
      console.log('❌ 404 에러 발생 - 페이지를 찾을 수 없습니다');
      return;
    }

    console.log('\n=== 3단계: 사정관 목록 확인 ===');

    // 계열 선택이 필요한지 확인
    const hasSeriesSelection = await page.getByText(/대계열|중계열|소계열/).count() > 0;

    if (hasSeriesSelection) {
      console.log('계열 선택 UI 발견');

      // 계열 선택 (첫 번째 옵션들 선택)
      const seriesButtons = await page.getByRole('button').all();

      if (seriesButtons.length > 0) {
        console.log(`${seriesButtons.length}개의 버튼 발견`);

        // 첫 번째 계열 버튼 클릭 (인덱스로 안전하게 접근)
        try {
          await seriesButtons[0].click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'tests/screenshots/working-04-series-1.png', fullPage: true });

          // 두 번째 계열 버튼 클릭
          const seriesButtons2 = await page.getByRole('button').all();
          if (seriesButtons2.length > 1) {
            await seriesButtons2[1].click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'tests/screenshots/working-05-series-2.png', fullPage: true });
          }

          // 세 번째 계열 버튼 클릭
          const seriesButtons3 = await page.getByRole('button').all();
          if (seriesButtons3.length > 2) {
            await seriesButtons3[2].click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'tests/screenshots/working-06-series-3.png', fullPage: true });
          }
        } catch (error) {
          console.log('계열 선택 중 에러:', error);
        }
      }
    }

    console.log('\n=== 4단계: 사정관 목록 확인 ===');

    // 사정관 목록 텍스트 확인
    const officerListTitle = await page.getByText(/사정관 목록/i).count();
    console.log('사정관 목록 제목:', officerListTitle > 0 ? '✓ 발견' : '✗ 없음');

    // 이용권 정보 확인
    const ticketInfo = await page.getByText(/평가 이용권/i).count();
    console.log('이용권 정보:', ticketInfo > 0 ? '✓ 발견' : '✗ 없음');

    // 페이지의 모든 버튼 목록
    const allButtons = await page.getByRole('button').allTextContents();
    console.log('페이지의 버튼들:', allButtons.slice(0, 10)); // 처음 10개만

    // 페이지의 모든 링크 목록
    const allLinks = await page.getByRole('link').allTextContents();
    console.log('페이지의 링크들:', allLinks.slice(0, 10)); // 처음 10개만

    await page.screenshot({ path: 'tests/screenshots/working-07-final-state.png', fullPage: true });

    console.log('\n=== 5단계: 사정관 카드 찾기 ===');

    // 다양한 방법으로 사정관 카드 찾기
    const cardSelectors = [
      '[data-testid="officer-card"]',
      '.grid > div',
      '[class*="card"]',
      '[class*="officer"]'
    ];

    for (const selector of cardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ 셀렉터 "${selector}": ${count}개 발견`);

        // 첫 번째 카드의 텍스트 내용 확인
        const firstCardText = await page.locator(selector).first().textContent();
        console.log('첫 번째 카드 내용:', firstCardText?.substring(0, 100));

        break;
      }
    }

    console.log('\n=== 테스트 완료 ===');
  });

  test('사정관 평가 시스템 간단한 확인', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').filter({ hasText: '로그인' }).click();

    // Hub로 리다이렉트 대기
    await page.waitForURL('http://localhost:3000/**', { timeout: 10000 });

    // 평가 페이지로 이동
    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 페이지 확인
    const bodyText = await page.textContent('body');

    // 단언문
    expect(bodyText).not.toContain('404');
    console.log('✓ 404 에러 없음');

    // 스크린샷
    await page.screenshot({ path: 'tests/screenshots/evaluation-simple-test.png', fullPage: true });
  });
});
