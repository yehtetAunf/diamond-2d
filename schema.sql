CREATE TABLE IF NOT EXISTS current_result (
  id INTEGER PRIMARY KEY,
  result TEXT NOT NULL,
  set_value TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result TEXT NOT NULL,
  set_value TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO current_result (id, result, set_value, value, updated_at)
VALUES (1, '79', '1,245.67', '87,899.01', datetime('now'));
