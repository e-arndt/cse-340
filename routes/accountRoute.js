// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

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


// POST /account/register
// Handles form submission from the registration view
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)


// POST /account/login
// Handles login request submission
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)


// GET /account/ (default route)
// Account management landing page
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountHome)
)

// GET /account/edit/:account_id
router.get(
  "/edit/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildEditAccount)
)

// POST /account/update — handle account info update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// POST /account/update-password — handle password change
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// GET /account/management
// Inventory management view
router.get(
  "/management",
  utilities.handleErrors(accountController.buildInventoryManagement)
)

// Handle Logout process
router.get("/logout", utilities.handleErrors(accountController.logout))



module.exports = router
