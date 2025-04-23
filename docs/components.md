# Component Inventory

This document lists all reusable and app-specific components used across the **Public User** and **Staff Division (Admin)** apps in the monorepo.

---

## Shared UI Components (`packages/ui/`)

| Component Name        | Description                                       | Done? |
| --------------------- | ------------------------------------------------- | ----- |
| `PrimaryButton`     | Main call-to-action button                        | [x]   |
| `TextInputField`    | Generic form input with label                     | [x]   |
| `PasswordInput`     | Input with show/hide toggle for passwords         | [x]   |
| `Label`             | Field label with optional helper text             | [ ]   |
| `SectionHeader`     | Section title or page heading                     | [ ]   |
| `Card`              | Wrapper for displaying report info or content     | [ ]   |
| `DropdownSelect`    | Reusable select input (e.g. for State, Type)      | [ ]   |
| `DatePickerInput`   | Selectable date input                             | [ ]   |
| `TimePickerInput`   | Selectable time input                             | [ ]   |
| `FileUploader`      | Upload documents or images                        | [ ]   |
| `EmptyState`        | Display when there's no content                   | [ ]   |
| `TabBar`            | Bottom navigation bar (Home, Map, etc.)           | [ ]   |
| `SearchBar`         | Input for filtering content                       | [ ]   |
| `FeedbackInput`     | Textarea for long-form feedback                   | [ ]   |
| `Modal`             | Reusable modal for confirmations or messages      | [ ]   |
| `Avatar`            | User profile image component                      | [ ]   |
| `ReportStatusBadge` | Label showing status (In Review, Submitted, etc.) | [ ]   |

---

## Admin-Only Components (`apps/admin-app/components/`)

| Component Name         | Description                                  | Done? |
| ---------------------- | -------------------------------------------- | ----- |
| `ReportFormBuilder`  | Create/edit new pollution form templates     | [ ]   |
| `FeedbackForm`       | Input box for staff feedback on reports      | [ ]   |
| `ReportReviewCard`   | Card to review and take action on a report   | [ ]   |
| `AdminPollutionForm` | Full-featured report form with admin options | [ ]   |
| `ReportTable`        | Tabular view of reports (status, date, etc.) | [ ]   |
| `FormBuilderSidebar` | Layout section with tools for building forms | [ ]   |

---

## Public-Only Components (`apps/public-app/components/`)

| Component Name           | Description                                       | Done? |
| ------------------------ | ------------------------------------------------- | ----- |
| `UserReportCard`       | Preview of user-submitted pollution reports       | [ ]   |
| `ReportSubmissionForm` | Form to report pollution incidents                | [ ]   |
| `WelcomeBanner`        | Greeting or promo at top of dashboard             | [ ]   |
| `LoginCard`            | Login form with email/password                    | [ ]   |
| `SignupForm`           | New user registration form                        | [ ]   |
| `UserProfileForm`      | Edit profile info (name, contact, etc.)           | [ ]   |
| `ReportMap`            | Map showing nearby or submitted pollution reports | [ ]   |

---

## 🛠 Notes

- [ ] Consider documenting each component in Storybook.
- [ ] Add code examples and props documentation to each shared component.
- [ ] Group visual components (e.g., buttons, inputs) into folders for clarity.

---
