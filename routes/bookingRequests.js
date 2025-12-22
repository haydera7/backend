import express from "express";
import BookingRequest from "../models/BookingRequest.js";
import Property from "../models/Property.js";
import { protect } from "../middleware/Auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// ✅ CREATE BOOKING REQUEST (TENANT)
router.post("/", protect, async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    // 1️⃣ Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 2️⃣ Create booking request
    const booking = new BookingRequest({
      property: property._id,
      landlord: property.landlord,
      tenant: req.user._id,
      message,
    });

    await booking.save();
  

   await Notification.create({
  user: property.landlord,
  message: "You have a new booking request",
});


    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create booking request" });
  }
});

// ✅ GET landlord booking requests
router.get("/landlord", protect, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({
      landlord: req.user._id,
    })
      .populate("tenant", "fullName email")
      .populate("property", "title location price");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// ✅ ACCEPT / REJECT booking request
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await BookingRequest.findById(req.params.id);
   
  if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

     // ❌ Prevent double booking
if (booking.property.status === "Rented") {
  return res.status(400).json({ message: "Property already rented" });
}

    // ❌ Not landlord
    if (booking.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    // ✅ If accepted → mark property as rented
    if (status === "accepted") {
      await Property.findByIdAndUpdate(booking.property, {
        status: "Rented",
      });
    }

    // 🔔 Notify tenant
    await Notification.create({
      user: booking.tenant,
      message:
        status === "accepted"
          ? "Your booking request was accepted 🎉"
          : "Your booking request was rejected ❌",
    });

    res.json({ message: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// ✅ MARK TENANT BOOKINGS AS SEEN
router.put("/mark-seen", protect, async (req, res) => {
  try {
    await BookingRequest.updateMany(
      { tenant: req.user._id, seen: false },
      { seen: true }
    );
    res.json({ message: "Bookings marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});



// ✅ GET TENANT BOOKINGS
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ tenant: req.user._id })
      .populate("property")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

export default router;
