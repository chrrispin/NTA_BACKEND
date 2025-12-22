// example: routes/articles.js
const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

// Middleware to validate and sanitize pagination params
const validatePaginationParams = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const section = req.query.section || undefined;

  // Validate page and limit
  if (page < 1) req.query.page = 1;
  if (limit < 1) req.query.limit = 10;
  if (limit > 100) req.query.limit = 100; // Cap limit at 100

  req.query.page = page.toString();
  req.query.limit = limit.toString();
  req.query.section = section;

  next();
};

// Get all articles with pagination and optional filtering by section
router.get("/", validatePaginationParams, articleController.getAllArticles);

// Get single article by ID
router.get("/:id", articleController.getArticleById);

// Create new article
router.post("/", articleController.createArticle);

// Update article
router.put("/:id", articleController.updateArticle);

// Delete article
router.delete("/:id", articleController.deleteArticle);

module.exports = router; // ✅ must export router
