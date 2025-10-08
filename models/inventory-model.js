const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 *  UPDATED: Only return approved inventory
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1 
         AND i.inv_approved = true`,   // only fetch approved items
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
  }
}

/* ***************************
 *  Get inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
       WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0] // single vehicle object
  } catch (error) {
    console.error("getInventoryById error:", error)
  }
}

/* ***************************
 *  Insert new classification
 *  NEW: inserted classifications are unapproved by default
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name, classification_approved)
      VALUES ($1, false)
      RETURNING *`
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("addClassification error:", error)
    throw error
  }
}

/* ***************************
 *  Insert new vehicle
 *  UPDATED: inserted vehicles are unapproved by default
 * ************************** */
async function addVehicle(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory
        (classification_id, inv_make, inv_model, inv_year, inv_description, 
         inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_approved)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
      RETURNING *`
    const data = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    ])
    return data.rows[0]
  } catch (error) {
    console.error("addVehicle error:", error)
    throw error
  }
}

/* ***************************
 *  Update existing vehicle by inv_id
 * ************************** */
async function updateVehicle(
  inv_id,
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      UPDATE inventory
      SET classification_id = $1,
          inv_make = $2,
          inv_model = $3,
          inv_year = $4,
          inv_description = $5,
          inv_image = $6,
          inv_thumbnail = $7,
          inv_price = $8,
          inv_miles = $9,
          inv_color = $10
      WHERE inv_id = $11
      RETURNING *`
    const data = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("updateVehicle error:", error)
    throw error
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rowCount // 1 if deleted, 0 if not
  } catch (error) {
    console.error("deleteInventory error:", error)
    throw error
  }
}

/* ***************************
 *  NEW: Get all unapproved inventory (for admin dashboard)
 * ************************** */
async function getUnapprovedInventory() {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.inv_approved = false
      ORDER BY i.inv_make, i.inv_model`
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getUnapprovedInventory error:", error)
    throw error
  }
}

/* ***************************
 *  NEW: Approve inventory item (admin action required)
 * ************************** */
async function approveInventory(inv_id, approverId) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_approved = true,
          account_id = $2,
          inv_approved_date = CURRENT_TIMESTAMP
      WHERE inv_id = $1`
    const result = await pool.query(sql, [inv_id, approverId])
    return result.rowCount > 0  // true if one row updated
  } catch (error) {
    console.error("approveInventory error:", error)
    throw error
  }
}


/* ***************************
 *  NEW: Delete inventory item (admin reject)
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return result.rowCount > 0  // true if deleted
  } catch (error) {
    console.error("deleteInventoryItem error:", error)
    throw error
  }
}


/* ***************************
 *  Exports
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addVehicle,
  updateVehicle,
  deleteInventory,
  getUnapprovedInventory,     // new for approval
  approveInventory,           // new for approval
  deleteInventoryItem         // new for approval
}
