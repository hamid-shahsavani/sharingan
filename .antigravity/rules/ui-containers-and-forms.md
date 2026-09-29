# UI Architecture: Modals & Forms

This document governs the design and structure of UI modal containers and forms
across the application.

---

## 1. UI Containers (`_components/modals/`)

In this application, all overlay dialogs, inspection panels, and editing flows
are encapsulated exclusively within **Modals** under `_components/modals/`.
There are no separate drawer, view, or standalone container folders.

- Permitted container directory: `modals/`

---

## 2. Modal Specifications

- **Component Suffix:** `Modal` (e.g., `CreateWorkspaceModal`, `NodeDetailModal`).
- **Base Primitive:** All modals must be built using the shared `base-modal` component.
- **Routing & Search Params:** Modals are controlled exclusively via `useRouterSearchParams()`:
  - `is_open`: Controls visibility (`isOpen`).
  - `id`: Resource identifier when inspecting/editing an existing item.
- **Lazy Loading:** All modals MUST be lazily loaded (`React.lazy`) at their import site.
- **Delete Confirmation:** For deletion flows, the standard `delete-confirmation` modal must be used.

---

## 3. Embedded Forms

All form workflows (creation, editing, settings) are hosted directly inside their respective modals:

- **Validation Engine:** Managed via `react-hook-form` paired with a `zod` validation schema.
- **Design System Elements:** Form fields must use shared UI primitives (`src/features/shared/_uis/`).
- **Required Fields:** Explicitly marked with an `isRequired` prop.
- **Loading State:** Form submit buttons must be disabled during submission/loading states.
- **State Reset:** Form state resets whenever the parent modal triggers `onClose` or unmounts.
- **Standard Action Labels:**
  - Create / Add: `"ایجاد"`
  - Edit / Update: `"ثبت تغییرات"`

---

## 4. Local File Attachments

- Files are persisted purely locally (IndexedDB or local blobs/Data URLs); no remote server uploads exist.
