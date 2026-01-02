require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connection = require('./models/db');

const migrationFile = 'migrations/create-users-table.sql';
const sql = fs.readFileSync(path.join(__dirname, migrationFile), 'utf8');

console.log('🔧 Creating users table...');

connection.query(sql, (error, results) => {
  if (error) {
    console.error('❌ Error creating users table:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Users table created successfully!');
  process.exit(0);
});
