const pool = require("../database/")

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
    return result.rows[0]  // return the new account row
  } catch (error) {
    console.error("registerAccount error:", error)
    throw error   // Throw error so controller can handle it
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT account_email FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount > 0 // true if email exists
  } catch (error) {
    console.error("checkExistingEmail error:", error)
    throw error
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account
      WHERE account_email = $1
    `
    const result = await pool.query(sql, [account_email])
    if (result.rowCount === 0) return null
    return result.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error:", error)
    throw error
  }
}

module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail 
}
