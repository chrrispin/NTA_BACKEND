const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Admin authentication routes
router.post("/admin/signup", authController.signup);
router.post("/admin/login", authController.login);

module.exports = router;
