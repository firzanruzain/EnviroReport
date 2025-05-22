<p align="left"><a href="./application-architecture.md#back-end-supabase-edge-functions-"><-- back to application architecture</a></p>

# Supabase Edge Functions Documentation

This document provides a complete reference for all Edge Functions used in the project. It includes their purpose, HTTP methods, parameters, example usage, and implementation status.

---

## 📘 Index of Edge Functions

| Category     | Function Name                                             | HTTP Method | Parameters / Query             | Status | new       |
| ------------ | --------------------------------------------------------- | ----------- | ------------------------------ | ------ | --------- |
| **Auth**     | [`signIn`](#signin)                                       | POST        | `{ email, password }`          | ✅     | none      |
|              | [`signUp`](#signup)                                       | POST        | `{ email, password, name }`    | ✅     | none      |
|              | [`forgotPassword`](#forgotpassword)                       | POST        | `{ email }`                    | ⏳     | none      |
| **Division** | [`fetch-division`]()                                      | GET         | None                           | ⏳     | -         |
|              | [`fetch-pollutions`](#fetch-pollutions)                   | GET         | `division_id` (query)          | ✅     | completed |
| **Form**     | [`fetch-forms`](#fetch-forms)                             | GET         | `pollution_id` (query)         | ✅     | completed |
|              | [`fetch-published-form`](#fetch-published-form)           | GET         | `pollution_id` (query)         | ✅     | completed |
|              | [`update-form`](#update-form)                             | POST        | `{ form_data }`                | ✅     | completed |
|              | [`fetch-form-template`](#fetch-form-template)             | GET         | `form_template_id` (query)     | ✅     | completed |
|              | [`create-new-form`](#create-new-form)                     | POST        | `{ pollution_id }`             | ✅     | completed |
| **Report**   | [`fetch-reports`](#fetch-reports)                         | GET         | `count` (query)                | ✅     | completed |
|              | [`fetch-report-by-pollution`](#fetch-report-by-pollution) | GET         | `pollution_id`, `count`        | ✅     | completed |
|              | [`update-feedback`](#update-feedback)                     | POST        | `{ report_id, feedback_data }` | 🚧     | completed |
|              | [`fetch-report-details`](#fetch-report-details)           | GET         | `report_id`                    | ✅     | completed |
|              | [`create-report`](#create-report)                         | POST        | `{ form_data, user_id }`       | 🚧     | completed |
| **User**     | [`fetch-current-user`](#fetch-current-user)               | GET         | None                           | ✅     | completed |
|              | [`fetch-user-profile`](#fetch-user-profile)               | GET         | `user_id` (query)              | ✅     | completed |
|              | [`update-user-profile`](#update-user-profile)             | PATCH       | `{ profile_data }`             | ⏳     |           |

---

## 📂 Function Details and Usage

### 🔐 Auth Functions

#### `signIn`

- **Method:** `POST`
- **Description:** Authenticates a user using email and password.
- **Body Example:**

```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

#### `signUp`

- **Method:** `POST`
- **Description:** Registers a new user account.
- **Body Example:**

```json
{
  "email": "new@example.com",
  "password": "secure123",
  "name": "John Doe"
}
```

#### `forgotPassword`

- **Method:** `POST`
- **Description:** Sends a password reset email.
- **Body Example:**

```json
{
  "email": "user@example.com"
}
```

---

### 🏢 Division Functions

#### `fetch-pollutions`

- **Method:** `GET`
- **Query:** `division_id=abc123`
- **Description:** Returns pollution types under a division.

---

### 📝 Form Functions

#### `fetch-forms`

- **Method:** `GET`
- **Query:** `pollution_id=xyz456`
- **Description:** Fetch all forms related to a pollution type.

#### `fetch-published-form`

- **Method:** `GET`
- **Query:** `pollution_id=xyz456`
- **Description:** Fetch only active (published) forms.

#### `update-form`

- **Method:** `POST`
- **Body Example:**

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

#### `create-form`

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
- **Query:** `form_template_id=abc123`
- **Description:** Fetch full form template details with fields and configs.

---

### 📄 Report Functions

#### `fetch-report-details`

- **Method:** `GET`
- **Query:** `report_id=abc123`
- **Description:**
  Fetch detailed report information by its report ID.
  Returns report metadata, submitted form data, status, timestamps, and associated feedback if any.
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
- **Query:** `count=10`
- **Description:** Fetch all reports with pagination.

#### `fetch-report-by-pollution`

- **Method:** `GET`
- **Query:** `pollution_id=abc123&count=10`

#### `update-feedback`

- **Method:** `POST`
- **Description:** Add or update feedback for a report.
- **Body Example:**

```json
{
  "report_id": "report-xyz",
  "feedback_text": "Needs verification"
}
```

#### `create-report`

- **Method:** `POST`
- **Body Example:**

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

### 👤 User Functions

#### `fetch-current-user`

- **Method:** `GET`
- **Description:** Fetch currently authenticated user from JWT.

#### `fetch-user-profile`

- **Method:** `GET`
- **Query:** `user_id=uuid123`
- **Description:** Fetch user profile data.

#### `update-user-profile`

- **Method:** `PATCH`
- **Body Example:**

```json
{
  "user_id": "uuid123",
  "full_name": "Updated Name",
  "phone": "123456789"
}
```

---

## 🛠 Development Status Legend

| Status          | Meaning                       |
| --------------- | ----------------------------- |
| ✅ Implemented  | Fully functional and tested   |
| 🚧 Need Testing | Implemented but needs review  |
| ⏳ In Progress  | Still being built or reviewed |

---

## 📌 Notes

- All `POST`/`PATCH`/`DELETE` requests should have `Content-Type: application/json` header.
- Authenticated requests must include `Authorization: Bearer <JWT>` header.
- For GET requests with query parameters, use standard URL query syntax: `?param=value`

---
