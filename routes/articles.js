// example: routes/articles.js
const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

// Get all articles (with optional filtering by section)
router.get("/", articleController.getAllArticles);

// Get single article by ID
router.get("/:id", articleController.getArticleById);

// Create new article
router.post("/", articleController.createArticle);

// Update article
router.put("/:id", articleController.updateArticle);

// Delete article
router.delete("/:id", articleController.deleteArticle);

module.exports = router; // ✅ must export router
