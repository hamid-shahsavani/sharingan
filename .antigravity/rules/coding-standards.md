# Coding Standards & Syntax Best Practices

This document outlines the strict TypeScript, React, and general syntax rules
that must be followed across the codebase.

---

## 1. TypeScript & Type Rules

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

---

## 2. Props & Parameters

- Props and parameters MUST be defined as an `interface` in the same file. Never
  use inline type objects.
- Props must be destructured directly in the component parameter list.
- **Boolean Props:** Must be prefixed with `is` (e.g.,
  `isOpen`, `isSelected`).
- **Callback Props:** Must be prefixed with `on` (e.g., `onSubmit`, `onClose`,
  `onNodeSelect`).

---

## 3. React Components

- All components MUST be defined as arrow functions:
  ```typescript
  export const NodeCard = ({
    node,
    isSelected,
  }: NodeCardProps) => {
    // ...
  };
  ```
- **Decomposition:** If a component grows large or complex, break it down into
  smaller sub-components. If private to that component, place sub-components at
  the bottom of the same file. If reused elsewhere, extract them to
  `_components/` (or `src/features/shared/_components/` if shared between main
  and layout).

---

## 4. Variables & Naming Conventions

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

---

## 5. Import & Export Rules

- **No Default Exports:** Never use `export default`. Use named exports
  exclusively.
- **Inline Exports:** Export directly at the point of declaration
  (`export const ...`).
- **No Cross-Domain Direct Couplings:** `main` and `layout` features must never
  import directly from each other. Common dependencies must be placed in
  `src/features/shared/`.

---

## 6. Comments & Code Hygiene

- Code must be self-explanatory and clean; avoid redundant explanatory comments.
- **AI-Generated Code:** AI agents must NOT produce explanatory code comments.
- **No Commented-Out Code:** Never leave dead or commented-out code in files.
  Delete unused code completely.

---

## 7. Styling & Design Consistency

- Maintain strict layout consistency: uniform padding, margin scales, and gap
  tokens across all views.
- **Animations:** Do not mix animation libraries. Avoid Framer Motion unless
  applied uniformly across the entire application; prefer Tailwind v4
  lightweight CSS transitions.
- **Conditional Classes:** Conditional Tailwind classes must ALWAYS be merged
  using the `cn()` utility.
