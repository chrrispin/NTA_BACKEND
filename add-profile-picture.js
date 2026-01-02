require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connection = require('./models/db');

const migrationFile = 'migrations/add-profile-picture-column.sql';
const sql = fs.readFileSync(path.join(__dirname, migrationFile), 'utf8');

console.log('🔧 Adding profile_picture column to users table...');

connection.query(sql, (error, results) => {
  if (error) {
    console.error('❌ Error adding profile_picture column:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Profile picture column added successfully!');
  process.exit(0);
});
