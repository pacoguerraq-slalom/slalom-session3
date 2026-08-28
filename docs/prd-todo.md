# Product Requirements Document (PRD) - TODO App Upgrade

## 1. Overview

The TODO app is currently limited to task titles and completion status. This upgrade will make the app more useful for managing urgency and prioritization while keeping the initial release simple, teachable, and local-only. The MVP will add optional due dates, priority levels, and date-based filters without requiring backend changes. Visual overdue highlighting and deterministic task sorting are intentionally planned for Post-MVP.

**Users and value**

- TODO app users can record when incomplete work is due and quickly focus on tasks due today or already overdue.
- Users can assign a simple priority level to distinguish the most important work.
- The product remains lightweight and easy to understand, with no account, server, or external-storage requirement.

**Source of requirements**

- [Requirements meeting](artifacts/09162025-requirements-meeting.vtt), September 16, 2025.
- [Slack clarification](artifacts/09172025-slack-conversation-export.txt), September 17, 2025. This artifact is the authoritative source for MVP versus Post-MVP scope where the two discussions differ.

## 2. MVP Scope

### Functional Requirements

- **Optional due dates:** Allow a task to have an optional `dueDate` represented as an ISO calendar date in `YYYY-MM-DD` format. A task may be created or retained without a due date.
- **Priority:** Add a `priority` field with the enum values `P1`, `P2`, and `P3`. New tasks default to `P3` when no priority is supplied.
- **Required title:** Require a non-empty task `title` when creating or editing a task. Existing completion behavior remains supported.
- **Date filters:** Provide quick-switch views or tabs named **All**, **Today**, and **Overdue**.
- **All view:** Display all tasks, including completed tasks.
- **Today view:** Display only incomplete tasks with a due date equal to the current local calendar date.
- **Overdue view:** Display only incomplete tasks with a due date earlier than the current local calendar date.
- **Invalid date handling:** If a supplied due date is invalid or does not conform to the required format, ignore it and treat the task as undated. The application must not fail because of an invalid date value.
- **Local persistence:** Persist task data using the existing local-storage approach so tasks, due dates, priorities, titles, and completion status survive page reloads.
- **No backend changes:** Implement the MVP without introducing or requiring backend APIs, server-side persistence, authentication, or external storage.

### User Experience Requirements

- Keep the interaction model simple and teachable.
- Make the three filter choices easy to discover and switch between.
- Use the existing TODO app patterns for creating, editing, completing, and persisting tasks.
- Priority values may be displayed as text in the MVP. Color-coded priority badges are not required until a later release.

### Data Contract

Each task must support the following fields:

| Field | Requirement |
| --- | --- |
| `title` | Required, non-empty task title. |
| `completed` | Existing completion state; preserve current behavior. |
| `priority` | Required normalized value of `P1`, `P2`, or `P3`; defaults to `P3`. |
| `dueDate` | Optional valid `YYYY-MM-DD` date; invalid values are treated as absent. |

### Assumptions

- “Today” and “Overdue” are evaluated against the user’s local calendar date, not a server time zone.
- A due date equal to today is not overdue.
- A missing or invalid due date cannot qualify a task for the Today or Overdue views.
- Existing tasks that predate the upgrade may lack the new fields; they should be treated as `priority: P3` with no due date.
- The existing task completion model and local-storage mechanism are retained unless implementation discovery shows a narrowly scoped compatibility adjustment is necessary.

### Constraints and Dependencies

- The MVP must remain local-only and must not require backend changes or an external service.
- The implementation depends on the existing frontend task model, local-storage persistence, and task-list/filter components.
- The implementation must use the exact priority values and due-date format defined in the data contract to keep persisted data predictable.
- No dedicated keyboard-navigation or expanded accessibility feature set is required for this MVP, per the agreed scope. Existing platform behavior and basic usability should not be intentionally regressed.

### Success Metrics

- 100% of newly created tasks have a valid priority value, defaulting to `P3` when omitted.
- 100% of accepted due dates conform to `YYYY-MM-DD`; invalid values are handled as absent without application failure.
- Filter results meet the defined inclusion rules for All, Today, and Overdue, including completed-task behavior.
- Task data remains available after a browser reload through local persistence.
- MVP delivery requires no backend or external-storage changes.

### Risks and Mitigations

- **Date and time-zone ambiguity:** Comparing timestamps instead of calendar dates could put tasks in the wrong filter. Compare normalized local calendar dates using the defined `YYYY-MM-DD` representation.
- **Legacy task compatibility:** Existing local-storage records may not contain `priority` or `dueDate`. Normalize missing fields on read, using `P3` and absent due date defaults.
- **Invalid persisted data:** Older or manually modified storage may contain unsupported values. Validate and normalize priority and due date values before rendering or filtering.
- **Scope expansion:** Visual urgency treatments and sorting could increase MVP complexity. Keep both explicitly deferred to Post-MVP.

### MVP Acceptance Criteria

- A user can create a task with a required title, an optional due date, and a priority of `P1`, `P2`, or `P3`.
- When a user omits priority, the task is stored and displayed with `P3`.
- A task with no due date can be created, stored, displayed, and completed normally.
- A valid `YYYY-MM-DD` due date is retained after saving and browser reload.
- An invalid due date is treated as absent, does not crash the app, and does not appear in Today or Overdue results.
- The All view includes completed and incomplete tasks.
- The Today view includes only incomplete tasks due on the user’s current local date.
- The Overdue view includes only incomplete tasks due before the user’s current local date.
- Completed tasks do not appear in Today or Overdue views.
- Existing tasks without the new fields remain usable and are interpreted as priority `P3` without a due date.
- The MVP operates entirely with local persistence and does not require a backend or external storage.

## 3. Post-MVP Scope

- **Overdue visual highlighting:** Highlight overdue tasks visually, with red as the proposed treatment, so they stand out in the task list. This was requested in the requirements meeting and explicitly approved for Post-MVP in Slack.
- **Deterministic task sorting:** Sort tasks in this order: overdue first, then priority from `P1` to `P3`, then due date ascending, with undated tasks last. This was also explicitly approved for Post-MVP in Slack.
- **Color-coded priority badges:** Consider visual priority badges using red for `P1`, orange for `P2`, and gray for `P3`, as discussed in the requirements meeting. The Slack scope decision does not require these badges in the MVP.

## 4. Out of Scope

- **Notifications and reminders:** No push, email, browser, or other due-date notifications.
- **Recurring tasks:** No recurrence rules or automatic task generation.
- **Multi-user functionality:** No accounts, collaboration, sharing, permissions, or synchronized team task lists.
- **External storage:** No database, cloud storage, or third-party persistence; local storage remains the agreed MVP storage mechanism.
- **Backend changes:** No new or modified backend APIs or server-side task processing for this upgrade.
- **Dedicated keyboard navigation:** No dedicated keyboard-navigation feature set or specialized accessibility expansion in the current scope.