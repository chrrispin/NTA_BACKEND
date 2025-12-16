const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// First connection to create database
const adminConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

console.log('Connecting to MySQL...');

adminConnection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');

  // Read setup.sql
  const setupSql = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = setupSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let completed = 0;

  const executeNextStatement = (index) => {
    if (index >= statements.length) {
      console.log('✅ Database initialization complete!');
      adminConnection.end();
      process.exit(0);
    }

    const statement = statements[index];
    console.log(`\n📝 Executing statement ${index + 1}/${statements.length}...`);
    
    adminConnection.query(statement, (err, results) => {
      if (err) {
        console.error(`❌ Error: ${err.message}`);
        // Continue anyway
      } else {
        console.log(`✅ Success: ${statement.substring(0, 50)}...`);
      }
      executeNextStatement(index + 1);
    });
  };

  executeNextStatement(0);
});
