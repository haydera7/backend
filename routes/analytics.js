// routes/analytics.js
import express from "express";
import Property from "../models/Property.js";
import BookingRequest from "../models/BookingRequest.js";
import { protect, authorize } from "../middleware/Auth.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("landlord"),
  async (req, res) => {
    try {
      // 1️⃣ Landlord properties only
      const properties = await Property.find({
        landlord: req.user._id,
      });

      const propertyIds = properties.map(p => p._id);

      // 2️⃣ Total views (only landlord's properties)
      const totalViews = properties.reduce(
        (sum, p) => sum + (p.views || 0),
        0
      );

      // 3️⃣ Booking requests (only landlord's properties)
      const bookingRequests = await BookingRequest.countDocuments({
        property: { $in: propertyIds },
      });

      // 4️⃣ Total revenue (only rented properties of landlord)
      const totalRevenue = properties
        .filter(p => p.status === "Rented")
        .reduce((sum, p) => sum + (p.price || 0), 0);

      // 5️⃣ Response rate (still placeholder)
      const responseRate = Math.round(Math.random() * 80 + 10);

      res.json({
        totalViews,
        bookingRequests,
        totalRevenue,
        responseRate,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
