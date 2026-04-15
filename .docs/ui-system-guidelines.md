# UI System Guidelines

Use the shared system layer in `src/shared/components/system` for new UI work.

## Rules

- Do not introduce new hardcoded dark surface hex values such as `#0B1220` or `#101A2E` in feature code.
- Do not style raw `button`, `input`, `select`, or `textarea` elements directly in feature code unless there is no shared primitive that fits.
- Do not add arbitrary radius values or micro typography values unless they are first promoted into the theme system.
- Prefer semantic surfaces and text colors over one-off `text-white`, `border-white/10`, and `bg-*` combinations.
- Prefer `LoadingState` and `EmptyState` over ad hoc text-only placeholders.

## Preferred primitives

- Actions: `AppButton`
- Fields: `FormField`, `AppInput`, `AppTextarea`, `AppSelect`
- Containers: `Surface`
- Overlays: `AppDialog`, `AppSheet`
- Headers: `SectionHeader`
- Status: `StatusChip`, `IconBadge`
- Placeholders: `LoadingState`, `EmptyState`

## Migration note

`ElectricCard`, `app-card`, and `app-panel` are compatibility layers during the transition. New screens should prefer `Surface` and related system components.
