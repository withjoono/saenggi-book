import { test, expect } from '@playwright/test';

test.describe('사정관 평가 시스템 전체 플로우', () => {
  test('로그인부터 사정관 목록까지 전체 테스트', async ({ page }) => {
    // ============================================================
    // 1단계: 로그인
    // ============================================================
    console.log('\n=== 1단계: 로그인 ===');

    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');

    await page.screenshot({ path: 'tests/screenshots/full-01-login-ready.png', fullPage: true });

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: '로그인' });
    await loginButton.click();

    console.log('로그인 버튼 클릭');

    // Hub로 리다이렉트 대기
    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });
    console.log('✓ 로그인 성공 - Hub 메인으로 이동:', page.url());

    await page.screenshot({ path: 'tests/screenshots/full-02-hub-main.png', fullPage: true });

    // ============================================================
    // 2단계: 평가 서비스 랜딩 페이지
    // ============================================================
    console.log('\n=== 2단계: 평가 서비스 랜딩 페이지 ===');

    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/full-03-evaluation-landing.png', fullPage: true });

    // 페이지 확인
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).toContain('사정관');

    console.log('✓ 평가 서비스 랜딩 페이지 로드');

    // ============================================================
    // 3단계: 사정관 평가 서비스 바로가기 클릭
    // ============================================================
    console.log('\n=== 3단계: 사정관 평가 서비스 바로가기 클릭 ===');

    // "사정관 평가 서비스" 섹션 찾기
    const officerSection = page.locator('text=사정관 평가 서비스').locator('..');

    // 해당 섹션 내의 "바로가기" 버튼 찾기
    const goButton = page.getByRole('button', { name: '바로가기' }).nth(1); // 두 번째 바로가기 버튼 (사정관 평가 서비스)

    if (await goButton.isVisible()) {
      await goButton.click();
      console.log('✓ 사정관 평가 서비스 바로가기 클릭');

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/full-04-officer-service.png', fullPage: true });
    } else {
      // 대체 방법: 링크로 직접 이동
      console.log('버튼을 찾을 수 없어 직접 이동 시도');
      await page.goto('http://localhost:3001/evaluation/request');
      await page.waitForLoadState('networkidle');
    }

    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);

    await page.waitForTimeout(2000);

    // ============================================================
    // 4단계: 계열 선택 (있다면)
    // ============================================================
    console.log('\n=== 4단계: 계열 선택 확인 ===');

    await page.screenshot({ path: 'tests/screenshots/full-05-before-series-select.png', fullPage: true });

    const pageContent = await page.textContent('body');

    if (pageContent?.includes('대계열') || pageContent?.includes('계열')) {
      console.log('계열 선택 UI 발견 - 계열 선택 시작');

      // 대계열 선택
      const seriesButtons = await page.getByRole('button').all();
      console.log(`${seriesButtons.length}개의 버튼 발견`);

      // 첫 번째, 두 번째, 세 번째 계열 선택
      if (seriesButtons.length >= 3) {
        try {
          await seriesButtons[0].click();
          await page.waitForTimeout(1000);
          console.log('✓ 대계열 선택');
          await page.screenshot({ path: 'tests/screenshots/full-06-series-1.png', fullPage: true });

          const seriesButtons2 = await page.getByRole('button').all();
          await seriesButtons2[1].click();
          await page.waitForTimeout(1000);
          console.log('✓ 중계열 선택');
          await page.screenshot({ path: 'tests/screenshots/full-07-series-2.png', fullPage: true });

          const seriesButtons3 = await page.getByRole('button').all();
          await seriesButtons3[2].click();
          await page.waitForTimeout(1000);
          console.log('✓ 소계열 선택');
          await page.screenshot({ path: 'tests/screenshots/full-08-series-3.png', fullPage: true });
        } catch (error) {
          console.log('계열 선택 중 에러:', error);
        }
      }
    }

    // ============================================================
    // 5단계: 사정관 목록 확인
    // ============================================================
    console.log('\n=== 5단계: 사정관 목록 확인 ===');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/full-09-officer-list.png', fullPage: true });

    const finalContent = await page.textContent('body');

    // 사정관 목록 관련 요소 확인
    const hasOfficerList = finalContent?.includes('사정관 목록') || finalContent?.includes('사정관');
    const hasTicket = finalContent?.includes('이용권') || finalContent?.includes('평가');
    const hasApplyButton = await page.getByRole('button', { name: /평가 신청|신청/ }).count() > 0;

    console.log('사정관 관련 콘텐츠:', hasOfficerList ? '✓ 있음' : '✗ 없음');
    console.log('이용권 관련 콘텐츠:', hasTicket ? '✓ 있음' : '✗ 없음');
    console.log('평가 신청 버튼:', hasApplyButton ? '✓ 있음' : '✗ 없음');

    // 페이지의 모든 버튼 확인
    const allButtons = await page.getByRole('button').allTextContents();
    console.log('\n페이지의 버튼들 (처음 10개):');
    allButtons.slice(0, 10).forEach((btn, idx) => {
      console.log(`  ${idx + 1}. ${btn}`);
    });

    // ============================================================
    // 6단계: 사정관 카드 확인
    // ============================================================
    console.log('\n=== 6단계: 사정관 카드 확인 ===');

    // 다양한 셀렉터로 사정관 카드 찾기
    const cardSelectors = [
      '[data-testid="officer-card"]',
      '.grid > div:has(button)',
      '[class*="card"]',
      'div:has(> button:text("평가 신청"))',
    ];

    let officerCards = null;
    let cardCount = 0;

    for (const selector of cardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ 셀렉터 "${selector}": ${count}개 발견`);
        officerCards = page.locator(selector);
        cardCount = count;
        break;
      }
    }

    if (officerCards && cardCount > 0) {
      console.log(`\n✓ 총 ${cardCount}개의 사정관 카드 발견`);

      // 첫 번째 카드 정보 확인
      const firstCard = officerCards.first();
      const cardText = await firstCard.textContent();
      console.log('첫 번째 카드 정보:', cardText?.substring(0, 100));

      // 평가 신청 버튼 확인
      const applyButtons = await page.getByRole('button', { name: /평가 신청|신청/ }).count();
      console.log(`평가 신청 버튼 수: ${applyButtons}개`);
    } else {
      console.log('✗ 사정관 카드를 찾을 수 없습니다');
    }

    // ============================================================
    // 7단계: 최종 확인
    // ============================================================
    console.log('\n=== 7단계: 최종 확인 ===');

    await page.screenshot({ path: 'tests/screenshots/full-10-final.png', fullPage: true });

    const finalUrl = page.url();
    console.log('최종 URL:', finalUrl);

    console.log('\n=== 테스트 완료 ===');
    console.log('모든 스크린샷이 tests/screenshots/ 폴더에 저장되었습니다.');
  });

  test('사정관 평가 페이지 빠른 확인', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').filter({ hasText: '로그인' }).click();

    // Hub로 리다이렉트 대기
    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });

    // 평가 페이지로 이동
    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');

    // 페이지 확인
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).toContain('사정관');

    console.log('✓ 사정관 평가 페이지 접근 성공');
  });
});
