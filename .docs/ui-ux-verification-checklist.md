# UI/UX Verification Checklist

## By area/screen

### App shell and navigation

- Active route is obvious in desktop nav.
- All primary destinations are discoverable.
- Keyboard focus is visible on nav items, profile entry, theme toggle, and floating actions.
- Small-screen navigation has an intentional fallback.

### Auth

- Login and sign-up have identical field structure, spacing, and CTA behavior.
- Social sign-in and primary sign-in buttons read as intentionally different variants.
- Error, disabled, and loading states are visible and stable.

### Home

- Dashboard cards align to a consistent spacing rhythm.
- Loading and empty states preserve layout.
- Metric values, labels, and helper copy follow a predictable type hierarchy.

### Transactions

- Filter controls, add panel, and feedback modal share consistent field anatomy.
- Dense rows remain readable and clickable without hover-only dependence.
- Empty, loading, error, and success states are distinct.

### Subscriptions

- Add panel uses the same dialog/sheet pattern as other flows.
- Collapsed and expanded cards preserve hierarchy and readable spacing.
- Delete/cancel actions are clearly secondary to review actions.

### Banking

- Connect, sync, and loading states share a consistent button model.
- Linked accounts and recent transaction rows match list-row spacing and icon alignment.

### Gamification

- Circles, badges, targets, and reflection dialogs share common surface and CTA styles.
- Empty states use the same structure and tone.

### Search and analytics

- Hero input remains usable on smaller screens.
- Decorative emphasis does not overpower the primary task.

### Profile

- Editable forms, add-preference forms, and read-only sections share the same visual system.
- Dense data remains readable without overusing micro uppercase labels.

## Light mode checklist

- No text depends on `.light [class*=...]` patching to remain legible.
- Surface layering remains clear without dark-mode shadows.
- Interactive borders and rings remain visible on light backgrounds.
- Accent colors still pass contrast when used for text.

## Dark mode checklist

- Secondary text meets contrast expectations on all surfaces.
- Overlays, dialogs, and sheets use semantic dark surfaces rather than pure black.
- Surface elevation is communicated with tone changes, not only glow/shadow.
- Pure white text is reserved for primary emphasis, not every label.

## Interaction state checklist

- Hover states exist but are not required to understand affordance.
- Focus rings are visible and consistent across buttons, inputs, selects, textareas, and custom controls.
- Active/pressed states exist for primary actions.
- Disabled states reduce affordance clearly without losing legibility.
- Invalid/error states use both color and text.

## Performance-perception checklist

- Large data views use skeletons instead of text-only loaders.
- Route transitions do not cause layout jumps.
- Infinite animations are avoided on idle screens.
- Loading indicators appear close to the affected UI, not only globally.
- Chat, modal, and panel animations do not delay task completion.

## Accessibility checklist

- All icon-only buttons have accessible labels.
- Scrollable regions retain visible scroll affordance.
- Contrast is checked for helper text, metadata labels, and empty states.
- Motion honors reduced-motion preferences and remains restrained by default.
- Form labels, hints, and errors are associated with controls.
