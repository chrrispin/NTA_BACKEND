const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();



// Prefer CONNECTION_URI (Clever Cloud), fallback to manual credentials for local/dev
let connection;
if (process.env.CONNECTION_URI) {
    connection = mysql.createPool(process.env.CONNECTION_URI);
} else {
    connection = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = connection;
