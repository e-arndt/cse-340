const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    metaDescription: `Browse our selection of ${className} vehicles available at CSE Motors.`,
    ogTitle: `${className} Vehicles at CSE Motors`,
    ogDescription: `Find your next ride among our ${className} vehicles — quality options for every driver.`,
    ogImage: data[0].inv_thumbnail || data[0].inv_image || "/images/site/logo.png",
    ogUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    preloadImage: data[0]?.inv_thumbnail || data[0]?.inv_image || null,
    nav,
    grid,
  })
}



/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  const vehicleData = await invModel.getInventoryById(inv_id)
  let nav = await utilities.getNav()

  if (!vehicleData) {
    return next({ status: 404, message: "Vehicle not found" })
  }

  // Build the detail HTML using the utility
  const detail = await utilities.buildDetailView(vehicleData)

  res.render("./inventory/detail", {
  title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
  metaDescription: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}. ${vehicleData.inv_description}`,
  ogTitle: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
  ogDescription: vehicleData.inv_description,
  ogImage: vehicleData.inv_image,
  ogUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
  preloadImage: vehicleData.inv_image,

    nav,
    detail
  })
}



module.exports = invCont