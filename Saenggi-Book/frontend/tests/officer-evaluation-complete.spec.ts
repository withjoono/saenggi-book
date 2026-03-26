import { test, expect } from '@playwright/test';

test.describe('사정관 평가 시스템 완전한 테스트', () => {
  test('로그인 → 계열 선택 → 사정관 목록 → 평가 신청', async ({ page }) => {
    // ============================================================
    // 1단계: 로그인
    // ============================================================
    console.log('\n=== 1단계: 로그인 ===');

    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').filter({ hasText: '로그인' }).click();

    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });
    console.log('✓ 로그인 성공');

    await page.screenshot({ path: 'tests/screenshots/complete-01-login-success.png', fullPage: true });

    // ============================================================
    // 2단계: 평가 서비스 페이지 접근
    // ============================================================
    console.log('\n=== 2단계: 평가 서비스 페이지 ===');

    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');

    // 사정관 평가 서비스 바로가기 클릭 (두 번째 바로가기 버튼)
    await page.getByRole('button', { name: '바로가기' }).nth(1).click();
    await page.waitForLoadState('networkidle');

    console.log('✓ 사정관 평가 신청 페이지로 이동');
    console.log('현재 URL:', page.url());

    await page.screenshot({ path: 'tests/screenshots/complete-02-request-page.png', fullPage: true });

    // ============================================================
    // 3단계: 계열 선택
    // ============================================================
    console.log('\n=== 3단계: 계열 선택 ===');

    // 대분류 선택 (첫 번째 드롭다운)
    const grandSeriesDropdown = page.locator('select, [role="combobox"]').first();

    if (await grandSeriesDropdown.isVisible()) {
      console.log('드롭다운 방식 사용');

      // 대분류 선택
      await grandSeriesDropdown.click();
      await page.waitForTimeout(500);

      // 첫 번째 옵션 선택 (인덱스 1, 0은 기본값)
      const grandOptions = await page.locator('select').first().locator('option').all();
      if (grandOptions.length > 1) {
        await page.locator('select').first().selectOption({ index: 1 });
        console.log('✓ 대분류 선택');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/complete-03-grand-series.png', fullPage: true });
      }

      // 중분류 선택
      const middleOptions = await page.locator('select').nth(1).locator('option').all();
      if (middleOptions.length > 1) {
        await page.locator('select').nth(1).selectOption({ index: 1 });
        console.log('✓ 중분류 선택');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/complete-04-middle-series.png', fullPage: true });
      }

      // 소분류 선택
      const rowOptions = await page.locator('select').nth(2).locator('option').all();
      if (rowOptions.length > 1) {
        await page.locator('select').nth(2).selectOption({ index: 1 });
        console.log('✓ 소분류 선택');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/complete-05-row-series.png', fullPage: true });
      }

      // "선택" 버튼 클릭
      const selectButton = page.getByRole('button', { name: /선택/ });
      if (await selectButton.isVisible()) {
        await selectButton.click();
        console.log('✓ 선택 버튼 클릭');
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('드롭다운을 찾을 수 없습니다');
    }

    await page.screenshot({ path: 'tests/screenshots/complete-06-after-series-select.png', fullPage: true });

    // ============================================================
    // 4단계: 사정관 목록 확인
    // ============================================================
    console.log('\n=== 4단계: 사정관 목록 확인 ===');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/complete-07-officer-list.png', fullPage: true });

    const pageContent = await page.textContent('body');

    // 사정관 목록 관련 키워드 확인
    console.log('사정관 목록:', pageContent?.includes('사정관 목록') ? '✓' : '✗');
    console.log('평가 이용권:', pageContent?.includes('평가 이용권') ? '✓' : '✗');
    console.log('원하는 사정관을 선택:', pageContent?.includes('원하는 사정관을 선택') ? '✓' : '✗');

    // 사정관 카드 찾기
    const officerCards = await page.locator('div').filter({ hasText: /평가 신청/ }).count();
    console.log(`사정관 카드 수: ${officerCards}개`);

    // 평가 신청 버튼 찾기
    const applyButtons = await page.getByRole('button', { name: /평가 신청|신청하기/ }).count();
    console.log(`평가 신청 버튼 수: ${applyButtons}개`);

    if (applyButtons > 0) {
      console.log('✓ 사정관 목록 로드 성공!');
    }

    // ============================================================
    // 5단계: 이용권 확인
    // ============================================================
    console.log('\n=== 5단계: 이용권 확인 ===');

    // 이용권 개수 확인
    const ticketText = await page.locator('text=/평가 이용권/').locator('..').textContent();
    console.log('이용권 정보:', ticketText);

    // 이용권 구매하기 링크 확인
    const purchaseLink = page.getByText(/이용권 구매하기/);
    if (await purchaseLink.isVisible()) {
      console.log('✓ 이용권 구매하기 링크 발견');
    }

    // ============================================================
    // 6단계: 사정관 정보 확인
    // ============================================================
    console.log('\n=== 6단계: 사정관 정보 확인 ===');

    // 첫 번째 사정관 카드의 정보 출력
    const firstApplyButton = page.getByRole('button', { name: /평가 신청/ }).first();

    if (await firstApplyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 사정관 카드의 상위 요소 찾기
      const officerCard = firstApplyButton.locator('..').locator('..');
      const officerInfo = await officerCard.textContent();

      console.log('\n첫 번째 사정관 정보:');
      console.log(officerInfo?.substring(0, 200));

      // 평가 신청 버튼 상태 확인
      const isDisabled = await firstApplyButton.isDisabled();
      console.log('평가 신청 버튼 활성화:', !isDisabled ? '✓' : '✗ (비활성화됨)');

      if (!isDisabled) {
        console.log('\n평가 신청 테스트를 원하시면 아래 버튼을 클릭하세요.');
        console.log('(현재 테스트에서는 실제 신청하지 않습니다)');

        // 실제로 신청하려면 주석 해제:
        // await firstApplyButton.click();
        // await page.waitForTimeout(2000);
        // console.log('✓ 평가 신청 완료');
      }
    } else {
      console.log('✗ 평가 신청 버튼을 찾을 수 없습니다');
    }

    // ============================================================
    // 7단계: 최종 스크린샷
    // ============================================================
    await page.screenshot({ path: 'tests/screenshots/complete-08-final.png', fullPage: true });

    console.log('\n=== 테스트 완료 ===');
    console.log('스크린샷 저장 위치: tests/screenshots/');
    console.log('최종 URL:', page.url());
  });

  test('빠른 통합 테스트 - 사정관 평가 시스템 접근', async ({ page }) => {
    // 로그인
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').filter({ hasText: '로그인' }).click();

    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });

    // 평가 페이지
    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');

    // 사정관 평가 서비스 바로가기
    await page.getByRole('button', { name: '바로가기' }).nth(1).click();
    await page.waitForLoadState('networkidle');

    // 페이지 확인
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('사정관 평가 신청');

    console.log('✓ 사정관 평가 시스템 접근 성공');
  });
});
