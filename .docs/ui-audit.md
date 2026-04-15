# UI Audit

## Scope

Reviewed the frontend shell, dashboard layout, floating AI assistant, shared button/input primitives, the reusable electric card pattern, and representative page-level styling.

## Inconsistencies Found

- Theme values were split across `src/styles/theme.css`, `src/shared/theme.ts`, and many page-local hard-coded colors, radii, and surface values.
- Floating assistant behavior used continuous idle motion plus recurring tooltip visibility, which made the affordance noisy.
- High-frequency UI patterns repeated slightly different radii, dark surfaces, borders, and muted label styles.
- Shared controls existed, but several app surfaces still bypassed the common primitives and redefined their own input/button treatments.
- Theme ownership was split across frontend files, with no backend-controlled override path for engineering-only updates.

## Fixes Applied

- Established `src/shared/theme.ts` as the main frontend theme token source and applied it through `src/shared/theme-provider.tsx`.
- Added CSS utility classes in `src/styles/theme.css` for app shell, card/panel surfaces, eyebrow labels, empty-state text, and standardized button/input treatment.
- Updated `src/app/App.tsx`, `src/features/home/components/ElectricCard.tsx`, `src/features/dashboard/layout/DashboardLayout.tsx`, and `src/features/dashboard/components/ZappBot.tsx` to consume the centralized theme.
- Removed the user-facing theme route and added support for backend-injected runtime overrides through `window.__ZAPP_THEME__`, so one backend-managed payload can drive linked frontend theme tokens.
- Normalized a second pass of high-traffic UI surfaces in subscriptions and gamification so dialogs, panels, labels, empty states, and form controls reuse the same shell/input/button conventions.
- Reworked the floating assistant so:
  - the electric highlight appears only on hover,
  - the “Ask a question” prompt appears once on initial load and then dismisses,
  - recurring idle shake/bounce behavior is removed,
  - accessibility labels were added for open, close, and send actions.
- Added focused tests for the assistant behavior and theme/control consistency markers.

## Recommendations Not Yet Applied

- Normalize the remaining page-local hard-coded surface tokens in `SubscriptionsPage`, onboarding forms, dialog flows, and several analytics/home sections. Those files are visually dense enough that a full sweep would create unnecessary churn in one pass.
- Move repeated uppercase metadata labels and empty/loading state blocks into dedicated shared components once the product team confirms copy hierarchy expectations.
- Consolidate modal/drawer shells on top of one shared wrapper so radius, padding, and header spacing stop diverging.
- Have the backend emit a validated theme payload into the app shell or API bootstrap response, with schema validation and release controls, so developers edit one backend-managed record instead of frontend files.

## Rationale And Tradeoffs

Centralizing theme tokens is a good idea here because the app already has a recognizable visual language but was expressing it through duplication. A token module plus CSS variable bridge keeps motion, inline chart styles, and Tailwind utility usage aligned without forcing a full design-system rewrite.

The tradeoff is that this frontend workspace can only prepare the contract for backend ownership, not the backend editing UI itself. This pass removes user exposure and makes the frontend ready for a backend-managed theme payload while keeping the current app stable.
