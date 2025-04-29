const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connect_db");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const bookRoute = require("./routes/book");
const categoryRoute = require("./routes/category");
const documentRoute = require("./routes/document");
const reviewRoute = require("./routes/review");
const borrowRoute = require("./routes/borrow");
const membershipRoute = require("./routes/membership");
const chatRoute = require("./routes/chat");
const Chat = require("./models/Chat");
const Message = require("./models/Message");
const User = require("./models/User");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("./services/penaltyJob");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();

app.use(cors(
    {
        origin: "http://localhost:3000",
  credentials: true,
    }
));
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
app.use("/v1/membership", membershipRoute);
app.use("/v1/chat", chatRoute);

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinChat", async ({ chatId, userId }) => {
      socket.join(chatId);

      const chat = await Chat.findById(chatId);
      if (!chat.participants.includes(userId)) {
        socket.emit("error", { message: "Unauthorized access to chat" });
        return;
      }

      console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on("sendMessage", async ({ chatId, userId, content }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat.participants.includes(userId)) {
          socket.emit("error", { message: "Unauthorized access to chat" });
          return;
        }

        const message = await Message.create({
          chatId,
          sender: userId,
          content,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "username avatar"
        );

        io.to(chatId).emit("newMessage", populatedMessage);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
server.listen(8000, () => {
  console.log("Server is running");
});
