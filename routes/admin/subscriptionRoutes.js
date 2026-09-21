const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const subscriptionController = require("../../controllers/admin/Subscriptioncontroller");

const MODULE = "subscription";

/* ===================== PLANS ===================== */
router.get("/plans", requireAdminAuth, checkPermission(MODULE, "isView"), subscriptionController.listPlans);
router.get("/plans/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), subscriptionController.newPlanForm);
router.post("/plans", requireAdminAuth, checkPermission(MODULE, "isAdd"), subscriptionController.createPlan);
router.get("/plans/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), subscriptionController.editPlanForm);
router.post("/plans/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), subscriptionController.updatePlan);
router.get("/plans/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), subscriptionController.deletePlan);

/* ===================== SUBSCRIBERS ===================== */
router.get("/subscribers", requireAdminAuth, checkPermission(MODULE, "isView"), subscriptionController.listSubscribers);

/* ===================== ROOT ===================== */
router.get("/", requireAdminAuth, checkPermission(MODULE, "isView"), (req, res) => res.redirect("/admin/subscription/plans"));

module.exports = router;