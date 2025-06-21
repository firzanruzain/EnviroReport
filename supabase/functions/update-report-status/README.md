# Update Report Status Edge Function

This edge function updates the status of a report in the database.

## Endpoint

```
PATCH /functions/v1/update-report-status
```

## HTTP Method

This function **only accepts PATCH requests**. Any other HTTP method will return a 405 Method Not Allowed error.

## Query Parameters

- `report_id` (required): The ID of the report to update
- `status` (required): The new status for the report

## Valid Status Values

- `"Pending"`
- `"In Review"`
- `"Closed"`

## Request Example

```javascript
const response = await fetch(
  "https://your-project.supabase.co/functions/v1/update-report-status?report_id=123&status=In%20Review",
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }
);

const result = await response.json();
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "report_id": "123",
    "report_status": "In Review",
    "submission_date": "2025-01-15T10:30:00Z",
    "form_template": {
      "form_template_id": "FT_123",
      "form_name": "Water Pollution Report",
      "description": "Form for reporting water pollution incidents",
      "pollution_type_id": "PT_WATER",
      "status": "Active"
    }
  },
  "message": "Report status updated to In Review"
}
```

### Error Responses

#### 405 Method Not Allowed

- "Method not allowed. Only PATCH requests are accepted."

#### 400 Bad Request

- Missing `report_id`: "report_id is required"
- Missing `status`: "status is required"
- Invalid status: "Invalid status. Must be one of: Pending, In Review, Closed"

#### 404 Not Found

- "Report not found"

#### 500 Internal Server Error

- Database errors or unexpected errors

## Usage Examples

### Update to "In Review"

```javascript
const params = new URLSearchParams({
  report_id: "123",
  status: "In Review",
});

const response = await fetch(
  `https://your-project.supabase.co/functions/v1/update-report-status?${params}`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }
);
```

### Update to "Closed"

```javascript
const params = new URLSearchParams({
  report_id: "123",
  status: "Closed",
});

const response = await fetch(
  `https://your-project.supabase.co/functions/v1/update-report-status?${params}`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }
);
```

## Notes

- The function validates that the status is one of the allowed values
- The function returns the updated report data including the form template information
- Make sure to URL encode the status value if it contains spaces (e.g., "In Review" becomes "In%20Review")
- **Only PATCH requests are accepted** - POST, GET, PUT, DELETE, etc. will return 405 errors
