// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build Detail by vehicle ID view
router.get("/detail/:invId", 
  utilities.handleErrors(invController.buildDetailView))

// GET inventory management
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
)

// GET add classification
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// POST add classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

// GET add vehicle
router.get(
  "/add-vehicle",
  utilities.handleErrors(invController.buildAddVehicle)
)

// POST add vehicle
router.post(
  "/add-vehicle",
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.addVehicle)
)



module.exports = router;