
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
require("dotenv").config();

require("./cronJobs");
require("./services/overdueReminder.service");


const app = express();

// CORS Configuration (Allow Frontend & Cookies)
const FRONTEND_ORIGIN = "http://localhost:3000";

app.use(
  cors({
    origin: "*", // Allow requests from frontend
    credentials: true,       // Allow cookies
  })
); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//  Import Routes
const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const cartRoutes = require("./routes/cart.routes");
const borrowRoutes = require("./routes/borrow.routes");
const paymentRoutes = require("./routes/payment.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const notificationRoutes = require("./routes/notification.routes");
const shareRoutes = require("./routes/share.routes");
const reservationRoutes = require("./routes/reservation.routes");
const authorRoutes = require("./routes/author.routes");
const AdminRoutes = require("./routes/admin.routes");
// const authMe = require("./middlewares/auth.me");



app.use("/api/auth", authRoutes);//registration and login
// app.use("/api/auth", authMe);
app.use("/api/users/authors", authorRoutes);
app.use("/api/admin/authors", authorRoutes);
app.use("/api/users/books", bookRoutes);
app.use("/uploads", express.static("public/uploads")); // Serve images
app.use("/api/users", userRoutes);
app.use("/api", AdminRoutes);//user admin handler routes
app.use("/api/categories", categoryRoutes);

// Protected Routes (Authentication Required)
app.use("/api/cart", cartRoutes);
app.use("/api/borrows",  borrowRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shares",  shareRoutes);
app.use("/api/reservations", reservationRoutes);



// WebSockets (Real-time Notifications)
const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: FRONTEND_ORIGIN, 
    credentials: true,
  },
});

// WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Store WebSocket instance in Express for use in controllers
app.set("io", io);

//  Sync Database
sequelize.sync().then(() => {
  console.log("Database synced!");
});

app.get("/", (_req,res) =>{
  res.send(process.env.NODE_ENV)
  console.log(process.env.NODE_ENV)
})


app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

//  Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
