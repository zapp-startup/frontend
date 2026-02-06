# Guidelines

Use this file to give the AI rules and conventions for this project. Keep it focused—only the most important rules.

---

# General guidelines

* Prefer responsive layouts with flexbox and grid; use absolute positioning only when needed.
* Refactor as you go: keep files small and move helpers/components into their own files.
* Use React Router (`NavLink`, `useLocation`, `Routes`, `Route`) for navigation and URL-based pages.
* Prefer TypeScript types for props and state; avoid `any` where possible.

---

# Design system (Zapp)

* **Base font:** System sans; support a base font-size of 14px where relevant.
* **Dates:** Use short formats like “Jun 10” unless a longer format is required.

## Colors and theme

* **Background:** Primary `#0B1220`; cards/surfaces `#101A2E` with subtle borders (`border-white/[0.03]`–`/10`).
* **Accent palette:** Electric cyan `#22F0FF`, green `#3CFF9E`, red `#FF4D4D`, blue `#3B82FF`, purple `#B47CFF`, teal `#00FFD1`, yellow `#FFE066`.
* **Glow:** Use soft/medium glow on interactive elements and cards (e.g. `box-shadow` with accent color).
* **Text:** White for primary, gray-400/500 for secondary; accent colors for status and highlights.

## Typography

* **Headings:** `font-black`, tight tracking where appropriate; section labels in `uppercase`, `tracking-[0.2em]`–`[0.4em]`, small caps (`text-[10px]`).
* **Body:** Clear hierarchy with font weight and size; avoid long unbroken blocks.

## Components

* **Cards:** Rounded corners (e.g. `rounded-[2.5rem]`), border, subtle glow, hover lift/shadow.
* **Buttons:** Uppercase labels with tracking; primary = filled accent, secondary = outline or muted.
* **Nav:** Active state with background pill and accent icon; use `NavLink` with `end` for home.

## Layout and motion

* Use motion (e.g. Framer Motion) for page transitions and micro-interactions; keep duration ~0.3–0.5s and easing consistent.
* One primary action per section; secondary actions visually de-emphasized.
