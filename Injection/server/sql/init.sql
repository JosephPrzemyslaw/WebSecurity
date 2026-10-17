CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

INSERT INTO users (login, password) VALUES ('ewa', 'ewa123');
INSERT INTO users (login, password) VALUES ('marc', 'marc123');
