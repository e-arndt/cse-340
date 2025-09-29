const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * Always use SSL with Render’s Postgres
 * *************** */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Query wrapper (optional for logging/debugging)
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      if (process.env.NODE_ENV !== "production") {
        console.log("executed query", { text })
      }
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
}
