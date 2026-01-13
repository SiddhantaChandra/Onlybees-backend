const express = require('express')
const { getClient } = require('../db')

const router = express.Router()

router.post('/events/create', async (req, res, next) => {
	const body = req.body || {}
	if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
		return res.status(400).json({ error: 'Event name is required' })
	}
	if (!Array.isArray(body.sections) || body.sections.length === 0) {
		return res.status(400).json({ error: 'At least one section is required' })
	}

	const sections = body.sections
	for (let i = 0; i < sections.length; i += 1) {
		const s = sections[i]
		if (!s || typeof s.name !== 'string' || !s.name.trim()) {
			return res.status(400).json({ error: `Section ${i} name is required` })
		}
		if (typeof s.price !== 'number' || Number.isNaN(s.price) || s.price < 0) {
			return res.status(400).json({ error: `Section ${i} price must be a non-negative number` })
		}
		if (!Number.isInteger(s.capacity) || s.capacity <= 0) {
			return res.status(400).json({ error: `Section ${i} capacity must be a positive integer` })
		}
	}

	const client = await getClient()

	try {
		await client.query('BEGIN')
		const eventInsert = await client.query('INSERT INTO events (name) VALUES ($1) RETURNING id', [body.name.trim()])
		const eventId = eventInsert.rows[0].id

		const createdSections = []
		for (let i = 0; i < sections.length; i += 1) {
			const s = sections[i]
			const result = await client.query(
				'INSERT INTO sections (event_id, name, price, capacity, remaining) VALUES ($1, $2, $3, $4, $4) RETURNING id, name, price, capacity, remaining',
				[eventId, s.name.trim(), s.price, s.capacity]
			)
			createdSections.push(result.rows[0])
		}

		await client.query('COMMIT')
		return res.status(201).json({ eventId, name: body.name.trim(), sections: createdSections })
	} catch (err) {
		await client.query('ROLLBACK')
		return next(err)
	} finally {
		client.release()
	}
})

module.exports = router
