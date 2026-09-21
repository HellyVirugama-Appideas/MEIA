// const express = require("express");
// const router = express.Router();

// const { requireAdminAuth, redirectIfLoggedIn, isSuperAdmin } = require("../../middleware/adminAuth");
// const adminController = require("../../controllers/admin/adminController");

// /* ===================== AUTH ===================== */
// router.get("/login", redirectIfLoggedIn, adminController.getLoginPage);
// router.post("/login", redirectIfLoggedIn, adminController.postLogin);
// router.get("/logout", requireAdminAuth, adminController.logout);

// /* ===================== ROOT / DASHBOARD ===================== */
// router.get("/", requireAdminAuth, (req, res) => res.redirect("/admin/dashboard"));
// router.get("/dashboard", requireAdminAuth, adminController.getDashboard);

// /* ===================== CHANGE PASSWORD ===================== */
// router.get("/changepass", requireAdminAuth, adminController.getChangePass);
// router.post("/changepass", requireAdminAuth, adminController.postChangePass);

// /* ===================== SUB ADMIN MANAGEMENT (Super Admin only) ===================== */
// router.get("/sub-admin/list", requireAdminAuth, isSuperAdmin, adminController.getSubAdminList);
// router.get("/sub-admin/add", requireAdminAuth, isSuperAdmin, adminController.getAddSubAdmin);
// router.post("/sub-admin/add", requireAdminAuth, isSuperAdmin, adminController.postSubAdmin);
// router.get("/sub-admin/edit/:id", requireAdminAuth, isSuperAdmin, adminController.getEditSubAdmin);
// router.post("/sub-admin/edit/:id", requireAdminAuth, isSuperAdmin, adminController.postEditSubAdmin);

// // NOTE: subadmin_list.ejs uses a plain <a href="..."> link (GET) to toggle status,
// // so this stays a GET route to match it — not a POST/form.
// router.get("/sub-admin/status/:id/:status", requireAdminAuth, isSuperAdmin, adminController.changeAdminStatus);

// router.post("/sub-admin/delete/:id", requireAdminAuth, isSuperAdmin, adminController.deleteSubAdmin);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  requireAdminAuth,
  redirectIfLoggedIn,
  isSuperAdmin,
  checkPermission,
} = require("../../middleware/adminAuth");

const adminController = require("../../controllers/admin/adminController");

/* ===================== AUTH ===================== */
router.get("/login", redirectIfLoggedIn, adminController.getLoginPage);
router.post("/login", redirectIfLoggedIn, adminController.postLogin);
router.get("/logout", requireAdminAuth, adminController.logout);

/* ===================== ROOT / DASHBOARD ===================== */
router.get("/", requireAdminAuth, (req, res) => res.redirect("/admin/dashboard"));
router.get("/dashboard", requireAdminAuth, adminController.getDashboard);

/* ===================== CHANGE PASSWORD ===================== */
router.get("/changepass", requireAdminAuth, adminController.getChangePass);
router.post("/changepass", requireAdminAuth, adminController.postChangePass);

/* ===================== SUB ADMIN MANAGEMENT ===================== */
/* Super Admin + jinke paas subadmin permission hai */
const MODULE = "subadmin";

router.get(
  "/sub-admin/list",
  requireAdminAuth,
  checkPermission(MODULE, "isView"),
  adminController.getSubAdminList
);

router.get(
  "/sub-admin/add",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  adminController.getAddSubAdmin
);

router.post(
  "/sub-admin/add",
  requireAdminAuth,
  checkPermission(MODULE, "isAdd"),
  adminController.postSubAdmin
);

router.get(
  "/sub-admin/edit/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  adminController.getEditSubAdmin
);

router.post(
  "/sub-admin/edit/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"),
  adminController.postEditSubAdmin
);

router.get(
  "/sub-admin/status/:id/:status",
  requireAdminAuth,
  checkPermission(MODULE, "isEdit"), // status change = edit
  adminController.changeAdminStatus
);

router.post(
  "/sub-admin/delete/:id",
  requireAdminAuth,
  checkPermission(MODULE, "isDelete"),
  adminController.deleteSubAdmin
);

module.exports = router;