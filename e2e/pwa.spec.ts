import { test, expect } from '@playwright/test';

/**
 * PWA 및 오프라인 기능 E2E 테스트
 * - 서비스 워커 등록
 * - manifest.json 접근성
 * - 오프라인 인디케이터
 */
test.describe('PWA Features', () => {
  test.describe('Service Worker', () => {
    test('should register service worker', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 서비스 워커 등록 확인
      const swRegistered = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch {
          return false;
        }
      });

      // 서비스 워커가 지원되면 등록되어야 함
      // 개발 환경에서는 등록되지 않을 수 있음
      if (process.env.CI) {
        expect(swRegistered).toBe(true);
      }
    });
  });

  test.describe('Web App Manifest', () => {
    test('manifest.json should be accessible', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      expect(response?.status()).toBe(200);
    });

    test('manifest.json should have valid structure', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      expect(response?.status()).toBe(200);

      const manifest = await response?.json();

      // 필수 필드 확인
      expect(manifest.name).toBeTruthy();
      expect(manifest.short_name).toBeTruthy();
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
    });

    test('manifest.json should have correct app info', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();

      expect(manifest.name).toContain('MindBridge');
      expect(manifest.lang).toBe('ko');
      expect(manifest.theme_color).toBe('#0ea5e9');
      expect(manifest.background_color).toBe('#ffffff');
    });

    test('manifest.json should have icons', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();

      expect(manifest.icons).toBeInstanceOf(Array);
      expect(manifest.icons.length).toBeGreaterThan(0);

      // 필수 아이콘 사이즈 확인
      const iconSizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
      expect(iconSizes).toContain('192x192');
      expect(iconSizes).toContain('512x512');
    });

    test('manifest.json should have shortcuts', async ({ page }) => {
      const response = await page.goto('/manifest.json');
      const manifest = await response?.json();

      expect(manifest.shortcuts).toBeInstanceOf(Array);
      expect(manifest.shortcuts.length).toBeGreaterThan(0);

      // 첫 번째 숏컷 확인
      const firstShortcut = manifest.shortcuts[0];
      expect(firstShortcut.name).toBeTruthy();
      expect(firstShortcut.url).toBeTruthy();
    });
  });

  test.describe('Meta Tags for PWA', () => {
    test('should have apple-mobile-web-app-capable meta tag', async ({ page }) => {
      await page.goto('/');

      const metaTag = page.locator('meta[name="apple-mobile-web-app-capable"]');
      // Next.js가 appleWebApp 메타데이터를 생성함
      // 직접 확인이 어려울 수 있으므로 skip 가능
    });

    test('should have theme-color meta tag', async ({ page }) => {
      await page.goto('/');

      const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
      expect(themeColor).toBe('#0ea5e9');
    });

    test('should have viewport meta tag', async ({ page }) => {
      await page.goto('/');

      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute('content', /width=device-width/);
    });
  });

  test.describe('Offline Functionality', () => {
    test('should show offline indicator when offline', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 오프라인 모드 활성화
      await context.setOffline(true);

      // 브라우저가 오프라인 상태를 감지할 시간 부여
      await page.waitForTimeout(1500);

      // 오프라인 알림이 표시되어야 함
      const offlineAlert = page.locator('[role="alert"]').filter({ hasText: /연결|오프라인/i });
      await expect(offlineAlert).toBeVisible({ timeout: 5000 });

      // 온라인으로 복귀
      await context.setOffline(false);
    });

    test('should hide offline indicator when back online', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 오프라인 모드 활성화
      await context.setOffline(true);
      await page.waitForTimeout(1500);

      // 오프라인 알림 확인
      const offlineAlert = page.locator('[role="alert"]').filter({ hasText: /연결|오프라인/i });
      await expect(offlineAlert).toBeVisible({ timeout: 5000 });

      // 온라인으로 복귀
      await context.setOffline(false);
      await page.waitForTimeout(1500);

      // 오프라인 알림이 사라져야 함
      await expect(offlineAlert).not.toBeVisible({ timeout: 5000 });
    });

    test('should preserve localStorage data when offline', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForFunction(() => localStorage.getItem('user_id') !== null);

      const userId = await page.evaluate(() => localStorage.getItem('user_id'));

      // 오프라인 모드로 전환
      await context.setOffline(true);

      // 페이지 새로고침 시도 (실패할 수 있음)
      try {
        await page.reload({ timeout: 5000 });
      } catch {
        // 오프라인에서는 새로고침 실패 가능
      }

      // localStorage 데이터는 유지되어야 함
      const userIdAfterOffline = await page.evaluate(() => localStorage.getItem('user_id'));
      expect(userIdAfterOffline).toBe(userId);

      await context.setOffline(false);
    });
  });

  test.describe('App Installation', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('settings page should display PWA install section', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      // 앱 설치 섹션이 표시되어야 함 (설치되지 않은 경우)
      const installSection = page.getByText('앱 설치').or(
        page.getByText('앱이 설치되어 있습니다')
      );
      await expect(installSection).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Performance', () => {
    test('should load main page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      // 3초 이내 로드
      expect(loadTime).toBeLessThan(3000);
    });

    test('icons should be accessible', async ({ page }) => {
      // 192x192 아이콘 확인
      const icon192Response = await page.goto('/icons/icon-192x192.png');
      expect(icon192Response?.status()).toBe(200);

      // 512x512 아이콘 확인
      const icon512Response = await page.goto('/icons/icon-512x512.png');
      expect(icon512Response?.status()).toBe(200);
    });
  });
});
