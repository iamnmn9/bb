// Stages the landing page: opening sequence, "It's a Boy!" reveal,
// pointer parallax, lit windows in the skyline, and letters that glow
// as Tinker Bell flies past them.
(function () {
  const reduceMotion = window.Tink.reduceMotion;
  const root = document.documentElement;
  const badge = document.getElementById("badge");
  const BOY = ["#ffffff", "#bfe8ff", "#8fd3ff", "#5fb4f0", "#ffe58a"];

  // ---------- Split the title into letters ----------

  const LETTER_START = 0.9;
  const LETTER_GAP = 0.045;
  const letters = [];
  let i = 0;
  for (const word of document.querySelectorAll("#title .letters")) {
    const text = word.textContent;
    word.textContent = "";
    for (const c of text) {
      if (c === " ") {
        word.append(" ");
        continue;
      }
      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = c;
      span.style.setProperty("--d", `${LETTER_START + i++ * LETTER_GAP}s`);
      word.append(span);
      letters.push(span);
    }
  }

  // ---------- Lit windows in the skyline ----------

  const skyPath = document.querySelector(".skyline path").getAttribute("d");
  const windows = document.querySelector(".skyline .windows");
  const SVG = "http://www.w3.org/2000/svg";
  let x = 0, y = 220;
  for (const [, cmd, val] of skyPath.matchAll(/([MVHLZ])\s*([\d.]+)?/g)) {
    if (cmd === "V") y = +val;
    if (cmd !== "H") {
      if (cmd === "M") x = +val;
      continue;
    }
    const x2 = +val;
    // Each flat roof is a building: dot a few windows down its face.
    for (let wx = x + 6; wx < x2 - 8; wx += 12) {
      for (let wy = y + 8; wy < 214; wy += 12) {
        if (Math.random() > 0.22) continue;
        const r = document.createElementNS(SVG, "rect");
        r.setAttribute("x", wx);
        r.setAttribute("y", wy);
        r.setAttribute("width", 4);
        r.setAttribute("height", 5);
        r.setAttribute("class", "win");
        r.style.setProperty("--delay", `${-Math.random() * 9}s`);
        windows.append(r);
      }
    }
    x = x2;
  }

  if (reduceMotion) return;

  // ---------- Pointer parallax ----------

  const layers = document.querySelectorAll(".layer[data-depth]");
  for (const l of layers) l.style.setProperty("--depth", l.dataset.depth);

  const aim = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    aim.x = (e.clientX / window.innerWidth) * 2 - 1;
    aim.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  (function drift(t) {
    // With no pointer (phones), sway gently on its own.
    const idle = { x: Math.sin(t / 5200) * 0.35, y: Math.cos(t / 6100) * 0.25 };
    cur.x += ((aim.x || idle.x) - cur.x) * 0.04;
    cur.y += ((aim.y || idle.y) - cur.y) * 0.04;
    root.style.setProperty("--px", cur.x.toFixed(4));
    root.style.setProperty("--py", cur.y.toFixed(4));
    requestAnimationFrame(drift);
  })(0);

  // ---------- Letters glow as Tink flies by ----------

  let rects = [];
  const measure = () => {
    rects = letters.map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };
  window.addEventListener("resize", measure);
  setInterval(measure, 1000);
  measure();

  window.Tink.onMove((tx, ty) => {
    for (const r of rects) {
      if (Math.abs(r.x - tx) < 34 && Math.abs(r.y - ty) < 50 && !r.el.classList.contains("lit")) {
        r.el.classList.add("lit");
        setTimeout(() => r.el.classList.remove("lit"), 500);
      }
    }
  });

  // ---------- Opening flight ----------

  let revealed = false;
  function revealBadge() {
    if (revealed) return;
    revealed = true;
    badge.classList.add("revealed");
    const b = badge.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    window.Tink.burst(cx, cy, 140, BOY);
    setTimeout(() => window.Tink.burst(cx, cy, 60, BOY), 180);
  }

  function opening() {
    const star = document.querySelector(".second-star").getBoundingClientRect();
    window.Tink.jumpTo(star.left + star.width / 2, star.top + star.height / 2);

    // Trace under each line of the title, then swoop down to the badge.
    const lines = [...document.querySelectorAll("#title .letters")].map((l) => l.getBoundingClientRect());
    const b = badge.getBoundingClientRect();
    const route = [];
    for (const [n, r] of lines.entries()) {
      const left = { x: r.left - 10, y: r.top + r.height * 0.55 };
      const right = { x: r.right + 10, y: r.top + r.height * 0.55 };
      // Alternate direction so the path flows like a ribbon.
      const [a, z] = n % 2 === 0 ? [left, right] : [right, left];
      route.push({ ...a, speed: 1.6 }, { ...z, speed: 1.3 });
    }
    route.push({ x: b.left + b.width / 2, y: b.top + b.height / 2, speed: 1.6, done: revealBadge });
    window.Tink.fly(route);
  }

  // Fonts change the title's size, so wait for them before plotting the route.
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    measure();
    setTimeout(opening, 700);
  });

  // Whatever happens, the news must come out.
  setTimeout(revealBadge, 6000);
})();
