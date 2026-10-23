// Opening: a "tap to enter" screen (browsers only allow the song to start
// after a tap), then Peter and the Darlings swoop across the sky trailing
// pixie dust before the main page appears. The flight itself is a CSS
// animation; this adds the dust and tidies up.
(function () {
  const root = document.documentElement;
  const gate = document.getElementById("gate");
  const flyers = document.getElementById("flyers");

  // ---------- Tap to enter ----------

  if (root.classList.contains("waiting")) {
    gate.addEventListener("click", () => {
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
      root.classList.remove("waiting");
      gate.classList.add("gone");
      setTimeout(() => gate.remove(), 800);
      window.dispatchEvent(new Event("neverland:show"));
    }, { once: true });
    gate.focus({ preventScroll: true });
  } else {
    gate.remove();
  }

  // ---------- Pixie dust behind the flight ----------

  if (!window.Tink.introMs) {
    flyers.remove();
    return;
  }

  let flying = false;
  flyers.addEventListener("animationstart", (e) => {
    if (e.target !== flyers) return;
    flying = true;
    requestAnimationFrame(trail);
  });
  flyers.addEventListener("animationend", (e) => {
    if (e.target !== flyers) return;
    flying = false;
    flyers.remove();
  });

  function trail() {
    if (!flying) return;
    const r = flyers.getBoundingClientRect();
    // Sprinkle from under the group while any of it is on screen.
    if (r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight) {
      for (let i = 0; i < 2; i++) {
        window.Tink.burst(r.left + Math.random() * r.width, r.top + r.height * (0.4 + Math.random() * 0.6), 3);
      }
    }
    requestAnimationFrame(trail);
  }
})();
