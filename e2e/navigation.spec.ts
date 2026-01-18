import { test, expect } from '@playwright/test';

/**
 * 네비게이션 및 페이지 E2E 테스트
 * - 하단 네비게이션 (모바일)
 * - 설정 페이지
 * - 도움말 페이지
 * - 프로필 페이지
 */
test.describe('Navigation', () => {
  test.describe('Bottom Navigation (Mobile)', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should display bottom navigation on mobile', async ({ page }) => {
      await page.goto('/');

      const bottomNav = page.locator('nav[aria-label="메인 네비게이션"]');
      await expect(bottomNav).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to chat page', async ({ page }) => {
      await page.goto('/profile');

      const chatLink = page.getByRole('menuitem', { name: '상담' });
      await chatLink.click();

      await expect(page).toHaveURL('/');
    });

    test('should navigate to checkin page', async ({ page }) => {
      await page.goto('/');

      const checkinLink = page.getByRole('menuitem', { name: '기분체크' });
      await checkinLink.click();

      await expect(page).toHaveURL('/checkin');
    });

    test('should navigate to exercises page', async ({ page }) => {
      await page.goto('/');

      const exercisesLink = page.getByRole('menuitem', { name: '운동' });
      await exercisesLink.click();

      await expect(page).toHaveURL('/exercises');
    });

    test('should navigate to profile page', async ({ page }) => {
      await page.goto('/');

      const profileLink = page.getByRole('menuitem', { name: '프로필' });
      await profileLink.click();

      await expect(page).toHaveURL('/profile');
    });

    test('should highlight active navigation item', async ({ page }) => {
      await page.goto('/profile');

      const profileLink = page.getByRole('menuitem', { name: '프로필' });
      await expect(profileLink).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
    });

    test('should display all settings sections', async ({ page }) => {
      await expect(page.getByText('테마 설정')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('알림 설정')).toBeVisible();
      await expect(page.getByText('개인정보 관리')).toBeVisible();
      await expect(page.getByText('앱 정보')).toBeVisible();
    });

    test('should display theme options', async ({ page }) => {
      await expect(page.getByRole('button', { name: '라이트' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: '다크' })).toBeVisible();
      await expect(page.getByRole('button', { name: '시스템' })).toBeVisible();
    });

    test('should toggle dark mode', async ({ page }) => {
      // 다크 모드 버튼 클릭
      await page.getByRole('button', { name: '다크' }).click();

      // html에 dark 클래스가 적용되어야 함
      await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('should toggle light mode from dark mode', async ({ page }) => {
      // 먼저 다크 모드로 전환
      await page.getByRole('button', { name: '다크' }).click();
      await expect(page.locator('html')).toHaveClass(/dark/);

      // 라이트 모드로 전환
      await page.getByRole('button', { name: '라이트' }).click();

      // dark 클래스가 제거되어야 함
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    });

    test('should toggle push notification setting', async ({ page }) => {
      // 푸시 알림 토글 버튼 찾기
      const pushToggle = page.locator('button[role="switch"]').first();
      const initialState = await pushToggle.getAttribute('aria-checked');

      await pushToggle.click();

      // 상태가 변경되어야 함
      const newState = await pushToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });

    test('should show delete confirmation modal', async ({ page }) => {
      // 대화 기록 삭제 버튼 클릭
      await page.getByText('대화 기록 삭제').click();

      // 확인 모달이 표시되어야 함
      await expect(page.getByText('모든 대화 기록이 영구적으로 삭제됩니다')).toBeVisible();
      await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
      await expect(page.getByRole('button', { name: '삭제' })).toBeVisible();
    });

    test('should cancel delete operation', async ({ page }) => {
      // 대화 기록 삭제 버튼 클릭
      await page.getByText('대화 기록 삭제').click();

      // 취소 버튼 클릭
      await page.getByRole('button', { name: '취소' }).click();

      // 모달이 닫혀야 함
      await expect(page.getByText('모든 대화 기록이 영구적으로 삭제됩니다')).not.toBeVisible();
    });

    test('should display app version', async ({ page }) => {
      // 버전 정보 표시 확인
      await expect(page.getByText(/v\d+\.\d+\.\d+/)).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to privacy page', async ({ page }) => {
      await page.getByText('개인정보처리방침').click();
      await expect(page).toHaveURL('/privacy');
    });

    test('should navigate to help page', async ({ page }) => {
      await page.getByText('도움말').click();
      await expect(page).toHaveURL('/help');
    });
  });

  test.describe('Help Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');
    });

    test('should display usage guide', async ({ page }) => {
      await expect(page.getByText('사용 가이드')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('채팅 시작하기')).toBeVisible();
      await expect(page.getByText('기분 체크인 사용법')).toBeVisible();
      await expect(page.getByText('심리 운동 활용하기')).toBeVisible();
    });

    test('should display FAQ section', async ({ page }) => {
      await expect(page.getByText('자주 묻는 질문')).toBeVisible({ timeout: 10000 });
    });

    test('should expand FAQ accordion', async ({ page }) => {
      // FAQ 항목 클릭
      const faqQuestion = page.getByText('Q. 대화 내용은 안전한가요?');
      await faqQuestion.click();

      // 답변이 표시되어야 함
      await expect(page.getByText(/암호화/)).toBeVisible();
    });

    test('should collapse FAQ accordion on second click', async ({ page }) => {
      const faqQuestion = page.getByText('Q. 대화 내용은 안전한가요?');

      // 첫 번째 클릭 - 펼치기
      await faqQuestion.click();
      await expect(page.getByText(/암호화/)).toBeVisible();

      // 두 번째 클릭 - 접기
      await faqQuestion.click();
      await expect(page.getByText(/암호화/)).not.toBeVisible();
    });

    test('should display contact information', async ({ page }) => {
      await expect(page.getByText('문의하기')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('support@mindbridge.ai')).toBeVisible();
    });

    test('should display emergency hotlines', async ({ page }) => {
      await expect(page.getByText('긴급 상담 안내')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('1393')).toBeVisible();
      await expect(page.getByText('1577-0199')).toBeVisible();
    });
  });

  test.describe('Profile Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
    });

    test('should display profile header', async ({ page }) => {
      await expect(page.getByText('프로필')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('익명 사용자')).toBeVisible();
    });

    test('should display user ID', async ({ page }) => {
      // ID가 표시되어야 함
      await expect(page.getByText(/ID:/).first()).toBeVisible({ timeout: 10000 });
    });

    test('should display settings menu item', async ({ page }) => {
      await expect(page.getByText('설정')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('알림, 언어, 테마')).toBeVisible();
    });

    test('should navigate to settings from profile', async ({ page }) => {
      const settingsLink = page.getByRole('link').filter({ hasText: '설정' });
      await settingsLink.click();

      await expect(page).toHaveURL('/settings');
    });

    test('should display app version in profile', async ({ page }) => {
      await expect(page.getByText(/Version \d+\.\d+\.\d+/)).toBeVisible({ timeout: 10000 });
    });

    test('should display logout button', async ({ page }) => {
      await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Privacy Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/privacy');
      await page.waitForLoadState('networkidle');
    });

    test('should display privacy policy content', async ({ page }) => {
      // 개인정보처리방침 페이지 내용 확인
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
    });
  });
});
