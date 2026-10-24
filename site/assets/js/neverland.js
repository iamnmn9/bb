// The inside page: countdown to the shower, and cards that rise into
// view as you scroll down to them.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Countdown ----------

  const countdown = document.getElementById("countdown");
  const start = Date.parse(countdown.dataset.start);
  const units = countdown.querySelector(".countdown-units");
  const note = countdown.querySelector(".countdown-note");
  const cells = {};
  for (const el of countdown.querySelectorAll("[data-unit]")) cells[el.dataset.unit] = el;

  function tick() {
    const left = start - Date.now();
    if (left <= 0) {
      units.hidden = true;
      note.textContent = "The adventure has begun!";
      return;
    }
    const s = Math.floor(left / 1000);
    cells.days.textContent = Math.floor(s / 86400);
    cells.hours.textContent = Math.floor((s % 86400) / 3600);
    cells.minutes.textContent = Math.floor((s % 3600) / 60);
    cells.seconds.textContent = s % 60;
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }

  // With no date set yet, the placeholder note stays put.
  if (!Number.isNaN(start)) {
    units.hidden = false;
    note.textContent = "";
    tick();
  }

  // ---------- RSVP, sent to Formspree without leaving the page ----------

  const form = document.getElementById("rsvp-form");
  const status = form.querySelector(".form-status");
  const guestsField = document.getElementById("guests-field");
  const thanks = document.getElementById("rsvp-thanks");

  // No guest count needed when someone can't come.
  form.addEventListener("change", () => {
    const no = form.elements.attending.value === "No";
    guestsField.hidden = no;
    form.elements.guests.disabled = no;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    status.classList.remove("error");
    status.textContent = "Sending your RSVP…";

    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        const name = form.elements.name.value.trim().split(" ")[0];
        thanks.querySelector(".thanks-text").textContent = form.elements.attending.value === "Yes"
          ? `We can't wait to celebrate with you, ${name}. See you in Neverland!`
          : `We'll miss you, ${name}! Thank you for letting us know.`;
        form.hidden = true;
        thanks.hidden = false;
        thanks.focus();
        if (window.Tink && !reduceMotion) {
          const r = thanks.getBoundingClientRect();
          window.Tink.burst(r.left + r.width / 2, r.top + r.height / 2, 120);
        }
      })
      .catch(() => {
        status.classList.add("error");
        status.textContent = "Hmm, that didn't send. Please check your connection and try again.";
        button.disabled = false;
      });
  });

  // ---------- Cards rise in on scroll ----------

  const cards = document.querySelectorAll(".rise-in");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    for (const c of cards) c.classList.add("in");
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const c of cards) io.observe(c);
})();
