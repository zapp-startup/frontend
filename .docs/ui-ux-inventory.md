# UI/UX Inventory

## Repeated UI patterns and duplicated components

- Surfaces: `ElectricCard` is the dominant wrapper, while `Card`, `app-card`, and `app-panel` also exist. Subscriptions, transactions, and buy-advisor each reimplement their own overlay/sheet anatomy.
- Buttons: shared `Button` exists, but search, dashboard shell, banking, subscriptions, and profile still ship raw styled `button` or `motion.button` CTAs.
- Inputs/forms: shared `Input`, `Textarea`, `Label`, and `Dialog` exist, but onboarding, transactions, subscriptions, buy advisor, profile preferences, and search often use raw elements with local styles.
- Empty/loading states: shared `Skeleton` exists, but most screens still use text-only loading and local `animate-pulse` blocks.

## Repeated colors

### Tokenized accent colors already present

- Cyan: `COLORS.electricCyan`
- Blue: `COLORS.electricBlue`
- Green: `COLORS.electricGreen`
- Red: `COLORS.electricRed`
- Purple: `COLORS.electricPurple`
- Yellow: `COLORS.electricYellow`

### Repeated hardcoded values still in feature code

- `#0B1220`
- `#101A2E`
- `#22F0FF`
- `#3B82FF`
- `#6B7280` and `#6b7280`
- `#64748b`
- `#0F172A`

These appear in search, transactions, buy advisor, circles, onboarding, profile, chatbot, dashboard nav, and badge display.

## Repeated spacing and radius values

- Spacing: `p-4/5/6/8/10/12`, `gap-2/3/4/6/8/10`, plus hero values like `py-10`, `py-14`, `px-12`, `pl-28`.
- Radius: `rounded-xl`, `rounded-2xl`, `rounded-3xl`, and arbitrary values from `1.5rem` through `4rem`.
- Biggest outliers: search and buy-advisor.

## Typography values repeated across screens

- Titles: `text-6xl`, `text-5xl`, `text-4xl`, `text-3xl`, `text-2xl`, `text-xl`
- Metadata: repeated `text-[10px]`, `text-[9px]`, uppercase, wide tracking
- Weight drift: heavy `font-black` usage
- Helper copy drift: repeated `text-gray-400` and `text-gray-500`

## Inconsistent button variants

- Shared `Button` sizes are `h-8`, `h-9`, `h-10`, but feature CTAs commonly override to `h-12`, `py-6`, or `py-10`.
- Primary buttons vary between cyan-filled, white-filled, purple-tinted, green-tinted, and outline-like ghost buttons.
- Floating and hero buttons are not represented as shared semantic variants.

Components to consolidate: `AppButtonPrimary`, `AppButtonSecondary`, `AppButtonDanger`, `AppButtonFloating`, `AppButtonHero`.

## Inconsistent input states

- Shared input supports ring, invalid, and disabled states.
- Raw fields often use only `focus:border-cyan-500/50`.
- Placeholder colors vary between `text-gray-500`, `text-gray-600`, `text-gray-700`, `text-gray-800`.
- Dense and large field heights are ad hoc.

Components to consolidate: `AppField`, `AppInput`, `AppTextarea`, `AppSelect`, `AppFieldHint`, `AppFieldError`.

## Inconsistent card treatments

- `Card` uses `rounded-xl border`.
- `ElectricCard` uses `app-card` plus glow and shadow.
- Many nested panels use `app-panel` with additional custom radius and border treatments.
- Cards for lists, metrics, dialogs, and stack views do not share a strict surface hierarchy.

Components to consolidate: `SurfaceCard`, `SurfacePanel`, `SurfaceInset`, `MetricCard`, `ListRowCard`.

## Inconsistent icon sizing and usage

- Nav icons: `16`
- Dense action icons: `14`
- Standard action icons: `18-24`
- Feature hero icons: `28-48`
- Some icons sit in decorated containers; others do not.
- Glow and shadow treatments are inconsistent even within the same screen.

Components to consolidate: `IconBadge`, `StatusDot`, `MetricIcon`.

## Inconsistent animation behaviors

- Route content fade/slide: `DashboardLayout`
- Background ambient line loops: `AmbientEnergyLines`
- Eye tracking and prompt animation: `ZappBot`
- Progress bars and gauges animate on render in analytics, home, targets
- Multiple `whileHover` and `whileTap` patterns are reauthored locally
- `animate-pulse` is used both for loading and decorative indicators

Components to consolidate: `PageEnterMotion`, `InteractiveScale`, `ProgressReveal`, `LoadingSkeleton`.

## Components/screens that should be consolidated first

- Auth forms: `src/features/auth/pages/LoginPage.tsx`, `src/features/auth/pages/SignUpPage.tsx`
- Transaction forms and dialogs: `src/features/transactions/pages/TransactionsPage.tsx`, `src/features/transactions/components/TransactionFeedbackModal.tsx`
- Subscription add panel and subscription cards: `src/features/subscriptions/pages/SubscriptionsPage.tsx`
- Search hero input + evaluate CTA: `src/features/search/pages/SearchPage.tsx`
- Banking call-to-action cluster: `src/features/banking/components/ConnectBankButton.tsx`, `src/features/banking/components/BankConnectionCard.tsx`
- Gamification dialogs: `src/features/gamification/components/TransactionReflectionDialog.tsx`, `src/features/gamification/components/MonthlyTargetsWidget.tsx`, `src/features/gamification/pages/CirclesPage.tsx`
