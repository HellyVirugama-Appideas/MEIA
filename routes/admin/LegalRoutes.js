const express = require("express");
const router = express.Router();

const { requireAdminAuth, checkPermission, redirectIfLoggedIn } = require("../../middleware/adminAuth");

const faqController = require("../../controllers/admin/Faqcontroller");
const legalController = require("../../controllers/admin/Legalcontroller");

const MODULE = "cms";

/* ===================== FAQs ===================== */
router.get("/faq", requireAdminAuth, checkPermission(MODULE, "isView"), faqController.listFaqs);
router.get("/faq/add", requireAdminAuth, checkPermission(MODULE, "isAdd"), faqController.newFaqForm);
router.post("/faq", requireAdminAuth, checkPermission(MODULE, "isAdd"), faqController.createFaq);
router.get("/faq/edit/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), faqController.editFaqForm);
router.post("/faq/:id", requireAdminAuth, checkPermission(MODULE, "isEdit"), faqController.updateFaq);
router.get("/faq/delete/:id", requireAdminAuth, checkPermission(MODULE, "isDelete"), faqController.deleteFaq);

/* ===================== TERMS & PRIVACY ===================== */
router.get("/term", requireAdminAuth, checkPermission(MODULE, "isView"), legalController.editTermsForm);
router.post("/term", requireAdminAuth, checkPermission(MODULE, "isEdit"), legalController.updateTerms);
router.get("/privacy", requireAdminAuth, checkPermission(MODULE, "isView"), legalController.editPrivacyForm);
router.post("/privacy", requireAdminAuth, checkPermission(MODULE, "isEdit"), legalController.updatePrivacy);

module.exports = router;