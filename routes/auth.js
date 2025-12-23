import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ fullName, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user: { fullName, email, role }, token });
  } catch (err) {
    res.status(500).json({ message: err.message }); 
  }
});

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Admin login path
    if (email && role === "admin") {
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized: Not an admin" });
      }

    }

    // Normal user login path
    if (role !== "admin") {
      if (user.role === "admin") {
        return res.status(403).json({ message: "Admins must use the admin login page" });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      token,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
