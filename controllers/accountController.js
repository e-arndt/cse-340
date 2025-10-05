const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  const nav = await utilities.getNav()
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
accountController.buildRegister = async function (req, res, next) {
  const nav = await utilities.getNav()
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
 *  Deliver Account Management Landing View
 * *************************************** */
accountController.buildAccountHome = async function (req, res, next) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/account-home", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_id: accountData.account_id,
    account_type: accountData.account_type,
    metaDescription: "Landing page for your CSE Motors account.",
    ogTitle: "CSE Motors - Account Landing",
    ogDescription: "You’re logged in to your CSE Motors account.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg"
  })
}

/* ****************************************
 *  Deliver Inventory Management view
 * *************************************** */
accountController.buildInventoryManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    metaDescription: "Manage your CSE Motors inventory — add classifications and new vehicles.",
    ogTitle: "CSE Motors - Inventory Management",
    ogDescription: "Access tools to add new vehicle classifications and manage the inventory.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg"
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  const nav = await utilities.getNav()

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("success", "Account created successfully! You can now log in.")
      return res.redirect("/account/login")
    } else {
      req.flash("error", "Registration failed.")
      res.status(500).render("account/register", { title: "Register", nav, errors: null })
    }
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
accountController.accountLogin = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Invalid email or password." }],
      account_email,
    })
  }

  const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
  if (!passwordMatch) {
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Invalid password." }],
      account_email,
    })
  }

  delete accountData.account_password
  const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 3600 * 1000,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })

  req.flash("success", `Welcome back, ${accountData.account_firstname}!`)
  return res.redirect("/account/")
}

/* ****************************************
 *  Process Logout
 * *************************************** */
accountController.logout = async function (req, res) {
  res.clearCookie("jwt", { httpOnly: true, sameSite: "lax" })
  req.flash("success", "You have been logged out.")
  req.session.save(() => {
    res.redirect("/")
  })
}

/* ***************************
 *  Build Edit Account View
 * ************************** */
accountController.buildEditAccount = async function (req, res, next) {
  const account_id = parseInt(req.params.account_id)
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData

  if (accountData.account_id !== account_id) {
    req.flash("error", "Unauthorized access.")
    return res.redirect("/account/")
  }

  res.render("./account/edit-account", {
    title: "Edit Account Information",
    nav,
    errors: null,
    accountData,
    loggedin: res.locals.loggedin,
  })
}

/* ***************************
 *  Process Account Info Update
 * ************************** */
accountController.updateAccount = async function (req, res, next) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const nav = await utilities.getNav()

  try {
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    )

    if (updateResult) {
      // Re-fetch updated account info from DB
      const updatedAccount = await accountModel.getAccountById(account_id)

      // Refresh JWT cookie with updated info after account update
      const token = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      })

      // Update session object after account update
      req.session.accountData = updatedAccount

      req.flash("success", "Account information updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Update failed.")
      res.status(500).render("./account/edit-account", {
        title: "Edit Account Information",
        nav,
        errors: null,
        accountData: { account_firstname, account_lastname, account_email, account_id },
        loggedin: res.locals.loggedin,
      })
    }
  } catch (err) {
    console.error("Error updating account:", err)
    next(err)
  }
}

/* ***************************
 *  Process Password Update
 * ************************** */
accountController.updatePassword = async function (req, res, next) {
  const { account_id, account_password } = req.body
  const nav = await utilities.getNav()

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      req.flash("success", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Password update failed.")
      res.status(500).render("./account/edit-account", {
        title: "Edit Account Information",
        nav,
        errors: null,
        accountData: res.locals.accountData,
        loggedin: res.locals.loggedin,
      })
    }
  } catch (err) {
    next(err)
  }
}

module.exports = accountController
