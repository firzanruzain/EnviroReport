# File Structure

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
  ├── admin-app
  └── public-app

/packages
  ├── modules
      ├── report
          ├── hooks
          └── screens
      ├── auth
      ├── division
      ├── form
      └── user
  ├── models
  ├── assets
      ├── images.js
      └── fonts.js
  ├── ui
  └── services

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
