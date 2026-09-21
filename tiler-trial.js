const form = document.getElementById("tilerEnquiryForm");
const status = document.getElementById("tilerFormStatus");

const TILER_WEBHOOK_URL =
  "https://hook.us2.make.com/xlfixsprbb4ptio985b675u32f1i0dty";

if (form && status) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const body = new URLSearchParams();

    [
      "name",
      "email",
      "phone",
      "suburb",
      "postcode",
      "jobType",
      "description",
      "urgency",
      "preferredContact",
    ].forEach((field) => {
      body.append(field, formData.get(field) || "");
    });

    try {
      button.disabled = true;
      button.textContent = "Sending...";
      status.className = "trade-status";
      status.textContent = "Sending your enquiry...";

      const response = await fetch(TILER_WEBHOOK_URL, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error("Webhook request failed");
      }

      status.className = "trade-status success";
      status.textContent =
        "✓ Enquiry received. Please check your email for confirmation.";
      form.reset();
    } catch (error) {
      console.error(error);
      status.className = "trade-status error";
      status.textContent =
        "Something went wrong while sending the enquiry. Please try again.";
    } finally {
      button.disabled = false;
      button.innerHTML = 'Send enquiry <span>→</span>';
    }
  });
}