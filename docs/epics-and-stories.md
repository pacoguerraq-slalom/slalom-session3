# TODO App Upgrade - Epics and User Stories

## MVP Epics

- Epic: Task Due-Date Management
  - Story: Add an optional due date to a task
    - Acceptance Criteria: Given a user creates or edits a task, when they provide a due date in `YYYY-MM-DD` format, then the task retains that due date.
    - Acceptance Criteria: Given a task has a due date, when the task is displayed or reloaded, then the due date is shown as part of the task.
    - Technical Requirements: Frontend: Extend `TaskForm`'s existing `dueDate` state and date input, and submit the normalized value with the task payload. Extend `TaskList`'s existing due-date display pattern. Backend: Preserve the existing `POST /api/tasks` and `PUT /api/tasks/:id` contracts and store the value in the task model's `due_date` field where the API remains in use.
  - Story: View a task without a due date
    - Acceptance Criteria: Given a user creates or edits a task without a due date, when the task is saved, then the task remains usable and displays no due date.
    - Acceptance Criteria: Given a task has no due date, when the user views Today or Overdue, then the task is not included in either view.
    - Technical Requirements: Frontend: Represent an absent date as an empty form value and conditionally render the existing due-date `Chip` only when a value is present. Backend: Persist an absent date as `NULL` using the existing `due_date` column when the REST API is used.
  - Story: Keep an invalid due date from preventing task use
    - Acceptance Criteria: Given a user supplies an invalid or non-`YYYY-MM-DD` due date, when the task is saved, then the value is treated as absent.
    - Acceptance Criteria: Given a task has an invalid due date, when the user views the task or switches filters, then the application remains usable and the task is excluded from Today and Overdue.
    - Technical Requirements: Frontend: Replace the current permissive `new Date()` normalization path in `TaskForm` with strict calendar-date validation before submission. Backend: Validate `due_date` at the request boundary and normalize invalid values to `NULL` rather than returning a server error; apply the same rule to create and update requests.

- Epic: Task Prioritization
  - Story: Assign P1, P2, or P3 priority to a task
    - Acceptance Criteria: Given a user creates or edits a task, when they select P1, P2, or P3, then the selected value is displayed for that task.
    - Acceptance Criteria: Given a task is saved, when its priority is inspected, then it is one of exactly P1, P2, or P3.
    - Technical Requirements: Frontend: Add a priority selector to `TaskForm`, constrain its options to `P1`, `P2`, and `P3`, include the selected value in POST/PUT payloads, and render the value in `TaskList`. Backend: Add a `priority` field to the existing task schema and accept only the same three values on create and update.
  - Story: Default a task to P3 when no priority is selected
    - Acceptance Criteria: Given a user creates a task without selecting a priority, when the task is saved, then its priority is P3.
    - Acceptance Criteria: Given an existing task has no priority, when the task is loaded, then it is treated as P3.
    - Technical Requirements: Frontend: Initialize new and legacy task form state to `P3` when no priority is supplied. Backend: Define the task-model default as `P3` and normalize missing values returned from existing records before they reach clients.
  - Story: View a task's priority as text
    - Acceptance Criteria: Given a task has a priority, when the task appears in any task view, then the priority is presented as readable text.
    - Acceptance Criteria: Given the MVP is being used, when a task priority is displayed, then a color-coded badge is not required for the task to be understandable.
    - Technical Requirements: Frontend: Add a plain-text priority value to the existing `ListItemText` or task metadata area in `TaskList`; do not require the Post-MVP badge styling. Backend: Include normalized `priority` in every task response from the existing list, detail, create, and update endpoints.
  - Story: Normalize an unsupported saved priority
    - Acceptance Criteria: Given saved task data contains a priority other than P1, P2, or P3, when the task is loaded, then the task is treated as priority P3.
    - Acceptance Criteria: Given saved task data contains an unsupported priority, when the task list is displayed, then the application remains usable.
    - Technical Requirements: Frontend: Normalize unsupported or missing response values to `P3` before form initialization and rendering. Backend: Validate persisted and request values against a shared `P1`/`P2`/`P3` allowlist and return `P3` for unsupported stored values without failing the list request.

- Epic: Date-Based Task Views
  - Story: Switch between All, Today, and Overdue views
    - Acceptance Criteria: Given the task list is open, when the user views the filter controls, then All, Today, and Overdue are clearly available.
    - Acceptance Criteria: Given the user selects a filter, when the selection changes, then the corresponding task view is displayed without requiring a backend service.
    - Technical Requirements: Frontend: Add filter state and discoverable MUI tab or toggle controls to the `TaskList` surface, defaulting to All. Implement filtering in the existing fetched-task rendering path. Backend: No new endpoint is required; if filtering is delegated to the API, extend `GET /api/tasks` with an explicit filter contract without removing the existing unfiltered request.
  - Story: View completed and incomplete tasks in the All view
    - Acceptance Criteria: Given the task list contains completed and incomplete tasks, when the user selects All, then both task states are displayed.
    - Technical Requirements: Frontend: Keep the existing `TaskList` mapping and completed checkbox behavior in the All predicate; do not apply a completion filter. Backend: Ensure the default `GET /api/tasks` response includes both `completed = 0` and `completed = 1` records.
  - Story: View incomplete tasks due today
    - Acceptance Criteria: Given the user selects Today, when a task is incomplete and its due date equals the user's local calendar date, then the task is displayed.
    - Acceptance Criteria: Given the user selects Today, when a task is completed, undated, invalidly dated, or due on another date, then the task is not displayed.
    - Technical Requirements: Frontend: Derive today as the browser's local `YYYY-MM-DD` calendar date and filter normalized tasks using exact date equality plus `completed === false`/`0`. Backend: No backend change is required for client-side filtering; do not compare timestamp strings using server time zones.
  - Story: View incomplete tasks with past due dates
    - Acceptance Criteria: Given the user selects Overdue, when a task is incomplete and its due date is earlier than the user's local calendar date, then the task is displayed.
    - Acceptance Criteria: Given the user selects Overdue, when a task is completed, undated, invalidly dated, due today, or due in the future, then the task is not displayed.
    - Technical Requirements: Frontend: Filter normalized `YYYY-MM-DD` values with a strict date-only comparison against the browser's local date and require an incomplete task. Backend: No backend change is required for client-side filtering; if server-side filtering is later used, define the comparison timezone explicitly as the user's local calendar date.
  - Story: Exclude completed tasks from Today and Overdue views
    - Acceptance Criteria: Given a task appears in Today or Overdue, when the user marks it completed, then it is removed from that filtered view.
    - Acceptance Criteria: Given a completed task has a due date in the past or today, when the user selects Today or Overdue, then the task is not displayed.
    - Technical Requirements: Frontend: Recompute the active filter after `handleToggleComplete` refreshes tasks, using the existing PATCH `/api/tasks/:id` flow. Backend: Preserve the existing boolean completion PATCH contract and return the updated completion value so the frontend can reapply the predicate.

- Epic: Core Task Management
  - Story: Create or edit a task with a required title
    - Acceptance Criteria: Given a user creates or edits a task, when the title is non-empty, then the task can be saved with its title.
    - Acceptance Criteria: Given a user creates or edits a task, when the title is empty, then the task cannot be saved without a title.
    - Technical Requirements: Frontend: Reuse `TaskForm`'s existing `title` state, `required` input, trim check, and `onSave` callback for both POST and PUT flows in `App`. Backend: Preserve the existing title validation in `POST /api/tasks` and `PUT /api/tasks/:id`, including the 400 response for missing or whitespace-only titles.
  - Story: Continue completing tasks in the task list
    - Acceptance Criteria: Given an incomplete task is displayed, when the user marks it completed, then its completed state changes to complete.
    - Acceptance Criteria: Given a completed task is displayed, when the user marks it incomplete, then its completed state changes to incomplete.
    - Technical Requirements: Frontend: Preserve `TaskList`'s Checkbox and `handleToggleComplete` implementation, including PATCH payload `{ completed: boolean }`, then refetch tasks so filtered results update. Backend: Preserve `PATCH /api/tasks/:id` boolean validation, integer storage convention, and updated-task response.
  - Story: Keep task details available after a page reload
    - Acceptance Criteria: Given a user saves a task with its title, completion state, priority, and due date, when the page is reloaded, then those task details are restored.
    - Acceptance Criteria: Given a user saves multiple tasks, when the page is reloaded, then all saved tasks remain available.
    - Technical Requirements: Frontend: Persist and hydrate the complete task shape through the repository's agreed local-storage path; update `App`/`TaskList` refresh behavior without losing `title`, `completed`, `priority`, or `dueDate`. Backend: No server persistence dependency is permitted by the PRD; the current in-memory SQLite implementation must not be treated as reload persistence. Existing REST calls may remain only where they do not conflict with the local-only contract.
  - Story: Continue using existing tasks without a due date or priority
    - Acceptance Criteria: Given existing saved tasks lack due date and priority fields, when the app is upgraded and loaded, then the tasks remain viewable and usable.
    - Acceptance Criteria: Given an existing saved task lacks a priority, when the task is displayed, then it is treated as P3 and has no due date.
    - Technical Requirements: Frontend: Normalize legacy task responses at the `TaskList` data boundary, accepting the current API's `due_date` naming and mapping missing fields to no due date and `P3`. Backend: Make the new `priority` column nullable-compatible during migration or response normalization, and preserve existing `title`, `description`, `due_date`, and `completed` records.

## Post-MVP Epics

- Epic: Overdue Task Visibility
  - Story: Visually highlight overdue tasks
    - Acceptance Criteria: Given an incomplete task has a due date earlier than the user's local calendar date, when the task is displayed, then it has a visually distinct overdue treatment.
    - Acceptance Criteria: Given a task is due today, in the future, undated, or completed, when the task is displayed, then it is not marked as overdue.
    - Technical Requirements: Frontend: Add an overdue predicate alongside the existing completed-state styling in `TaskList` and apply a distinct red visual treatment only to incomplete tasks with a date earlier than the browser's local calendar date. Backend: Return normalized due-date and completion fields; no new endpoint is required.

- Epic: Task Sorting
  - Story: Show overdue tasks before other tasks
    - Acceptance Criteria: Given a task list contains overdue and non-overdue tasks, when the list is displayed, then overdue tasks appear before non-overdue tasks.
    - Technical Requirements: Frontend: Replace the current response-order rendering with a stable comparator that evaluates the same local-date overdue predicate used by highlighting. Backend: If sorting is performed in `GET /api/tasks`, add an explicit overdue ordering expression based on normalized date values and completion state; preserve the API response shape.
  - Story: Sort tasks by priority from P1 to P3
    - Acceptance Criteria: Given tasks share the same overdue status, when they are displayed, then higher-priority tasks appear before lower-priority tasks in the order P1, P2, P3.
    - Technical Requirements: Frontend: Add a priority rank map `P1 < P2 < P3` to the stable task comparator and normalize missing/unsupported values to P3 before comparison. Backend: Add the same rank ordering only if server-side sorting is selected; use the constrained `priority` field rather than lexical ordering assumptions.
  - Story: Sort tasks by ascending due date
    - Acceptance Criteria: Given tasks share the same overdue status and priority, when they have due dates, then they appear from earliest due date to latest due date.
    - Technical Requirements: Frontend: Compare valid `YYYY-MM-DD` strings as date-only values after validating them, avoiding `new Date()` timezone conversion. Backend: If sorting in SQL, order the ISO-compatible `due_date` column ascending after overdue and priority keys.
  - Story: Show undated tasks after dated tasks
    - Acceptance Criteria: Given tasks share the same overdue status and priority, when some tasks have due dates and others do not, then undated tasks appear after dated tasks.
    - Technical Requirements: Frontend: Add an explicit missing-date comparator branch after valid due-date comparison so `NULL`/empty dates sort last. Backend: Preserve `NULL` for absent dates and use an explicit nulls-last ordering expression rather than relying on database defaults.

- Epic: Visual Priority Indicators
  - Story: Display color-coded priority badges
    - Acceptance Criteria: Given a task has priority P1, P2, or P3, when the task is displayed, then its priority has a color-coded badge.
    - Acceptance Criteria: Given a task has priority P1, P2, or P3, when the badge is displayed, then P1 is red, P2 is orange, and P3 is gray.
    - Technical Requirements: Frontend: Extend the existing MUI `Chip` pattern in `TaskList` with a priority chip whose label is the normalized priority and whose styles map P1 to red, P2 to orange, and P3 to gray; retain readable text independent of color. Backend: Include the normalized priority in all task responses; no new endpoint or integration is required.