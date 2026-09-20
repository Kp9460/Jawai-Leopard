const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// MONGODB CONNECTION
// ======================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });


// ======================================================
// REVIEW SCHEMA
// ======================================================

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
      trim: true,
    },

    month: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    // Sirf website form se aaye (new) reviews me ye tag hoga.
    // DB me pehle se pade purane reviews me ye field nahi
    // hogi, isliye wo list me nahi aayenge.
    source: {
      type: String,
      default: "website",
    },
  },
  {
    timestamps: true,
  }
);


// ======================================================
// REVIEW MODEL
// ======================================================

const Review = mongoose.model("Review", reviewSchema);


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send("Jawai Safari Backend is Running");
});


// ======================================================
// ADD REVIEW
// ======================================================

app.post("/api/reviews", async (req, res) => {
  try {
    const {
      name,
      location,
      rating,
      review,
      month,
      year,
    } = req.body;

    const newReview = new Review({
      name,
      location,
      rating,
      review,
      month,
      year,
      source: "website", // website form se aaya naya review
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });

  } catch (error) {

    console.log("Review Save Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
});


// ======================================================
// GET REVIEWS
// ======================================================

app.get("/api/reviews", async (req, res) => {
  try {

    // Sirf website se aaye (new) reviews lao.
    // Purane reviews (jinme source nahi hai) apne aap bahar.
    const reviews = await Review
      .find({ source: "website" })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });

  } catch (error) {

    console.log("Review Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
});




app.post("/api/test-review", async (req, res) => {
  console.log("TEST REVIEW RECEIVED:", req.body);

  try {
    const testReview = new Review({
      name: "Test User",
      location: "Jaipur, India",
      rating: 5,
      review: "MongoDB test review",
      month: "September",
      year: 2026,
      source: "website",
    });

    await testReview.save();

    console.log("TEST REVIEW SAVED:", testReview);

    res.json({
      success: true,
      message: "Test review saved successfully",
      review: testReview,
    });

  } catch (error) {
    console.log("TEST REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});