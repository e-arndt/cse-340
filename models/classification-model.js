// models/classification-model.js
const pool = require("../database/")

/* ***************************
 *  Get all unapproved classifications
 * ************************** */
async function getUnapprovedClassifications() {
  try {
    const sql = `
      SELECT * FROM public.classification
      WHERE classification_approved = false
      ORDER BY classification_name`
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getUnapprovedClassifications error:", error)
    throw error
  }
}

/* ***************************
 *  Approve a classification
 * ************************** */
async function approveClassification(classification_id, approverId) {
  try {
    const sql = `
      UPDATE public.classification
      SET classification_approved = true,
          account_id = $2,
          classification_approval_date = CURRENT_TIMESTAMP
      WHERE classification_id = $1`
    const result = await pool.query(sql, [classification_id, approverId])
    return result.rowCount > 0  // success flag
  } catch (error) {
    console.error("approveClassification error:", error)
    throw error
  }
}


/* ***************************
 *  Delete a classification (rejected)
 * ************************** */
async function deleteClassification(classification_id) {
  try {
    // Prevent deletion if vehicles exist
    const check = await pool.query(
      "SELECT COUNT(*) FROM public.inventory WHERE classification_id = $1",
      [classification_id]
    )
    if (parseInt(check.rows[0].count) > 0) {
      return false // don’t delete
    }

    const result = await pool.query(
      "DELETE FROM public.classification WHERE classification_id = $1",
      [classification_id]
    )
    return result.rowCount > 0
  } catch (error) {
    console.error("deleteClassification error:", error)
    throw error
  }
}



async function getClassificationById(classification_id) {
  return pool.query(
    "SELECT * FROM public.classification WHERE classification_id = $1",
    [classification_id]
  ).then(result => result.rows[0])
}


/* ***************************
 *  Export functions
 * ************************** */
module.exports = {
  getUnapprovedClassifications,
  approveClassification,
  getClassificationById,
  deleteClassification
}
