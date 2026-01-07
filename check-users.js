const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mukamunana.1',
    database: 'nta_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id, name, email, role, profile_picture FROM users');
    console.log('Users in database:');
    rows.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.name}, Email: ${r.email}, Role: ${r.role}, Picture: ${r.profile_picture || 'NULL'}`);
    });
    await conn.release();
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
