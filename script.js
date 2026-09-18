const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

const form = document.getElementById("trialForm");
const status = document.getElementById("formStatus");

const WEBHOOK_URL =
  "https://imagination-sum-holdings-machine.trycloudflare.com/webhook/fumba-trial-request";

if (form && status) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');

    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      business: formData.get("business"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      type: formData.get("type"),
      process: formData.get("process"),
    };

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      status.textContent = "Sending your request...";

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      status.textContent =
        "✓ Trial request received! Please check your email for confirmation.";

      form.reset();
    } catch (error) {
      console.error(error);

      status.textContent =
        "Something went wrong while sending your request. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Request a free trial <span>→</span>';
    }
  });
}
