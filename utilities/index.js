const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
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
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next)



/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
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
 * Build classification select list
 * *************************************** */
Util.buildClassificationList = async function (selectedClassificationId = null) {
  const data = await invModel.getClassifications()
  let classifications = data.rows

  let list = '<select name="classification_id" id="classificationList" required>'
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
