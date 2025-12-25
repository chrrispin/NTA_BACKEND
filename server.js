const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/auth");
const articlesRoute = require("./routes/articles");
const categoriesRoute = require("./routes/categories");
const commentsRoute = require("./routes/comments");
const uploadsRoute = require("./routes/uploads");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", authRoute);
app.use("/api/articles", articlesRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/uploads", uploadsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
