// Debug start helper: start server without DB init for debugging
process.env.SKIP_DB_INIT = 'true';
require('./server.js');
