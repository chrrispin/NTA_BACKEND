
const mysql = require('mysql2');
// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
    try {
        require('dotenv').config();
    } catch (e) {
        // ignore if dotenv is not installed
    }
}



// Prefer MYSQL_ADDON_URI (Clever Cloud), then CONNECTION_URI, then manual credentials
let connection;
if (process.env.MYSQL_ADDON_URI) {
    connection = mysql.createPool(process.env.MYSQL_ADDON_URI);
} else if (process.env.CONNECTION_URI) {
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
