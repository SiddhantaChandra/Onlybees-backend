require('dotenv').config()
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

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
