import { test, expect } from '@playwright/test';

test.describe('사정관 평가 API 디버깅', () => {
  test('로그인 후 사정관 API 응답 확인', async ({ page }) => {
    // API 응답 수집
    const apiResponses: Array<{ url: string; status: number; data: any }> = [];

    page.on('response', async response => {
      const url = response.url();

      // 사정관 관련 API만 수집
      if (url.includes('/officer-evaluation/') || url.includes('/officer')) {
        try {
          const data = await response.json();
          apiResponses.push({
            url,
            status: response.status(),
            data
          });
          console.log(`\n[API Response] ${url}`);
          console.log('Status:', response.status());
          console.log('Data:', JSON.stringify(data, null, 2));
        } catch (e) {
          // JSON이 아닌 경우 무시
        }
      }
    });

    // 1. 로그인
    console.log('\n=== 로그인 ===');
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').filter({ hasText: '로그인' }).click();

    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });
    console.log('✓ 로그인 성공');

    // 2. 평가 페이지로 이동
    console.log('\n=== 평가 페이지 이동 ===');
    await page.goto('http://localhost:3001/evaluation');
    await page.waitForLoadState('networkidle');

    // 3. 사정관 평가 서비스로 이동
    await page.getByRole('button', { name: '바로가기' }).nth(1).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== 수집된 API 응답 ===');
    console.log(`총 ${apiResponses.length}개의 API 호출 수집됨`);

    // 사정관 목록 API 확인
    const officerListResponse = apiResponses.find(r => r.url.includes('/officer-evaluation/officer'));
    if (officerListResponse) {
      console.log('\n[사정관 목록 API]');
      console.log('URL:', officerListResponse.url);
      console.log('Status:', officerListResponse.status);
      console.log('Data:', JSON.stringify(officerListResponse.data, null, 2));

      // 데이터 구조 확인
      if (officerListResponse.data.success && Array.isArray(officerListResponse.data.data)) {
        const officers = officerListResponse.data.data;
        console.log(`\n사정관 수: ${officers.length}명`);

        if (officers.length > 0) {
          const firstOfficer = officers[0];
          console.log('\n첫 번째 사정관 데이터:');
          console.log('officer_id:', firstOfficer.officer_id);
          console.log('officerId (camelCase):', firstOfficer.officerId);
          console.log('officer_name:', firstOfficer.officer_name);
          console.log('전체 데이터:', JSON.stringify(firstOfficer, null, 2));

          // officer_id 체크
          if (firstOfficer.officer_id === undefined || firstOfficer.officer_id === null) {
            console.error('❌ officer_id가 없습니다!');
          } else if (isNaN(firstOfficer.officer_id)) {
            console.error('❌ officer_id가 NaN입니다!');
          } else {
            console.log('✓ officer_id가 정상입니다:', firstOfficer.officer_id);
          }
        }
      }
    } else {
      console.log('❌ 사정관 목록 API 응답을 찾을 수 없습니다');
    }

    // 티켓 API 확인
    const ticketResponse = apiResponses.find(r => r.url.includes('/ticket'));
    if (ticketResponse) {
      console.log('\n[티켓 API]');
      console.log('Data:', JSON.stringify(ticketResponse.data, null, 2));
    }

    // 평가 목록 API 확인
    const evaluationListResponse = apiResponses.find(r => r.url.includes('/member/'));
    if (evaluationListResponse) {
      console.log('\n[평가 목록 API]');
      console.log('Data:', JSON.stringify(evaluationListResponse.data, null, 2));
    }

    // 스크린샷
    await page.screenshot({ path: 'tests/screenshots/api-debug-page.png', fullPage: true });

    // API 응답을 파일로 저장
    const fs = require('fs');
    const outputPath = 'tests/screenshots/api-responses.json';
    fs.writeFileSync(outputPath, JSON.stringify(apiResponses, null, 2));
    console.log(`\n✓ API 응답이 ${outputPath}에 저장되었습니다`);
  });

  test('수동으로 API 직접 호출 테스트', async ({ request, page }) => {
    // 먼저 로그인해서 토큰 획득
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('input[name="email"]').fill('withjuno6@naver.com');
    await page.locator('input[name="password"]').fill('123456');
    await page.locator('button[type="submit"]').filter({ hasText: '로그인' }).click();

    await page.waitForURL('http://localhost:3000/**', { timeout: 15000 });

    // 쿠키에서 토큰 가져오기
    const cookies = await page.context().cookies();
    console.log('Cookies:', cookies);

    // 사정관 목록 API 직접 호출
    try {
      const response = await page.request.get('http://localhost:3001/api-nest/officer-evaluation/officer');
      const data = await response.json();

      console.log('\n=== 사정관 목록 API 직접 호출 ===');
      console.log('Status:', response.status());
      console.log('Data:', JSON.stringify(data, null, 2));

      if (data.success && Array.isArray(data.data)) {
        console.log(`\n사정관 수: ${data.data.length}명`);

        data.data.forEach((officer: any, index: number) => {
          console.log(`\n사정관 ${index + 1}:`);
          console.log('  officer_id:', officer.officer_id);
          console.log('  officerId:', officer.officerId);
          console.log('  officer_name:', officer.officer_name);
          console.log('  remaining_evaluations:', officer.remaining_evaluations);
        });
      }
    } catch (error) {
      console.error('API 호출 실패:', error);
    }
  });
});
