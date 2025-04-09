const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connect_db")
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const bookRoute = require("./routes/book");
const categoryRoute = require("./routes/category");
const documentRoute = require("./routes/document");
const reviewRoute = require("./routes/review");
const borrowRoute = require("./routes/borrow");
const path = require("path");

dotenv.config();
const app = express();

connectDB();


app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);
app.use("/v1/books", bookRoute);
app.use("/v1/categorys", categoryRoute);
app.use("/v1/documents", documentRoute);
app.use("/v1/reviews", reviewRoute);
app.use("/v1/borrow", borrowRoute);

app.listen(8000, () => {
    console.log("Server is running");
});