const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Load .env only if it exists locally (not on Render)
if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config();
}

/**
 * Initialize database schema and seed data
 * Runs once on server startup
 */
async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔧 Initializing database...');

    // Use the database (already exists on Clever Cloud)
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        image_url TEXT,
        summary TEXT,
        is_live BOOLEAN DEFAULT FALSE,
        page VARCHAR(50) DEFAULT 'Home',
        subLinks JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_section (section),
        INDEX idx_page (page),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Articles table ensured');

    // Check if table has data; if empty, seed it
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM articles');
    if (rows[0].count === 0) {
      const sampleArticles = [
        ['news1', 'Officials: Over 2,600 rescued from flooded Ukrainian-controlled areas of Kherson', 'https://media.cnn.com/api/v1/images/stellar/prod/97ff8560-8c09-4bfb-8d40-86f8ea671d18.jpg?c=16x9&q=h_720,w_1280,c_fill', 'Water level at the Nova Kakhovka reservoir continues to decline, minister says, after collapse of major dam in southern Ukraine', 1],
        ['news1', "Trump's chilling remarks reveal a deeper reality about the 2024 campaign", 'https://media.cnn.com/api/v1/images/stellar/prod/230613205742-05-donald-trump-bedminster-061323.jpg?c=16x9&q=h_720,w_1280,c_fill', "New details emerge about Trump's campaign strategy", 0],
        ['news2', 'What scientists say keeps mosquitoes at bay', 'https://media.cnn.com/api/v1/images/stellar/prod/230622192324-01-how-repel-mosquitos-scientifically-wellness-scn.jpg?c=16x9&q=h_438,w_780,c_fill', 'Scientific research reveals effective mosquito repellent methods', 0],
        ['news2', "Everybody loves Americans: Why US tourists are a hot commodity", 'https://media.cnn.com/api/v1/images/stellar/prod/230622161002-01-us-tourists-hot-commodity-restricted.jpg?c=16x9&q=h_438,w_780,c_fill', 'American tourists are increasingly popular around the world', 0],
        ['news3', "This endangered bird has found a refuge among Hong Kong's skyscrapers", 'https://cdn.cnn.com/cnn/interactive/uploads/20230619-cockatoo_image_c.jpg', 'An endangered species thrives in an urban environment', 0],
        ['news4', 'Live updates on a huge day for the US economy: Housing, GDP, jobs and Bidenomics', 'https://media.cnn.com/api/v1/images/stellar/prod/230627152404-nyse-file-0609.jpg?c=16x9&q=h_438,w_780,c_fill', 'Key economic indicators released today', 1],
      ];

      for (const article of sampleArticles) {
        await connection.query(
          'INSERT INTO articles (section, title, image_url, summary, is_live) VALUES (?, ?, ?, ?, ?)',
          article
        );
      }
      console.log(`✅ Seeded ${sampleArticles.length} sample articles`);
    } else {
      console.log(`✅ Articles table already has ${rows[0].count} records`);
    }

    console.log('🎉 Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = initDatabase;
