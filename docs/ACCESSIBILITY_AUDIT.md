# Accessibility Audit

## How to run the audit

### Automated (axe + Playwright)

1. **First-time setup:** Install Playwright browsers (only needed once per machine):
   ```bash
   npx playwright install chromium
   ```

2. **Run the accessibility tests:**
   ```bash
   npm run test:a11y
   ```
   Or directly:
   ```bash
   npx playwright test tests/e2e/a11y.spec.ts
   ```

   The test suite runs axe (WCAG 2.1 Level A/AA) on key routes: `/`, `/services`, `/blog`, `/book`. It fails if any **critical** or **serious** violations are found.

3. **With dev server already running:** If you prefer to start the dev server yourself, run:
   ```bash
   npm run dev
   ```
   Then in another terminal (with `reuseExistingServer` in `playwright.config.ts`), run the tests. By default the test runner starts the dev server automatically.

### Manual (Lighthouse + axe DevTools)

- **Lighthouse:** Open Chrome DevTools → Lighthouse tab → select "Accessibility" → Analyze page load. Run on key routes: `/`, `/services`, `/blog`, `/book`, `/checkout/deposit`, `/portal`.
- **axe DevTools:** Install the [axe DevTools](https://www.deque.com/axe/devtools/) browser extension, open any page, run the scan, and fix reported issues.

### Before release

Re-run the automated audit and/or Lighthouse on the routes above and document results (e.g. in `docs/accessibility-audit-YYYY-MM.md`).
