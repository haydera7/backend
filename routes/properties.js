import express from "express";
import multer from "multer";
import Property from "../models/Property.js";
import path from "path";
import { protect,authorize  } from "../middleware/Auth.js";
const router = express.Router();

// ✅ Set up multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get(
  "/landlord",
  protect,
  authorize("landlord"),
  async (req, res) => {
    try {
      const properties = await Property.find({
        landlord: req.user._id,
      });
      res.json(properties);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);



// ✅ Add new property
router.post("/",protect,authorize("landlord"), upload.array("images", 5), async (req, res) => {
  try {
    const { title, location, price, status } = req.body;
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    const newProperty = new Property({
      title,
      location,
      price,
      status,
      images,
      landlord: req.user._id
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("Error saving property:", err);
    res.status(500).json({ message: "Failed to save property" });
  }
});

// ✅ Get approved & active properties for tenants
router.get("/public", async (req, res) => {
  try {
    const properties = await Property.find({
      approved: true,
      status: "Active",
    });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// ✅ Update property
router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { title, location, price, status } = req.body;
    let images = [];

    if (req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = req.body.images;
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { title, location, price, status, images },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating property:", err);
    res.status(500).json({ message: "Failed to update property" });
  }
});

// ✅ Delete property
router.delete("/:id", async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/approve", async (req, res) => {
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


export default router;
