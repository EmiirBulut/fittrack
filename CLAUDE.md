# Claude Instructions — FitTrack

> Stack: React 18, TypeScript, Vite, TanStack Query, Zustand, React Hook Form + Zod, React Router v6, Ant Design 5, Supabase
> Place this file at the root of the repository.

---

## 1. Project Overview

FitTrack is a personal fitness tracking web application. A single user manages their own exercise library, builds custom workout programs from those exercises, and executes workouts with a real-time timer/rep tracker. Completed sessions are stored and used to calculate streaks and statistics on the dashboard.

**Key characteristics:**
- Single-user application with Supabase Auth (email/password).
- No backend server — all data lives in Supabase (PostgreSQL + Auth).
- Deployed as a static site via Vercel or Netlify.
- No collaboration, no sharing, no multi-tenancy.

---

## 2. Project Structure

```
src/
├── assets/
│   └── styles/           # Global CSS overrides for Ant Design tokens
├── components/
│   ├── ui/               # Shared base wrappers (AntTimerButton, AntVideoEmbed, etc.)
│   └── layout/           # AppLayout, AuthLayout, Sidebar, TopNav
├── features/
│   ├── auth/             # Login page, auth helpers
│   ├── dashboard/        # Streak card, stats summary, recent activity
│   ├── exercises/        # Exercise list, add/edit exercise drawer
│   ├── workouts/         # Workout list, workout builder
│   └── active-workout/   # Active session screen, timer, video embed, progress
│       └── [feature]/
│           ├── components/
│           ├── hooks/
│           ├── types/
│           └── api/
├── hooks/                # Global hooks (useAuth, useStreak)
├── lib/                  # Utility functions, helpers, constants, formatters
│   ├── queryKeys.ts      # All TanStack Query key constants
│   ├── supabase.ts       # Supabase client singleton
│   └── streakUtils.ts    # Streak calculation helpers
├── pages/                # Route-level page components (thin wrappers over features)
├── router/               # React Router v6 config, route constants, ProtectedRoute
├── store/                # Zustand: auth session, active workout state, UI prefs
├── types/                # Global TypeScript types matching Supabase table shapes
└── main.tsx
```

---

## 3. TypeScript

- Always use **strict TypeScript** — no `any`, no `as unknown` suppression.
- Define types/interfaces in the relevant `types/` folder — not inline in components.
- Use `interface` for object shapes, `type` for unions, intersections, and aliases.
- All function parameters and return types must be explicitly typed.
- Supabase response types must be derived from the generated `Database` type — never leave query results untyped.
- Use `Database['public']['Tables']['table_name']['Row']` pattern for table row types.

---

## 4. Components

- Use **functional components** exclusively. No class components.
- One component per file. Filenames use **PascalCase**: `ExerciseCard.tsx`, `WorkoutBuilderStep.tsx`.
- Keep components focused on a single visual responsibility. Split if doing more than one thing.
- Always define a `Props` interface for every component, even with a single prop.
- Use destructuring in the function signature:

```tsx
interface Props {
  exerciseId: string;
  isActive: boolean;
}
const ExerciseCard = ({ exerciseId, isActive }: Props) => { ... }
```

### Naming Conventions

| Element | Pattern | Example |
|---|---|---|
| Components | PascalCase | `ExerciseCard`, `WorkoutBuilderModal` |
| Hooks | `use` prefix | `useExercises`, `useActiveWorkout` |
| Event handlers | `handle` prefix | `handleStartWorkout`, `handleCompleteStep` |
| Boolean props/state | `is/has/can` prefix | `isActive`, `hasVideo`, `canSkip` |
| Route constants | SCREAMING_SNAKE_CASE | `ROUTES.DASHBOARD`, `ROUTES.ACTIVE_WORKOUT` |
| Query keys | SCREAMING_SNAKE_CASE constant | `QUERY_KEYS.EXERCISES`, `QUERY_KEYS.WORKOUTS` |

---

## 5. State Management

- **Server state** → TanStack Query (`useQuery` for reads, `useMutation` for writes).
- **Global client state** → Zustand: auth session, active workout session state (current step index, elapsed time, is paused), UI preferences.
- **Local UI state** → `useState` (drawer open/close, toggles) or `useReducer` (complex local logic like timer state machine).
- Do not use Zustand for server data. Do not use TanStack Query for pure client state.
- Keep Zustand slices flat. No deeply nested state.
- Always define `queryKey` arrays as constants in `lib/queryKeys.ts` — never inline strings.
- Active workout session state (current step, timer) lives in Zustand — it is ephemeral client state, not server state.

---

## 6. Data Layer (Supabase)

- All Supabase calls go through typed helper functions in `features/[feature]/api/`.
- Import the singleton client from `lib/supabase.ts` — never instantiate `createClient` elsewhere.
- No raw Supabase calls outside the `api/` layer.
- Wrap API functions in `useQuery`/`useMutation` hooks inside `features/[feature]/hooks/`.
- Always invalidate or update related query cache after mutations.
- Use Supabase Row Level Security (RLS): every table has a policy restricting reads/writes to `auth.uid() = user_id`.
- Never expose the Supabase `service_role` key on the frontend — use only the `anon` key.
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Supabase Table Shapes

```ts
// exercises
interface Exercise {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  youtube_url: string | null;  // stored as-is; transformed to embed URL in util
  image_url: string | null;
  created_at: string;
}

// workouts
interface Workout {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// workout_steps  (ordered list of exercises/rest blocks in a workout)
interface WorkoutStep {
  id: string;
  workout_id: string;
  exercise_id: string | null;  // null when step_type = 'rest'
  step_type: 'exercise' | 'rest';
  order_index: number;
  duration_seconds: number | null;  // used when tracking_type = 'duration' or step_type = 'rest'
  reps: number | null;              // used when tracking_type = 'reps'
  tracking_type: 'duration' | 'reps';
}

// workout_sessions  (completed workout log)
interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  completed_at: string;   // ISO date string — used for streak calculation
  duration_seconds: number;
}
```

---

## 7. Authentication

- Supabase Auth with email/password.
- Auth state is managed by a Zustand `authStore` slice that listens to `supabase.auth.onAuthStateChange`.
- `ProtectedRoute` component checks `authStore.session`; unauthenticated users are redirected to `/login`.
- On logout: clear TanStack Query cache (`queryClient.clear()`), reset Zustand auth state, navigate to `/login`.
- Never store tokens manually — Supabase handles this via its own storage.

---

## 8. Forms

- All forms use **React Hook Form**.
- All validation uses **Zod**. Define schema first, derive the type with `z.infer<typeof schema>`.
- Error messages come from the Zod schema — never hardcode error strings in JSX.
- Never validate manually with `if` checks in submit handlers.
- Use Ant Design form items as visual wrappers; bind `Controller` from React Hook Form for controlled inputs.

---

## 9. Routing

- Router: React Router v6 with `createBrowserRouter`.
- All route path strings live in `router/routes.ts` as constants — never hardcoded elsewhere.
- Use `React.lazy` + `Suspense` for all page-level components.
- `ProtectedRoute` wrapper checks auth state; unauthenticated users redirect to `/login`.

```
/login                    → AuthLayout
/                         → AppLayout → DashboardPage
/exercises                → AppLayout → ExercisesPage
/workouts                 → AppLayout → WorkoutsPage
/workouts/new             → AppLayout → WorkoutBuilderPage
/workouts/:workoutId/edit → AppLayout → WorkoutBuilderPage
/workouts/:workoutId/start → AppLayout → ActiveWorkoutPage  (full-screen, no sidebar)
```

### Layout assignment per route

- `/login` → `AuthLayout` (centered card, no nav)
- All other routes → `AppLayout` (fixed sidebar 220px + content area)
- `/workouts/:workoutId/start` → `AppLayout` but sidebar is hidden; full content width

---

## 10. Design System — Ant Design 5

- Use **Ant Design 5** for all UI components. Do not use Tailwind CSS.
- Customize the Ant Design theme via the `theme` prop on `ConfigProvider` in `main.tsx`.
- Never override Ant Design styles with inline styles or arbitrary CSS classes — use the theme token system.
- Component-level style overrides go in `assets/styles/antd-overrides.css` if token customization is insufficient.

### Theme Tokens

```ts
// src/lib/antdTheme.ts
import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#475949',
    colorBgBase: '#fafaf5',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f4f4ef',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      bodyBg: '#f4f4ef',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e8ede8',
      itemSelectedColor: '#475949',
      itemHoverBg: '#f0f4f0',
    },
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
    },
  },
};
```

### Typography

- Display/headline text: `fontFamily` override to `'Bricolage Grotesque', system-ui, sans-serif` via inline style or a CSS class `.display-font`.
- Body/label text: `Inter` (set as default `fontFamily` token).
- Import both fonts from Google Fonts in `index.html`.

### Design Rules

- No 1px divider lines between sections. Use background color shifts (`colorBgLayout` vs `colorBgContainer`) to create visual separation.
- No high-intensity box-shadows. Use Ant Design's built-in subtle elevation where needed.
- Card borders: use `bordered={false}` on `<Card>` components; rely on background contrast.
- Use `<Space>` and `<Flex>` for layout within components; use `<Row>` / `<Col>` for page-level grid.
- Minimum 24px horizontal margin on all content areas.

---

## 11. Active Workout Feature

This is the most complex feature. Key rules:

- **Timer state machine** lives in Zustand (`activeWorkoutStore`). States: `idle | running | paused | completed`.
- On step completion (timer reaches 0 or user marks reps done), automatically advance to the next step.
- Rest steps: timer counts down automatically. No user input required.
- Exercise steps with `tracking_type = 'duration'`: timer counts down.
- Exercise steps with `tracking_type = 'reps'`: show rep count + a "Done" button. No automatic advance.
- YouTube embed: transform stored URL (`youtube.com/watch?v=ID`) to embed URL (`youtube.com/embed/ID`). Helper: `lib/youtubeUtils.ts → getYouTubeEmbedUrl(url: string): string | null`.
- Video is shown in an iframe alongside the timer. Never open YouTube in a new tab.
- On workout completion: write a `WorkoutSession` record to Supabase, then navigate to a completion summary screen.

---

## 12. Streak Calculation

Streak logic lives entirely in `lib/streakUtils.ts`.

```ts
// Given an array of completed_at ISO strings, return current streak (days)
export function calculateStreak(completedDates: string[]): number

// Return total sessions, this week sessions, longest streak
export function calculateStats(sessions: WorkoutSession[]): WorkoutStats
```

- A "day" is determined by the user's local timezone (use `toLocaleDateString()`).
- Streak increments if there is at least one completed session on each consecutive calendar day up to and including today.
- Streak resets to 0 if yesterday has no completed session (and today also has none).
- If today already has a session, the streak is maintained.

---

## 13. Error Handling

- All async operations must handle error state explicitly in the UI.
- Use TanStack Query `isError` / `error` states — never silently swallow errors.
- Show user-friendly inline error messages — never raw Supabase error strings.
- Never use empty `catch` blocks.
- On Supabase auth error: show message and remain on login page.
- On data fetch error: show Ant Design `<Alert type="error">` inline, with a retry option.

---

## 14. Performance

- `React.memo`, `useCallback`, `useMemo` only when there is a measurable reason — not by default.
- Lazy-load all page components via `React.lazy`.
- Keep state as local as possible to avoid unnecessary re-renders.
- The active workout timer uses `setInterval` via a custom `useTimer` hook. Clear the interval on component unmount and when the workout is paused/completed.

---

## 15. Code Cleanliness

- No `console.log` in committed code.
- No commented-out code blocks without an explanation comment.
- No unused imports or variables.
- Destructure props and objects instead of repeated dot-notation access.
- Extract complex logic into named variables or helper functions before the JSX `return`.

---

*Last updated: 2026-05-19*
