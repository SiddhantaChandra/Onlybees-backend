const express = require("express");
const { query } = require("../db");

const router = express.Router();

router.get("/bookings", async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.id,
		    b.qty,
		    b.created_at,
		    e.id AS event_id,
		    e.name AS event_name,
		    s.id AS section_id,
		    s.name AS section_name,
		    s.price AS section_price
		FROM bookings b
		JOIN events e ON b.event_id = e.id
		JOIN sections s ON b.section_id = s.id
		ORDER BY b.created_at DESC, b.id DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
