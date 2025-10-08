// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const adminController = require("../controllers/adminController")

// Admin-only approval dashboard
router.get(
  "/approval",
  utilities.checkLogin,
  utilities.checkAdmin, // only admins can access
  utilities.handleErrors(adminController.buildApprovalView)
)

// POST to approve an item (classification or vehicle)
router.post(
  "/approve",
  utilities.checkLogin,
  utilities.checkAdmin,
  utilities.handleErrors(adminController.approveItem)
)

// POST to reject (delete) an unapproved item
router.post(
  "/reject",
  utilities.checkLogin,
  utilities.checkAdmin,
  utilities.handleErrors(adminController.rejectItem)
)

module.exports = router
