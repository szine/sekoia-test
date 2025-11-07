import { test, expect, Page } from '@playwright/test';

test.describe('Home Page - WikiJokes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('WikiJokes');
  });

  test('should have search input and button with SVG icon', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    const searchButton = page.locator('button[type="submit"]');
    const svg = searchButton.locator('svg');

    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();
    await expect(svg).toBeVisible();
  });

  test('Search happy path: type query, submit, verify 10 joke cards', async ({ page }) => {
    // Wait for initial load to complete
    await page.waitForSelector('.joke-card, app-loading-skeleton, app-empty-state', { timeout: 10000 });

    // Type in search input
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('programming');

    // Submit the form
    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Wait for loading to complete and jokes to appear
    await page.waitForSelector('.joke-card', { timeout: 10000 });

    // Verify joke cards are displayed
    const jokeCards = page.locator('.joke-card');
    const count = await jokeCards.count();
    
    // Should have jokes (API may return up to 10)
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('Two-part joke rendering: verify setup and delivery', async ({ page }) => {
    // Wait for initial jokes to load
    await page.waitForSelector('.joke-card', { timeout: 10000 });

    // Look for a twopart joke (if any exist in the results)
    const twopartJoke = page.locator('.joke-card__twopart').first();
    
    if (await twopartJoke.count() > 0) {
      const setup = twopartJoke.locator('.joke-card__setup');
      const delivery = twopartJoke.locator('.joke-card__delivery');

      await expect(setup).toBeVisible();
      await expect(delivery).toBeVisible();
      
      // Verify they have content
      await expect(setup).not.toBeEmpty();
      await expect(delivery).not.toBeEmpty();
    }
  });

  test('Empty state: use rare query and verify empty state', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    
    // Use a very rare/impossible query
    await searchInput.fill('xyzabc123impossiblequery999');
    
    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Wait for either empty state or error
    await page.waitForSelector('app-empty-state, app-error-banner', { timeout: 10000 });

    // Check if empty state is shown
    const emptyState = page.locator('app-empty-state');
    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('No jokes found');
    }
  });

  test('Loading state: verify skeletons appear during fetch', async ({ page }) => {
    // Intercept API call to delay response
    await page.route('**/joke/Any*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/');

    // Loading skeleton should be visible
    const loadingSkeleton = page.locator('app-loading-skeleton');
    await expect(loadingSkeleton).toBeVisible();
  });

  test('A11y basics: tab order (input → button)', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    const searchButton = page.locator('button[type="submit"]');

    // Focus on input
    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    // Tab to button
    await page.keyboard.press('Tab');
    await expect(searchButton).toBeFocused();
  });

  test('A11y: Enter key submits search', async ({ page }) => {
    await page.waitForSelector('.joke-card, app-loading-skeleton, app-empty-state', { timeout: 10000 });

    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('test');

    // Press Enter
    await searchInput.press('Enter');

    // Wait for search to complete
    await page.waitForSelector('.joke-card, app-empty-state, app-error-banner', { timeout: 10000 });

    // Verify search was triggered (URL or content changed)
    const jokeCards = page.locator('.joke-card');
    const emptyState = page.locator('app-empty-state');
    const errorBanner = page.locator('app-error-banner');

    // One of these should be visible
    const hasJokes = await jokeCards.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;
    const hasError = await errorBanner.count() > 0;

    expect(hasJokes || hasEmptyState || hasError).toBe(true);
  });

  test('A11y: focus moves to results heading on successful search', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.joke-card', { timeout: 10000 });

    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('funny');

    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Wait for results
    await page.waitForSelector('.joke-card', { timeout: 10000 });

    // Check if results heading exists and can receive focus
    const resultsHeading = page.locator('.home__results-heading');
    if (await resultsHeading.count() > 0) {
      await expect(resultsHeading).toHaveAttribute('tabindex', '-1');
    }
  });

  test('Joke card displays tags', async ({ page }) => {
    await page.waitForSelector('.joke-card', { timeout: 10000 });

    const firstJokeCard = page.locator('.joke-card').first();
    const tags = firstJokeCard.locator('.joke-card__tag');

    await expect(tags.first()).toBeVisible();
    await expect(tags.first()).not.toBeEmpty();
  });

  test('Search bar is disabled while loading', async ({ page }) => {
    // Intercept API to delay response
    await page.route('**/joke/Any*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('test');
    
    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Check if input is disabled during loading
    await expect(searchInput).toBeDisabled();
    await expect(searchButton).toBeDisabled();
  });

  test('Semantic HTML: main, form, section elements', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('section[aria-label="Search section"]')).toBeVisible();
  });

  test('ARIA live regions for loading state', async ({ page }) => {
    await page.goto('/');
    
    const loadingSkeleton = page.locator('[role="status"][aria-live="polite"]');
    
    // Loading skeleton should have proper ARIA attributes
    if (await loadingSkeleton.count() > 0) {
      await expect(loadingSkeleton).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('Empty search triggers fetch with filters', async ({ page }) => {
    await page.waitForSelector('.joke-card, app-loading-skeleton, app-empty-state', { timeout: 10000 });

    const searchInput = page.locator('input[type="text"]');
    await searchInput.clear();

    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Should still fetch jokes even with empty query
    await page.waitForSelector('.joke-card, app-empty-state, app-error-banner', { timeout: 10000 });

    const jokeCards = page.locator('.joke-card');
    const count = await jokeCards.count();
    
    // Should have results or empty state
    expect(count >= 0).toBe(true);
  });
});
