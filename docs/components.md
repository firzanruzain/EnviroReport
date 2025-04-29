<p align="left"><a href="./application-architecture.md#ui-"><-- back to application architecture</a></p>

# EnviroReport - Components

<details>
<summary>Table of Contents</summary>

- [EnviroReport - Components](#enviroreport---components)
  - [Shared UI Components](#shared-ui-components)
  - [App-Specific Components](#app-specific-components)
  - [Utility Components](#utility-components)
  - [Component Status](#component-status)
  - [Usage Examples](#usage-examples)

</details>

---

## Shared UI Components

| Component | Status       | Description                                                                 | Props                                                                                   |
|-----------|--------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Button** | ✅ Implemented | Styled button component with multiple variants.                             | `title`, `onPress`, `variant`, `className`, `disabled`                                  |
| **Card**   | ✅ Implemented | Container component with consistent styling.                                | -                                                                                       |
| **Container** | ✅ Implemented | Root layout component with safe area handling.                             | -                                                                                       |
| **Field**  | ✅ Implemented | Text input field with common configurations.                                | `toggleButton`, supports all standard TextInput props                                   |
| **Heading** | ✅ Implemented | Section header with optional navigation.                                   | `nav`                                                                                   |
| **Header** | ✅ Implemented | Reusable app header component.                                              | `userName`, `profileImage`, `showNotifications`                                         |

---

## App-Specific Components

| Component          | Status       | Description                              | Props                     |
|---------------------|--------------|------------------------------------------|---------------------------|
| **ReportList**      | ✅ Implemented | Displays a list of submitted reports.    | `reports`, `loading`      |
| **ListItem** (sub-component) | - | Handles individual report display.        | -                         |

---

## Utility Components

| Component         | Status       | Description                              | Technical Details         |
|--------------------|--------------|------------------------------------------|---------------------------|
| **RotatingImage** | ✅ Implemented | Animated rotating image component.       | Uses `react-native-reanimated` for smooth rotation |

---

## Component Status

| Component     | Status | Notes                    |
|---------------|--------|--------------------------|
| Button        | ✅     |                          |
| Card          | ✅     |                          |
| Container     | ✅     |                          |
| Field         | ✅     |                          |
| Heading       | ✅     |                          |
| Header        | ✅     | Now in Shared UI         |
| ReportList    | ✅     | Needs router integration |
| RotatingImage | ✅     |                          |

---

## Usage Examples

```tsx
// Header usage
<Header
  userName="John Doe"
  profileImage={require('./custom-profile.png')}
  showNotifications={false}
/>

// Field with toggle
<Field
  placeholder="Password"
  secureTextEntry={!showPassword}
  toggleButton={
    <EyeToggle
      visible={showPassword}
      onToggle={togglePassword}
    />
  }
/>
```
