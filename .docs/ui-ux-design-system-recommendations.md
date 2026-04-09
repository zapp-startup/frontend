# Design System Recommendations

## Proposed token model

- Colors: `bg.canvas`, `surface.base`, `surface.raised`, `surface.overlay`, `surface.inset`, `border.subtle`, `border.strong`, `text.primary`, `text.secondary`, `text.tertiary`, `text.inverse`, `action.primary.*`, `action.secondary.*`, `status.success|warning|danger|info`, `accent.cyan|green|blue|purple|red|yellow`.
- Spacing: `space.1/2/3/4/5/6/8/10/12` mapped to `4/8/12/16/20/24/32/40/48`, plus aliases for `control`, `card`, `section`, `dialog`.
- Typography: `pageTitle`, `sectionTitle`, `cardTitle`, `metric`, `body`, `bodyStrong`, `label`, `eyebrow`, `caption`.
- Radius: `sm=8`, `md=12`, `lg=16`, `xl=24`, `2xl=32`.
- Elevation: `0`, `1`, `2`, `overlay`.
- Motion: `duration.fast=120ms`, `base=180ms`, `slow=280ms`, plus standard easing and shared hover/press scales.

Rules:

- Reserve uppercase tracked typography for labels and metadata.
- Reduce raw `font-black`; use `700` by default and `800-900` for hero/metric emphasis only.
- In dark mode, pair elevation with lighter surfaces, not shadow alone.
- Keep animation trigger-based; avoid infinite ambient motion unless product-critical.

## Proposed component library structure

```text
src/shared/components/system/
  tokens/
    color.ts
    spacing.ts
    typography.ts
    motion.ts
  primitives/
    app-button.tsx
    app-input.tsx
    app-textarea.tsx
    app-select.tsx
    app-dialog.tsx
    app-sheet.tsx
    surface.tsx
    icon-badge.tsx
    skeleton-block.tsx
  patterns/
    page-header.tsx
    metric-card.tsx
    empty-state.tsx
    loading-state.tsx
    form-field.tsx
    status-chip.tsx
    list-row.tsx
```

## Dark-mode strategy

- Keep light and dark themes as semantic token maps, not duplicated class recipes.
- Map all components to semantic tokens only.
- Treat `surface.base`, `surface.raised`, and `surface.overlay` as the layering backbone.
- Reserve accent colors for emphasis, not for all borders and glows.
- Remove substring-based `.light [class*=...]` overrides from `theme.css`.

Example:

```ts
export const semanticTheme = {
  dark: {
    "surface.base": "#101A2E",
    "surface.raised": "#14203A",
    "surface.overlay": "rgba(8,17,31,0.88)",
    "text.primary": "#FFFFFF",
    "text.secondary": "#CBD5E1",
    "border.subtle": "rgba(255,255,255,0.08)",
  },
  light: {
    "surface.base": "#FFFFFF",
    "surface.raised": "#E4ECF6",
    "surface.overlay": "rgba(238,244,251,0.92)",
    "text.primary": "#08111F",
    "text.secondary": "#334155",
    "border.subtle": "rgba(11,18,32,0.10)",
  },
};
```

## Migration roadmap

### Phase 1: Stabilize tokens

- Choose one semantic token layer as the only public API.
- Map current app colors into that layer.
- Remove hardcoded dark surfaces from the top 5 traffic screens.

### Phase 2: Replace primitive bypasses

- Build `AppButton`, `AppInput`, `AppTextarea`, `AppSelect`, `AppDialog`, `Surface`.
- Migrate auth, banking CTA, search hero, transaction feedback, and circles dialogs first.

### Phase 3: Standardize page patterns

- Introduce `PageHeader`, `EmptyState`, `LoadingState`, `MetricCard`, `ListRow`.
- Migrate home, subscriptions, analytics, and profile.

### Phase 4: Rationalize motion

- Move hover/press/enter animation into shared wrappers.
- Remove infinite ambient loops and track reduced-motion coverage.

### Phase 5: Governance

- Add lint guidance for arbitrary color and radius usage.
- Add visual review checklist for new screens.
- Add a small token snapshot test and theme regression test around both modes.

## Recommended first adopters

- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/pages/SignUpPage.tsx`
- `src/features/search/pages/SearchPage.tsx`
- `src/features/subscriptions/pages/SubscriptionsPage.tsx`
- `src/features/transactions/components/TransactionFeedbackModal.tsx`
- `src/features/gamification/pages/CirclesPage.tsx`
