# UI/UX Audit

## Executive summary

The frontend has a strong visual direction, but consistency is being achieved mostly by repeated page-level styling rather than by a central design system. The main architectural issue is a split theming model: custom `--app-*` tokens in [`src/shared/theme.ts`](../src/shared/theme.ts) and [`src/styles/theme.css`](../src/styles/theme.css) coexist with Tailwind/shadcn semantic tokens, while many screens bypass both with hardcoded dark values like `#0B1220`, `#101A2E`, `text-white`, and `border-white/10`.

This causes four systemic UX problems:

- Dark mode is the real source of truth; light mode is partially patched in after the fact.
- Shared primitives exist, but many feature screens bypass them with one-off buttons, inputs, cards, and dialogs.
- Typography, spacing, radii, and icon sizing drift between screens because values are chosen locally.
- Motion and loading states favor visual flair over clarity and accessibility.

Styling approach detected: Tailwind 4, shadcn/Radix primitives, custom CSS variables, custom utility patterns, and `motion/react`. Test setup detected: Vitest + Testing Library via `package.json` and `src/test/setup.ts`. No tests were added or run for this audit.

## Audit methodology

1. Reviewed app shell, routes, theme provider, theme CSS, and shared token files.
2. Reviewed reusable primitives under `src/shared/components/ui`.
3. Reviewed all major route screens and representative feature components under `src/features/**`.
4. Searched for hardcoded colors, custom radii, micro typography, one-off buttons/inputs/dialogs, and animation patterns.
5. Clustered findings into token, reuse, state, dark-mode, layout, and hierarchy issues.

## Prioritized issues

### High

1. `High` `Tokens problem`
   Files:
   `src/shared/theme.ts:1`, `src/styles/theme.css:3`, `src/styles/theme.css:122`, `src/styles/theme.css:320`
   Symptom:
   Two theme systems are active at once: app tokens (`--app-*`) and Tailwind/shadcn semantic tokens (`--background`, `--card`, `--primary`, etc.). Light mode also relies on selector-based overrides such as `.light [class*="text-white"]`.
   Why it matters:
   This creates no single thematic truth. Components can look correct only because light mode is compensating for hardcoded dark classes, which is brittle and hard to scale.
   Recommended fix:
   Make semantic tokens the only public styling contract and map app accents/surfaces into that system. Remove substring-based light-mode overrides.
   Evidence of larger system problem:
   Yes. This is the root cause for most later inconsistencies.

2. `High` `Dark-mode problem`
   Files:
   `src/features/search/pages/SearchPage.tsx:23`, `src/features/dashboard/components/BuyAdvisorModal.tsx:29`, `src/features/dashboard/components/BuyAdvisorModal.tsx:34`, `src/features/transactions/pages/TransactionsPage.tsx:575`, `src/features/transactions/pages/TransactionsPage.tsx:583`, `src/features/gamification/pages/CirclesPage.tsx:557`, `src/features/transactions/components/TransactionFeedbackModal.tsx:136`
   Symptom:
   Many surfaces and overlays hardcode `#0B1220`, `#101A2E`, white borders, and dark-only text colors directly in feature files.
   Why it matters:
   Dark mode cannot be reliably maintained, and light mode will keep regressing whenever new screens are added. Shadows are also being used as elevation in places where dark surfaces should differentiate layers semantically.
   Recommended fix:
   Replace direct dark values with semantic surface tokens such as `surface/base`, `surface/raised`, `surface/overlay`, `text/primary`, `border/subtle`.
   Evidence of larger system problem:
   Yes. Hardcoded dark styling is widespread.

3. `High` `Component reuse problem`
   Files:
   `src/shared/components/ui/button.tsx:7`, `src/shared/components/ui/input.tsx:5`, `src/features/auth/pages/LoginPage.tsx:92`, `src/features/search/pages/SearchPage.tsx:20`, `src/features/dashboard/components/BuyAdvisorModal.tsx:65`, `src/features/transactions/pages/TransactionsPage.tsx:608`, `src/features/profile/pages/ProfilePage.tsx:140`
   Symptom:
   Shared `Button` and `Input` exist, but feature code frequently uses raw `button`, `input`, `textarea`, and `select` elements with custom styling.
   Why it matters:
   Interaction states, heights, padding, focus treatment, disabled behavior, and dark-mode behavior diverge immediately.
   Recommended fix:
   Define a small app-facing primitive layer on top of current shadcn components: `AppButton`, `AppInput`, `AppTextarea`, `AppSelect`, `AppDialog`, `SectionHeader`, `MetricCard`.
   Evidence of larger system problem:
   Yes. The reuse gap spans auth, search, transactions, subscriptions, profile, onboarding, and modal flows.

4. `High` `State/interaction problem`
   Files:
   `src/features/dashboard/layout/DashboardLayout.tsx:94`, `src/features/home/pages/HomePage.tsx:209`, `src/features/gamification/pages/BadgesPage.tsx:45`, `src/features/gamification/components/MonthlyTargetsWidget.tsx:80`, `src/features/subscriptions/pages/SubscriptionsPage.tsx:614`
   Symptom:
   Loading states are mostly text-only loaders or spinners, often with `animate-pulse`, while skeleton primitives already exist in `src/shared/components/ui/skeleton.tsx`.
   Why it matters:
   Text spinners feel slower, produce more layout shift, and give less structure than skeletons for data-heavy screens.
   Recommended fix:
   Use skeleton layouts for lists, cards, stats, and panels; reserve spinners for compact inline actions.
   Evidence of larger system problem:
   Yes. Affects perceived performance across the app.

### Medium

5. `Medium` `Typography problem`
   Files:
   `src/styles/theme.css:197`, `src/features/home/pages/HomePage.tsx:72`, `src/features/search/pages/SearchPage.tsx:10`, `src/features/gamification/pages/CirclesPage.tsx:230`, `src/features/profile/pages/ProfilePage.tsx:441`
   Symptom:
   Headings and labels use many local combinations: `text-6xl`, `text-5xl`, `text-4xl`, `text-2xl`, repeated `text-[10px]`, `text-[9px]`, heavy uppercase tracking, and `font-black`.
   Why it matters:
   Information hierarchy is theatrical but inconsistent. Similar sections do not read with a predictable scale.
   Recommended fix:
   Create named typography tokens for page title, section title, eyebrow, metric, helper, and dense data labels; remove most raw pixel typography.
   Evidence of larger system problem:
   Yes.

6. `Medium` `Layout/spacing problem`
   Files:
   `src/features/home/components/ElectricCard.tsx:39`, `src/features/search/pages/SearchPage.tsx:23`, `src/features/dashboard/components/BuyAdvisorModal.tsx:34`, `src/features/subscriptions/pages/SubscriptionsPage.tsx:294`, `src/features/home/pages/HomePage.tsx:242`
   Symptom:
   There are many custom radii and paddings: `rounded-[4rem]`, `rounded-[3.5rem]`, `rounded-[3rem]`, `rounded-[2.5rem]`, `rounded-[2rem]`, `rounded-xl`, `rounded-2xl`, plus varied `p-4`, `p-5`, `p-6`, `p-8`, `p-10`, `p-12`.
   Why it matters:
   Surface rhythm changes from screen to screen. Components that should feel related do not align visually.
   Recommended fix:
   Standardize on 3-4 radius steps and 4-5 spacing steps for cards, dense rows, dialogs, and hero controls.
   Evidence of larger system problem:
   Yes. Search, subscriptions, dialogs, and gamification all diverge.

7. `Medium` `Button consistency problem`
   Files:
   `src/shared/components/ui/button.tsx:23`, `src/features/auth/pages/LoginPage.tsx:92`, `src/features/banking/components/ConnectBankButton.tsx:25`, `src/features/dashboard/layout/DashboardLayout.tsx:203`, `src/features/search/pages/SearchPage.tsx:26`
   Symptom:
   Primary actions use different foundations: shared `Button`, raw `motion.button`, raw `button`, custom cyan buttons, white buttons, outline variants, and oversized CTA styles.
   Why it matters:
   Primary CTA recognition is inconsistent, and hover/active/disabled feedback is not standardized.
   Recommended fix:
   Define semantic variants: `primary`, `secondary`, `quiet`, `danger`, `floating`, `hero`. Keep motion optional and layered, not reauthored per screen.
   Evidence of larger system problem:
   Yes.

8. `Medium` `Input consistency problem`
   Files:
   `src/shared/components/ui/input.tsx:10`, `src/features/auth/pages/LoginPage.tsx:112`, `src/features/transactions/pages/TransactionsPage.tsx:608`, `src/features/dashboard/components/BuyAdvisorModal.tsx:65`, `src/features/profile/pages/ProfilePage.tsx:145`
   Symptom:
   Inputs vary in height, background, label style, border strength, placeholder color, and focus treatment. Some use shared `Input`, others use raw elements with custom `focus:border-cyan-500/50`.
   Why it matters:
   Forms feel unrelated and are harder to scan. Focus visibility is inconsistent and sometimes weak against dark surfaces.
   Recommended fix:
   Standardize field anatomy: label, control, description, error, optional suffix/prefix icon, and invalid state.
   Evidence of larger system problem:
   Yes.

9. `Medium` `Navigation and hierarchy problem`
   Files:
   `src/features/dashboard/layout/DashboardLayout.tsx:132`, `src/features/dashboard/layout/DashboardLayout.tsx:138`, `src/features/dashboard/layout/DashboardLayout.tsx:172`
   Symptom:
   Desktop top nav exposes only a subset of routes, while other destinations like analytics/search are accessible only indirectly. The active state depends on tiny uppercase labels and low-contrast inactive text.
   Why it matters:
   Current location and available destinations are not obvious, especially for first-time users. There is also no visible mobile nav pattern in the layout.
   Recommended fix:
   Use a single navigation model with all core destinations, clearer active indicators, and a defined small-screen fallback.
   Evidence of larger system problem:
   Partial, but it impacts structure app-wide.

10. `Medium` `Motion problem`
    Files:
    `src/features/dashboard/components/AmbientEnergyLines.tsx:8`, `src/features/dashboard/components/ZappBot.tsx:57`, `src/features/dashboard/components/ZappBot.tsx:246`, `src/features/dashboard/components/BuyAdvisorModal.tsx:92`
    Symptom:
    Several animations run continuously without user intent: ambient background lines, cursor/eye tracking, typing dots, pulsing indicators, repeated glow-driven motion.
    Why it matters:
    Always-on motion competes with content, can fatigue users, and can feel less performant even when technically smooth.
    Recommended fix:
    Restrict motion to first-load reveals, hover, state change, and explicit user-triggered flows. Keep reduced-motion support, but reduce default animation even for standard mode.
    Evidence of larger system problem:
    Yes.

### Low

11. `Low` `Icon consistency problem`
    Files:
    `src/features/dashboard/layout/DashboardLayout.tsx:159`, `src/features/search/pages/SearchPage.tsx:18`, `src/features/home/pages/HomePage.tsx:74`, `src/features/banking/components/BankConnectionCard.tsx:43`
    Symptom:
    Icon sizes range from 14 to 48 with inconsistent stroke emphasis and alignment. Some actions use filled-looking glow treatments while others stay flat.
    Why it matters:
    This weakens scanability and makes certain actions feel more important than intended.
    Recommended fix:
    Standardize icon sizes by slot: 14, 16, 20, 24, 32; standardize stroke weight and icon container usage.
    Evidence of larger system problem:
    Yes, but lower severity than tokens and form consistency.

12. `Low` `Accessibility problem`
    Files:
    `src/styles/theme.css:177`, `src/features/dashboard/layout/DashboardLayout.tsx:147`, `src/features/search/pages/SearchPage.tsx:23`, `src/features/home/pages/HomePage.tsx:206`
    Symptom:
    Scrollbars are globally hidden, inactive text often sits at gray-on-dark low contrast, oversized custom inputs/buttons do not always show strong focus, and some clickable text is implemented as a styled `button` with minimal affordance.
    Why it matters:
    Keyboard and low-vision users get weaker feedback. Hidden scrollbars also reduce discoverability of overflow areas.
    Recommended fix:
    Restore visible scrollbar styling, enforce WCAG contrast on secondary text, and define consistent focus rings using semantic tokens.
    Evidence of larger system problem:
    Yes.

## Accessibility and dark-mode risks

- `.light [class*="text-white"]` and similar selectors in `src/styles/theme.css:320` are a maintenance risk and can mask real contrast problems.
- Global scrollbar removal in `src/styles/theme.css:173` hides affordance on long panels and dialogs.
- Repeated use of `text-gray-500` or `text-gray-600` on dark surfaces appears decorative rather than accessible in many screens.
- Dialog and slide-over forms often rely on border-color-only focus states instead of a consistent ring and offset.
- Large hero inputs and floating buttons do not consistently express disabled, pressed, and error states.

## Reuse and design-system opportunities

- Consolidate `ElectricCard`, `app-card`, `app-panel`, and `Card` into a single surface model with variants.
- Create app-level field primitives so auth, profile, onboarding, transactions, and subscriptions stop reimplementing inputs and labels.
- Create a standard page header component covering title, eyebrow, helper copy, trailing CTA, and status chip.
- Replace custom empty/loading blocks with shared `EmptyState` and `Skeleton` patterns.
- Standardize dialog/sheet wrappers; several flows are building their own modal anatomy despite Radix dialog primitives already existing.

## Quick wins

- Replace text-only loaders with skeletons in home, subscriptions, badges, monthly targets, and dashboard routes.
- Remove selector-based light-mode patches in favor of semantic token usage in the highest-traffic screens first.
- Standardize CTA height and radius across auth, search, banking, subscriptions, and transactions.
- Swap raw form elements in dialogs for shared `Input`, `Textarea`, `Select`, and `Label`.
- Reduce always-on background and assistant motion; keep only state-based transitions.

## Systemic fixes

- Establish one token system and make all component styling flow through it.
- Introduce app-facing primitives for surfaces, form controls, dialogs, badges, empty states, and page headers.
- Define a compact type scale and spacing scale, then codify lintable conventions for avoiding arbitrary values.
- Treat dark mode and light mode as semantic themes, not separate hardcoded palettes.
- Add a UI consistency review gate for new routes: tokens, focus states, loading states, and motion rules.

## Suggested code direction

```tsx
// Example: centralize semantic surface usage instead of local dark values
<AppDialog variant="overlay">
  <AppDialogHeader
    eyebrow="Manual Entry"
    title="Add Subscription"
    description="Track recurring costs and value scores."
  />
  <AppField label="Merchant">
    <AppInput placeholder="Netflix" />
  </AppField>
  <AppButton variant="primary" size="lg">Add Subscription</AppButton>
</AppDialog>
```

```css
/* Example: semantic tokens instead of screen-level hex values */
:root {
  --surface-base: var(--color-card);
  --surface-raised: color-mix(in srgb, var(--color-card) 92%, white 8%);
  --surface-overlay: color-mix(in srgb, var(--color-background) 82%, black 18%);
  --text-primary: var(--color-foreground);
  --text-secondary: var(--color-muted-foreground);
  --border-subtle: var(--color-border);
}
```
