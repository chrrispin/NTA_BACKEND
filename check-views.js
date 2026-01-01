const connection = require('./models/db');

console.log('Checking views in database...\n');

connection.query('SELECT id, title, views FROM articles ORDER BY id DESC LIMIT 10', (err, results) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
  
  console.log('📊 Articles Views (Latest 10):');
  console.log('='.repeat(80));
  results.forEach(r => {
    console.log(`ID: ${r.id} | Views: ${r.views} | Title: ${r.title.substring(0, 50)}...`);
  });
  console.log('='.repeat(80));
  
  connection.end();
  process.exit(0);
});
