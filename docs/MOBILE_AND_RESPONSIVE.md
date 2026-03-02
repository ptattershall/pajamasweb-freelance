# Mobile and responsive testing

## Touch targets

Primary actions (booking CTA, checkout buttons, chat button, portal nav, service filter/search, form submit) use a **minimum 44×44px** tap target (WCAG 2.5.5 Level AAA, and common mobile best practice):

- **Button (ui):** `min-h-[44px]`; icon size includes `min-w-[44px]`.
- **Floating chat button:** Already 56×56px (`w-14 h-14`).
- **Home:** Contact, Get in Touch, mobile menu button, and mobile nav links use `min-h-[44px]` or `py-3` for tap area.
- **ServiceFilterGrid:** Clear search (44×44), Clear filters, tier Select (min-h 44px), View Details links.
- **Checkout:** Deposit submit and Service checkout buttons use `min-h-[44px]`.
- **Portal:** Nav and Sign Out use the shared Button component with 44px minimum.

## Responsive testing

Before launch:

1. **Viewport:** Test key flows at **375px** width (e.g. Chrome DevTools device emulation: iPhone SE or similar).
2. **Routes:** Home, Services, Book, Checkout (deposit), Portal dashboard.
3. **Check:** No horizontal overflow, readable text, tap targets at least 44px, forms usable, nav accessible (mobile menu).

Testing on various devices can be done via browser device emulation; optional real-device check (e.g. one iOS and one Android) is recommended before launch.
