BEGIN;

DELETE FROM bookings;
DELETE FROM sections;
DELETE FROM events;

WITH e1 AS (
  INSERT INTO events (name)
  VALUES ('Sample Event')
  RETURNING id
)
INSERT INTO sections (event_id, name, price, capacity, remaining)
SELECT id, 'VIP', 150, 10, 10 FROM e1
UNION ALL
SELECT id, 'General', 75, 20, 20 FROM e1;

INSERT INTO events (id, name) VALUES (99, 'Concurrency Test Event') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO sections (id, event_id, name, price, capacity, remaining)
VALUES (100, 99, 'Test Section', 50, 5, 5)
ON CONFLICT (id) DO UPDATE SET event_id = EXCLUDED.event_id, name = EXCLUDED.name, price = EXCLUDED.price, capacity = EXCLUDED.capacity, remaining = EXCLUDED.remaining;

SELECT setval('events_id_seq', (SELECT GREATEST(COALESCE(MAX(id),1), 100) FROM events), true);
SELECT setval('sections_id_seq', (SELECT GREATEST(COALESCE(MAX(id),1), 100) FROM sections), true);

COMMIT;
