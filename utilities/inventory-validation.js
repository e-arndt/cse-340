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
      .matches(/^[A-Za-z0-9 ]{2,}$/)
      .withMessage("Make must be 2+ letters, numbers, or spaces."),
    body("inv_model")
      .matches(/^[A-Za-z0-9 _-]{2,}$/)
      .withMessage("Model must be 2+ character."),
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
 * Check vehicle data and return errors or continue (ADD)
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
      },
      metaDescription: "Form for adding a new vehicle to CSE Motors inventory.",
      ogTitle: "Add Vehicle - CSE Motors",
      ogDescription: "Add a new vehicle into the CSE Motors system.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.originalUrl
    })
  }

  next()
}

/* ******************************
 * Check vehicle data for UPDATE
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
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
    const classificationSelect = await utilities.buildClassificationList(classification_id)

    return res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect,
      locals: {
        inv_id,
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
      },
      metaDescription: "Edit a vehicle in the CSE Motors inventory.",
      ogTitle: "Edit Vehicle - CSE Motors",
      ogDescription: "Update vehicle details in the CSE Motors system.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.originalUrl
    })
  }

  next()
}



module.exports = validate
