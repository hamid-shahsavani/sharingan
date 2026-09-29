# State Management & Offline Persistence

This document defines patterns for local state management (Jotai) and offline
persistence (IndexedDB).

> [!IMPORTANT] **No Remote API / Server Communication:** This application is
> strictly offline-first and 100% client-driven. There are no remote API
> services, fetchers, HTTP clients, TanStack queries, or mutations.

---

## 1. Global State & Jotai (`_stores/`)

- **Suffix:** `Atom` (e.g., `mindMapAtom`, `workspaceAtom`).
- Global client state must be managed with Jotai.
- **Minimalism:** Avoid global atoms unless URL search params, router state, or deep
  prop drilling make it strictly necessary.
- **Derived Atoms & Actions:** Derived atoms and action atom handlers must be defined inside
  the store module. Never perform ad-hoc state mutations without structured atom primitives.
- **Atomic Subscriptions:** Components must subscribe only to the precise atom
  slice using `useAtomValue`, `useSetAtom`, or `useAtom` to prevent unnecessary re-renders.
- **Persistence Integration:** Jotai atoms interface directly with local IndexedDB persistence
  for loading and syncing local records.

---

## 2. Offline Persistence & IndexedDB

- **Persistence Structure:** Modular client-side IndexedDB persistence for:
  - `workspaces`: Parent/child workspace records.
  - `documents`: Current mind-map nodes and connections.
  - `versions`: Named or timestamped snapshots for rollback.
  - `settings`: User preferences and theme.
- **Async Operations:** All database interactions must be explicitly typed,
  error-handled, and encapsulated in pure helper functions or persistence drivers.
- **Auto-Save:** Debounced auto-save policy with clear `isDirty` and `isSaving`
  status flags reflected in the UI.
