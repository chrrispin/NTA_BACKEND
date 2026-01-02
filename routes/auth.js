const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Auth routes
router.post("/admin/signup", authController.signup);
router.post("/admin/login", authController.login);
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// User management routes (protected)
router.get("/users", authController.verifyToken, authController.getAllUsers);
router.post("/users", authController.verifyToken, authController.createUser);
router.put("/users/:id", authController.verifyToken, authController.updateUser);
router.delete("/users/:id", authController.verifyToken, authController.deleteUser);

module.exports = router;
