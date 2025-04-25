# EnviroReport - Components

<details>
    <Summary> Table of Contents</Summary>

- [Shared UI Components](#shared-ui-components)
  - [1. Button](#1-button)
  - [2. Card](#2-card)
  - [3. Container](#3-container)
  - [4. Field](#4-field)
  - [5. Heading](#5-heading)
  - [6. Header](#6-header)
- [App-Specific Components](#app-specific-components)
  - [Public User Components](#public-user-components)
    - [ReportList](#reportlist)
- [Utility Components](#utility-components)
  - [RotatingImage](#rotatingimage)
- [Component Status](#component-status)
- [Usage Examples](#usage-examples)
</details>

---

## Shared UI Components

### 1. Button

✅ **Implemented**`(title: ReactNode, onPress?: () => void, variant?: string, className?: string, disabled?: boolean)`Styled button component with multiple variants**Props:**

- `title`: Button content (text or element)
- `onPress`: Click handler
- `variant`: 'primary' | 'secondary' | 'disabled'
- `className`: Additional Tailwind classes
- `disabled`: Disabled state

### 2. Card

✅ **Implemented**`(children: ReactNode, className?: string)`Container component with consistent styling**Styles:**

- Default: Light green background with rounded corners

### 3. Container

✅ **Implemented**`(children: ReactNode, className?: string)`Root layout component with safe area handling**Features:**

- Handles status bar styling
- Full-height container

### 4. Field

✅ **Implemented**Text input field with common configurations**Props:**

- `toggleButton`: Optional right-side button (e.g., password toggle)
- Supports all standard TextInput props

### 5. Heading

✅ **Implemented**Section header with optional navigation**Features:**

- Pressable when nav prop provided
- Centered text with custom styling

### 6. Header

✅ **Implemented**`(userName?: string, profileImage?: ImageSource)`Reusable app header component**Features:**

- Profile picture link (default image provided)
- User greeting section
- Notification icon
- Responsive layout

**Props:**

- `userName`: Displayed user name (default "Firzan")
- `profileImage`: Custom profile image source
- `showNotifications`: Toggles bell icon (default true)

---

## App-Specific Components

### Public User Components

#### ReportList

✅ **Implemented**
`(reports: Report[], loading: boolean)`
Displays list of submitted reports
**Sub-component: ListItem**
Handles individual report display

### Utility Components

#### RotatingImage

✅ **Implemented**Animated rotating image component**Technical:**

- Uses react-native-reanimated
- Smooth constant rotation

---

## Component Status

| Component     | Status | Notes                    |
| ------------- | ------ | ------------------------ |
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
