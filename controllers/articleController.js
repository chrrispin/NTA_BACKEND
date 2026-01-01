// controllers/articleController.js
const connection = require('../models/db');

// Get all articles with pagination, filtering, and metadata
exports.getAllArticles = async (req, res) => {
  try {
    console.log('📝 GET ALL ARTICLES REQUEST RECEIVED');
    
    // Parse and validate query parameters
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    const section = req.query.section;

    // Validate page
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }
    if (limit > 100) {
      limit = 100; // Cap at 100
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause for filtering
    let whereClause = '';
    const params = [];

    if (section) {
      whereClause = 'WHERE section = ?';
      params.push(section);
    }

    console.log('🔍 Querying section:', section);

    console.log('🔍 Params:', { page, limit, offset, section });

    // First query: Get total count with same filters
    const countQuery = `SELECT COUNT(*) as total FROM articles ${whereClause}`;
    const countParams = params.slice();

    connection.query(countQuery, countParams, (countError, countResults) => {
      if (countError) {
        console.error('❌ COUNT QUERY ERROR:', countError.code, countError.message);
        return res.status(500).json({
          error: 'Failed to fetch articles count',
          message: countError.message,
          code: countError.code
        });
      }

      const totalItems = countResults[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / limit);

      console.log('✅ Total items:', totalItems, 'Total pages:', totalPages);

      // Second query: Get paginated results
      let dataQuery = `SELECT * FROM articles ${whereClause} ORDER BY is_live DESC, created_at DESC LIMIT ? OFFSET ?`;
      const dataParams = [...params, limit, offset];

      console.log('🔍 Executing data query:', dataQuery);
      console.log('📦 With params:', dataParams);

      connection.query(dataQuery, dataParams, (error, results) => {
        if (error) {
          console.error('❌ DATA QUERY ERROR:', error.code, error.message);
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

          let parsedMedia = [];
          if (article.media && typeof article.media === 'string') {
            try {
              const trimmed = article.media.trim();
              if (trimmed) {
                parsedMedia = JSON.parse(trimmed);
              }
            } catch (e) {
              console.warn('⚠️ media JSON parse failed for article id', article.id, '->', e.message);
              parsedMedia = [];
            }
          }

          return {
            id: article.id,
            section: article.section,
            title: article.title,
            slug: article.slug,
            image_url: article.image_url,
            summary: article.summary,
            content: article.content || null,
            is_live: article.is_live,
            page: article.page,
            views: article.views !== null && article.views !== undefined ? article.views : 0,
            created_at: article.created_at || new Date().toISOString(),
            updated_at: article.updated_at || new Date().toISOString(),
            isAudioPick: article.isAudioPick || false,
            isHot: article.isHot || false,
            subLinks: parsedSubLinks,
            media: parsedMedia
          };
        });

        // Always return 200 with empty array if no articles found
        res.status(200).json({
          articles: articles,
          page: page,
          limit: limit,
          totalItems: totalItems,
          totalPages: totalPages,
          hasMore: page < totalPages
        });
        console.log('🔎 Articles returned:', articles.map(a => ({id: a.id, section: a.section, title: a.title})));
      });
    });
  } catch (error) {
    console.error('Error in getAllArticles:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Get article by slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    connection.query(
      'SELECT * FROM articles WHERE slug = ?',
      [slug],
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

        let parsedMedia = [];
        if (article.media && typeof article.media === 'string') {
          try {
            const trimmed = article.media.trim();
            if (trimmed) {
              parsedMedia = JSON.parse(trimmed);
            }
          } catch (e) {
            console.warn('⚠️ media JSON parse failed for article id', article.id, '->', e.message);
            parsedMedia = [];
          }
        }

        res.json({
          id: article.id,
          section: article.section,
          title: article.title,
          slug: article.slug,
          image_url: article.image_url,
          summary: article.summary,
          content: article.content || null,
          is_live: article.is_live,
          page: article.page,
          views: article.views !== null && article.views !== undefined ? article.views : 0,
          created_at: article.created_at || new Date().toISOString(),
          updated_at: article.updated_at || new Date().toISOString(),
          isAudioPick: article.isAudioPick || false,
          isHot: article.isHot || false,
          subLinks: parsedSubLinks,
          media: parsedMedia
        });
      }
    );
  } catch (error) {
    console.error('Error in getArticleBySlug:', error);
    res.status(500).json({ error: 'Server error' });
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
          // Return 200 with null for not found, for consistency
          return res.status(200).json({ article: null });
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

        let parsedMedia = [];
        if (article.media && typeof article.media === 'string') {
          try {
            const trimmed = article.media.trim();
            if (trimmed) {
              parsedMedia = JSON.parse(trimmed);
            }
          } catch (e) {
            console.warn('⚠️ media JSON parse failed for article id', article.id, '->', e.message);
            parsedMedia = [];
          }
        }

        res.json({
          id: article.id,
          section: article.section,
          title: article.title,
          slug: article.slug,
          image_url: article.image_url,
          summary: article.summary,
          content: article.content || null,
          is_live: article.is_live,
          page: article.page,
          views: article.views !== null && article.views !== undefined ? article.views : 0,
          created_at: article.created_at || new Date().toISOString(),
          updated_at: article.updated_at || new Date().toISOString(),
          isAudioPick: article.isAudioPick || false,
          isHot: article.isHot || false,
          subLinks: parsedSubLinks,
          media: parsedMedia
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
    const { section, title, slug, image_url, summary, content, is_live = false, page = 'Home', isAudioPick = false, isHot = false, subLinks = [], media = [] } = req.body;

    // Validate required fields
    if (!section || !title) {
      console.log('❌ Validation failed: section or title missing');
      return res.status(400).json({ error: 'section and title are required' });
    }

    const subLinksJson = JSON.stringify(subLinks);
    const mediaJson = JSON.stringify(media);
    console.log('✅ Data validated, attempting database insert...');

    connection.query(
      'INSERT INTO articles (section, title, slug, image_url, summary, content, is_live, page, isAudioPick, isHot, subLinks, media, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [section, title, slug || null, image_url || null, summary || null, content || null, is_live ? 1 : 0, page, isAudioPick ? 1 : 0, isHot ? 1 : 0, subLinksJson, mediaJson],
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
    const { section, title, slug, image_url, summary, content, is_live, page, isAudioPick, isHot, subLinks, media } = req.body;

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
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (is_live !== undefined) {
      updates.push('is_live = ?');
      values.push(is_live ? 1 : 0);
    }
    if (page !== undefined) {
      updates.push('page = ?');
      values.push(page);
    }
    if (isAudioPick !== undefined) {
      updates.push('isAudioPick = ?');
      values.push(isAudioPick ? 1 : 0);
    }
    if (isHot !== undefined) {
      updates.push('isHot = ?');
      values.push(isHot ? 1 : 0);
    }
    if (subLinks !== undefined) {
      updates.push('subLinks = ?');
      values.push(JSON.stringify(subLinks));
    }
    if (media !== undefined) {
      updates.push('media = ?');
      values.push(JSON.stringify(media));
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

// Increment views for an article
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    connection.query(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Database update error:', error);
          return res.status(500).json({ error: 'Failed to increment views' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Views incremented', views: results.affectedRows });
      }
    );
  } catch (error) {
    console.error('Error in incrementViews:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
