const utilities = require("../utilities/")
const baseController = {}

/* ***************************
 *  Build home view
 * ************************** */
baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("index", {
    title: "Home",
    metaDescription: "Welcome to CSE Motors! Browse our collection of cars, trucks, and SUVs.",
    ogTitle: "CSE Motors - Home",
    ogDescription: "Find your next vehicle at CSE Motors.",
    ogImage: "/images/vehicles/delorean.jpg",
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage: "/images/vehicles/delorean.jpg",
    nav,
  })
}

/* ***************************
 *  Trigger intentional server error (for testing)
 * ************************** */
baseController.throwError = async function (req, res, next) {
  try {
    // Intentionally trigger an error
    throw new Error("Intentional server error for testing.")
  } catch (err) {
    next(err) // pass error to the global middleware
  }
}

module.exports = baseController
