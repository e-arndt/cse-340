// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// GET /account/login
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// GET /account/register
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)



module.exports = router;