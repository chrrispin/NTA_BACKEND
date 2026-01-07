
const mysql = require('mysql2');
// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
    try {
        require('dotenv').config();
    } catch (e) {
        // ignore if dotenv is not installed
    }
}





// Prefer Clever Cloud explicit MySQL addon variables, then URI, then manual credentials
let connection;
console.log('DEBUG: NODE_ENV =', process.env.NODE_ENV);

if (process.env.SKIP_DB_INIT === 'true') {
    console.warn('⚠️ SKIP_DB_INIT=true — exporting stub DB connection for debug');
    connection = {
        getConnection: (cb) => cb(null, { release: () => {} }),
        query: (...args) => {
            const cb = args[args.length - 1];
            if (typeof cb === 'function') cb(null, []);
            return;
        }
    };
} else {
    if (process.env.MYSQL_ADDON_HOST) {
        connection = mysql.createPool({
            host: process.env.MYSQL_ADDON_HOST,
            user: process.env.MYSQL_ADDON_USER,
            password: process.env.MYSQL_ADDON_PASSWORD,
            database: process.env.MYSQL_ADDON_DB,
            port: process.env.MYSQL_ADDON_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('DEBUG: Using Clever Cloud MySQL addon variables.');
    } else if (process.env.MYSQL_ADDON_URI) {
        console.log('DEBUG: Using MYSQL_ADDON_URI.');
        connection = mysql.createPool(process.env.MYSQL_ADDON_URI);
    } else if (process.env.CONNECTION_URI) {
        console.log('DEBUG: Using CONNECTION_URI.');
        connection = mysql.createPool(process.env.CONNECTION_URI);
    } else {
        console.log('DEBUG: Using manual DB credentials.');
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

    // Optional: Test the connection pool at startup for immediate feedback
    if (connection) {
        connection.getConnection((err, conn) => {
            if (err) {
                console.error('❌ MySQL connection test failed:', err.message);
            } else {
                console.log('✅ MySQL connection pool test succeeded.');
                conn.release();
            }
        });
    }
}

module.exports = connection;
