const express = require("express");
const router = express.Router();
const { requireAdminAuth, checkPermission } = require("../../middleware/adminAuth");
const journalCategoryController = require("../../controllers/admin/Journalcategorycontroller");

const MODULE = "content";

router.get("/", requireAdminAuth, checkPermission(MODULE, "isView"), journalCategoryController.listJournalCategories);
router.get("/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), journalCategoryController.newJournalCategoryForm);
router.post("/", requireAdminAuth, checkPermission(MODULE, "isAdd"), journalCategoryController.createJournalCategory);
router.get("/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), journalCategoryController.editJournalCategoryForm);
router.post("/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), journalCategoryController.updateJournalCategory);
router.get("/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), journalCategoryController.deleteJournalCategory);

module.exports = router;