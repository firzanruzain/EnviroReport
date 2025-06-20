# Forms Management

## Screens

### Forms Tab ✅

1. List of Pollution Types based on Division {from user Object}
2. For each pollution type

   - List active Form Template **{edge-function: fetch-active-form}**
   - onPress -> open `Forms Template Edit Page` **{pass form_template_id}**
   - `Manage` Button -> open [`Manage Forms Page`](#manage-forms-page) **{pass pollution_type_id}**

### Manage Forms Page

1. List of Forms (Name) for selected pollution type
2. Option Button for each forms:

   - View
   - Edit
   - Delete
   - Publish

3. `Create` Button -> [`New Form Page`](#new-form-screen)

### New Form Screen

1. Form Details Input:

   - Name
   - Description
   - Icon ??

2. `Create` Button -> Create Form {edge-function: create-form} ->
   return newly created form id -> `Edit Form Screen`

## Hooks

### useFormStore

1. Methods:

   1. fetchActiveForm (pollution_type_id: string) => return {form_templated_id, form_name}
   2. fetchForms (pollution_type_id: string) [with pagination]
   3. createForm(pollution_type_id) => return newly created form_template_id

2. Properties:

   1. forms: Form[]
   2. count: number
   3. limit: number
   4. offset: number
   5. isLoading: boolean
   6. hasMore: boolean
