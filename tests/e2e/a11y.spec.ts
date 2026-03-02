import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const keyRoutes = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/blog', name: 'Blog' },
  { path: '/book', name: 'Book' },
];

test.describe('Accessibility (axe)', () => {
  for (const { path, name } of keyRoutes) {
    test(`${name} (${path}) should have no critical or serious axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const critical = results.violations.filter((v) => v.impact === 'critical');
      const serious = results.violations.filter((v) => v.impact === 'serious');
      expect(
        critical,
        `Critical violations on ${path}: ${JSON.stringify(critical, null, 2)}`
      ).toHaveLength(0);
      expect(
        serious,
        `Serious violations on ${path}: ${JSON.stringify(serious, null, 2)}`
      ).toHaveLength(0);
    });
  }
});
