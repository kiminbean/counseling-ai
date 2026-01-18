import { test, expect, devices } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * 주요 페이지의 시각적 일관성을 검증하는 스크린샷 비교 테스트
 *
 * 사용법:
 * - 첫 실행: npm run test:visual:update (기준 스냅샷 생성)
 * - 이후 실행: npm run test:visual (스냅샷 비교)
 *
 * 스냅샷 저장 위치: e2e/visual.spec.ts-snapshots/
 */

test.describe('Visual Regression Tests', () => {
  test.describe('Desktop Views', () => {
    test('homepage matches screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 동적 콘텐츠 안정화를 위한 추가 대기
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
      });
    });

    test('settings page matches screenshot', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('settings-desktop.png', {
        fullPage: true,
      });
    });

    test('help page matches screenshot', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('help-desktop.png', {
        fullPage: true,
      });
    });

    test('privacy page matches screenshot', async ({ page }) => {
      await page.goto('/privacy');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('privacy-desktop.png', {
        fullPage: true,
      });
    });

    test('profile page matches screenshot', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 동적 ID 마스킹 (ID: xxx 형식의 텍스트가 있는 영역)
      const idElement = page.locator('text=/ID:.*$/').first();
      if (await idElement.isVisible()) {
        await idElement.evaluate((el) => {
          el.textContent = 'ID: masked-for-testing';
        });
      }

      await expect(page).toHaveScreenshot('profile-desktop.png', {
        fullPage: true,
      });
    });

    test('checkin page matches screenshot', async ({ page }) => {
      await page.goto('/checkin');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('checkin-desktop.png', {
        fullPage: true,
      });
    });

    test('exercises page matches screenshot', async ({ page }) => {
      await page.goto('/exercises');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('exercises-desktop.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Mobile Views (Pixel 5)', () => {
    test.use({ ...devices['Pixel 5'] });

    test('homepage mobile matches screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
      });
    });

    test('settings page mobile matches screenshot', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('settings-mobile.png', {
        fullPage: true,
      });
    });

    test('help page mobile matches screenshot', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('help-mobile.png', {
        fullPage: true,
      });
    });

    test('profile page mobile matches screenshot', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 동적 ID 마스킹
      const idElement = page.locator('text=/ID:.*$/').first();
      if (await idElement.isVisible()) {
        await idElement.evaluate((el) => {
          el.textContent = 'ID: masked-for-testing';
        });
      }

      await expect(page).toHaveScreenshot('profile-mobile.png', {
        fullPage: true,
      });
    });

    test('bottom navigation mobile matches screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const bottomNav = page.locator('nav[aria-label="메인 네비게이션"]');
      await expect(bottomNav).toBeVisible();

      await expect(bottomNav).toHaveScreenshot('bottom-nav-mobile.png');
    });
  });

  test.describe('Dark Mode', () => {
    test.beforeEach(async ({ page }) => {
      // 설정 페이지에서 다크 모드 활성화
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: '다크' }).click();
      await page.waitForTimeout(300);
    });

    test('homepage dark mode matches screenshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
      });
    });

    test('settings page dark mode matches screenshot', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('settings-dark.png', {
        fullPage: true,
      });
    });

    test('help page dark mode matches screenshot', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('help-dark.png', {
        fullPage: true,
      });
    });

    test('profile page dark mode matches screenshot', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // 동적 ID 마스킹
      const idElement = page.locator('text=/ID:.*$/').first();
      if (await idElement.isVisible()) {
        await idElement.evaluate((el) => {
          el.textContent = 'ID: masked-for-testing';
        });
      }

      await expect(page).toHaveScreenshot('profile-dark.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Interactive States', () => {
    test('settings modal open state matches screenshot', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      // 대화 기록 삭제 모달 열기
      await page.getByText('대화 기록 삭제').click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('settings-delete-modal.png', {
        fullPage: true,
      });
    });

    test('help FAQ expanded state matches screenshot', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('networkidle');

      // FAQ 아코디언 펼치기
      const faqQuestion = page.getByText('Q. 대화 내용은 안전한가요?');
      await faqQuestion.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('help-faq-expanded.png', {
        fullPage: true,
      });
    });
  });
});
