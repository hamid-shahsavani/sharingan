# Architecture & Directory Structure Conventions

This project follows a strict **tripartite feature-driven architecture**. All
application logic, UI, state, and assets are strictly partitioned inside
`src/features/` across three distinct domains. Once this folder structure has
been agreed upon, no architectural deviations or unauthorized folders may be
introduced.

---

## 1. Global Architectural & Directory Rules

- **Strict Feature Partitioning (`src/features`):** The entire application logic
  is partitioned into exactly three feature scopes:
  1. `main/`: The core content and domain of the application (e.g.,
     canvas, nodes, edges, viewports, graph management).
  2. `layout/`: Everything related to the application shell layout (headers,
     sidebars, toolbars, docks, floating panels).
  3. `shared/`: Everything shared between `main` and `layout` (e.g., base UI
     primitives `_uis/`, shared assets `_assets/`, common hooks `_hooks/`,
     cross-domain components `_components/`).
- **Underscore Prefix for Internal React/Feature Folders:** All structural
  directories created inside `main/`, `layout/`, and `shared/` MUST start with
  an underscore (`_`), for example:
  - `_components/` (feature components)
  - `_hooks/` (custom hooks)
  - `_assets/` (images, fonts, static assets)
  - `_uis/` (shared base UI primitives such as buttons, dialogs, inputs)
  - `_types/` (domain and TypeScript type definitions)
  - `_stores/` (Jotai state stores & atoms)
  - `_schemas/` (Zod validation schemas)
  - `_utils/` (pure utility functions)
- **Strict Prohibition of Outside Folders:** Outside of `src/features/`,
  **ABSOLUTELY NO OTHER FOLDERS** may be created!
  - Directories such as `src/components`, `src/hooks`, `src/lib`, `src/shared`,
    or `src/utils` at the `src/` root are strictly forbidden.
  - The only allowed items in `src/` are:
    - `src/features/` (the three feature folders: `main`, `layout`, `shared`)
    - `src/main.tsx` (Vite DOM entrypoint & SPA shell)
    - `src/index.css` (global styles & Tailwind v4 theme)
- **Naming Case:** All directory and file names MUST be in strict `kebab-case`.
- **Domain Prefix:** All file names inside features MUST be descriptive and in
  `kebab-case`.
- **No Typos:** Zero tolerance for spelling mistakes or typos in any part of the
  project (code, variables, comments, or documentation).
- **Dead Code Elimination:** Any unused file, component, utility, or npm
  dependency must be immediately deleted.
- **No Barrels:** Never use barrel `index.ts` files that re-export sibling
  modules to avoid circular dependencies.

---

## 2. Master Directory Tree

```text
sharingan/
├── components.json                 # Shadcn CLI configuration (base-nova style)
├── eslint.config.js                # Type-checked ESLint configuration
├── vite.config.ts                  # Vite + Tailwind + Babel React Compiler setup
├── tsconfig.json                   # Path mappings and project references
├── src/
│   ├── features/                   # Sole home for all project logic (strictly 3 domains)
│   │   │
│   │   ├── main/                   # Core main content & domain (canvas, nodes, graphs)
│   │   │   ├── _components/        # Main domain components (canvas.tsx, node-card.tsx)
│   │   │   ├── _hooks/             # Main domain hooks
│   │   │   ├── _stores/            # Jotai state atoms & stores for main domain
│   │   │   ├── _types/             # Domain TypeScript interfaces
│   │   │   └── ...                 # Any internal folder prefixed with '_'
│   │   │
│   │   ├── layout/                 # Layout & chrome elements (header, sidebar, docks)
│   │   │   ├── _components/        # Layout components (header.tsx, sidebar.tsx, dock.tsx)
│   │   │   ├── _hooks/             # Layout state & interaction hooks
│   │   │   ├── _stores/            # Layout view state stores
│   │   │   └── ...                 # Any internal folder prefixed with '_'
│   │   │
│   │   └── shared/                 # Shared between main and layout
│   │       ├── _uis/               # Shadcn / Base-UI primitives (button.tsx, dialog.tsx)
│   │       ├── _assets/            # Shared assets (images/, fonts/, icons/)
│   │       ├── _components/        # Reusable composite UI components
│   │       ├── _hooks/             # Shared utility hooks
│   │       ├── _types/             # Shared TypeScript types & interfaces
│   │       ├── _utils/             # Pure shared utilities (cn, helpers)
│   │       └── ...                 # Any internal folder prefixed with '_'
│   │
│   ├── index.css                   # Tailwind v4 theme, OKLCH design tokens, font definitions
│   └── main.tsx                    # Vite DOM entrypoint
```

---

## 3. Subdirectory Conventions (`_<category>/`)

All subdirectories within `src/features/{main,layout,shared}` must follow these
explicit naming and structural guidelines:

### Base UI Primitives (`_uis/`)

- Dedicated to primitive headless/styled components (buttons, inputs, dropdowns,
  dialogs, tooltips).
- Uses `@base-ui/react` styled with Tailwind v4 utilities and `cn()`.
- Resides exclusively under `src/features/shared/_uis/`.

### Components (`_components/`)

- Domain-specific or composite components.
- In `main/_components/`: Components making up the main canvas and graph
  content.
- In `layout/_components/`: Header, footer, sidebar, navigation, docks, and
  toolbars.
- In `shared/_components/`: Composite components shared across both `main` and
  `layout`.
- All components MUST be defined as arrow functions with explicit prop
  interfaces.

### Hooks (`_hooks/`)

- Each custom hook must reside in its own dedicated file.
- **Filename Convention:** Hook filenames must **NOT** start with `use-` (e.g.,
  name the file `canvas-viewport.ts` or `workspace.ts`, while the exported
  function remains `export const useWorkspace = ...`).

### Types (`_types/`)

- Group cohesive domain types together.
- **Naming:** Types must be in `PascalCase`.
- **Object Types:** If a type represents an object structure, it MUST be defined
  as an `interface`.

### Stores (`_stores/`)

- Jotai atoms, atom creators, and derived state definitions.
- Clean initial atom states, derived selectors, and action atom handlers.

### Utilities (`_utils/`)

- Pure utility functions (e.g., math, color calculations, formatting).
- All utility functions MUST be declared using standard `function` declarations
  (do not use arrow functions for utilities).

### Assets (`_assets/`)

- Static assets such as images, SVGs, and fonts.
- Subdirectories: `images/`, `fonts/`.
- No non-English filenames.

---

## 4. Strict Boundary & Anti-Pattern Rules

1. **NO FOLDERS OUTSIDE `src/features`:** Under no circumstance create folders
   like `src/components`, `src/hooks`, `src/lib`, `src/shared`, `src/ui`, or
   `src/utils`. All code must belong to either `main`, `layout`, or `shared`
   inside `src/features/`.
2. **STRICT UNDERSCORE PREFIX:** Any structural folder inside
   `src/features/{main,layout,shared}` MUST start with `_` (e.g., `_components`,
   `_hooks`, `_uis`).
3. **NO DIRECT COUPLING BETWEEN `main` AND `layout`:** `main` and `layout` must
   never import directly from each other. Any code needed by both MUST be placed
   in `src/features/shared/`.
