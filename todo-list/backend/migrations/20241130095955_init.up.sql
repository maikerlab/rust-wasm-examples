CREATE TABLE todos(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    done INTEGER NOT NULL DEFAULT 0
);