import express from "express";
import Message from "../models/Message.js";
import BookingRequest from "../models/BookingRequest.js";
import { protect } from "../middleware/Auth.js";

const router = express.Router();


// ✅ SEND MESSAGE
router.post("/:bookingId", protect, async (req, res) => {
  try {

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text required" });
    }

    const booking = await BookingRequest.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user._id.toString();

    // ✅ authorization check
    if (
      booking.tenant.toString() !== userId &&
      booking.landlord.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ✅ determine receiver
    const receiver =
      booking.tenant.toString() === userId
        ? booking.landlord
        : booking.tenant;

    const message = await Message.create({
      booking: booking._id,
      sender: userId,
      receiver,
      text,
    });

    const populatedMessage = await message.populate(
      "sender",
      "fullName"
    );

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});



// ✅ GET CHAT MESSAGES
router.get("/:bookingId", protect, async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userId = req.user._id.toString();

    // ✅ authorization check
    if (
      booking.tenant.toString() !== userId &&
      booking.landlord.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const messages = await Message.find({ booking: booking._id })
      .populate("sender", "fullName");

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

router.put("/:bookingId/read", protect, async (req, res) => {
  await Message.updateMany(
    {
      booking: req.params.bookingId,
      receiver: req.user._id,
      read: false,
    },
    { read: true }
  );

  res.json({ message: "Messages marked as read" });
});

router.get("/unread/count", protect, async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    read: false,
  });

  res.json({ count });
});


export default router;
