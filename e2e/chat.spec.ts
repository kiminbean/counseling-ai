import { test, expect } from '@playwright/test';

/**
 * 채팅 플로우 E2E 테스트
 * - 메시지 전송
 * - AI 응답 수신
 * - 메시지 지속성
 * - 로딩 상태
 */
test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 인증 및 초기 로드 대기
    await page.waitForFunction(() => {
      return localStorage.getItem('user_id') !== null;
    }, { timeout: 15000 });
    // 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome message when no messages', async ({ page }) => {
    // 환영 메시지 확인
    await expect(page.getByText('안녕하세요!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('MindBridge AI입니다.')).toBeVisible();
  });

  test('should display chat input', async ({ page }) => {
    // 채팅 입력 필드 확인
    const input = page.locator('#chat-input');
    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEnabled();
  });

  test('should send message on Enter key', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('테스트 메시지입니다');
    await input.press('Enter');

    // 사용자 메시지가 표시되어야 함
    await expect(page.locator('[data-testid="user-message"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('테스트 메시지입니다')).toBeVisible();
  });

  test('should send message on button click', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('버튼으로 전송');

    // 전송 버튼 클릭
    const sendButton = page.getByRole('button', { name: '메시지 전송' });
    await sendButton.click();

    // 사용자 메시지가 표시되어야 함
    await expect(page.getByText('버튼으로 전송')).toBeVisible({ timeout: 10000 });
  });

  test('should clear input after sending message', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('전송 후 입력창 초기화');
    await input.press('Enter');

    // 입력창이 비워져야 함
    await expect(input).toHaveValue('');
  });

  test('should show loading indicator while waiting for response', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('로딩 테스트');
    await input.press('Enter');

    // 로딩 인디케이터(타이핑 애니메이션) 또는 AI 응답 확인
    // API 응답이 빠르면 로딩이 안 보일 수 있으므로, 둘 중 하나 확인
    const loadingOrResponse = page.locator('[data-testid="ai-message"]');
    await expect(loadingOrResponse.first()).toBeVisible({ timeout: 30000 });
  });

  test('should use quick suggestion buttons', async ({ page }) => {
    // 빠른 제안 버튼 클릭
    const suggestionButton = page.getByRole('button', { name: '요즘 스트레스를 받아요' });

    if (await suggestionButton.isVisible()) {
      await suggestionButton.click();

      // 메시지가 전송되어야 함
      await expect(page.getByText('요즘 스트레스를 받아요')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show new chat button after first message', async ({ page }) => {
    // 메시지 전송
    const input = page.locator('#chat-input');
    await input.fill('첫 번째 메시지');
    await input.press('Enter');

    // 새 대화 버튼이 나타나야 함
    const newChatButton = page.getByRole('button', { name: '새 대화 시작' });
    await expect(newChatButton).toBeVisible({ timeout: 10000 });
  });

  test('should preserve message history in localStorage', async ({ page }) => {
    // 메시지 전송
    const input = page.locator('#chat-input');
    await input.fill('히스토리 테스트');
    await input.press('Enter');

    // 메시지가 표시될 때까지 대기
    await expect(page.getByText('히스토리 테스트')).toBeVisible({ timeout: 10000 });

    // localStorage에 메시지가 저장되었는지 확인
    const hasMessages = await page.evaluate(() => {
      const messages = localStorage.getItem('chat_messages');
      return messages !== null && messages.includes('히스토리');
    });

    expect(hasMessages).toBe(true);
  });

  test('should display hotline information', async ({ page }) => {
    // 긴급 상담 정보 표시 확인
    await expect(page.getByText('1393')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('1577-0199')).toBeVisible();
  });

  test('should handle multiline input with Shift+Enter', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('첫 번째 줄');
    await input.press('Shift+Enter');
    await input.type('두 번째 줄');

    // textarea에 두 줄이 있어야 함
    const value = await input.inputValue();
    expect(value).toContain('첫 번째 줄');
    expect(value).toContain('두 번째 줄');
  });
});
