CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0
);

INSERT INTO users (login, password, is_admin) VALUES ('ewa', 'ewa123', 1);
INSERT INTO users (login, password, is_admin) VALUES ('marc', 'marc123', 0);
