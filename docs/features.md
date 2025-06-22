# Core Features

This page document and tracks full implementation of each features based on project's requirements which include all needed components (`modules`, `models`, `hooks`, `edge functions`).

## Public User App

### Authentication

- [x] Sign Up
- [x] Log In/Logout
- [ ] Forgot Password

### Profile Management

- [ ] View Profile
- [ ] Edit Profile

### Dashboard

- [x] View User Dashboard (shows submitted reports count and latest reports)

### Incident Reporting

- [ ] Submit New Report
  - [ ] Select pollution type
  - [ ] Fill dynamic form based on pollution type
  - [ ] Location tagging on map
  - [ ] Document upload
- [x] View Submitted Reports (list view)
- [x] View Report Details
- [ ] Map View of submitted reports

## Staff Division App

### Authentication

- [ ] Staff Login/Logout

### Dashboard

- [x] View Division Dashboard (shows report statistics)

### Profile Management

- [ ] View Profile
- [ ] Edit Profile

### Report Management

- [x] View Division Submitted Reports
  - [x] add report id in report details
  - [ ] Filter by pollution type
  - [x] Search reports
- [x] Update Report Status (Pending/In Review/Closed)
- [ ] Send Form Feedback
- [x] View Report Details
  - [x] timeline view of reports

### Form Management

- [x] Create New Form
  - [x] From scratch
  - [ ] From template library
- [x] View Existing Forms
- [x] View Published Form
- [ ] Search/filter forms
- [x] Edit Form
  - [x] Add/remove fields
  - [x] Reorder fields
  - [x] save form
- [x] Publish/Unpublish Form
- [x] Delete Form

## Cross-Cutting Features

- [ ] Notifications system
- [ ] Data validation
- [ ] Responsive UI for mobile

---
