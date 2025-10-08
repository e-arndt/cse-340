const pool = require("../database/")
const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ************************
 * Constructs the nav HTML unordered list
 * Only shows classifications that are approved
 * and have at least one approved inventory item
 ************************** */
Util.getNav = async function () {
  try {
    const data = await pool.query(`
      SELECT DISTINCT c.classification_id, c.classification_name
      FROM public.classification AS c
      JOIN public.inventory AS i
        ON c.classification_id = i.classification_id
      WHERE c.classification_approved = true
        AND i.inv_approved = true
      ORDER BY c.classification_name
    `)

    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
      list += `
        <li>
          <a href="/inv/type/${row.classification_id}"
             title="See our inventory of ${row.classification_name} vehicles">
             ${row.classification_name}
          </a>
        </li>`
    })
    list += "</ul>"

    return list
  } catch (error) {
    console.error("getNav error:", error)
    return '<ul><li><a href="/" title="Home">Home</a></li></ul>'
  }
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += `
        <a href="../../inv/detail/${vehicle.inv_id}" 
           title="View ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} details">
          <div class="card-image">
            <img src="${vehicle.inv_thumbnail}" 
                 alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} thumbnail">
          </div>
        </a>
        <div class="namePrice">
          <hr>
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" 
               title="View ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      `
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}



/* ***************************
 * Build HTML for a single vehicle detail
 * ************************** */
Util.buildDetailView = async function(vehicle) {
  let detail = `
     <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
      <h2>Details and Description</h2>
      <div class="price-detail">
        <p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
      </div>
        <p><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
  `
  return detail
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next)



/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  res.locals.loggedin = false
  res.locals.accountData = null

  const token = req.cookies?.jwt
  if (!token) {
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      // Token invalid or expired
      res.clearCookie("jwt", { httpOnly: true, sameSite: "lax" })
      return next()
    }
    // Token valid
    res.locals.accountData = accountData
    res.locals.loggedin = true
    next()
  })
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


 /* ****************************************
 *  Check if user is Employee or Admin
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && 
     (res.locals.accountData.account_type === "Employee" || 
      res.locals.accountData.account_type === "Admin")) {
    next()
  } else {
    req.flash("notice", "You do not have permission to access that page.")
    return res.redirect("/account/login")
  }
}


/* ****************************************
 *  Check if user is Admin
 * ************************************ */
Util.checkAdmin = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData.account_type === "Admin") {
    next()
  } else {
    req.flash("notice", "Admin access only.")
    return res.redirect("/account/login")
  }
}


 /* ****************************************
 * Build classification select list
 * *************************************** */
Util.buildClassificationList = async function (selectedClassificationId = null) {
  const data = await invModel.getClassifications()
  let classifications = data.rows

  // id and name must match the label's
  let list = '<select class="mgmt-dropdown" name="classification_id" id="classification_id" required>'
  list += '<option value="">Choose a Classification</option>'

  classifications.forEach((row) => {
    list += `<option value="${row.classification_id}" ${
      selectedClassificationId == row.classification_id ? "selected" : ""
    }>${row.classification_name}</option>`
  })

  list += "</select>"
  return list
}



module.exports = Util