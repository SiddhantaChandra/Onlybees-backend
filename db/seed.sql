BEGIN;

DELETE FROM bookings;
DELETE FROM sections;
DELETE FROM events;

WITH e AS (
  INSERT INTO events (name)
  VALUES ('Sample Event')
  RETURNING id
)
INSERT INTO sections (event_id, name, price, capacity, remaining)
SELECT id, 'VIP', 150, 10, 10 FROM e
UNION ALL
SELECT id, 'General', 75, 20, 20 FROM e;

COMMIT;
