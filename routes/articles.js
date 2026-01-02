// example: routes/articles.js
const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const workflowController = require("../controllers/workflowController");
const { verifyToken } = require("../controllers/authController");
const connection = require('../models/db');
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

// Increment views for an article
router.post("/:id/view", articleController.incrementViews);

// Get article by slug (must come before /:id to match first)
router.get("/slug/:slug", articleController.getArticleBySlug);

// Get single article by ID
router.get("/:id", articleController.getArticleById);

// Create new article
router.post("/", articleController.createArticle);

// Update article
router.put("/:id", articleController.updateArticle);

// Delete article
router.delete("/:id", articleController.deleteArticle);

// Migration endpoint - call once to add content column
router.post("/migrate/add-content-column", (req, res) => {
  // First check if column exists
  connection.query('SHOW COLUMNS FROM articles LIKE "content"', (error, results) => {
    if (error) {
      console.error('Migration check error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    if (results && results.length > 0) {
      return res.json({ success: true, message: 'Content column already exists' });
    }
    
    // Column doesn't exist, add it
    const sql = 'ALTER TABLE articles ADD COLUMN content LONGTEXT AFTER summary';
    connection.query(sql, (error) => {
      if (error) {
        console.error('Migration error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true, message: 'Content column added successfully' });
    });
  });
});

// WORKFLOW ROUTES (Protected - requires authentication)
// Get articles based on user role
router.get("/workflow/my-articles", verifyToken, workflowController.getArticlesByRole);

// Editor: Submit article for review
router.post("/:id/submit-for-review", verifyToken, workflowController.submitForReview);

// Admin/Super Admin: Approve article
router.post("/:id/approve", verifyToken, workflowController.approveArticle);

// Admin/Super Admin: Reject article
router.post("/:id/reject", verifyToken, workflowController.rejectArticle);

// Super Admin: Publish approved article
router.post("/:id/publish", verifyToken, workflowController.publishArticle);

module.exports = router; // ✅ must export router
