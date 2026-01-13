const path = require('path')
const dotenv = require('dotenv')
const express = require('express')
const eventsRouter = require('./routes/events')

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use(eventsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Server error' })
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
