## System Architecture & Design

<details>
  <summary>📚 Table of Contents</summary>

- [System Architecture \& Design](#system-architecture--design)
- [Overview](#overview)
- [Modules #](#modules-)
- [Models #](#models-)
- [UI #](#ui-)
- [Assets](#assets)
- [Services](#services)
- [Back-end (Supabase Edge Functions) #](#back-end-supabase-edge-functions-)
- [Key Design Principles](#key-design-principles)

</details>

---

## Overview

This project follows a modular architecture with clear separation between:

1. Presentation Layer (React Native UI)
2. Business Logic (Edge Functions)
3. Data Layer (PostgreSQL)

Key characteristics:

- Feature-first module organization
- Type-safe models shared across layers
- Isolated backend services via Supabase

![test](./System%20Architecture%20diagram.drawio.png)

---

## Modules [#](modules.md)  

Contains **[feature](features.md)-based** logic, organized per domain (e.g., `report`, `user`, `auth`).Each module includes its own:

- `/hooks`: Data fetching, mutations, and business logic tied to the module
- `/screens`: Feature-specific screens that combine hooks and UI for user flows

Example:

```
/modules/report/hooks
/modules/report/screens
/modules/auth/screens/signUp.tsx
```

---

## Models [#](models.md)  

Centralized repository of TypeScript types, interfaces, and schema definitions.
Models are imported across hooks, screens, and components to maintain strict type safety and reduce duplication.

Example:

```
/models/report.ts
/models/user.ts
```

---

## UI [#](components.md)

Houses **shared, purely presentational [components](components.md) and views** that are reused across multiple features:

- `/components`: Stateless UI elements like Button, Card, Input, etc.
- `/screens`: Reusable, layout-driven screens that are mainly visual and prop-driven.

Example:

```
/ui/components/Button.tsx
/ui/screens/ReportScreen.tsx
```

---

## Assets

A collection of static files such as images, icons, fonts, and other design-related assets used throughout the application.

Example:

```
/assets/logo.png
/assets/icons/
```

---

## Services

Contains core backend service instances and configuration helpers.

- `supabase.tsx`: Supabase client setup, providing a single shared connection instance across the app.

Example:

```
/services/supabase.tsx
```

---

## Back-end (Supabase Edge Functions) [#](edge-functions.md)  

The app uses [Supabase Edge Functions](https://supabase.com/docs/guides/functions) to implement server-side business logic.
These functions expose secure HTTP API endpoints that the frontend consumes via feature-specific hooks, enabling clean separation between backend operations and UI.

---

## Key Design Principles

- **Feature-driven** module organization
- **Centralized types** for maximum type safety
- **Separation of concerns** between data, business logic, and presentation
- **Reusable UI components** for consistent design and faster development
- **Scalable structure** designed for growing app complexity

---
