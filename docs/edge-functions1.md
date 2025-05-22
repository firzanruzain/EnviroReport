<p align="left"><a href="./application-architecture.md#back-end-supabase-edge-functions-"><-- back to application architecture</a></p>

# Edge Functions

This page document and track implementation of all available edge functions that are implemented inside Supabase and act as API HTTP endpoint.

## Auth

* [x] signIn
* [x] signUp
* [ ] forgotPassword

## Division

* [ ] fetch-division
* [x] fetch-pollutions

  * fetch pollutions based on requested division\_id

## Form

* [x] fetch-forms (`pollution id`)
* [x] fetch-published-form (`pollution  id`)
* [x] update-form (`data`, `pollution id`)
* [x] fetch-form-template
* [x] create-form (`data`)

## Report

* [x] fetch-all-reports \[`count`]
* [x] fetch-report-by-pollution (`pollution id`) \[`count`]
* [x] update-feedback (`report id `, `data`)

  * need testing
* [x] fetch-report-details (`report id`)
* [x] create-report (`data`)

  * need testing

## User

* [x] fetch-current-user
* [x] fetch-user-profile (`user`)
* [ ] update-user-profile (`data`)

based on this list of edge functions for my system, suggest http method to be implemented for each of them
