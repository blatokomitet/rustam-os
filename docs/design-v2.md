# RUSTAM OS 2.0 — mobile design architecture

## Source of truth
This branch changes the existing **React/Vite demo**; it does not claim to add Clerk, a backend, or server synchronization. Existing localStorage keys must remain compatible.

## Navigation
Five proposed primary destinations: Today (overview), Work, Plan (tasks/calendar), Analytics (finance), Profile (habits/goals/settings). Implement as feature modules in a subsequent functional migration, with deep links and accessibility tests.

## Tokens
Canvas #090B10; surface #12151D; cards #1A1E29; text #F5F7FA; muted #939BAA; accent #A3E635; info #60A5FA; warning #F59E0B; error #EF4444. Minimum interactive target 44px; reduced-motion support.

## Roadmap
1. Premium dark visual foundation (implemented on this branch).
2. Extract monolithic src/main.tsx into app/, design-system/, features/, shared/ without changing persistence.
3. Five-tab navigation, responsive bento dashboard, accurate real-data KPI cards.
4. Work shifts, projects, calendar, finance, goals, habits, and character.
5. Automated tests, accessibility audit, visual regression, deploy preview, production promotion.

## Design reference categories
Dribbble productivity dashboards, project management, habit tracking, fintech dark mode, mobile task management. Use patterns as inspiration, not copied artwork.

## Acceptance criteria
No hard-coded fictional balances presented as live metrics; no broken localStorage migrations; keyboard support; mobile 320px+; Playwright screenshots; tests and Vite build passing before merge.
