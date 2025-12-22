import express from "express";
import  adminRoutes from "./routes/admin.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import User from "./models/User.js";
import Users from "./routes/user.js";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import propertyRoutes from "./routes/properties.js";
import bookingRoutes from "./routes/bookingRequests.js";
import analyticsRoutes from "./routes/analytics.js";
import chatRoute from "./routes/chat.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Make uploads folder publicly accessible
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-name.vercel.app"
    ],
    credentials: true
  })
);

app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookingRequests", bookingRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/api/chat", chatRoute);
app.use("/users", Users);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// ✅ Create a test user if no users exist
mongoose.connection.once("open", async () => {
  console.log("MongoDB connection open, checking for test user...");

  const existingUsers = await User.find({});
  if (existingUsers.length === 0) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const testUser = new User({
      fullName: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "tenant"
    });
    await testUser.save();
    console.log("✅ Test user created: test@example.com / 123456");
  } else {
    console.log("Users already exist in the database.");
  }
});

// ✅ Dummy user route (temporary)
app.get("/api/user/me", (req, res) => {
  const isLoggedIn = false;
  if (!isLoggedIn) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json({ username: "Hayder", role: "landlord" });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
