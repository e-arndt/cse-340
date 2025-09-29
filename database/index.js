const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * Render requires SSL in production
 * Local dev does not
 * *************** */
let pool

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // 👈 required on Render
    },
  })
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

// Added for troubleshooting queries during development
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
