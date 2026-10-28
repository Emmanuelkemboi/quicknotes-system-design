
# QuickNotes System Design

QuickNotes is a small notes application prototype and system-design project. The browser client demonstrates REST API requests for loading, creating, and deleting notes. The accompanying documents describe a production-oriented API contract, relational data model, and scalable architecture.

## Features

- Load a sample set of notes with `GET`.
- Create a note with `POST`.
- Delete a note with `DELETE`.
- Validate required fields and title length.
- Show loading, success, error, and empty states.
- Responsive layout for desktop and mobile screens.

## Run the API client

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Start a local static server, for example with the VS Code Live Server extension.
4. Open `index.html` through the local server.
5. Select **Load notes** to fetch sample notes, or create a note using the form.

The client uses `https://jsonplaceholder.typicode.com/posts` as a demonstration API, so an internet connection is required. JSONPlaceholder simulates write requests and does not permanently store created or deleted posts. The interface updates locally after a successful simulated write.

## Design documents

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- How a browser client uses `GET`, `POST`, and `DELETE` to interact with a REST-style API and handles unsuccessful HTTP responses.
- Why input validation, accessible status messages, and safe text rendering matter in a client application.
- How primary keys, foreign keys, indexes, and join tables represent relationships in a relational database.
- How load balancing, caching, read replicas, and background queues address different scaling and reliability needs.
- Why system design requires explicit assumptions and trade-offs rather than relying on component names alone.
