const express = require("express");
const { getClient } = require("../db");

const router = express.Router();

router.post("/book", async (req, res, next) => {
  const { eventId, sectionId, qty } = req.body || {};

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res
      .status(400)
      .json({ error: "eventId must be a positive integer" });
  }
  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    return res
      .status(400)
      .json({ error: "sectionId must be a positive integer" });
  }
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: "qty must be a positive integer" });
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const sectionRes = await client.query(
      "SELECT id, remaining FROM sections WHERE id = $1 AND event_id = $2 FOR UPDATE",
      [sectionId, eventId]
    );

    if (sectionRes.rows.length === 0) {
      const err = new Error("Section not found for event");
      err.status = 404;
      throw err;
    }

    const section = sectionRes.rows[0];
    if (section.remaining < qty) {
      const err = new Error("Not enough seats");
      err.status = 400;
      throw err;
    }

    await client.query(
      "UPDATE sections SET remaining = remaining - $1 WHERE id = $2",
      [qty, sectionId]
    );

    const bookingRes = await client.query(
      "INSERT INTO bookings (event_id, section_id, qty) VALUES ($1, $2, $3) RETURNING id, created_at",
      [eventId, sectionId, qty]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      bookingId: bookingRes.rows[0].id,
      eventId,
      sectionId,
      qty,
      createdAt: bookingRes.rows[0].created_at,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
