// MOBILE MENU

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Close menu after clicking a link

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) navLinks.classList.remove("active");
  });
});

// BOOKING FORM (only on home page — reviews.html me ye form nahi hai)

const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");

if (bookingForm) {
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get form values
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const safari = document.getElementById("safariType").value;
  const guests = document.getElementById("guests").value;
  const date = document.getElementById("date").value;

  // Create WhatsApp message
  const message = `
🐆 *NEW JAWAI SAFARI BOOKING*

👤 Name: ${name}
📱 Phone: ${phone}
🦁 Safari: ${safari}
👥 Guests: ${guests}
📅 Date: ${date}

Please contact the customer to confirm the booking.
`;

  // Your WhatsApp number
  const whatsappNumber = "919694865849";

  // Create WhatsApp URL
  const whatsappURL =
    "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

  window.open(whatsappURL, "_blank");

  // Success message
  if (formMessage) formMessage.textContent = "Booking details are ready on WhatsApp 🐆";

  // Clear form
  bookingForm.reset();
});
} // end if (bookingForm)

// MINIMUM BOOKING DATE (only on home page)

const dateInput = document.getElementById("date");

if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
}


// ======================================================
// REVIEWS SYSTEM
// MongoDB Backend — koi hardcoded review nahi hai.
// Home page = sirf 3 reviews | reviews.html = saare reviews
// Sirf website form se submit kiye (new) reviews dikhenge.
// Date = Month + Year only (din / tarikh nahi)
// ======================================================

const API_URL = "http://localhost:5000/api/reviews";


// ---------- Star rating ----------

function createStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? "★" : "☆";
  }
  return stars;
}


// ---------- HTML escape ----------

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ---------- Review card (Month Year only, no date) ----------

function createReviewCard(review) {
  const card = document.createElement("article");
  card.className = "review-card";

  const firstLetter =
    review.name && review.name.length > 0
      ? review.name.charAt(0).toUpperCase()
      : "?";

  card.innerHTML =
    '<div class="review-stars">' +
    createStars(Number(review.rating)) +
    "</div>" +
    '<p class="review-text">"' +
    escapeHTML(review.review) +
    '"</p>' +
    '<div class="review-user">' +
    '<div class="review-avatar">' +
    escapeHTML(firstLetter) +
    "</div>" +
    "<div>" +
    "<strong>" +
    escapeHTML(review.name) +
    "</strong>" +
    "<span>" +
    escapeHTML(review.location) +
    "</span>" +
    "</div>" +
    "</div>" +
    '<div class="review-date">' +
    escapeHTML(review.month) +
    " " +
    escapeHTML(String(review.year)) +
    "</div>";

  return card;
}


// ======================================================
// GET REVIEWS FROM MONGODB
// Sirf website se aaye (new) reviews — purane nahi
// ======================================================

async function getReviews() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.reviews)) {
      // Sirf website form se submit kiye reviews dikhao.
      // DB me pehle se pade purane reviews (bina source tag)
      // yahin filter ho jayenge.
      return data.reviews.filter(
        (review) => review.source === "website"
      );
    }

    return [];
  } catch (error) {
    console.error("Unable to load reviews:", error);
    return [];
  }
}


// ======================================================
// HOME PAGE — Only first 3 reviews
// ======================================================

async function renderHomeReviews() {
  const homeReviews = document.getElementById("homeReviews");
  if (!homeReviews) return;

  homeReviews.innerHTML = "";

  const reviews = await getReviews();

  if (reviews.length === 0) {
    homeReviews.innerHTML =
      '<p class="no-reviews">No reviews available yet.</p>';
    return;
  }

  reviews.slice(0, 3).forEach((review) => {
    homeReviews.appendChild(createReviewCard(review));
  });
}


// ======================================================
// REVIEWS PAGE — Show all reviews
// ======================================================

async function renderAllReviews() {
  const container = document.getElementById("allReviews");
  if (!container) return;

  container.innerHTML = "";

  const reviews = await getReviews();

  if (reviews.length === 0) {
    container.innerHTML =
      '<p class="no-reviews">No reviews available yet.</p>';
    return;
  }

  reviews.forEach((review) => {
    container.appendChild(createReviewCard(review));
  });
}


// ======================================================
// ADD NEW REVIEW — Save to MongoDB, turant list me dikhao
// ======================================================

const reviewForm = document.getElementById("reviewForm");
const reviewSuccess = document.getElementById("reviewSuccess");

if (reviewForm) {
  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("reviewName").value.trim();
    const location = document.getElementById("reviewLocation").value.trim();
    const rating = Number(document.getElementById("reviewRating").value);
    const reviewText = document.getElementById("reviewText").value.trim();

    // ---------- Validation ----------

    if (!name || !location || !rating || !reviewText) {
      if (reviewSuccess) {
        reviewSuccess.textContent =
          "Please fill all fields and select a rating. ⭐";
      }
      return;
    }

    // ---------- Current Month + Year only (no day/date) ----------

    const currentDate = new Date();
    const month = currentDate.toLocaleString("en-US", { month: "long" });
    const year = currentDate.getFullYear();

    // ---------- Review Object ----------

    const newReview = {
      name: name,
      location: location,
      rating: rating,
      review: reviewText,
      month: month,
      year: year,
      source: "website", // website form se aaya naya review
    };

    try {
      // ---------- Send Review to Backend ----------

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add review");
      }

      // ---------- Success ----------

      if (reviewSuccess) {
        reviewSuccess.textContent =
          "Thank you! Your review has been added successfully. 🐆";
      }

      reviewForm.reset();

      // Lists turant refresh — naya review abhi dikhega
      await renderHomeReviews();
      await renderAllReviews();
    } catch (error) {
      console.error("Unable to submit review:", error);
      if (reviewSuccess) {
        reviewSuccess.textContent =
          "Unable to submit review. Please try again.";
      }
    }
  });
}


// ======================================================
// INITIAL LOAD
// ======================================================

renderHomeReviews();
renderAllReviews();
