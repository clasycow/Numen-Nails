PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, value TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  name TEXT NOT NULL, email TEXT NOT NULL, service TEXT NOT NULL, message TEXT NOT NULL,
  design TEXT, photos TEXT NOT NULL DEFAULT '[]', requested_slot_id TEXT,
  preferred_date TEXT, preferred_time TEXT, silent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new', notes TEXT NOT NULL DEFAULT '',
  deposit_received INTEGER NOT NULL DEFAULT 0, slot_id TEXT, appointment_start TEXT,
  reminder_consent INTEGER NOT NULL DEFAULT 0, reminder_state TEXT,
  reminder_lock TEXT, reminder_sent_at TEXT, revision TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiries_email ON inquiries(email,created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_reminders ON inquiries(status,appointment_start,reminder_state);
CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY, starts_at TEXT NOT NULL UNIQUE, ends_at TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open', inquiry_id TEXT UNIQUE,
  CHECK(ends_at > starts_at),
  FOREIGN KEY(inquiry_id) REFERENCES inquiries(id)
);
CREATE INDEX IF NOT EXISTS slots_availability ON slots(state,starts_at);
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, happened_at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, record_id TEXT NOT NULL);
