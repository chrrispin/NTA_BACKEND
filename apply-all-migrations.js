const connection = require('./models/db');
const fs = require('fs');
const path = require('path');

const migrations = [
  'add-content-column.sql',
  'add-flags-columns.sql',
  'add-media-column.sql',
  // 'add-page-column.sql', // Skip - already in init-db.js
  'ensure-performance-indexes.sql'
];

let completed = 0;

const runMigration = (index) => {
  if (index >= migrations.length) {
    console.log('\n🎉 All migrations completed!');
    connection.end();
    process.exit(0);
    return;
  }

  const migrationFile = migrations[index];
  const filePath = path.join(__dirname, 'migrations', migrationFile);

  console.log(`\n📝 Running migration ${index + 1}/${migrations.length}: ${migrationFile}`);

  let sql = fs.readFileSync(filePath, 'utf8');
  
  // Remove USE database statements from migrations
  sql = sql.replace(/^\s*USE\s+[^;]+;\s*/gim, '');
  
  // Split by semicolon and filter out empty statements
  const statements = sql.split(';').filter(s => s.trim());

  const executeNext = (statementIndex) => {
    if (statementIndex >= statements.length) {
      console.log(`✅ Migration successful: ${migrationFile}`);
      runMigration(index + 1);
      return;
    }

    const statement = statements[statementIndex].trim();
    if (!statement) {
      executeNext(statementIndex + 1);
      return;
    }

    connection.query(statement + ';', (error) => {
      if (error) {
        // Check if error is because column already exists
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`⚠️  ${migrationFile} (already applied or similar): ${error.message}`);
          executeNext(statementIndex + 1);
        } else {
          console.error(`❌ Migration failed: ${migrationFile}`, error.message);
          connection.end();
          process.exit(1);
        }
      } else {
        executeNext(statementIndex + 1);
      }
    });
  };

  executeNext(0);
};

console.log('🔧 Starting database migrations...');
runMigration(0);
