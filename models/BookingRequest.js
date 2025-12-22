import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    seen: {
      type: Boolean,
      default: false, // ⭐ CRITICAL
    },
  },
  { timestamps: true }
);

export default mongoose.model("BookingRequest", bookingRequestSchema);
