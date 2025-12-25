
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
console.log('DEBUG: NODE_ENV =', process.env.NODE_ENV);
if (process.env.MYSQL_ADDON_URI) {
    console.log('DEBUG: MYSQL_ADDON_URI is set. Parsing URI...');
    // Parse the URI manually for mysql2 compatibility
    const uri = process.env.MYSQL_ADDON_URI;
    const match = uri.match(/^mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)$/);
    if (match) {
        const [ , user, password, host, port, database ] = match;
        connection = mysql.createPool({
            host,
            user,
            password,
            database,
            port: Number(port),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('DEBUG: Parsed MYSQL_ADDON_URI and created pool.');
    } else {
        console.error('ERROR: Could not parse MYSQL_ADDON_URI, falling back to URI string.');
        connection = mysql.createPool(uri);
    }
} else if (process.env.CONNECTION_URI) {
    console.log('DEBUG: CONNECTION_URI is set.');
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

module.exports = connection;
