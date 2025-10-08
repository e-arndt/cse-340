// controllers/adminController.js
const invModel = require("../models/inventory-model")
const classModel = require("../models/classification-model")
const utilities = require("../utilities")

const adminCont = {}

/* ***************************
 *  Build Admin Approval Dashboard
 * ************************** */
adminCont.buildApprovalView = async function (req, res, next) {
  try {
    const [nav, unapprovedClasses, unapprovedVehicles] = await Promise.all([
      utilities.getNav(),
      classModel.getUnapprovedClassifications(),
      invModel.getUnapprovedInventory()
    ])

    res.render("admin/approval", {
      title: "Admin Approval Dashboard",
      nav,
      unapprovedClasses,
      unapprovedVehicles,
      errors: null,
      accountData: res.locals.accountData,
      loggedin: res.locals.loggedin
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Approve Item
 * ************************** */
adminCont.approveItem = async function (req, res, next) {
  try {
    const { itemType, id } = req.body
    const approverId = res.locals.accountData.account_id

    if (itemType === "classification") await classModel.approveClassification(id, approverId)
    if (itemType === "vehicle") await invModel.approveInventory(id, approverId)

    req.flash("success", "Item approved successfully.")
    res.redirect("/admin/approval")
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Reject (Delete) Item
 * ************************** */
adminCont.rejectItem = async function (req, res, next) {
  try {
    const { itemType, id } = req.body

    if (itemType === "classification") await classModel.deleteClassification(id)
    if (itemType === "vehicle") await invModel.deleteInventoryItem(id)

    req.flash("success", "Item rejected and deleted.")
    res.redirect("/admin/approval")
  } catch (error) {
    next(error)
  }
}

module.exports = adminCont
