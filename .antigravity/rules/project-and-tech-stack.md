# Project Overview, Mission & Technology Stack

This document defines the core mission, capabilities, architectural philosophy,
runtime framework, build tools, styling, and dependencies used across
**Sharingan**.

---

## 1. Project Mission & Capabilities

**Sharingan** is a high-performance visual mind-mapping and knowledge-graph
Single Page Application (SPA). It provides users with:

- **Infinite Canvas:** Conceptual mind maps, hierarchical node graphs, and
  freeform relational mapping.
- **Multi-Workspace Hierarchy:** Support for parent (group) workspaces and
  nested child workspaces.
- **Node Inspection & Rich Editing:** Markdown notes editor, file and folder
  attachments, visual tags, and AI-assisted ideation.
- **Persistence & History:** Snapshot-based version history with full undo/redo
  and robust offline-first IndexedDB persistence.

---

## 2. Core Architectural Philosophy

- **100% Offline-First:** No remote backend, API services, or cloud
  dependencies. All state, graphs, workspaces, and media attachments are
  persisted locally using IndexedDB.
- **Tripartite Feature Partitioning:** Strict code organization within
  `src/features/` across three domains (`main/`, `layout/`, and `shared/`).
- **Clean Standards:** Strict TypeScript type safety, Babel React Compiler, and
  modular headless UI primitives.

---

## 3. Technology Stack Overview

| Layer                   | Technology            | Key Details & Version                                                         |
| :---------------------- | :-------------------- | :---------------------------------------------------------------------------- |
| **Runtime & Framework** | React 19              | `@types/react: ^19.2`, `react: ^19.2.8`, `react-dom: ^19.2.8`                 |
| **Compiler**            | React Compiler        | `babel-plugin-react-compiler: ^1.0.0` with Vite integration                   |
| **Build Tool**          | Vite 8                | Fast HMR, ESM bundling, path alias `@/*` -> `./src/*`                         |
| **Styling**             | Tailwind CSS v4       | `@tailwindcss/vite: ^4.3.3`, `tailwindcss: ^4.3.3`, `tw-animate-css`          |
| **Component Library**   | Shadcn UI             | Style: `base-nova`, powered by `@base-ui/react`, `@fontsource-variable/geist` |
| **State Management**    | Jotai                 | Atomic client state primitives and derived atoms                              |
| **Forms & Validation**  | React Hook Form + Zod | Strictly typed form control with Zod schema validation                        |
| **Language**            | TypeScript 6          | Strict type-checking, type-aware linting enabled                              |
| **Icons**               | Lucide React          | `lucide-react: ^1.46.0`                                                       |
| **Quality & Linting**   | ESLint 10 + Prettier  | `@typescript-eslint/recommendedTypeChecked`, strict promise and import rules   |

---

## 4. Architectural Guidelines for Dependencies

- **Zero Unauthorized Dependencies:** Do not install extra npm packages without
  explicit necessity and alignment with the stack.
- **Styling Standards:** Tailwind CSS v4 is used with modern CSS variables
  (OKLCH color system) defined in `src/index.css`.
- **Component Architecture:** UI primitives are generated via Shadcn CLI into
  `src/features/shared/_uis/` using `@base-ui/react`.
- **Compiler Optimizations:** React 19 Compiler handles component memoization
  automatically. Avoid manual `useMemo` / `useCallback` unless strictly
  necessary for external referential stability.
