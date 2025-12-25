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
    'http://localhost:3000',
    'https://nta-frontend.onrender.com',  // Replace with your NTA frontend Render URL
    'https://nta-admin.onrender.com',     // Replace with your NTA_ADMIN frontend Render URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", authRoute);
app.use("/api/articles", articlesRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/uploads", uploadsRoute);

const PORT = process.env.PORT || 5000;

// Initialize database before starting server
initDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
