const connection = require('../models/db');

// Get articles based on user role and status
exports.getArticlesByRole = (req, res) => {
  try {
    const { role, id } = req.user;
    let query = 'SELECT * FROM articles WHERE 1=1';
    let params = [];

    if (role === 'super_admin') {
      // Super Admin sees all articles
      query += ' ORDER BY created_at DESC';
    } else if (role === 'admin') {
      // Admin sees articles submitted for their review
      query += ' AND (status = "pending_admin_review" OR status = "draft" AND submitted_by = ?)';
      params.push(id);
      query += ' ORDER BY created_at DESC';
      params = [id];
      query = 'SELECT * FROM articles WHERE status = "pending_admin_review" OR (status = "draft" AND submitted_by = ?) ORDER BY created_at DESC';
    } else if (role === 'editor') {
      // Editor sees their own articles
      query += ' AND submitted_by = ? ORDER BY created_at DESC';
      params.push(id);
    } else if (role === 'viewer') {
      // Viewer sees only published articles
      query += ' AND status = "published" ORDER BY created_at DESC';
    }

    connection.query(query, params, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch articles',
        });
      }

      res.json({
        success: true,
        data: results,
        message: 'Articles fetched successfully',
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Editor: Submit article for review
exports.submitForReview = (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const role = req.user.role;

    // Only editors can submit
    if (role !== 'editor') {
      return res.status(403).json({
        success: false,
        message: 'Only editors can submit articles for review',
      });
    }

    connection.query(
      'UPDATE articles SET status = "pending_admin_review", submitted_by = ?, submitted_at = NOW(), current_reviewer_role = "admin" WHERE id = ? AND submitted_by = ?',
      [userId, id, userId],
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to submit article',
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Article not found or you do not have permission to submit it',
          });
        }

        res.json({
          success: true,
          message: 'Article submitted for review',
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Admin: Approve article (moves to super admin review)
exports.approveArticle = (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { notes } = req.body;

    // Only admin and super_admin can approve
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve articles',
      });
    }

    // Determine next status
    const nextStatus = role === 'admin' ? 'pending_super_admin_review' : 'approved';
    const nextReviewerRole = role === 'admin' ? 'super_admin' : null;

    connection.query(
      'UPDATE articles SET status = ?, approved_by = ?, approved_at = NOW(), current_reviewer_role = ? WHERE id = ?',
      [nextStatus, userId, nextReviewerRole, id],
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to approve article',
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Article not found',
          });
        }

        res.json({
          success: true,
          message: `Article approved${nextStatus === 'approved' ? ' and ready to publish' : ' and sent to super admin'}`,
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Admin/Super Admin: Reject article
exports.rejectArticle = (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { reason } = req.body;

    // Only admin and super_admin can reject
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reject articles',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    connection.query(
      'UPDATE articles SET status = "rejected", approved_by = ?, approved_at = NOW(), rejection_reason = ?, current_reviewer_role = NULL WHERE id = ?',
      [userId, reason, id],
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to reject article',
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Article not found',
          });
        }

        res.json({
          success: true,
          message: 'Article rejected',
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Super Admin: Publish approved article
exports.publishArticle = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Only super_admin can publish
    if (role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can publish articles',
      });
    }

    connection.query(
      'UPDATE articles SET status = "published", is_live = 1, current_reviewer_role = NULL WHERE id = ? AND status = "approved"',
      [id],
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to publish article',
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Article not found or not in approved status',
          });
        }

        res.json({
          success: true,
          message: 'Article published successfully',
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
