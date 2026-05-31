import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH || './data/trendsensor.db'

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  const resolvedPath = path.resolve(process.cwd(), DB_PATH)
  const dir = path.dirname(resolvedPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(resolvedPath)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  initSchema(_db)
  return _db
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS keywords (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      term        TEXT    NOT NULL UNIQUE,
      view        TEXT    NOT NULL CHECK(view IN ('korean','foreign')),
      first_seen  TEXT    NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_keywords_view ON keywords(view);

    CREATE TABLE IF NOT EXISTS weekly_snapshots (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword_id   INTEGER NOT NULL REFERENCES keywords(id),
      iso_week     TEXT    NOT NULL,
      score        REAL    NOT NULL,
      collected_at TEXT    NOT NULL,
      UNIQUE(keyword_id, iso_week)
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_week ON weekly_snapshots(iso_week);
    CREATE INDEX IF NOT EXISTS idx_snapshots_kw   ON weekly_snapshots(keyword_id);

    CREATE TABLE IF NOT EXISTS trend_labels (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword_id     INTEGER NOT NULL REFERENCES keywords(id),
      iso_week       TEXT    NOT NULL,
      label          TEXT    NOT NULL CHECK(label IN ('rising','fading','new_entry','exited','stable')),
      score_current  REAL,
      score_previous REAL,
      delta_pct      REAL,
      UNIQUE(keyword_id, iso_week)
    );

    CREATE INDEX IF NOT EXISTS idx_labels_week ON trend_labels(iso_week);
  `)
}
