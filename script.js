// MOBILE MENU

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Close menu after clicking a link

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// BOOKING FORM

const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");

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
  formMessage.textContent = "Booking details are ready on WhatsApp 🐆";

  // Clear form
  bookingForm.reset();
});

// MINIMUM BOOKING DATE

const dateInput = document.getElementById("date");

const today = new Date().toISOString().split("T")[0];

dateInput.setAttribute("min", today);