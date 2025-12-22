import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "Active" },
  images: [String],
    landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

    // ⭐ IMPORTANT FIELD (MISSING)
  approved: {
    type: Boolean,
    default: false,
  }


});

export default mongoose.model("Property", propertySchema);


// models/Property.js
/*previous
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: String,
  price: Number,
  rooms: Number,
status: { type: String, enum: ["Active","Inactive","Rented","Pending"], default: "Active" },
  views: { type: Number, default: 0 },
  images: { type: [String], default: [] },
   lat: Number, // Add these for weather data
  lon: Number,
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export default mongoose.model("Property", propertySchema);*/
