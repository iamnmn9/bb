// The inside page: countdown to the shower, the RSVP form, and the palace
// whose three doors each open one room (invitation, registry, RSVP).
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

  // ---------- The palace: one room at a time ----------
  // The room lives in the URL hash (#invitation, #registry, #rsvp), so the
  // back button returns to the palace and a room can be linked directly.

  const hero = document.getElementById("palace-view");
  const palace = document.getElementById("palace");
  const rooms = [...document.querySelectorAll(".sections > section")];
  let current = null;

  function show() {
    const room = rooms.find((r) => "#" + r.id === location.hash) || null;
    hero.hidden = !!room;
    for (const r of rooms) r.hidden = r !== room;
    document.body.dataset.view = room ? "room" : "palace";
    palace.classList.remove("zoom");
    delete palace.dataset.opening;

    if (room) {
      window.scrollTo({ top: 0, behavior: "instant" });
      // Replay the card's entrance each time its door opens.
      room.classList.remove("in");
      void room.offsetWidth;
      room.classList.add("in");
      room.querySelector("h2").focus({ preventScroll: true });
    } else if (current) {
      // Coming back out of a room: land in front of the palace doors.
      palace.scrollIntoView({ block: "center", behavior: "instant" });
    }
    current = room;
  }

  // Opening a door: it swings open, pixie dust bursts out, and we zoom in.
  for (const link of palace.querySelectorAll(".door-link")) {
    link.addEventListener("click", (e) => {
      if (reduceMotion) return; // just go straight in
      e.preventDefault();
      if (palace.dataset.opening) return;
      const room = link.hash.slice(1);
      const r = link.getBoundingClientRect();
      const p = palace.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height * 0.35;
      palace.dataset.opening = room;
      palace.style.transformOrigin = `${x - p.left}px ${y - p.top}px`;
      if (window.Tink) window.Tink.burst(x, y, 90);
      setTimeout(() => palace.classList.add("zoom"), 650);
      setTimeout(() => { location.hash = room; }, 1200);
    });
  }

  window.addEventListener("hashchange", show);
  show();

  // ---------- Fireworks over the palace now and then ----------

  const FIREWORKS = [
    ["#fff3c4", "#ffd76a", "#ffffff"],
    ["#bfe8ff", "#8fd3ff", "#ffffff"],
    ["#d6fff4", "#8fe8d0", "#ffffff"],
  ];
  if (window.Tink && !reduceMotion) {
    (function fire() {
      setTimeout(fire, 2500 + Math.random() * 3000);
      if (hero.hidden || document.hidden || palace.dataset.opening) return;
      const r = palace.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const x = r.left + r.width * (0.15 + Math.random() * 0.7);
      const y = r.top + r.height * (0.02 + Math.random() * 0.2);
      window.Tink.burst(x, y, 70, FIREWORKS[(Math.random() * FIREWORKS.length) | 0]);
    })();
  }
})();
