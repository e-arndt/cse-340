// controllers/accountController.js
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


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


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  // If no account found
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    // Compare entered password with hashed password in DB
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)

    if (passwordMatch) {
      delete accountData.account_password

      // Create JWT token (expires in 1 hour = 3600 seconds)
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

      // Set cookie with JWT token
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      // Redirect to account management area
      return res.redirect("/account/")
    } else {
      // Invalid password
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "Something went wrong. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}


module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin 
}


