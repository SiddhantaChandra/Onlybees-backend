CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10) NOT NULL CHECK (price >= 0),
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  remaining INTEGER NOT NULL CHECK (remaining >= 0 AND remaining <= capacity),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, name),
  UNIQUE (id, event_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_id INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_section_fk FOREIGN KEY (section_id, event_id) REFERENCES sections(id, event_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sections_event ON sections(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_section ON bookings(section_id);
