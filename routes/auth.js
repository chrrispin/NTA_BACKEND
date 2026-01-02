const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const authController = require("../controllers/authController");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: fileFilter,
});

// Auth routes
router.post("/admin/signup", authController.signup);
router.post("/admin/login", authController.login);
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// User management routes (protected)
router.get("/users", authController.verifyToken, authController.getAllUsers);
router.post("/users", authController.verifyToken, upload.single("profilePicture"), authController.createUser);
router.put("/users/:id", authController.verifyToken, upload.single("profilePicture"), authController.updateUser);
router.delete("/users/:id", authController.verifyToken, authController.deleteUser);

module.exports = router;

