const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const projectRoot = path.resolve(__dirname, "..");
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isLocalOrigin =
        origin === "null" || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin || "");
      const isAllowed =
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" && isLocalOrigin);

      callback(null, isAllowed);
    },
  })
);
app.use(express.json({ limit: "20kb" }));

// Serve only the public website files; don't expose the project or backend folders.
app.use(
  "/images",
  express.static(path.join(projectRoot, "images"), {
    dotfiles: "deny",
    maxAge: "1d",
  })
);


// MONGODB CONNECTION

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((error) => console.error("MongoDB connection failed:", error.message));
} else {
  console.error("MONGO_URI is missing. The website will run, but reviews are unavailable.");
}


// REVIEW SCHEMA

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },

    review: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
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


// REVIEW MODEL

const Review = mongoose.model("Review", reviewSchema);


// WEBSITE ROUTES

app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/reviews.html", (req, res) => {
  res.sendFile(path.join(projectRoot, "reviews.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(projectRoot, "style.css"));
});

app.get("/reviews.css", (req, res) => {
  res.sendFile(path.join(projectRoot, "reviews.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(projectRoot, "script.js"));
});

app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    databaseConnected,
  });
});

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "The review service is temporarily unavailable.",
    });
  }

  next();
}

// ADD REVIEW

app.post("/api/reviews", requireDatabase, async (req, res) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const review = typeof body.review === "string" ? body.review.trim() : "";
    const rating = Number(body.rating);

    if (!name || name.length > 80) {
      return res.status(400).json({ success: false, message: "Enter a name up to 80 characters." });
    }

    if (!location || location.length > 80) {
      return res.status(400).json({ success: false, message: "Enter a location up to 80 characters." });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Choose a rating from 1 to 5." });
    }

    if (review.length < 10 || review.length > 1000) {
      return res.status(400).json({ success: false, message: "A review must be 10 to 1,000 characters." });
    }

    const now = new Date();
    const month = new Intl.DateTimeFormat("en", {
      month: "long",
      timeZone: "Asia/Kolkata",
    }).format(now);
    const year = Number(
      new Intl.DateTimeFormat("en", {
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(now)
    );

    const newReview = new Review({
      name,
      location,
      rating,
      review,
      month,
      year,
      source: "website",
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });

  } catch (error) {

    console.error("Review save failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to add review. Please try again later.",
    });
  }
});


// GET REVIEWS

app.get("/api/reviews", requireDatabase, async (req, res) => {
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

    console.error("Review fetch failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load reviews. Please try again later.",
    });
  }
});

// START SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
