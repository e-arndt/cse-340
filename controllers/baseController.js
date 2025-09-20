const utilities = require("../utilities/")
const baseController = {}

/* ***************************
 *  Build home view
 * ************************** */
baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {
    title: "Home",
    metaDescription: "Welcome to CSE Motors! Browse our collection of cars, trucks, and SUVs.",
    ogTitle: "CSE Motors - Home",
    ogDescription: "Find your next vehicle at CSE Motors.",
    ogImage: "/images/vehicles/delorean.jpg",
    ogUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    preloadImage: "/images/vehicles/delorean.jpg",
    nav
  })
}


module.exports = baseController
