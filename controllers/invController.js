const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const nav = await utilities.getNav()

  if (!data || data.length === 0) {
    req.flash("error", "No vehicles found for this classification.")
    return res.status(404).render("./inventory/classification", {
      title: "No vehicles found",
      nav,
      grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>',
      metaDescription: "No vehicles were found in this classification.",
      ogTitle: "No vehicles found",
      ogDescription: "Browse our inventory at CSE Motors.",
      ogImage: "/images/site/delorean.jpg",
      ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg",
      accountData: res.locals.accountData,
      loggedin: res.locals.loggedin
    })
  }

  const grid = await utilities.buildClassificationGrid(data)
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    metaDescription: `Browse our selection of ${className} vehicles available at CSE Motors.`,
    ogTitle: `${className} Vehicles at CSE Motors`,
    ogDescription: `Find your next ride among our ${className} vehicles — quality options for every driver.`,
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage: data[0]?.inv_thumbnail || data[0]?.inv_image || "/images/site/checkerboard.jpg",
    nav,
    grid,
    accountData: res.locals.accountData,
    loggedin: res.locals.loggedin
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  const vehicleData = await invModel.getInventoryById(inv_id)
  const nav = await utilities.getNav()

  if (!vehicleData) {
    req.flash("error", "Vehicle not found.")
    return next({ status: 404, message: "Vehicle not found" })
  }

  const detail = await utilities.buildDetailView(vehicleData)
  res.render("./inventory/detail", {
    title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
    metaDescription: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}. ${vehicleData.inv_description}`,
    ogTitle: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
    ogDescription: vehicleData.inv_description,
    ogImage: vehicleData.inv_image,
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage: vehicleData.inv_image,
    nav,
    detail,
    accountData: res.locals.accountData,
    loggedin: res.locals.loggedin
  })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null,
    metaDescription: "Manage vehicle classifications and inventory at CSE Motors.",
    ogTitle: "CSE Motors - Vehicle Management",
    ogDescription: "Access tools to add new classifications and vehicles.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg",
    accountData: res.locals.accountData,
    loggedin: res.locals.loggedin
  })
}

/* ***************************
 *  Deliver Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    metaDescription: "Add a new vehicle classification at CSE Motors.",
    ogTitle: "CSE Motors - Add Classification",
    ogDescription: "Add a new type of vehicle to the CSE Motors system.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg",
    accountData: res.locals.accountData,
    loggedin: res.locals.loggedin
  })
}

/* ***************************
 *  Deliver Add Vehicle view
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classifications = (await invModel.getClassifications()).rows

  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    errors: null,
    classifications,
    metaDescription: "Add a new vehicle to the CSE Motors inventory.",
    ogTitle: "CSE Motors - Add Vehicle",
    ogDescription: "Add a new vehicle record into the CSE Motors system.",
    ogImage: "/images/site/delorean.jpg",
    ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
    preloadImage: "/images/site/checkerboard.jpg",
    accountData: res.locals.accountData,
    loggedin: res.locals.loggedin
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("success", `The classification "${classification_name}" was successfully added.`)
      res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the classification insert failed.")
      res.status(500).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        metaDescription: "Add a new vehicle classification at CSE Motors.",
        ogTitle: "CSE Motors - Add Classification",
        ogDescription: "Add a new type of vehicle to the CSE Motors system.",
        ogImage: "/images/site/delorean.jpg",
        ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
        preloadImage: "/images/site/checkerboard.jpg",
        accountData: res.locals.accountData,
        loggedin: res.locals.loggedin
      })
    }
  } catch (err) {
    req.flash("error", "Database error while adding classification.")
    next(err)
  }
}

/* ***************************
 *  Process add vehicle
 * ************************** */
invCont.addVehicle = async function (req, res, next) {
  let {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  if (!inv_image?.trim()) inv_image = "/images/vehicles/no-car-image.png"
  if (!inv_thumbnail?.trim()) inv_thumbnail = "/images/vehicles/no-car-image-tn.png"

  const nav = await utilities.getNav()

  try {
    const result = await invModel.addVehicle(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (result) {
      req.flash("success", `The vehicle "${inv_year} ${inv_make} ${inv_model}" was successfully added.`)
      res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the vehicle insert failed.")
      const classifications = (await invModel.getClassifications()).rows
      res.status(500).render("./inventory/add-vehicle", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classifications,
        metaDescription: "Add a vehicle to the CSE Motors inventory.",
        ogTitle: "Add New Vehicle - CSE Motors",
        ogDescription: "Add a new vehicle to the CSE Motors inventory system.",
        ogImage: "/images/vehicles/no-car-image.png",
        ogUrl: req.originalUrl,
        accountData: res.locals.accountData,
        loggedin: res.locals.loggedin
      })
    }
  } catch (err) {
    req.flash("error", "Database error while adding vehicle.")
    next(err)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)

    if (!itemData) {
      req.flash("error", "Vehicle not found.")
      return res.redirect("/inv/")
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classificationSelect,
      errors: null,
      locals: {
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
      },
      metaDescription: "Edit a vehicle in the CSE Motors inventory.",
      ogTitle: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
      ogDescription: "Update vehicle details in the CSE Motors system.",
      ogImage: itemData.inv_image,
      ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg",
      accountData: res.locals.accountData,
      loggedin: res.locals.loggedin
    })
  } catch (error) {
    next(error)
  }
}


/* ***************************
 *  Process update vehicle
 * ************************** */
invCont.updateVehicle = async function (req, res, next) {
  let {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  if (!inv_image?.trim()) inv_image = "/images/vehicles/no-car-image.png"
  if (!inv_thumbnail?.trim()) inv_thumbnail = "/images/vehicles/no-car-image-tn.png"

  const nav = await utilities.getNav()

  try {
    const updateResult = await invModel.updateVehicle(
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (updateResult) {
      req.flash("success", `The vehicle "${inv_year} ${inv_make} ${inv_model}" was successfully updated.`)
      res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the update failed.")
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      res.status(500).render("./inventory/edit-inventory", {
        title: `Edit ${inv_year} ${inv_make} ${inv_model}`,
        nav,
        classificationSelect,
        errors: null,
        locals: {
          inv_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id
        },
        metaDescription: "Edit a vehicle in the CSE Motors inventory.",
        ogTitle: "Edit Vehicle - CSE Motors",
        ogDescription: "Update vehicle details in the CSE Motors system.",
        ogImage: "/images/site/delorean.jpg",
        ogUrl: req.originalUrl,
        accountData: res.locals.accountData,
        loggedin: res.locals.loggedin
      })
    }
  } catch (err) {
    req.flash("error", "Database error while updating vehicle.")
    next(err)
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)

    if (!itemData) {
      req.flash("error", "Vehicle not found.")
      return res.redirect("/inv/")
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      errors: null,
      locals: {
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
        inv_image: itemData.inv_image
      },
      metaDescription: "Confirm vehicle deletion in the CSE Motors inventory.",
      ogTitle: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      ogDescription: "Confirm removal of vehicle from the CSE Motors system.",
      ogImage: itemData.inv_image,
      ogUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
      preloadImage: "/images/site/checkerboard.jpg",
      accountData: res.locals.accountData,
      loggedin: res.locals.loggedin
    })
  } catch (error) {
    next(error)
  }
}


/* ***************************
 *  Process delete vehicle
 * ************************** */
invCont.deleteVehicle = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)
    if (Number.isNaN(inv_id)) {
      req.flash("error", "Invalid vehicle ID.")
      return res.redirect("/inv/")
    }

    const deleteResult = await invModel.deleteInventory(inv_id)
    if (deleteResult) {
      req.flash("success", "The vehicle was successfully deleted.")
      return res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the delete failed.")
      return res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    req.flash("error", "Database error while deleting vehicle.")
    next(error)
  }
}


/* ***************************
 *  Return inventory by classification ID as JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    if (isNaN(classification_id)) {
      return res.status(400).json({ error: "Invalid classification ID" })
    }

    const inventoryData = await invModel.getInventoryByClassificationId(classification_id)
    if (inventoryData && inventoryData.length > 0) {
      return res.json(inventoryData)
    } else {
      return res.status(404).json({ message: "No vehicles found for this classification" })
    }
  } catch (err) {
    next(err)
  }
}


module.exports = invCont
