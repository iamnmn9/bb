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
