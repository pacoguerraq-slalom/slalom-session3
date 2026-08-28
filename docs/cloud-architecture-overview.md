# TODO Application Cloud Architecture Overview

## System Context

```mermaid
flowchart LR
    User([User])
    Frontend[React Frontend]
    API[Express API]
    Store[(In-memory data store)]

    User -->|Uses task management UI| Frontend
    Frontend -->|HTTP REST requests| API
    API -->|Reads and writes tasks| Store
    Store -->|Task data responses| API
    API -->|JSON responses| Frontend
    Frontend -->|Displays task results| User
```

## Create TODO Workflow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API
    participant Store as In-memory data store

    User->>Frontend: Enter new TODO and click Create
    Frontend->>API: POST /api/tasks with TODO data
    API->>API: Validate request
    API->>Store: Store TODO
    Store-->>API: Return stored TODO
    API-->>Frontend: Return success response
    Frontend-->>User: Update UI and display new TODO
```

When the user submits a new TODO, the React frontend sends the task data to the Express API using `POST /api/tasks`. The API validates the request, stores the TODO in the in-memory data store, and returns a success response. The frontend then refreshes its task data and displays the new TODO to the user.

## Components

- **User:** Creates, edits, completes, and deletes TODO tasks through the application interface.
- **React Frontend:** Provides the browser-based task form and task list, manages user interactions, and communicates with the backend through REST requests.
- **Express API:** Exposes the `/api/tasks` endpoints, validates task requests, handles task operations, and returns JSON responses to the frontend.
- **In-memory data store:** Stores task records for the running application process. The current backend uses an in-memory SQLite database, so data is lost when the backend process stops.
