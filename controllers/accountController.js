// controllers/accountController.js
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
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
    errors: null,
    metaDescription: "Register for a CSE Motors account.",
    ogTitle: "CSE Motors - Register",
    ogDescription: "Sign up to create your CSE Motors account.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg"
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )


    if (regResult) {
      req.flash("notice", "Account successfully created. Please log in.")
      res.redirect("/account/login")
    } else {
      let nav = await utilities.getNav()
      res.status(500).render("account/register", {
        title: "Register",
        nav,
        metaDescription: "Register for a CSE Motors account.",
        ogTitle: "CSE Motors - Register",
        ogDescription: "Sign up to create your CSE Motors account.",
        ogImage: "/images/site/delorean.jpg",
        ogUrl: req.originalUrl,
        preloadImage: "/images/site/checkerboard.jpg",
        errors: null
      })
    }
  } catch (err) {
    next(err)
  }
}


module.exports = { buildLogin, buildRegister, registerAccount }

