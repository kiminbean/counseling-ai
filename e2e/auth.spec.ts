import { test, expect } from '@playwright/test';

/**
 * 인증 플로우 E2E 테스트
 * - 익명 인증
 * - 세션 유지
 * - 사용자 ID 지속성
 */
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should create user_id on first visit', async ({ page }) => {
    await page.goto('/');

    // user_id 생성 대기
    await page.waitForFunction(() => {
      return localStorage.getItem('user_id') !== null;
    }, { timeout: 10000 });

    const userId = await page.evaluate(() => localStorage.getItem('user_id'));
    expect(userId).toBeTruthy();
    expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/);
  });

  test('should create device_id on first visit', async ({ page }) => {
    await page.goto('/');

    // device_id 생성 대기
    await page.waitForFunction(() => {
      return localStorage.getItem('device_id') !== null;
    }, { timeout: 10000 });

    const deviceId = await page.evaluate(() => localStorage.getItem('device_id'));
    expect(deviceId).toBeTruthy();
    expect(deviceId).toMatch(/^device_\d+_[a-z0-9]+$/);
  });

  test('should persist user_id across page reloads', async ({ page }) => {
    await page.goto('/');

    // user_id 생성 대기
    await page.waitForFunction(() => {
      return localStorage.getItem('user_id') !== null;
    }, { timeout: 10000 });

    const userId1 = await page.evaluate(() => localStorage.getItem('user_id'));

    // 페이지 새로고침
    await page.reload();

    // user_id가 유지되는지 확인
    await page.waitForFunction(() => {
      return localStorage.getItem('user_id') !== null;
    }, { timeout: 10000 });

    const userId2 = await page.evaluate(() => localStorage.getItem('user_id'));

    expect(userId1).toBe(userId2);
  });

  test('should persist device_id across page reloads', async ({ page }) => {
    await page.goto('/');

    // device_id 생성 대기
    await page.waitForFunction(() => {
      return localStorage.getItem('device_id') !== null;
    }, { timeout: 10000 });

    const deviceId1 = await page.evaluate(() => localStorage.getItem('device_id'));

    // 페이지 새로고침
    await page.reload();

    // device_id가 유지되는지 확인
    await page.waitForFunction(() => {
      return localStorage.getItem('device_id') !== null;
    }, { timeout: 10000 });

    const deviceId2 = await page.evaluate(() => localStorage.getItem('device_id'));

    expect(deviceId1).toBe(deviceId2);
  });

  test('should handle auth initialization without errors', async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');

    // 인증 관련 치명적 에러가 없어야 함
    const criticalAuthErrors = consoleErrors.filter(
      error => error.includes('Auth') && error.includes('critical')
    );
    expect(criticalAuthErrors).toHaveLength(0);
  });

  test('should display chat UI after auth initialization', async ({ page }) => {
    await page.goto('/');

    // 인증 초기화 완료 대기 (스켈레톤이 사라질 때까지)
    await page.waitForFunction(() => {
      return localStorage.getItem('user_id') !== null;
    }, { timeout: 10000 });

    // 채팅 UI 요소가 표시되어야 함
    await expect(page.getByText('MindBridge AI')).toBeVisible({ timeout: 10000 });

    // 환영 메시지 또는 채팅 입력이 표시되어야 함
    const welcomeOrInput = page.getByText('안녕하세요').or(
      page.getByRole('textbox', { name: /메시지/i })
    );
    await expect(welcomeOrInput.first()).toBeVisible({ timeout: 10000 });
  });
});
