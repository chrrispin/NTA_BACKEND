const mysql = require('mysql2/promise');
require('dotenv').config();

async function addWorkflowColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔧 Adding workflow columns to articles table...');

    // Add status column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN status VARCHAR(50) DEFAULT 'draft'
      `);
      console.log('✅ Added status column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  status column already exists');
    }

    // Add submitted_by column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN submitted_by INT
      `);
      console.log('✅ Added submitted_by column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  submitted_by column already exists');
    }

    // Add submitted_at column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN submitted_at TIMESTAMP NULL
      `);
      console.log('✅ Added submitted_at column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  submitted_at column already exists');
    }

    // Add approved_by column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN approved_by INT
      `);
      console.log('✅ Added approved_by column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  approved_by column already exists');
    }

    // Add approved_at column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN approved_at TIMESTAMP NULL
      `);
      console.log('✅ Added approved_at column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  approved_at column already exists');
    }

    // Add rejection_reason column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN rejection_reason LONGTEXT
      `);
      console.log('✅ Added rejection_reason column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  rejection_reason column already exists');
    }

    // Add current_reviewer_role column
    try {
      await connection.query(`
        ALTER TABLE articles ADD COLUMN current_reviewer_role VARCHAR(50)
      `);
      console.log('✅ Added current_reviewer_role column');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log('⏭️  current_reviewer_role column already exists');
    }

    // Add indexes (these can be added multiple times without error)
    try {
      await connection.query(`
        ALTER TABLE articles ADD INDEX idx_status (status)
      `);
      console.log('✅ Added status index');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEY_NAME') throw e;
      console.log('⏭️  status index already exists');
    }

    try {
      await connection.query(`
        ALTER TABLE articles ADD INDEX idx_submitted_by (submitted_by)
      `);
      console.log('✅ Added submitted_by index');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEY_NAME') throw e;
      console.log('⏭️  submitted_by index already exists');
    }

    try {
      await connection.query(`
        ALTER TABLE articles ADD INDEX idx_approved_by (approved_by)
      `);
      console.log('✅ Added approved_by index');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEY_NAME') throw e;
      console.log('⏭️  approved_by index already exists');
    }

    try {
      await connection.query(`
        ALTER TABLE articles ADD INDEX idx_current_reviewer_role (current_reviewer_role)
      `);
      console.log('✅ Added current_reviewer_role index');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEY_NAME') throw e;
      console.log('⏭️  current_reviewer_role index already exists');
    }

    console.log('\n🎉 Workflow columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding workflow columns:', error.message);
  } finally {
    await connection.end();
  }
}

addWorkflowColumns();
