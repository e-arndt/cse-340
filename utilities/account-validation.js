const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

const accountModel = require("../models/account-model")

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
        return true
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check registration data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/register", {
      errors,
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      metaDescription: "Register for a CSE Motors account.",
      ogTitle: "CSE Motors - Register",
      ogDescription: "Sign up to create your CSE Motors account.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg"
    })
  }
  next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address."),

    // password is required (don’t enforce strong rules here, just required)
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password."),
  ]
}

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, // sticky
      metaDescription: "Login to your CSE Motors account.",
      ogTitle: "CSE Motors - Login",
      ogDescription: "Log in to manage your account at CSE Motors.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg"
    })
  }
  next()
}

/* **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.accountUpdateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long.")
      .isAlpha()
      .withMessage("First name may only contain letters."),
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long.")
      .isAlpha()
      .withMessage("Last name may only contain letters."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email address is required.")
      .custom(async (account_email, { req }) => {
        // Check if email is already used by another account
        const existing = await accountModel.checkExistingEmail(account_email)
        // Allow current user to keep their email
        if (existing && account_email !== req.body.current_email) {
          throw new Error("Email already exists. Please choose another.")
        }
        return true
      })
  ]
}

/* **********************************
 *  Check Updated Account Data
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.status(400).render("account/edit-account", {
      title: "Edit Account Information",
      nav,
      errors,
      accountData: res.locals.accountData,
      loggedin: res.locals.loggedin,
      metaDescription: "Edit your CSE Motors account information.",
      ogTitle: "CSE Motors - Edit Account",
      ogDescription: "Update your account details at CSE Motors.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg"
    })
  }
  next()
}

/* **********************************
 *  Password Update Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and special character.")
  ]
}

/* **********************************
 *  Check Password Update Data
 * ********************************* */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.status(400).render("account/edit-account", {
      title: "Edit Account Information",
      nav,
      errors,
      accountData: res.locals.accountData,
      loggedin: res.locals.loggedin,
      metaDescription: "Edit your CSE Motors account information.",
      ogTitle: "CSE Motors - Edit Account",
      ogDescription: "Update your account details at CSE Motors.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg"
    })
  }
  next()
}


module.exports = validate
