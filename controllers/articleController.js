// controllers/articleController.js
const connection = require('../models/db');

// Get all articles with optional filtering
exports.getAllArticles = async (req, res) => {
  try {
    console.log('📝 GET ALL ARTICLES REQUEST RECEIVED');
    const { section, page, limit = 50, offset = 0 } = req.query;

    // Build query based on filters
    let query = 'SELECT * FROM articles';
    const params = [];

    const conditions = [];
    if (section) {
      conditions.push('section = ?');
      params.push(section);
    }
    if (page) {
      conditions.push('page = ?');
      params.push(page);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add pagination
    query += ` ORDER BY is_live DESC, created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    console.log('🔍 Executing query:', query);
    console.log('📦 With params:', params);

    // Execute query
    connection.query(query, params, (error, results) => {
      if (error) {
        console.error('❌ DATABASE QUERY ERROR:', error.code, error.message);
        return res.status(500).json({ 
          error: 'Failed to fetch articles',
          message: error.message,
          code: error.code
        });
      }
      
      console.log('✅ Query successful, returned', results.length, 'articles');

      // Map database results to API response format with safe JSON parse for subLinks
      const articles = results.map(article => {
        let parsedSubLinks = [];
        if (article.subLinks && typeof article.subLinks === 'string') {
          try {
            const trimmed = article.subLinks.trim();
            if (trimmed) {
              parsedSubLinks = JSON.parse(trimmed);
            }
          } catch (e) {
            console.warn('⚠️ subLinks JSON parse failed for article id', article.id, '->', e.message);
            parsedSubLinks = [];
          }
        }

        return {
          id: article.id,
          section: article.section,
          title: article.title,
          slug: article.slug,
          image_url: article.image_url,
          summary: article.summary,
          is_live: article.is_live,
          page: article.page,
          subLinks: parsedSubLinks
        };
      });

      res.json(articles);
    });
  } catch (error) {
    console.error('Error in getAllArticles:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    connection.query(
      'SELECT * FROM articles WHERE id = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Database query error:', error);
          return res.status(500).json({ error: 'Failed to fetch article' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Article not found' });
        }

        const article = results[0];

        let parsedSubLinks = [];
        if (article.subLinks && typeof article.subLinks === 'string') {
          try {
            const trimmed = article.subLinks.trim();
            if (trimmed) {
              parsedSubLinks = JSON.parse(trimmed);
            }
          } catch (e) {
            console.warn('⚠️ subLinks JSON parse failed for article id', article.id, '->', e.message);
            parsedSubLinks = [];
          }
        }

        res.json({
          id: article.id,
          section: article.section,
          title: article.title,
          slug: article.slug,
          image_url: article.image_url,
          summary: article.summary,
          is_live: article.is_live,
          page: article.page,
          subLinks: parsedSubLinks
        });
      }
    );
  } catch (error) {
    console.error('Error in getArticleById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new article
exports.createArticle = async (req, res) => {
  try {
    console.log('📝 CREATE ARTICLE REQUEST RECEIVED:', req.body);
    const { section, title, slug, image_url, summary, is_live = false, page = 'Home', subLinks = [] } = req.body;

    // Validate required fields
    if (!section || !title) {
      console.log('❌ Validation failed: section or title missing');
      return res.status(400).json({ error: 'section and title are required' });
    }

    const subLinksJson = JSON.stringify(subLinks);
    console.log('✅ Data validated, attempting database insert...');

    connection.query(
      'INSERT INTO articles (section, title, slug, image_url, summary, is_live, page, subLinks, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [section, title, slug || null, image_url || null, summary || null, is_live ? 1 : 0, page, subLinksJson],
      (error, results) => {
        if (error) {
          console.error('❌ DATABASE ERROR:', error);
          return res.status(500).json({ 
            error: 'Failed to create article',
            details: error.message,
            code: error.code
          });
        }

        console.log('✅ ARTICLE CREATED SUCCESSFULLY with ID:', results.insertId);
        res.status(201).json({
          id: results.insertId,
          section,
          title,
          slug: slug || null,
          image_url: image_url || null,
          summary: summary || null,
          is_live,
          page: page || 'Home',
          subLinks
        });
      }
    );
  } catch (error) {
    console.error('❌ Error in createArticle:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { section, title, slug, image_url, summary, is_live, page, subLinks } = req.body;

    const updates = [];
    const values = [];

    if (section !== undefined) {
      updates.push('section = ?');
      values.push(section);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      values.push(slug);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    if (summary !== undefined) {
      updates.push('summary = ?');
      values.push(summary);
    }
    if (is_live !== undefined) {
      updates.push('is_live = ?');
      values.push(is_live ? 1 : 0);
    }
    if (page !== undefined) {
      updates.push('page = ?');
      values.push(page);
    }
    if (subLinks !== undefined) {
      updates.push('subLinks = ?');
      values.push(JSON.stringify(subLinks));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const query = `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`;

    connection.query(query, values, (error) => {
      if (error) {
        console.error('Database update error:', error);
        return res.status(500).json({ error: 'Failed to update article' });
      }

      res.json({ message: 'Article updated successfully' });
    });
  } catch (error) {
    console.error('Error in updateArticle:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    connection.query('DELETE FROM articles WHERE id = ?', [id], (error) => {
      if (error) {
        console.error('Database delete error:', error);
        return res.status(500).json({ error: 'Failed to delete article' });
      }

      res.json({ message: 'Article deleted successfully' });
    });
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
