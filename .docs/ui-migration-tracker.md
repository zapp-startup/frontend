# UI Migration Tracker

## Foundation

- Semantic theme aliases and shared surface/text helpers: `done`
- Light-mode patch selector removal: `done`
- Visible scrollbar restoration: `done`
- Shared system layer under `src/shared/components/system`: `done`

## Migrated screens/components

- `src/features/auth/pages/LoginPage.tsx`: `done`
- `src/features/auth/pages/SignUpPage.tsx`: `done`
- `src/features/search/pages/SearchPage.tsx`: `done`
- `src/features/transactions/components/TransactionFeedbackModal.tsx`: `done`
- `src/features/gamification/components/MonthlyTargetsWidget.tsx`: `done`

## Compatibility updates

- `src/features/home/components/ElectricCard.tsx` now composes shared surface variants: `done`
- `src/app/App.tsx` toaster theme hardcoding removed: `done`

## Remaining high-priority migration targets

- `src/features/subscriptions/pages/SubscriptionsPage.tsx`
- `src/features/transactions/pages/TransactionsPage.tsx`
- `src/features/gamification/pages/CirclesPage.tsx`
- `src/features/gamification/components/TransactionReflectionDialog.tsx`
- `src/features/dashboard/layout/DashboardLayout.tsx`
- `src/features/banking/components/*`
- `src/features/profile/pages/ProfilePage.tsx`
- `src/features/home/pages/HomePage.tsx`
- `src/features/analytics/pages/AnalyticsPage.tsx`

## Verification completed

- `npm run build`
- `npm run test:run -- src/shared/__tests__/theme.test.tsx src/shared/__tests__/system.test.tsx src/features/auth/__tests__/SignUpPage.test.tsx`
