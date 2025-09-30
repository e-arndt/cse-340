/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/

// Session Middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Browser Cookie Parser Middleware
app.use(cookieParser())

// JWT Authentication Middleware
// Checks for a valid JSON Web Token (jwt) in browser cookies.
app.use(utilities.checkJWTToken)


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // not at views root


/* ***********************
 * Default template variables middleware
 *************************/
app.use((req, res, next) => {
  res.locals.metaDescription = "Browse vehicles at CSE Motors"
  res.locals.ogTitle = "CSE Motors"
  res.locals.ogDescription = "Find your next vehicle today."
  res.locals.ogImage = "/images/vehicles/delorean.jpg"
  res.locals.ogUrl = req.protocol + "://" + req.get("host") + req.originalUrl
  res.locals.preloadImage = ""
  next()
})


/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Error link route (Task 3)
app.get("/test-error", utilities.handleErrors(baseController.throwError))

// Vehicle inventory route
app.use("/inv", inventoryRoute)

// Account login route
app.use("/account", accountRoute)


/* ***********************
 * File Not Found Route - must be last route in list
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "No Such Page! Sorry, that page resulted in a deadend crash." })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  console.error(err.stack)
  
  let message, ogImage, preloadImage

  switch (err.status) {
    case 400:
      message = "Bad request. Please check your input."
      ogImage = "/images/site/error-400.png"
      preloadImage = "/images/site/error-400.png"
      break
    case 401:
      message = "Unauthorized. Please log in."
      ogImage = "/images/site/error-401.png"
      preloadImage = "/images/site/error-401.png"
      break
    case 403:
      message = "Forbidden. You do not have permission."
      ogImage = "/images/site/error-403.png"
      preloadImage = "/images/site/error-403.png"
      break
    case 404:
      message = err.message
      ogImage = "/images/site/deadend.png"
      preloadImage = "/images/site/deadend.png"
      break
    default:
      message = "Oh no! There was a crash. Better try a different route!"
      ogImage = "/images/site/delorean-crash.png"
      preloadImage = "/images/site/delorean-crash.png"
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
    metaDescription: "An error occurred while trying to access CSE Motors.",
    ogTitle: "CSE Motors - Error",
    ogDescription: message,
    ogImage,
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500


/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
