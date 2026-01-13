const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

const query = (text, params) => pool.query(text, params)

async function getClient() {
  const client = await pool.connect()
  return client
}

module.exports = { pool, query, getClient }