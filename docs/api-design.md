
# QuickNotes API Design

## Overview

QuickNotes uses a REST-style JSON API. The base path is `/api/v1`, and note resources are represented by `/notes`. The examples describe the intended production API; the browser prototype uses JSONPlaceholder to demonstrate GET, POST, and DELETE requests.

## Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| GET | `/api/v1/notes` | List the authenticated user's notes, with pagination | `200 OK` |
| GET | `/api/v1/notes/{noteId}` | Retrieve one note | `200 OK` |
| POST | `/api/v1/notes` | Create a note | `201 Created` |
| PATCH | `/api/v1/notes/{noteId}` | Update selected note fields | `200 OK` |
| DELETE | `/api/v1/notes/{noteId}` | Delete a note | `204 No Content` |
| GET | `/api/v1/tags` | List the user's tags | `200 OK` |
| POST | `/api/v1/notes/{noteId}/tags` | Associate a tag with a note | `201 Created` |

## Create note

Request:

`POST /api/v1/notes`

```json
{
  "title": "Project ideas",
  "body": "Plan the first QuickNotes release.",
  "tagIds": [2, 4]
}
```

Response: `201 Created`

```json
{
  "id": 1042,
  "userId": 27,
  "title": "Project ideas",
  "body": "Plan the first QuickNotes release.",
  "createdAt": "2026-10-28T09:00:00Z",
  "updatedAt": "2026-10-28T09:00:00Z",
  "tags": [
    { "id": 2, "name": "Work" },
    { "id": 4, "name": "Planning" }
  ]
}
```

The response includes a server-generated ID and timestamps. The server obtains `userId` from the authenticated session rather than trusting a user ID supplied in the request.

## List notes

Request:

`GET /api/v1/notes?limit=20&cursor=eyJpZCI6MTAwMH0`

Response: `200 OK`

```json
{
  "data": [
    {
      "id": 1042,
      "userId": 27,
      "title": "Project ideas",
      "body": "Plan the first QuickNotes release.",
      "createdAt": "2026-10-28T09:00:00Z",
      "updatedAt": "2026-10-28T09:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": null
  }
}
```

Cursor pagination avoids large offset scans as the collection grows. The API returns only notes belonging to the authenticated user.

## Error handling

Errors use an appropriate HTTP status and a consistent JSON body.

| Status | Meaning | Example |
|---|---|---|
| `400 Bad Request` | Invalid input or malformed JSON | Title is empty |
| `401 Unauthorized` | Authentication is missing or invalid | No valid session |
| `403 Forbidden` | The user is authenticated but lacks permission | Access to a restricted resource |
| `404 Not Found` | The resource does not exist or is not accessible to the user | Unknown note ID |
| `500 Internal Server Error` | An unexpected server failure occurred | Database operation failed |

Example error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required.",
    "details": [
      {
        "field": "title",
        "issue": "must not be empty"
      }
    ],
    "requestId": "req_8f31c2"
  }
}
```

Error responses should not expose stack traces, database credentials, or internal implementation details. A request ID helps the support team trace a failure in server logs.
