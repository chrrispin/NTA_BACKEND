const connection = require('./models/db');
const fs = require('fs');
const path = require('path');

console.log('🔧 Running database migration: add-content-column...\n');

const migrationFile = path.join(__dirname, 'migrations', 'add-content-column.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

connection.query(sql, (error) => {
  if (error) {
    // Check if error is because column already exists
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Migration already applied: content column exists\n');
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Migration successful: content column added to articles table\n');
  }
  
  connection.end();
  process.exit(0);
});
