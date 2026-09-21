// const express = require("express");
// const router = express.Router();

// const { requireAdminAuth, redirectIfLoggedIn } = require("../../middleware/adminAuth");

// const userController = require("../../controllers/admin/Usercontroller");

// /* ===================== USERS ===================== */
// router.get("/users", requireAdminAuth, userController.listUsers);
// router.get("/users/:id", requireAdminAuth, userController.viewUser);
// router.post("/users/:id/status", requireAdminAuth, userController.updateUserStatus);

// module.exports = router;

// Save as: routes/admin/users.js

const express = require("express");
const router = express.Router();

const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");

const userController = require("../../controllers/admin/Usercontroller");

const MODULE = "users";

/* ===================== USERS ===================== */
router.get("/users", requireAdminAuth, checkPermission(MODULE, "isView"), userController.listUsers);
router.get("/users/:id", requireAdminAuth, checkPermission(MODULE, "isView"), userController.viewUser);
router.post("/users/:id/status", requireAdminAuth, checkPermission(MODULE, "isEdit"), userController.updateUserStatus);

module.exports = router;