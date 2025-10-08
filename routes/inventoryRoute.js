// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// ---------- Public Routes ----------

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build Detail by vehicle ID view
router.get(
  "/detail/:invId", 
  utilities.handleErrors(invController.buildDetailView)
)

// =============================================
// Inventory Management Routes (Employee/Admin)
// =============================================


// GET /inv/ (management view)
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
)

// GET add classification
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)

// POST add classification
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// GET add vehicle
router.get(
  "/add-vehicle",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddVehicle)
)

// POST add vehicle
router.post(
  "/add-vehicle",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.addVehicle)
)

// GET inventory items by classification_id (JSON response)
// (this one stays public because the client-side JS uses it for dropdowns)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ***************************
 * Edit Inventory Item View
 * ************************** */
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventoryView)
)

// POST update vehicle
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.vehicleRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateVehicle)
)

// Delete Confirmation View (Get item data)
router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteConfirmation)
)

// Carry Out the Delete (Delete item from DB)
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteVehicle)
)

module.exports = router
