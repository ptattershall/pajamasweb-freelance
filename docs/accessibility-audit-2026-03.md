# Accessibility audit – March 2026

## Summary

- **Date:** 2026-03
- **Tool:** axe-core (Playwright) with tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- **Routes tested:** `/`, `/services`, `/blog`, `/book`

## Results

- **Critical violations:** 0
- **Serious violations:** 0
- **Status:** Pass (no critical or serious issues on key routes)

## Changes made for accessibility

- Added `id="main-content"` to all `<main>` elements so the “Skip to main content” link works on every page.
- Skip link, focus indicators, and ARIA usage were already in place (see [REMAINING_FEATURES_BREAKDOWN.md](REMAINING_FEATURES_BREAKDOWN.md) Phase 3).

## How to re-run

See [ACCESSIBILITY_AUDIT.md](ACCESSIBILITY_AUDIT.md).
