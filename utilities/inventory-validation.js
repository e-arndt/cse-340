const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require(".")
const validate = {}

/* ******************************
 * Classification Validation Rules
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
  ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name
    })
    return
  }
  next()
}

/* ******************************
 * Vehicle Validation Rules
 * ***************************** */
validate.vehicleRules = () => {
  return [
    body("inv_make")
      .matches(/^[A-Za-z]{2,}$/)
      .withMessage("Make must be 2+ letters only."),
    body("inv_model")
      .matches(/^[A-Za-z0-9]{2,}$/)
      .withMessage("Model must be 2+ letters or numbers."),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage("Please provide a valid 4-digit year."),
    body("inv_price")
      .matches(/^[0-9]{3,7}(\.[0-9]{1,2})?$/)
      .withMessage("Price must be 3–7 digits, integer or decimal to 2 places."),
    body("inv_miles")
      .matches(/^[0-9]{2,7}$/)
      .withMessage("Miles must be 2–7 digits, no commas or decimals."),
    body("inv_color")
      .matches(/^[A-Za-z ]{3,24}$/)
      .withMessage("Color must be 3–24 letters and spaces."),
    body("inv_description")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Description must be 4+ characters."),
    body("inv_image")
      .optional({ checkFalsy: true })
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/)
      .withMessage("Image path must be /images/vehicles/filename.png|jpg|webp"),
    body("inv_thumbnail")
      .optional({ checkFalsy: true })
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9_-]+-tn\.(png|jpg|webp)$/)
      .withMessage("Thumbnail path must be /images/vehicles/filename-tn.png|jpg|webp")
  ]
}

/* ******************************
 * Check vehicle data and return errors or continue
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
    inv_description,
    inv_image,
    inv_thumbnail,
    classification_id
  } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classifications = (await invModel.getClassifications()).rows

    return res.render("inventory/add-vehicle", {
      errors,
      title: "Add New Vehicle",
      nav,
      classifications,
      metaDescription: "Form for adding a new vehicle to CSE Motors inventory.",
      locals: {
        inv_make,
        inv_model,
        inv_year,
        inv_price,
        inv_miles,
        inv_color,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id
      }
    })
  }

  next()
}


module.exports = validate
