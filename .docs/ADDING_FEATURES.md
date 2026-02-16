# Adding features and finding files

See **STRUCTURE.md** in the project root for the full layout and migration plan. This page is a short checklist for day-to-day work.

## Adding a new feature (new area of the app)

1. Create a folder: `src/features/<feature-name>/`.
2. Add at least:
   - `pages/<Name>Page.tsx` for the main screen(s).
   - `index.ts` that exports the page(s) (and any context/hooks you want public).
3. Register the route in `App.tsx` (public routes) or in `DashboardLayout.tsx` (dashboard routes).
4. If the feature has its own components, add `src/features/<feature-name>/components/` and keep them there.

## Adding a new page to an existing feature

1. Create `src/features/<feature>/pages/<NewName>Page.tsx`.
2. Export it from `src/features/<feature>/index.ts`.
3. Add the route in the same place other routes for that feature are defined (e.g. dashboard layout).

## Adding shared UI or logic

- **Used in 2+ features** → put in `src/shared/`:
  - Components → `shared/components/ui/` or `shared/components/layout/`
  - Hooks → `shared/hooks/`
  - Utils/constants → `shared/lib/`
  - Types → `shared/types/`
- **Used in one feature** → keep under `src/features/<feature>/components/` or `.../hooks/`.

## Finding files

| Looking for…              | Look in…                              |
|---------------------------|----------------------------------------|
| A page (e.g. Login)       | `src/features/<feature>/pages/`       |
| API calls for a domain    | `src/api/<domain>.api.ts`              |
| Shared Button, Input, etc.| `src/shared/components/ui/`            |
| Auth state / provider     | `src/features/auth/` (or `app/context` before migration) |
| Dashboard shell / nav     | `src/app/layout/` or `src/features/dashboard/layout/` |
| Theme / colors            | `src/shared/theme.ts` (or `app/theme.ts` before migration) |

## Imports

Use the `@/` alias so paths stay stable when you move files:

- `@/shared/components/ui/button`
- `@/features/auth/pages/LoginPage`
- `@/api/client`
