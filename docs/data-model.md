
# QuickNotes Data Model

## Entities and columns

### Users

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | Primary key, generated |
| `name` | VARCHAR(120) | Not null |
| `email` | VARCHAR(254) | Not null, unique |
| `created_at` | TIMESTAMP | Not null, defaults to current time |

### Notes

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | Primary key, generated |
| `user_id` | BIGINT | Foreign key to `users.id`, not null |
| `title` | VARCHAR(100) | Not null |
| `body` | TEXT | Not null |
| `created_at` | TIMESTAMP | Not null, defaults to current time |
| `updated_at` | TIMESTAMP | Not null, defaults to current time |

### Tags

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | Primary key, generated |
| `user_id` | BIGINT | Foreign key to `users.id`, not null |
| `name` | VARCHAR(50) | Not null |
| `created_at` | TIMESTAMP | Not null, defaults to current time |
| — | — | Unique constraint on `(user_id, name)` |

### Note tags

| Column | Type | Constraints |
|---|---|---|
| `note_id` | BIGINT | Foreign key to `notes.id`, primary-key component |
| `tag_id` | BIGINT | Foreign key to `tags.id`, primary-key component |
| `created_at` | TIMESTAMP | Not null, defaults to current time |
| — | — | Composite primary key `(note_id, tag_id)` |

## Relationships

- One user can own many notes: `users.id` to `notes.user_id` is one-to-many.
- One user can own many tags: `users.id` to `tags.user_id` is one-to-many.
- A note can have many tags, and a tag can be attached to many notes: `notes` and `tags` have a many-to-many relationship through `note_tags`.
- A note and its tags must belong to the same user. The application enforces this ownership rule in transactions when adding tags.

## SQL schema

The schema uses PostgreSQL syntax.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
```

The notes index supports a user's most recent notes query. The `note_tags` index supports looking up notes associated with a tag.

## Example queries

### 1. List a user's notes newest first

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 27
ORDER BY created_at DESC
LIMIT 20;
```

### 2. Retrieve a note with its owner

```sql
SELECT n.id, n.title, n.body, u.name AS owner_name, u.email
FROM notes AS n
JOIN users AS u ON u.id = n.user_id
WHERE n.id = 1042 AND n.user_id = 27;
```

### 3. List notes attached to a tag

```sql
SELECT n.id, n.title, n.body
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE t.user_id = 27 AND t.name = 'Planning'
ORDER BY n.created_at DESC;
```

## SQL vs NoSQL

PostgreSQL is the recommended starting database because notes have clear relationships to users and tags, and foreign keys and transactions help maintain consistency. It supports indexing and joins for common queries. A document database could be useful for a different access pattern, but duplicating tag data inside note documents would make shared tag updates and relationship consistency more complex. PostgreSQL is sufficient for the expected initial workload and can be scaled with read replicas and partitioning if measurement shows a need.
