<p align="left"><a href="./application-architecture.md#back-end-supabase-edge-functions-"><-- Back to Application Architecture</a></p>

<details>
  <summary>📚 Table of Contents</summary>

- [Supabase Edge Functions Documentation](#supabase-edge-functions-documentation)
  - [Index](#index)
    - [Division](#division)
    - [Form](#form)
    - [Report](#report)
    - [User](#user)
  - [Function Details](#function-details)
    - [Division](#division-1)
      - [`fetch-pollutions`](#fetch-pollutions)
    - [Form](#form-1)
      - [`fetch-forms`](#fetch-forms)
      - [`fetch-published-form`](#fetch-published-form)
      - [`update-form`](#update-form)
      - [`create-new-form`](#create-new-form)
      - [`fetch-form-template`](#fetch-form-template)
    - [📄 Report](#-report)
      - [`fetch-report-details`](#fetch-report-details)
      - [`fetch-reports`](#fetch-reports)
      - [`fetch-report-by-pollution`](#fetch-report-by-pollution)
      - [`update-feedback`](#update-feedback)
      - [`create-report`](#create-report)
    - [User](#user-1)
      - [`fetch-current-user`](#fetch-current-user)
      - [`fetch-profile-details`](#fetch-profile-details)
      - [`update-profile-details`](#update-profile-details)
  - [Status Legend](#status-legend)
  - [Auth Notes](#auth-notes)
</details>

# Supabase Edge Functions Documentation

Complete reference for all Supabase Edge Functions in this project, including usage, parameters, and status.

---

## Index

### Division

| Function                              | Method | Params                | Status |
| ------------------------------------- | ------ | --------------------- | ------ |
| [fetch-pollutions](#fetch-pollutions) | GET    | `division_id` (query) | ✅     |

### Form

| Function                                      | Method | Params                                 | Status |
| --------------------------------------------- | ------ | -------------------------------------- | ------ |
| [fetch-forms](#fetch-forms)                   | GET    | `pollution_id` (query)                 | ✅     |
| [fetch-published-form](#fetch-published-form) | GET    | `pollution_id` (query)                 | ✅     |
| [update-form](#update-form)                   | POST   | `{ form_data }`                        | ✅     |
| [fetch-form-template](#fetch-form-template)   | GET    | `form_template_id` (query)             | ✅     |
| [create-new-form](#create-new-form)           | POST   | `{ division_name, pollution_type_id }` | ✅     |

### Report

| Function                                                | Method | Params                         | Status |
| ------------------------------------------------------- | ------ | ------------------------------ | ------ |
| [fetch-reports](#fetch-reports)                         | GET    | `count` (query)                | ✅     |
| [fetch-report-by-pollution](#fetch-report-by-pollution) | GET    | `pollution_id`, `count`        | ✅     |
| [update-feedback](#update-feedback)                     | POST   | `{ report_id, feedback_data }` | 🚧     |
| [fetch-report-details](#fetch-report-details)           | GET    | `report_id`                    | ✅     |
| [create-report](#create-report)                         | POST   | `{ form_data, user_id }`       | 🚧     |

### User

| Function                                          | Method | Params             | Status |
| ------------------------------------------------- | ------ | ------------------ | ------ |
| [fetch-current-user](#fetch-current-user)         | GET    | None               | ✅     |
| [fetch-profile-details](#fetch-profile-details)   | GET    | `user_id` (query)  | ✅     |
| [update-profile-details](#update-profile-details) | PATCH  | `{ profile_data }` | 🚧     |

---

## Function Details

### Division

#### `fetch-pollutions`

- **Method:** `GET`
- **Query:** `?division_id=abc123`
- **Description:** Returns pollution types under a division.

---

### Form

#### `fetch-forms`

- **Method:** `GET`
- **Query:** `?pollution_id=xyz456`
- **Description:** Fetch all forms related to a pollution type.

#### `fetch-published-form`

- **Method:** `GET`
- **Query:** `?pollution_id=xyz456`
- **Description:** Fetch only active (published) forms.

#### `update-form`

- **Method:** `POST`
- **Payload Example:**

  ```json
  {
    "form_template_id": "form_id_123",
    "form_name": "Air Check",
    "status": "active",
    "form_fields": [
      {
        "field_label": "Location",
        "field_type_id": "uuid-type",
        "is_required": true,
        "field_order": 1,
        "config_data": {
          "placeholder": "Enter location"
        }
      }
    ]
  }
  ```

#### `create-new-form`

- **Method:** `POST`
- **Description:** Creates a new form template based on the division name and pollution type, and initializes it with a blank field.
- **Payload Example:**

  ```json
  {
    "division_name": "Selangor",
    "pollution_type_id": "air_001"
  }
  ```

- **Response Example:**

  ```json
  {
    "message": "Form template created",
    "form_template_id": "form_selangor_2"
  }
  ```

#### `fetch-form-template`

- **Method:** `GET`
- **Query:** `?form_template_id=abc123`
- **Description:** Fetch full form template details with fields and configs.

---

### 📄 Report

#### `fetch-report-details`

- **Method:** `GET`
- **Query:** `?report_id=abc123`
- **Description:** Fetch detailed report info including form data and feedback.
- **Response Example:**

  ```json
  {
    "report_id": "abc123",
    "form_template_id": "form-air-1",
    "submitted_by": "user-uuid",
    "submitted_at": "2025-05-22T08:12:34Z",
    "form_data": {
      "location": "Street A",
      "level": "High"
    },
    "status": "pending",
    "feedback": {
      "comment": "Please provide a clearer photo",
      "given_by": "staff-uuid"
    }
  }
  ```

#### `fetch-reports`

- **Method:** `GET`
- **Query:** `?limit=10&offset=0&pollution_type_id=abc123`
- **Description:** Fetch paginated list of reports.
- **Response Example:**
  ```json
  {
    "data": [
      {
        "report_id": "rep001",
        "submission_date": "2025-05-20T15:42:00Z",
        "form_data": { "location": "Street X" },
        "form_template": {
          "form_template_id": "form-air-1",
          "form_name": "Air Quality Check",
          "pollution_type_id": "abc123"
        }
      }
    ],
    "count": 25,
    "limit": 10,
    "offset": 0
  }
  ```

#### `fetch-report-by-pollution`

- **Method:** `GET`
- **Query:** `?pollution_id=abc123&count=10`

#### `update-feedback`

- **Method:** `POST`
- **Description:** Add or update feedback for a report.
- **Payload Example:**

  ```json
  {
    "report_id": "report-xyz",
    "feedback_text": "Needs verification"
  }
  ```

#### `create-report`

- **Method:** `POST`
- **Payload Example:**

  ```json
  {
    "form_template_id": "form-air-3",
    "form_data": {
      "location": "XYZ Street",
      "intensity": "High"
    },
    "user_id": "user-uuid"
  }
  ```

---

### User

#### `fetch-current-user`

- **Method:** `GET`
- **Description:** Fetch currently authenticated user from JWT.

#### `fetch-profile-details`

- **Method:** `GET`
- **Query:** `?user_id=uuid123`
- **Description:** Fetch user profile data.

#### `update-profile-details`

- **Method:** `PATCH`
- **Payload Example:**

  ```json
  {
    "user_id": "uuid123",
    "full_name": "Updated Name",
    "phone": "123456789"
  }
  ```

---

## Status Legend

| Symbol | Meaning                      |
| ------ | ---------------------------- |
| ✅     | Fully implemented            |
| 🚧     | Needs testing/review         |
| ⏳     | In progress / partially done |

---

## Auth Notes

- All secure requests require:

  - `Authorization: Bearer <JWT>`

- JSON requests must use:

  - `Content-Type: application/json`

- Use standard URL query syntax: `?param=value` for `GET` requests.

---
