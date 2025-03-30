const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connect_db")
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const bookRoute = require("./routes/book");
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

app.listen(8000, () => {
    console.log("Server is running");
});