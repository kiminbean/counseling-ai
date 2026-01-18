import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  /* Visual regression testing configuration */
  expect: {
    toHaveScreenshot: {
      /* 10% 픽셀 차이 허용 - 폰트 렌더링 등 미세한 차이 대응 */
      maxDiffPixelRatio: 0.1,
      /* 애니메이션 비활성화로 일관된 스크린샷 확보 */
      animations: 'disabled',
      /* 커서 깜빡임 숨김 */
      caret: 'hide',
    },
  },
  /* 스냅샷 저장 경로 - 각 스펙 파일 옆에 저장 */
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
