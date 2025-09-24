// controllers/accountController.js
const utilities = require("../utilities")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    metaDescription: "Login to your CSE Motors account.",
    ogTitle: "CSE Motors - Login",
    ogDescription: "Log in to manage your account at CSE Motors.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg"
  })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    metaDescription: "Register for a CSE Motors account.",
    ogTitle: "CSE Motors - Register",
    ogDescription: "Sign up to create your CSE Motors account.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg"
  })
}

module.exports = { buildLogin, buildRegister }

