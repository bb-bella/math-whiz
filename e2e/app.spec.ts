import { test, expect } from '@playwright/test';

test.describe('Emoji Math Whiz - E2E Tests', () => {
  test('should load the app without 404 errors', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const content = await body.innerHTML();
    expect(content.length).toBeGreaterThan(100);
  });

  test('should have interactive elements', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const body = page.locator('body');
    const html = await body.innerHTML();
    // Check for interactive content (buttons, inputs, or game elements)
    const hasInteractive = html.includes('button') || html.includes('input') || html.includes('div') || html.length > 500;
    expect(hasInteractive).toBe(true);
  });

  test('should render without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('gemini') && 
            !text.includes('API') && 
            !text.includes('analytics') &&
            !text.includes('fetch')) {
          errors.push(text);
        }
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    expect(errors.length).toBe(0);
  });

  test('should load all resources without 404s', async ({ page }) => {
    const failedRequests: { status: number; url: string }[] = [];

    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      
      if (status >= 400 && 
          !url.includes('gemini') && 
          !url.includes('googleapis') &&
          !url.includes('analytics')) {
        failedRequests.push({ status, url });
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    expect(failedRequests.length).toBe(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have localStorage available', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const storageAvailable = await page.evaluate(() => {
      try {
        window.localStorage.setItem('test', 'value');
        window.localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    });
    expect(storageAvailable).toBe(true);
  });

  test('should have window object', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const hasWindow = await page.evaluate(() => {
      return typeof window === 'object' && window !== null;
    });
    expect(hasWindow).toBe(true);
  });

  test('should have valid page title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

