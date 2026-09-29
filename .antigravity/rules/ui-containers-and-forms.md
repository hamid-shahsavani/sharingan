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

- **Component Suffix:** `Modal` (e.g., `CreateWorkspaceModal`, `NodeDetailModal`, `GroupNodeModal`).
- **Base Primitive:** All modals are built directly using the shared `dialog` component (`src/features/shared/_uis/dialog.tsx`).
- **No Descriptions:** Modals do NOT have descriptions (never use `description` or `DialogDescription` in modals).
- **State Management:** Modals are controlled via standard React component state (`isOpen`, `nodeId`).
- **Delete Confirmation:** For deletion flows, the standard `delete-confirmation` modal must be used.

---

## 3. Embedded Forms

All form workflows (creation, editing, settings) are hosted directly inside their respective modals:

- **Validation Engine:** Managed via `react-hook-form` paired with a `zod` validation schema.
- **Design System Elements:** Form fields must use shared UI primitives (`src/features/shared/_uis/`).
- **No Placeholders:** Form input fields must NOT have placeholders (do not use placeholder attributes on inputs or textareas).
- **Field & Label Sizing:** Labels and input fields must be spacious, prominent, and comfortably sized (`text-sm` for labels, `h-11` and `text-sm` for inputs).
- **Required Fields:** Explicitly marked with an `isRequired` prop.
- **Loading State:** Form submit buttons must be disabled during submission/loading states.
- **State Reset:** Form state resets whenever the parent modal triggers `onClose` or unmounts.
- **Standard Action Labels:**
  - Create / Add: `"ایجاد"`
  - Edit / Update: `"ثبت تغییرات"`

---

## 4. Local File Attachments

- Files are persisted purely locally (IndexedDB or local blobs/Data URLs); no remote server uploads exist.
