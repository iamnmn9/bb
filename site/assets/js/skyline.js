// Loads the London night scene (drawn by tools/make_london.py) into each
// .city-scene layer. It goes inline rather than in an <img> so the page CSS
// can twinkle the windows, pulse Big Ben's clock and drift the fog.
(function () {
  const scenes = document.querySelectorAll(".city-scene");
  if (!scenes.length) return;
  fetch("assets/img/london.svg")
    .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
    .then((svg) => {
      for (const el of scenes) el.innerHTML = svg;
    })
    .catch(() => {}); // the sky still looks fine without the city
})();
