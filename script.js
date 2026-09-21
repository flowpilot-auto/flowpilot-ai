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
  "https://hook.us2.make.com/7v3xf2j2f53529cwf6wo1j7q3nulypu9";

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

const bookingForm = document.getElementById("bookingForm");
const bookingStatus = document.getElementById("bookingStatus");
const BOOKING_WEBHOOK_URL =
  "https://hook.us2.make.com/ig6c3uljpx3tc0m9m7hcfmg8op9vml2r";
const BOOKING_TIME_ZONE = "Australia/Adelaide";
const adelaideParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: BOOKING_TIME_ZONE,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function zonedParts(date) {
  return Object.fromEntries(
    adelaideParts.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
}

function adelaideDateString(date) {
  const { year, month, day } = zonedParts(date);
  return [year, month, day].map((n, i) => i ? String(n).padStart(2, "0") : n).join("-");
}

function adelaideWallToUtc(day, time) {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wall = Date.UTC(year, month - 1, date, hour, minute);
  let actual = wall;
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(new Date(actual));
    actual += wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  }
  const p = zonedParts(new Date(actual));
  if (p.year !== year || p.month !== month || p.day !== date ||
      p.hour !== hour || p.minute !== minute) return null;
  return new Date(actual);
}

if (bookingForm && bookingStatus) {
  const dayField = bookingForm.elements.date;
  const timeField = bookingForm.elements.time;
  const button = bookingForm.querySelector('button[type="submit"]');

  function setBookingStatus(message, state = "") {
    bookingStatus.textContent = message;
    bookingStatus.dataset.state = state;
  }

  function refreshSlots() {
    const now = new Date();
    const today = adelaideDateString(now);
    const [year, month, day] = today.split("-").map(Number);
    dayField.min = today;
    dayField.max = new Date(Date.UTC(year, month - 1, day + 14))
      .toISOString().slice(0, 10);
    const selected = dayField.value;
    const previous = timeField.value;
    timeField.replaceChildren(new Option("Select a time", ""));
    if (!selected) return;
    const weekday = new Date(selected + "T12:00:00Z").getUTCDay();
    if (selected < today || selected > dayField.max || weekday === 0 || weekday === 6) {
      setBookingStatus("Please select a weekday within the next two weeks.", "error");
      return;
    }
    for (let hour = 10; hour < 16; hour++) {
      for (const minute of [0, 30]) {
        const value = String(hour).padStart(2, "0") + ":" +
          String(minute).padStart(2, "0");
        const start = adelaideWallToUtc(selected, value);
        if (!start || start.getTime() < now.getTime() + 24 * 60 * 60 * 1000) continue;
        const label = new Intl.DateTimeFormat("en-AU", {
          hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
        }).format(new Date(Date.UTC(2026, 0, 1, hour, minute)));
        timeField.add(new Option(label, value));
      }
    }
    if ([...timeField.options].some((option) => option.value === previous))
      timeField.value = previous;
    if (timeField.options.length === 1)
      setBookingStatus("No bookable times on that day. Please choose another weekday.", "error");
    else
      setBookingStatus("Choose a time; we’ll check availability before confirming.");
  }

  dayField.addEventListener("change", refreshSlots);
  refreshSlots();

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = new FormData(bookingForm);
    const date = String(values.get("date") || "");
    const time = String(values.get("time") || "");
    const today = adelaideDateString(new Date());
    const weekday = new Date(date + "T12:00:00Z").getUTCDay();
    const start = adelaideWallToUtc(date, time);
    if (!start || date < today || date > dayField.max ||
        weekday === 0 || weekday === 6 ||
        ![0, 30].includes(Number(time.slice(3))) ||
        Number(time.slice(0, 2)) < 10 || Number(time.slice(0, 2)) > 15 ||
        start.getTime() < Date.now() + 24 * 60 * 60 * 1000) {
      setBookingStatus("Please choose another weekday and time at least 24 hours ahead.", "error");
      return;
    }
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const body = new URLSearchParams({
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      business: String(values.get("business") || "").trim(),
      phone: String(values.get("phone") || "").trim(),
      start: start.toISOString().replace(".000", ""),
      end: end.toISOString().replace(".000", ""),
      notes: String(values.get("notes") || "").trim(),
      website: String(values.get("website") || ""),
    });

    try {
      button.disabled = true;
      button.textContent = "Checking availability…";
      setBookingStatus("Checking the calendar and booking your call…");
      const response = await fetch(BOOKING_WEBHOOK_URL, { method: "POST", body });
      const result = await response.json();
      if (response.status === 409) {
        setBookingStatus("That time has just been taken. Please choose another slot.", "error");
        return;
      }
      if (!response.ok || result.status !== "confirmed")
        throw new Error("Booking was not confirmed");
      const friendlyTime = new Intl.DateTimeFormat("en-AU", {
        timeZone: BOOKING_TIME_ZONE, weekday: "long", day: "numeric",
        month: "long", hour: "numeric", minute: "2-digit", hour12: true,
      }).format(start);
      setBookingStatus(
        "✓ Confirmed for " + friendlyTime +
        " (Adelaide time). Check your email for the calendar invite and Google Meet link.",
        "success"
      );
      bookingForm.reset();
      refreshSlots();
    } catch (error) {
      console.error(error);
      setBookingStatus(
        "We couldn’t confirm the booking. Please try again or request a trial below.",
        "error"
      );
    } finally {
      button.disabled = false;
      button.innerHTML = 'Check time &amp; book call <span>→</span>';
    }
  });
}
