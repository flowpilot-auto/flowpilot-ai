const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav-links");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
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

    const body = new URLSearchParams();

    body.append("name", formData.get("name"));
    body.append("business", formData.get("business"));
    body.append("email", formData.get("email"));
    body.append("phone", formData.get("phone"));
    body.append("type", formData.get("type"));
    body.append("process", formData.get("process"));

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      status.textContent = "Sending your request...";

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: body,
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
      submitButton.innerHTML =
        'Request a free trial <span>→</span>';
    }
  });
}
