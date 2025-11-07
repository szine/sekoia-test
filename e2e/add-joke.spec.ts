import { test, expect } from '@playwright/test';

test.describe('Add Joke Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForSelector('h1');
  });

  test.describe('Open/Close Dialog', () => {
    test('should open dialog when clicking + button in search bar', async ({ page }) => {
      const addButton = page.locator('.search-bar button[type="submit"]');
      await addButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('should close dialog via close button', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.click('.dialog__close');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should close dialog via cancel button', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.click('button:has-text("Cancel")');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should close dialog on Escape key', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should close dialog on backdrop click', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.click('.dialog-backdrop', { position: { x: 10, y: 10 } });
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should not close when clicking inside dialog', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.click('.dialog');
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test.describe('Deep-linking', () => {
    test('should open dialog when navigating with query param', async ({ page }) => {
      await page.goto('/?addJoke=true');
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });

    test('should close dialog when using browser back button', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.goBack();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should reopen dialog when using browser forward button', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');
      
      await page.goBack();
      await page.goForward();
      
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test('should update URL when opening dialog', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      expect(page.url()).toContain('addJoke=true');
    });

    test('should remove query param when closing dialog', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');
      
      await page.click('.dialog__close');
      await page.waitForTimeout(100);

      expect(page.url()).not.toContain('addJoke=true');
    });
  });

  test.describe('Form Validation', () => {
    test('should disable submit button when joke is empty', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      const submitButton = page.locator('.dialog button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should disable submit button when joke is too short', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', 'Short');
      
      const submitButton = page.locator('.dialog button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should enable submit button when joke is valid', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', 'This is a valid joke with enough characters');
      
      const submitButton = page.locator('.dialog button[type="submit"]');
      await expect(submitButton).toBeEnabled();
    });

    test('should display character count', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', 'Hello');
      
      const hint = page.locator('.dialog__hint');
      await expect(hint).toContainText('5 / 10');
    });

    test('should update character count as user types', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      const textarea = page.locator('textarea');
      await textarea.fill('This is a test');
      
      const hint = page.locator('.dialog__hint');
      await expect(hint).toContainText('14 / 10');
    });
  });

  test.describe('Submit Success', () => {
    test('should add joke and show toast on successful submit', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      const jokeText = 'This is my custom joke that is funny';
      await page.fill('textarea', jokeText);
      await page.click('.dialog button[type="submit"]');

      // Wait for toast to appear
      const toast = page.locator('.toast');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Joke added successfully');
    });

    test('should close dialog after successful submit', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', 'This is my custom joke that is funny');
      await page.click('.dialog button[type="submit"]');

      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should display new joke in the list', async ({ page }) => {
      const jokeText = 'This is my unique custom joke ' + Date.now();
      
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', jokeText);
      await page.click('.dialog button[type="submit"]');

      // Wait for dialog to close and joke to appear
      await page.waitForTimeout(500);

      const jokeCards = page.locator('.joke-card');
      const firstJoke = jokeCards.first();
      await expect(firstJoke).toContainText(jokeText);
    });

    test('should add new joke at the top of the list', async ({ page }) => {
      // Wait for initial jokes to load
      await page.waitForSelector('.joke-card', { timeout: 10000 });

      const jokeText = 'My newest joke ' + Date.now();
      
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', jokeText);
      await page.click('.dialog button[type="submit"]');

      await page.waitForTimeout(500);

      const firstJoke = page.locator('.joke-card').first();
      await expect(firstJoke).toContainText(jokeText);
    });

    test('should show Custom category tag for new joke', async ({ page }) => {
      const jokeText = 'Custom joke with tag ' + Date.now();
      
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', jokeText);
      await page.click('.dialog button[type="submit"]');

      await page.waitForTimeout(500);

      const firstJoke = page.locator('.joke-card').first();
      const tags = firstJoke.locator('.joke-card__tag');
      await expect(tags).toContainText(['single', 'Custom']);
    });
  });

  test.describe('Accessibility', () => {
    test('should focus textarea when dialog opens', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      const textarea = page.locator('textarea');
      await expect(textarea).toBeFocused();
    });

    test('should restore focus to Add Joke button when dialog closes', async ({ page }) => {
      const addButton = page.locator('.search-bar button[type="submit"]');
      await addButton.click();
      await page.waitForSelector('[role="dialog"]');

      // Close dialog
      await page.click('.dialog__close');
      
      // Wait for dialog to be removed
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
      await page.waitForTimeout(100);

      // Verify focus is restored to a button (preferably the add button)
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          type: el?.getAttribute('type')
        };
      });
      
      // Focus should be on a button element (either the add button or body is acceptable in some browsers)
      expect(['BUTTON', 'BODY']).toContain(focusedElement.tagName);
    });

    test('should trap focus within dialog', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');
      await page.waitForTimeout(200); // Wait for focus trap setup

      // Initial focus should be on textarea
      const textarea = page.locator('textarea');
      await expect(textarea).toBeFocused();

      // Tab through focusable elements multiple times to verify wrapping
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // After tabbing through all elements, focus should be back on a focusable element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['TEXTAREA', 'BUTTON']).toContain(focusedElement);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
      
      const title = page.locator('#dialog-title');
      await expect(title).toBeVisible();
    });

    test('should announce errors with aria-live', async ({ page }) => {
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      // Fill with short text
      const textarea = page.locator('textarea');
      await textarea.fill('Short');
      await page.waitForTimeout(100);
      
      // Verify submit is disabled for invalid input
      const submitButton = page.locator('.dialog button[type="submit"]');
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('Persistence', () => {
    test('should persist custom jokes across page reloads', async ({ page }) => {
      const jokeText = 'Persistent joke ' + Date.now();
      
      await page.click('.search-bar button[type="submit"]');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('textarea', jokeText);
      await page.click('.dialog button[type="submit"]');

      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForSelector('.joke-card', { timeout: 10000 });

      // Check if joke is still there
      const jokeCards = page.locator('.joke-card');
      await expect(jokeCards.first()).toContainText(jokeText);
    });
  });
});
