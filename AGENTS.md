# AGENTS.md

Welcome to the **Sharingan** codebase. This file serves as the definitive
reference manual and instruction set for all AI coding agents and human
developers working on this repository. Follow all rules, architectural
principles, and coding practices outlined below.

---

## 1. Project Mission & Context

**Sharingan** is a high-performance visual mind-mapping and knowledge-graph
Single Page Application (SPA). It provides users with:

- An infinite canvas for conceptual mind maps and hierarchical node graphs.
- Multi-workspace hierarchy with parent (group) and child workspaces.
- Node inspection, markdown notes editor, file/folder attachments, and AI
  ideation assistance.
- Snapshot-based version history with full undo/redo and robust offline-first
  IndexedDB persistence.

### Migration & Refactoring Context

- **Old Repository (Scan & Reference Source):**
  [https://github.com/hamid-shahsavani/sharingan-old/](https://github.com/hamid-shahsavani/sharingan-old/)
- **Mission:** The current repository is a clean, modern reboot. Legacy features
  from `sharingan-old` must be scanned, extracted, and refactored into the new
  architecture adhering to strict modern best practices, removing technical
  debt, and modernizing the technology stack.

---

## 2. Core Technology Stack

| Layer                   | Technology           | Key Details & Version                                                         |
| :---------------------- | :------------------- | :---------------------------------------------------------------------------- |
| **Runtime & Framework** | React 19             | `@types/react: ^19.2`, `react: ^19.2.8`, `react-dom: ^19.2.8`                 |
| **Compiler**            | React Compiler       | `babel-plugin-react-compiler: ^1.0.0` with Vite integration                   |
| **Build Tool**          | Vite 8               | Fast HMR, ESM bundling, path alias `@/*` -> `./src/*`                         |
| **Styling**             | Tailwind CSS v4      | `@tailwindcss/vite: ^4.3.3`, `tailwindcss: ^4.3.3`, `tw-animate-css`          |
| **Component Library**   | Shadcn UI            | Style: `base-nova`, powered by `@base-ui/react`, `@fontsource-variable/geist` |
| **Language**            | TypeScript 6         | Strict type-checking, type-aware linting enabled                              |
| **Icons**               | Lucide React         | `lucide-react: ^1.46.0`                                                       |
| **Quality & Linting**   | ESLint 10 + Prettier | `@typescript-eslint/recommendedTypeChecked`, strict promise and import rules  |

---

## 3. Team Workflow, Task Management & Git Standards

### Portal & Task Tracking

1. **Task Creation:** Before starting any task, an associated task MUST be
   created in the project portal with the target git branch name explicitly
   included in its title.
2. **Timer Policy:** Start the task timer the moment implementation begins; stop
   the timer immediately upon completion.
3. **Timeline Estimation:** An approximate start date and end date must always
   be defined for each task.
4. **Collaborators:** If working alongside another team member, explicitly list
   them in the task's collaborators section.

### Git & Husky Hooks

1. **Branch & Commit Format:** Commit messages and branch names MUST strictly
   conform to team conventions. Husky hooks will reject commits and branch
   creations that fail standard formatting.
2. **Pre-Push ESLint Guard:** ESLint is executed automatically before pushing.
   If any ESLint errors exist anywhere across the repository, the push is
   blocked.

### Linter Integrity (Zero-Tolerance Rules)

1. **No Unauthorized Config Edits:** Never disable, alter, or loosen ESLint
   configuration rules without prior consensus with team members.
2. **No Bypassing / No Any:** Never suppress ESLint rules using inline ignore
   comments (e.g., `eslint-disable`) or by casting variables to `any`. Fix the
   underlying type or lint issue cleanly.

---

## 4. Architecture & Directory Structure Conventions

This project follows a **domain-driven, feature-oriented SPA structure**. Once
the folder structure has been agreed upon, no fundamental architectural changes
may be made without team consensus.

### Global File & Directory Naming Rules

- **Naming Case:** All directory and file names MUST be in strict `kebab-case`.
- **Domain Prefix:** All file names inside domain features MUST be prefixed with
  `<domain>-` (e.g., `mind-map-node-card.tsx`).
- **No Typos:** Zero tolerance for spelling mistakes or typos in any part of the
  project (code, variables, comments, or documentation).
- **Dead Code Elimination:** Any unused file, component, utility, or npm
  dependency must be immediately deleted.
- **Shared Code:** Anything shared across multiple `features/` must be moved
  outside the feature and placed inside `src/shared/` (or `src/components/`,
  `src/lib/`, `src/hooks/`) under its matching category directory.
- **No Barrels:** Never use barrel `index.ts` files that re-export sibling
  modules to avoid circular dependencies.

```text
sharingan/
├── components.json             # Shadcn CLI configuration (base-nova style)
├── eslint.config.js            # Type-checked ESLint configuration
├── vite.config.ts              # Vite + Tailwind + Babel React Compiler setup
├── tsconfig.json               # Path mappings and project references
├── src/
│   ├── app/                    # SPA Shell, application layout, top-level providers
│   │   ├── app.tsx             # Root application component
│   │   ├── app-providers.tsx   # Global providers (theme, workspace initialization)
│   │   └── main.tsx            # Vite DOM entrypoint
│   │
│   ├── components/             # Global reusable design system & primitives
│   │   └── ui/                 # Shadcn base-nova components (button, dialog, input, etc.)
│   │
│   ├── features/               # Product feature domains
│   │   └── <domain>/           # Feature root (e.g., mind-map)
│   │       ├── routes/         # Feature routes & route-level configurations
│   │       ├── pages/          # Feature entry pages
│   │       ├── containers/     # Page sections, modals, drawers, views, forms, tables
│   │       ├── hooks/          # Domain-specific custom hooks (one hook per file)
│   │       ├── schemas/        # Yup validation schemas (one schema per file)
│   │       ├── types/          # Domain TypeScript types & interfaces
│   │       ├── interfaces/     # API Response interfaces exclusively
│   │       ├── apis/           # API fetcher functions (one call per file)
│   │       ├── queries/        # TanStack Queries (one query per file)
│   │       ├── mutations/      # TanStack Mutations (one mutation per file)
│   │       ├── stores/         # Zustand store slices & selectors
│   │       ├── constants/      # Domain constants (UPPER_SNAKE_CASE)
│   │       ├── providers/      # Domain context providers
│   │       ├── utils/          # Pure domain utility functions (function declarations)
│   │       └── assets/         # Domain assets (images/, fonts/)
│   │
│   ├── hooks/                  # App-wide utility hooks
│   ├── lib/                    # Shared core utilities (cn, id generators, errors, storage helpers)
│   └── index.css               # Tailwind v4 theme, OKLCH design tokens, font definitions
```

### Detailed Subdirectory Standards

#### 1. Routes (`routes/`)

- Place route configurations as individual files inside `routes/`.
- If routes require permissions, searchParams, or router state definitions,
  place them in dedicated adjacent files.
- **Route Patterns:**
  - Edit routes: `/:id/edit`
  - Create/Add routes: `/add`
- **Naming:** Route names MUST be singular (never plural) and in `kebab-case`.

#### 2. Hooks (`hooks/`)

- Each custom hook must reside in its own dedicated file.
- **Filename Convention:** Hook filenames must **NOT** start with `use-` (e.g.,
  name the file `workspace.ts` or `mind-map-viewport.ts`, while the exported
  function remains `export const useWorkspace = ...`).

#### 3. Pages (`pages/`)

- Component names must end with the `Page` suffix (e.g., `MindMapPage`).
- Pages are the only components imported directly into router configurations.
  Never import internal feature components directly into the router.

#### 4. Schemas (`schemas/`)

- Exactly **one** schema per file. Never bundle multiple schemas into a single
  file.
- Schema naming suffix: `Schema` (e.g., `createWorkspaceSchema`).
- Schemas must be defined with **Yup**.
- Reusable schemas used across features must live in `src/shared/schemas/` and
  be imported from there.

#### 5. Types (`types/`)

- Sibling types that share logical cohesion should be grouped in a single shared
  file.
- Do not fragment types into unnecessary micro-files; reference specific
  properties using indexed access types (e.g., `Workspace['id']`) when needed.
- **Naming:** Types must be in `PascalCase`.
- **Object Types:** If a type represents an object structure, it MUST be defined
  as an `interface`.
- **API Responses:** API response models do NOT belong in `types/`; they belong
  in `interfaces/`.

#### 6. Interfaces (`interfaces/`)

- **Props & Params:** Component `Props` and hook `Params` MUST be declared
  directly in their respective component/hook file as an `interface` (never in
  external files or inline objects).
- **Directory Scope:** The `interfaces/` directory is reserved **exclusively**
  for API response definitions.
- **One per File:** Each API response model must be in its own dedicated file.
- **Suffix Standards:**
  - Component props: `Props` (e.g., `MindMapNodeCardProps`)
  - Hook parameters: `Params` (e.g., `UseViewportParams`)
  - API responses: `Response` (e.g., `GetWorkspaceResponse`)

#### 7. Constants (`constants/`)

- Constant names must be in uppercase snake case: `UPPER_SNAKE_CASE`.

#### 8. Providers (`providers/`)

- Exactly one React Context Provider per file.
- Provider component names must end with `Provider` (e.g., `MindMapProvider`).

#### 9. APIs (`apis/`)

- Exactly one API request function per file.
- Function name suffix: `Api` (e.g., `getWorkspaceDetailsApi`).
- Must utilize the shared `fetcher` client unless handling an exceptional
  non-standard protocol.
- Do not trigger toast notifications inside the API function; toast error
  handling belongs in the local fetcher or calling mutation.
- Always return `response.data`. Do not add manual conditional checks to throw
  errors beforehand, as backend APIs provide standard error payloads.

#### 10. Assets (`assets/`)

- No non-English or Persian file names. Use concise, descriptive English
  filenames.
- Subdirectories: `images/` for images, `fonts/` for fonts.

#### 11. Utilities (`utils/`)

- Group cohesive utility functions (e.g., date helpers) in a shared file;
  otherwise keep individual utilities in separate files.
- All utility functions MUST be declared using standard `function` declarations
  (do not use arrow functions for utilities).

---

## 5. UI Architecture, Containers & Forms

### Containers Directory (`containers/`)

The `containers/` directory houses complex page sections that are assembled in
`pages/`. Permitted container subdirectories are:

- `modals/`
- `views/`
- `forms/`
- `tables/`
- `drawers/`

#### 1. Modals (`containers/modals/`)

- Component suffix: `Modal` (e.g., `CreateWorkspaceModal`).
- Modals must be built using the standard `base-modal` component.
- Props: accepts `isOpen` and `onClose`, controlled via `useRouterSearchParams`.
- When fetching backend data for a modal, pass the resource `id` through search
  params.
- If the modal contains a form that needs resetting with list/item data, pass a
  `data` prop.
- **Lazy Loading:** All modals MUST be lazily loaded (`React.lazy`) at their
  import site.
- **Delete Confirmation:** For all deletion flows, standard
  `delete-confirmation` modal must be used.

#### 2. Views (`containers/views/`)

- Component suffix: `View` (e.g., `WorkspaceDetailView`).
- Must use `base-view`, dedicated exclusively to displaying detailed properties
  of table/list items.
- Props: accepts `isOpen` and `onClose`, controlled via `useRouterSearchParams`.
- Receives resource `id` via search params when fetching backend details.
- Inner elements must be structured with `base-view-item` components to
  guarantee uniform styling.
- All views MUST be lazily imported.

#### 3. Forms (`containers/forms/`)

- Component suffix: `Form` (e.g., `EditWorkspaceForm`).
- All forms must be managed via `react-hook-form` paired with a `yup` validation
  schema.
- Form fields must use shared design system components (`src/components/ui/`).
- Required fields must receive an explicit `isRequired` prop.
- **Double-Submit Prevention:** Form submit buttons must be disabled during
  submission/loading states.
- **Multi-Form Pages:** Pages containing sequential form steps must utilize
  `base-stepper`.
- **Reset on Close:** Form state must reset whenever the containing modal/drawer
  triggers `onClose`.
- **Standard Button Labels:**
  - Create / Add actions: `"ایجاد"`
  - Edit / Update actions: `"ثبت تغییرات"`

#### 4. Tables (`containers/tables/`)

- Component suffix: `Table` (e.g., `WorkspacesTable`).
- Handled via a unified, reusable TanStack Table wrapper component.
- All table filtering, sorting, and pagination MUST be driven through
  `useRouterSearchParams`.

#### 5. File Uploads

- All file uploads must be handled via the shared `attachment` component for
  uniform UX.
- Upload requests must be sent as JSON payloads; do NOT submit raw multipart
  `form-data` directly from pages or UI containers.

---

## 6. Data Fetching, State Management & Routing

### TanStack Query (`queries/`)

- Exactly **one** query per file.
- Suffix: `Query` (e.g., `useWorkspaceListQuery`).
- **Key Object:** At the top of the file, define a local `key` object containing
  unique `kebab-case` query keys:
  ```typescript
  const key = {
    list: 'workspace-list',
    single: 'workspace-detail',
  } as const;
  ```
- Pass any dynamic filters into subsequent array indices of `queryKey`.
- Use the `enabled` option for conditional fetching.
- When querying single items by ID, pass `id` into params and enforce
  `enabled: Boolean(id)`.
- **No Destructuring:** Do NOT destructure TanStack query hook returns in
  consumer components:
  ```typescript
  // Correct:
  const workspaceQuery = useWorkspaceDetailQuery({ id });
  if (workspaceQuery.isLoading) return <Spinner />;

  // Prohibited:
  const { data, isLoading } = useWorkspaceDetailQuery({ id });
  ```

### TanStack Mutation (`mutations/`)

- Exactly **one** mutation per file.
- Suffix: `Mutation` (e.g., `useUpdateWorkspaceMutation`).
- Define a local `key` object at the top of the file with unique `kebab-case`
  keys.
- **Success Feedback:** Always trigger a custom success toast upon mutation
  completion.
- **Cache Invalidation:** Invalidate relevant query keys upon successful
  mutation.
- **No Destructuring:** Do NOT destructure mutation hook returns in consumer
  components.

### Global State & Zustand (`stores/`)

- Suffix: `Store` (e.g., `useMindMapStore`).
- Global client state must be managed with Zustand.
- **Minimalism:** Avoid Zustand unless URL search params, router state, or deep
  prop drilling make it strictly necessary.
- **Selectors & Reducers:** Store reducers and selectors must be defined inside
  the store slice. Never perform ad-hoc state mutations or read entire store
  states without specific selectors.
- **Atomic Subscriptions:** Components must subscribe only to the precise state
  slice or action they consume.

### URL Search Params & Router State

1. **Custom Hooks Exclusively:** Never read or mutate `location.state` or URL
   search params directly from `react-router-dom` or `nuqs`. Always use the
   project's standard custom hooks:
   - `useRouterSearchParams()`
   - `useRouterState()`
2. **Search Params Key Format:** All search param keys MUST be in `snake_case`.
3. **Restricted Search Param Scope:** `useRouterSearchParams` is permitted ONLY
   for:
   - **Base Tables:**
     - Filters: `filter_<name>`
     - Sorting: `sort_<column>`
     - Pagination: `pagination_limit`, `pagination_page` (Never use `per_page`
       in URL parameters. Map `pagination_limit` to `per_page` only when
       constructing backend API payloads).
   - **Base Modals & Base Drawers:**
     - `is_open`
     - `id`
     - `data`
4. **Router State:** Prefer passing state objects during navigation over calling
   manual `setRouterState` setters.

---

## 7. Coding Standards & Syntax Best Practices

### TypeScript & Type Rules

- **No `any`:** Under no circumstances use `any`. Use `unknown` with type guards
  or discriminated unions.
- **Discrete Sets:** Use strict TypeScript `union` types for finite sets of
  options.
- **Key-Value Objects:** Prefer `Record<string, V>` for key-value maps with
  dynamic keys.
- **Type Narrowing & Assertions:** Avoid non-null assertion `!`; always prefer
  optional chaining `?.`. Only use `!` if non-null existence is strictly
  guaranteed by preceding invariant assertions.
- **Function Return Types:** Explicitly define return types on all functions.
  (Exceptions: React component functions and void event handlers).

### Props & Parameters

- Props and parameters MUST be defined as an `interface` in the same file. Never
  use inline type objects.
- Props must be destructured directly in the component parameter list.
- **Boolean Props:** Must be prefixed with `is`, `has`, or `can` (e.g.,
  `isOpen`, `hasAccess`, `canEdit`).
- **Callback Props:** Must be prefixed with `on` (e.g., `onSubmit`, `onClose`,
  `onNodeSelect`).

### React Components

- All components MUST be defined as arrow functions:
  ```typescript
  export const MindMapNodeCard = ({
    node,
    isSelected,
  }: MindMapNodeCardProps) => {
    // ...
  };
  ```
- **Decomposition:** If a component grows large or complex, break it down into
  smaller sub-components. If private to that component, place sub-components at
  the bottom of the same file. If reused elsewhere, extract them to
  `components/`.

### Variables & Naming Conventions

- Default to `const`. Use `let` only when variable reassignment is strictly
  required.
- Variables must use `camelCase` (except constants which are
  `UPPER_SNAKE_CASE`).
- **Action Handlers:** Event handling functions must be prefixed with `handle`
  (e.g., `handleNodeClick`, `handleSubmit`).
- **Booleans:** Must start with `is` (e.g., `isActive`, `isVisible`).
- **Arrays:** Must be plural nouns ending with `s` (e.g., `nodes`,
  `selectedIds`).
- **State Pairs:** Standard React state naming:
  `const [item, setItem] = useState(...)`.
- **Refs:** Ref variables must end with `Ref` (e.g., `containerRef`).
- **DOM Elements:** DOM element variables must end with `Element` (e.g.,
  `scrollElement`).
- **Dates:** Date variables must end with `Date` (e.g., `createdDate`,
  `expiryDate`).
- **Form Events:** Form event arguments must be named `event`.

### Import & Export Rules

- **No Default Exports:** Never use `export default`. Use named exports
  exclusively.
- **Inline Exports:** Export directly at the point of declaration
  (`export const ...`).
- **No Cross-Route Couplings:** Feature routes must never import directly from
  sibling routes. Common dependencies must be placed in `src/shared/`.

### Comments & Code Hygiene

- Code must be self-explanatory and clean; avoid redundant explanatory comments.
- **AI-Generated Code:** AI agents must NOT produce explanatory code comments.
- **No Commented-Out Code:** Never leave dead or commented-out code in files.
  Delete unused code completely.

### Styling & Design Consistency

- Maintain strict layout consistency: uniform padding, margin scales, and gap
  tokens across all views.
- **Animations:** Do not mix animation libraries. Avoid Framer Motion unless
  applied uniformly across the entire application; prefer Tailwind v4
  lightweight CSS transitions.
- **Conditional Classes:** Conditional Tailwind classes must ALWAYS be merged
  using the `cn()` utility.

---

## 8. Refactoring Playbook: Upgrading from `sharingan-old`

When porting or refactoring features from the old codebase
([hamid-shahsavani/sharingan-old](https://github.com/hamid-shahsavani/sharingan-old/)),
follow these mandatory rules:

### A. Store Lifecycle & Async Initialization

- **Legacy Issue:** `sharingan-old` initialized IndexedDB and workspace state
  inside an unhandled async IIFE directly in `create()` in `mind-map-store.ts`.
  This caused race conditions, untracked errors, and testing friction.
- **Refactored Standard:** Create the Zustand store with clean initial/idle
  state. Workspace and document loading must be driven by an explicit
  initialization service or React hook (e.g., `useInitializeWorkspace` in
  `AppProviders`). Expose explicit loading, error, and ready states.

### B. Shadcn & Base-UI Primitives

- **Legacy Issue:** `sharingan-old` had hand-rolled UI primitives under
  `features/_shared/_uis/` combining Radix and Base-UI inconsistently.
- **Refactored Standard:** Use standard components generated via the `shadcn`
  CLI into `src/components/ui/` with the configured `base-nova` style and
  `@base-ui/react`. Style them using Tailwind v4 utility tokens and `cn()`.

### C. React 19 & React Compiler Best Practices

- **Legacy Issue:** Overuse of manual memoization (`useCallback`, `useMemo`) and
  state synchronization in effects.
- **Refactored Standard:** Trust the Babel React Compiler. Write idiomatic,
  clean React code without premature `useMemo`/`useCallback` unless needed for
  external subscription stability. Keep component render functions pure without
  side-effects.

### D. Graph Rendering & XYFlow

- When bringing over `@xyflow/react` and `@dagrejs/dagre`:
  - Clearly separate visual canvas state (node coordinates, viewport zoom/pan)
    from semantic graph state (hierarchy, parent-child links, node content).
  - Use custom edge components (`mind-edge.tsx`) with SVG path optimizations.
  - Implement handles with explicit semantic roles (`parent-source`,
    `parent-target`, `relation-source`, `relation-target`).

### E. Persistence & Offline History

- Keep IndexedDB repositories modular:
  - `workspaces`: Parent/child workspace records.
  - `documents`: Current mind-map nodes and connections.
  - `versions`: Named or timestamped snapshots for rollback.
  - `settings`: User preferences, theme, and API keys.
- Enforce the debounced auto-save policy with clear `isDirty` and `isSaving`
  visual feedback.
- Preserve Persian / RTL label compatibility (e.g., default workspace name
  `'ورک‌اسپیس اصلی'`).

---

## 9. Essential Agent Commands & Runbook

AI agents can verify and run tasks using the following package scripts:

| Command                | Purpose                                      | When to Run                                  |
| :--------------------- | :------------------------------------------- | :------------------------------------------- |
| `npm run dev`          | Starts Vite development server               | Manual inspection & browser subagent testing |
| `npm run build`        | Runs TypeScript compilation & Vite build     | After substantial structural changes         |
| `npm run lint`         | Runs ESLint across all files                 | Before completing any task                   |
| `npm run lint:fix`     | Automatically fixes auto-fixable lint issues | To resolve import and formatting lints       |
| `npm run format`       | Runs Prettier across the repository          | To ensure consistent formatting              |
| `npm run format:check` | Checks formatting without writing            | In CI / verification checks                  |

---

## 10. Working Rules for AI Agents

1. **No Automatic Commits:** Do **NOT** run `git commit` or create git commits
   automatically unless the user explicitly asks you to commit.
2. **Scan First, Code Second:** When refactoring a feature, consult the cloned
   reference source from `sharingan-old` to understand requirements, edge cases,
   and schemas before writing the new implementation.
3. **Preserve Integrity:** Never break existing type safety or leave broken
   build/lint states.
4. **Clickable Links:** When reporting modified or created files to the user,
   always provide clickable Markdown links with the `file://` scheme (e.g.
   `[main.tsx](file:///c:/Users/hamid/Documents/projects/sharingan/src/main.tsx)`).
