# StatusUpdateModal Component

A modal component for updating the status of reports in the EnviroReport application.

## Features

- Displays current report status
- Allows selection of new status from available options
- Shows descriptions for each status option
- Handles loading states and error messages
- Prevents updates when no change is made
- Integrates with the report store for state management
- Uses ref-based API for opening/closing the modal

## Usage

```tsx
import { StatusUpdateModal, StatusUpdateModalRef } from "ui";
import { ReportStatus } from "models/report";
import { useRef } from "react";

// In your component
const statusModalRef = useRef<StatusUpdateModalRef>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleUpdateStatus = async (newStatus: ReportStatus) => {
  try {
    setIsLoading(true);
    setError(null);

    // Call your update function
    await updateReportStatus(reportId, newStatus);

    // Close modal on success
    statusModalRef.current?.close();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update status");
  } finally {
    setIsLoading(false);
  }
};

const handleOpenModal = () => {
  setError(null);
  statusModalRef.current?.open();
};

// In your JSX
<StatusUpdateModal
  ref={statusModalRef}
  currentStatus={report.report_status}
  onUpdateStatus={handleUpdateStatus}
  isLoading={isLoading}
  error={error}
/>;
```

## Props

| Prop             | Type                                      | Required | Description                          |
| ---------------- | ----------------------------------------- | -------- | ------------------------------------ |
| `currentStatus`  | `ReportStatus`                            | Yes      | Current status of the report         |
| `onUpdateStatus` | `(status: ReportStatus) => Promise<void>` | Yes      | Function to handle status update     |
| `isLoading`      | `boolean`                                 | No       | Shows loading state (default: false) |
| `error`          | `string \| null`                          | No       | Error message to display             |

## Ref Methods

| Method    | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `open()`  | Opens the modal and resets the selected status to current status |
| `close()` | Closes the modal immediately                                     |

## Behavior

- **Automatic Closing**: The modal automatically closes when the `isLoading` prop transitions from `true` to `false`
- **Loading Protection**: The modal cannot be dismissed manually while `isLoading` is `true`
- **Status Reset**: When opening, the selected status automatically resets to the current status

## Available Status Options

- **Pending**: Report is waiting for review
- **In Review**: Report is currently being reviewed
- **Closed**: Report has been resolved and closed

## Integration with ReportPage

The StatusUpdateModal is automatically integrated with the ReportPage component through the heading's option function. When users click the dots menu (⋮) in the heading, the modal opens allowing them to update the report status.

### Additional Features in ReportPage

The ReportPage component also includes:

- **Pull-to-Refresh**: Users can pull down on the screen to refresh the report details
- **Status Updates**: Real-time status updates that reflect immediately in the UI
- **Error Handling**: Comprehensive error handling for both data fetching and status updates

## Styling

The component uses React Native Paper's Dialog component with custom styling that matches the application's design system. It includes:

- Consistent typography using the app's font classes
- Proper spacing and layout
- Error message styling
- Loading state indicators
- Disabled states for better UX
