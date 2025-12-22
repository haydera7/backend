import express from "express";
import User from "../models/User.js";
import Property from "../models/Property.js";

const router = express.Router();

// ===== USERS =====
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD USER
router.post("/users", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const newUser = new User({ fullName, email, password, role });
    await newUser.save();

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to add user" });
  }
});

// ===== PROPERTIES =====
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve property
router.put("/properties/:id/approve", async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Unapprove Property
router.put("/properties/:id/unapprove", async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { approved: false },
      { new: true }
    );

    res.json(property);
  } catch (err) {
    res.status(500).json({ error: "Failed to unapprove property" });
  }
});


export default router;
