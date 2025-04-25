# Environmental Incident Reporting System - Code Structure

<details>
  <summary>📚 Table of Contents</summary>

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Shared Packages](#shared-packages)
  - [1. ui-core](#1-ui-core)
  - [2. assets-core](#2-assets-core)
  - [3. hooks](#3hooks)
  - [4. models-core](#4-models-core)
  - [5. screens-core](#5-screens-core)
- [App Structure](#app-structure)
  - [Admin App](#admin-app)
  - [Public App](#public-app)
- [Best Practices](#best-practices)
- [Example Usage](#example-usage)

</details>

---

## Overview

This document describes the organization of code files in a monorepo structure, including shared logic, assets, and app-specific components, following best practices and the MVC architecture pattern.

---

## Directory Structure

```
/apps
  ├── admin-app
  └── public-app

/packages
  ├── ui-core
  ├── hooks
  ├── assets-core
  ├── utils
  └── models-core

/assets
  ├── images
  └── fonts
```

---

## Shared Packages

### 1. `ui-core`

✅ **Implemented**  
Reusable UI components styled with NativeWind and TailwindCSS.

**Examples:**
- Button
- Field
- Header
- Card
- Container

📁 `packages/shared-ui`

---

### 2. `assets-core`

✅ **Implemented**  
Centralized asset management including fonts, icons, and images.

**Includes:**
- `fonts.ts` → Exports app fonts for loading and Tailwind presets

📁 `packages/assets-core`

---

### 3. `hooks`

✅ **Implemented**  
Reusable logic and utility hooks across apps.

**Examples:**
- `useToggle.ts`
- `useUser.ts`

📁 `packages/shared-hooks`

---

### 4. `models-core`

✅ **Implemented**  
Handles data access and communication with Supabase backend.

**Examples:**
- `report.ts` → All report-related functions and types
- Organized by resource (e.g., `user.ts`, `formTemplate.ts`)

📁 `packages/models`

---

### 5. `screens-core`

✅ Implemented
Common screen templates used across apps (e.g., Login, Welcome)

**Examples:**
- `login.ts` →  Login screen for both apps.

📁 `packages/screens-crore`

---

## App Structure

### Admin App

📁 `apps/admin-app`

- `app.json` → Expo config
- `components/` → Admin-only components

---

### Public App

📁 `apps/public-app`

- `components/` → Specific components 

---

## Best Practices

✅ Use absolute imports with aliases (configured via `tsconfig.json`)  
✅ Use shared packages to avoid duplication  
✅ Models handle logic and API calls; hooks consume models  
✅ Use Tailwind presets for consistent styling  
✅ Keep all font and asset imports centralized

---
