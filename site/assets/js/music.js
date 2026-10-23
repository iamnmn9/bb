// Background song, shared by both pages. Browsers only allow sound after
// the visitor taps or clicks, so it starts on their first touch and then
// carries on from the same spot on the next page.
(function () {
  const audio = document.getElementById("music");
  const VOLUME = 0.45;

  try { audio.currentTime = +sessionStorage.getItem("musicTime") || 0; } catch (e) {}

  // Fade in gently; iPhones ignore volume changes, so give up after ~1.5s.
  function fadeIn() {
    let steps = 30;
    const fade = setInterval(() => {
      audio.volume = Math.min(VOLUME, audio.volume + 0.03);
      if (audio.volume >= VOLUME || --steps === 0) clearInterval(fade);
    }, 50);
  }

  // Touch screens only allow sound once the finger lifts, mice on press.
  const GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"];

  function play() {
    if (!audio.paused) return;
    audio.volume = 0;
    audio.play().then(() => {
      fadeIn();
      for (const g of GESTURES) removeEventListener(g, play);
    }, () => {});
  }

  // Keep trying on every touch until the browser lets it play.
  for (const g of GESTURES) addEventListener(g, play);

  // Remember where we were so the next page picks up the tune.
  addEventListener("pagehide", () => {
    try { sessionStorage.setItem("musicTime", audio.currentTime); } catch (e) {}
  });

  // Some browsers allow this straight away once the visitor has tapped before.
  play();
})();
