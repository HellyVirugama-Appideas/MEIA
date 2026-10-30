// const express = require("express");
// const router = express.Router();

// const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");

// const userController = require("../../controllers/admin/Usercontroller");

// const MODULE = "users";

// /* ===================== USERS ===================== */
// router.get("/users", requireAdminAuth, checkPermission(MODULE, "isView"), userController.listUsers);
// router.get("/users/:id", requireAdminAuth, checkPermission(MODULE, "isView"), userController.viewUser);
// router.post("/users/:id/status", requireAdminAuth, checkPermission(MODULE, "isEdit"), userController.updateUserStatus);

// router.get("/users/create", requireAdminAuth, checkPermission("users", "isAdd"), userController.newUserForm);
// router.post("/users", requireAdminAuth, userController.createUser);
// router.get("/users/:id/edit", requireAdminAuth, userController.editUserForm);
// router.post("/users/:id", requireAdminAuth, userController.updateUser);

// module.exports = router;

const express = require("express");
const router = express.Router();

const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");

const userController = require("../../controllers/admin/Usercontroller");

const MODULE = "users";

/* ===================== USERS ===================== */
router.get("/users", requireAdminAuth, checkPermission(MODULE, "isView"), userController.listUsers);

/* ---- ADD (":id" wale routes se PEHLE rakhna) ---- */
router.get("/users/create", requireAdminAuth, checkPermission(MODULE, "isAdd"), userController.newUserForm);
router.post("/users/create", requireAdminAuth, checkPermission(MODULE, "isAdd"), userController.createUser);

/* ---- EDIT ---- */
router.get("/users/:id/edit", requireAdminAuth, checkPermission(MODULE, "isEdit"), userController.editUserForm);
router.post("/users/:id/edit", requireAdminAuth, checkPermission(MODULE, "isEdit"), userController.updateUser);

/* ---- STATUS ---- */
router.post("/users/:id/status", requireAdminAuth, checkPermission(MODULE, "isEdit"), userController.updateUserStatus);

/* ---- VIEW (":id" wala sabse last me) ---- */
router.get("/users/:id", requireAdminAuth, checkPermission(MODULE, "isView"), userController.viewUser);

module.exports = router;