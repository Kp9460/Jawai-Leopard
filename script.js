// MOBILE MENU

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation",
    );
    menuBtn.textContent = isOpen ? "×" : "☰";
  });
}

// Close menu after clicking a link

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) navLinks.classList.remove("active");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open navigation");
      menuBtn.textContent = "☰";
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks?.classList.contains("active")) {
    navLinks.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation");
    menuBtn.textContent = "☰";
    menuBtn.focus();
  }
});

// BOOKING REQUEST (the form prepares a WhatsApp message; it does not confirm a booking)

const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const whatsappLink = document.getElementById("whatsappLink");
const dateInput = document.getElementById("date");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const safariSelect = document.getElementById("safariType");

// Set the date using the visitor's local calendar date, not UTC.
if (dateInput) {
  const now = new Date();
  const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  dateInput.min = localToday;
}

document.querySelectorAll(".safari-book-btn").forEach((link) => {
  link.addEventListener("click", () => {
    if (safariSelect && link.dataset.safari) {
      safariSelect.value = link.dataset.safari;
      safariSelect.focus({ preventScroll: true });
    }
    if (whatsappLink && formMessage) {
      whatsappLink.hidden = true;
      whatsappLink.removeAttribute("href");
      formMessage.textContent = "";
    }
  });
});

if (bookingForm && formMessage && whatsappLink) {
  nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
  phoneInput.addEventListener("input", () => phoneInput.setCustomValidity(""));
  bookingForm.addEventListener("input", clearPreparedRequest);
  bookingForm.addEventListener("change", clearPreparedRequest);

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearPreparedRequest();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const phoneDigits = phone.replace(/\D/g, "");

    nameInput.setCustomValidity(name ? "" : "Please enter your name.");
    phoneInput.setCustomValidity(
      phoneDigits.length >= 7 && phoneDigits.length <= 15
        ? ""
        : "Enter a valid phone number with 7 to 15 digits, including country code if needed.",
    );

    if (!bookingForm.reportValidity()) return;

    const safari = safariSelect.value;
    const guests = document.getElementById("guests").value;
    const date = dateInput.value;
    const message = [
      "🐆 JAWAI SAFARI ENQUIRY",
      "",
      `👤 Name: ${name}`,
      `📱 WhatsApp: ${phone}`,
      `🦁 Safari: ${safari}`,
      `👥 Guests: ${guests}`,
      `📅 Preferred date: ${date}`,
      "",
      "Please confirm availability, timings, inclusions and the complete total.",
      "I understand this is a request and not a confirmed booking.",
    ].join("\n");
    const whatsappNumber = "919694865849";

    whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    whatsappLink.hidden = false;
    formMessage.textContent =
      "Your request is ready. Continue to WhatsApp and press Send; your safari is not confirmed until the team replies.";
    whatsappLink.focus();
  });
}

function clearPreparedRequest() {
  if (whatsappLink && formMessage) {
    whatsappLink.hidden = true;
    whatsappLink.removeAttribute("href");
    formMessage.textContent = "";
  }
}

// REVIEWS SYSTEM
// MongoDB Backend
// Home page = only 3 reviews
// reviews.html = all reviews
// Date = Month + Year only

const configuredReviewApi = document
  .querySelector('meta[name="review-api-url"]')
  ?.content.trim();
const isLocalFile = window.location.protocol === "file:";
const isLocalHost = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);
const localApiHost = isLocalHost ? window.location.hostname : "localhost";
const localApiProtocol = "http:";
const API_URL =
  configuredReviewApi ||
  (isLocalFile || isLocalHost
    ? `${localApiProtocol}//${localApiHost}:5000/api/reviews`
    : `${window.location.origin}/api/reviews`);

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

// ---------- Review card ----------

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

// GET REVIEWS FROM MONGODB

async function getReviews() {
  const response = await fetch(API_URL, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success || !Array.isArray(data.reviews)) {
    throw new Error(data?.message || "Review service is unavailable.");
  }

  return data.reviews;
}

function createReviewMessage(message, isError = false) {
  const paragraph = document.createElement("p");
  paragraph.className = isError ? "no-reviews review-load-error" : "no-reviews";
  paragraph.setAttribute("role", "status");
  paragraph.textContent = message;
  return paragraph;
}

// HOME PAGE
// Only first 3 reviews

async function renderHomeReviews() {
  const homeReviews = document.getElementById("homeReviews");

  if (!homeReviews) return;

  homeReviews.replaceChildren();
  let reviews;

  try {
    reviews = await getReviews();
  } catch (error) {
    console.error("Unable to load reviews:", error);
    homeReviews.appendChild(
      createReviewMessage(
        "Guest reviews are temporarily unavailable. Please try again later.",
        true,
      ),
    );
    return;
  }

  if (reviews.length === 0) {
    homeReviews.appendChild(createReviewMessage("No reviews available yet."));
    return;
  }

  reviews.slice(0, 3).forEach((review) => {
    homeReviews.appendChild(createReviewCard(review));
  });
}

// REVIEWS PAGE
// Show all reviews

async function renderAllReviews() {
  const container = document.getElementById("allReviews");

  if (!container) return;

  container.replaceChildren();
  let reviews;

  try {
    reviews = await getReviews();
  } catch (error) {
    console.error("Unable to load reviews:", error);
    container.appendChild(
      createReviewMessage(
        "Guest reviews are temporarily unavailable. Please try again later.",
        true,
      ),
    );
    return;
  }

  if (reviews.length === 0) {
    container.appendChild(createReviewMessage("No reviews available yet."));
    return;
  }

  reviews.forEach((review) => {
    container.appendChild(createReviewCard(review));
  });
}

// ADD NEW REVIEW

const reviewForm = document.getElementById("reviewForm");
const reviewSuccess = document.getElementById("reviewSuccess");

if (reviewForm && reviewSuccess) {
  const nameInput = document.getElementById("reviewName");
  const locationInput = document.getElementById("reviewLocation");
  const ratingInput = document.getElementById("reviewRating");
  const reviewTextInput = document.getElementById("reviewText");
  const submitButton = reviewForm.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton.textContent.trim();

  [nameInput, locationInput, reviewTextInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.setCustomValidity("");
      reviewSuccess.classList.remove("is-error");
      reviewSuccess.textContent = "";
    });
  });
  ratingInput.addEventListener("change", () => {
    reviewSuccess.classList.remove("is-error");
    reviewSuccess.textContent = "";
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const location = locationInput.value.trim();
    const rating = Number(ratingInput.value);
    const reviewText = reviewTextInput.value.trim();

    nameInput.setCustomValidity(name ? "" : "Please enter your name.");
    locationInput.setCustomValidity(
      location ? "" : "Please enter your location.",
    );
    reviewTextInput.setCustomValidity(
      reviewText.length >= 10
        ? ""
        : "Please write at least 10 characters about your experience.",
    );

    if (!reviewForm.reportValidity()) return;

    const newReview = { name, location, rating, review: reviewText };

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting…";
      reviewSuccess.classList.remove("is-error");
      reviewSuccess.textContent = "Sending your review…";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to add review.");
      }

      reviewSuccess.classList.remove("is-error");
      reviewSuccess.textContent = "Thank you! Your review has been added. 🐆";
      reviewForm.reset();
      await Promise.all([renderHomeReviews(), renderAllReviews()]);
    } catch (error) {
      console.error("Unable to submit review:", error);
      reviewSuccess.classList.add("is-error");
      reviewSuccess.textContent =
        error instanceof TypeError
          ? "Could not reach the review service. Please try again later or contact us directly."
          : error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
}

// INITIAL LOAD

renderHomeReviews();

renderAllReviews();
