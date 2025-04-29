# Project Monorepo File & Package Structure

<details>
  <summary>📚 Table of Contents</summary>

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Package Overview](#packages-overview)

</details>

---

## Overview

This document describes the organization of code files in a monorepo structure, including shared logic, assets, and app-specific components, following best practices and the MVC architecture pattern.

---

## Directory Structure

```
/apps
  ├── admin-app        # App for internal users or admins
  └── public-app       # Public-facing mobile app

/packages
  ├── modules          # Feature-specific logic (hooks + screens)
  │   ├── report
  │   │   ├── hooks
  │   │   └── screens
  │   ├── auth
  │   ├── division
  │   ├── form
  │   └── user
  ├── models           # Global TypeScript types/interfaces
  ├── assets           # Static assets
  │   ├── images.js
  │   └── fonts.js
  ├── ui               # Shared UI components + views
  └── services         # External service clients (e.g. Supabase)

```

---

## Packages Overview

| Folder         | Purpose |
|----------------|---------|
| `/modules`     | Contains feature-specific business logic (hooks) and screens |
| `/models`      | Centralized TypeScript types and interfaces |
| `/ui`          | Reusable UI components and stateless shared screens |
| `/assets`      | Static assets like icons, images, fonts |
| `/services`    | Service clients and configuration files (e.g., Supabase) |

---
