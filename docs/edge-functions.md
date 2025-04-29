<p align="left"><a href="./application-architecture.md#back-end-supabase-edge-functions-"><-- back to application architecture</a></p>

# Edge Functions

This page document and track implementation of all available edge functions that are implemented inside Supabase and act as API HTTP endpoint.

## Auth
- [ ] signIn
- [ ] signUp
- [ ] forgotPassword

## Division
- [ ] fetch-division
- [ ] fetch-pollutions

## Form 
- [ ] fetch-form (```pollution id```)
- [ ] fetch-published-form (```pollution  id```)
- [ ] update-form (```data```, ```pollution id```)
- [ ] fetch-templates
- [ ] create-form (```data```)

## Report
- [ ] fetch-all-reports [```count```]
- [ ] fetch-report-by-pollution (```pollution id```) [```count```]
- [ ] update-feedback (```report id ```, ```data```)
- [ ] fetch-report-details (```report id```)
- [ ] create-report (```data```)

## User
- [ ] fetch-current-user
- [ ] fetch-user-profile (```user```)
- [ ] update-user-profile (```data```)