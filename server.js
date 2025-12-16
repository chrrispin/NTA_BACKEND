const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/auth");
const articlesRoute = require("./routes/articles");
const categoriesRoute = require("./routes/categories");
const commentsRoute = require("./routes/comments");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/articles", articlesRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/comments", commentsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
