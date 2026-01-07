const express = require("express");
const cors = require("cors");

const initDatabase = require("./init-db");
const authRoute = require("./routes/auth");
const articlesRoute = require("./routes/articles");
const categoriesRoute = require("./routes/categories");
const commentsRoute = require("./routes/comments");
const uploadsRoute = require("./routes/uploads");

const app = express();

// CORS configuration: allow your deployed frontends
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://nta-frontend.onrender.com',  // Replace with your NTA frontend Render URL
    'https://nta-admin.onrender.com',     // Replace with your NTA_ADMIN frontend Render URL
    'https://newtimeafrica.com',          // Added production frontend domain
    'https://admin.newtimeafrica.com',    // Added admin dashboard domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Debug logger for request-access route to help diagnose JSON parse errors
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/auth/request-access') {
    console.log('--- Incoming request to /api/auth/request-access ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw body (may be undefined if not JSON):', req.rawBody);
  }
  next();
});

// Root route for health/status check
app.get('/', (req, res) => {
  res.send('NTA Backend API is running');
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", authRoute);
app.use("/api/articles", articlesRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/uploads", uploadsRoute);

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));
};

// Allow skipping DB init for local debugging when SKIP_DB_INIT=true
if (process.env.SKIP_DB_INIT === 'true') {
  console.warn('⚠️ SKIP_DB_INIT=true — starting server without initializing database (debug mode)');
  startServer();
} else {
  // Initialize database before starting server
  initDatabase()
    .then(() => {
      startServer();
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });
}
