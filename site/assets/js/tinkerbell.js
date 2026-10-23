// Tinker Bell flits around the page leaving a pixie dust trail.
// She wanders between random points, visits the "enter" button now and then,
// and chases the visitor's pointer/finger when they move it.
// scene.js can script her flight through window.Tink.
(function () {
  const tink = document.getElementById("tink");
  const canvas = document.getElementById("dust");
  const ctx = canvas.getContext("2d");
  const enter = document.getElementById("enter");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const GOLD = ["#fff8d6", "#ffe58a", "#ffd76a", "#ffffff", "#c9f2ff"];
  const MAX_SPEED = 7;
  const STEER = 0.12;
  const MAX_PARTICLES = 900;

  let w, h, dpr;
  const pos = { x: -100, y: -100 };
  const vel = { x: 0, y: 0 };
  let target = { x: pos.x, y: pos.y };
  let pointer = null;
  let pointerSeenAt = 0;
  let leaving = false;
  let facing = 1;
  let route = []; // scripted waypoints: { x, y, speed, done }
  // Wait off-stage briefly so scene.js can give her an entrance.
  const offStageUntil = performance.now() + 2600;
  const particles = [];
  const listeners = [];

  // Pre-rendered soft glow sprites, one per colour: far nicer than flat dots.
  const sprites = {};
  function sprite(color) {
    if (sprites[color]) return sprites[color];
    const s = document.createElement("canvas");
    s.width = s.height = 32;
    const c = s.getContext("2d");
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.18, color);
    g.addColorStop(0.45, color + "55");
    g.addColorStop(1, color + "00");
    c.fillStyle = g;
    c.fillRect(0, 0, 32, 32);
    return (sprites[color] = s);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function buttonCenter() {
    const r = enter.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
  }

  function pickWaypoint() {
    // Every so often swing by the button to say "click me!"
    if (Math.random() < 0.25) {
      const b = buttonCenter();
      const side = Math.random() < 0.5 ? -1 : 1;
      return { x: b.x + side * (b.r.width / 2 + 30), y: b.y + rand(-30, 10) };
    }
    const m = 50;
    return { x: rand(m, w - m), y: rand(m, h * 0.8) };
  }

  function emit(x, y, n, spread, colors) {
    for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
      const palette = colors || GOLD;
      particles.push({
        x: x + rand(-4, 4),
        y: y + rand(-4, 4),
        vx: rand(-spread, spread) - vel.x * 0.08,
        vy: rand(-spread, spread * 0.5) - vel.y * 0.08,
        life: 0,
        maxLife: rand(45, 100),
        size: rand(3, 9),
        color: palette[(Math.random() * palette.length) | 0],
        sparkle: Math.random() < 0.18,
        spin: rand(0, Math.PI),
        twinkle: rand(0.1, 0.3),
      });
    }
  }

  // A ring of sparkles bursting outward.
  function burst(x, y, n = 80, colors) {
    for (let i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.1, 0.1);
      const s = rand(1.5, 6);
      const palette = colors || GOLD;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0,
        maxLife: rand(50, 110),
        size: rand(4, 11),
        color: palette[(Math.random() * palette.length) | 0],
        sparkle: Math.random() < 0.35,
        spin: rand(0, Math.PI),
        twinkle: rand(0.1, 0.3),
      });
    }
  }

  function drawSparkle(p, alpha) {
    const s = p.size * 0.9;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.spin + p.life * 0.05);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    // Four-pointed star
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? s : s * 0.22;
      const a = (i / 8) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function updateParticles() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.vy += 0.03; // pixie dust falls gently
      p.vx *= 0.97;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      const t = p.life / p.maxLife;
      if (t >= 1) {
        particles.splice(i, 1);
        continue;
      }
      const alpha = (1 - t) * (0.75 + 0.25 * Math.sin(p.life * p.twinkle * 3));
      if (p.sparkle) {
        drawSparkle(p, alpha);
      } else {
        const s = p.size * (1 - t * 0.5);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite(p.color), p.x - s, p.y - s, s * 2, s * 2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function step(t) {
    // Decide where to fly.
    const chasing = pointer && t - pointerSeenAt < 1500 && !leaving && !route.length;
    let speedBoost = 1;
    if (route.length) {
      const leg = route[0];
      target = leg;
      speedBoost = leg.speed || 1.4;
      if (Math.hypot(leg.x - pos.x, leg.y - pos.y) < 26) {
        route.shift();
        if (leg.done) leg.done();
      }
    } else if (chasing) {
      // Hover just beside the pointer instead of sitting under it.
      target = { x: pointer.x - 40 * facing, y: pointer.y - 30 };
    } else if (t < offStageUntil) {
      target = { x: pos.x, y: pos.y };
    } else if (!leaving && Math.hypot(target.x - pos.x, target.y - pos.y) < 40) {
      target = pickWaypoint();
    }
    if (leaving) speedBoost = 1.8;

    // Steer toward the target, with a little bob so she never flies straight.
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = Math.min(MAX_SPEED * speedBoost, dist * 0.08 + 1.5);
    vel.x += ((dx / dist) * speed - vel.x) * STEER;
    vel.y += ((dy / dist) * speed - vel.y) * STEER;
    pos.x += vel.x;
    pos.y += vel.y + Math.sin(t / 180) * 0.9;

    if (Math.abs(vel.x) > 0.4) facing = vel.x > 0 ? 1 : -1;
    const tilt = Math.max(-22, Math.min(22, vel.y * 3)) * facing;
    tink.style.transform =
      `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${facing}) rotate(${tilt}deg)`;

    // Pixie dust from her wings and wand; more of it the faster she flies.
    const fast = Math.hypot(vel.x, vel.y) > 3;
    emit(pos.x - 8 * facing, pos.y + 6, fast ? 3 : 2, 0.6);
    if (Math.random() < 0.6) emit(pos.x + 21 * facing, pos.y - 12, 1, 0.4);

    for (const fn of listeners) fn(pos.x, pos.y);

    updateParticles();
    requestAnimationFrame(step);
  }

  function onPointer(e) {
    pointer = { x: e.clientX, y: e.clientY };
    pointerSeenAt = performance.now();
  }

  enter.addEventListener("click", (e) => {
    if (reduceMotion || leaving) return; // follow the link straight away
    e.preventDefault();
    leaving = true;
    route = [];

    const b = buttonCenter();
    target = { x: b.x, y: b.y };
    burst(b.x, b.y, 160);

    document.body.style.setProperty("--x", `${b.x}px`);
    document.body.style.setProperty("--y", `${b.y}px`);
    setTimeout(() => document.body.classList.add("leaving"), 250);
    setTimeout(() => { window.location.href = enter.href; }, 1100);
  });

  enter.addEventListener("pointerenter", (e) => {
    if (!reduceMotion) burst(e.clientX, e.clientY, 24);
  });

  // Coming back via the browser's back button should show the page again.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      leaving = false;
      document.body.classList.remove("leaving");
    }
  });

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });

  resize();

  window.Tink = {
    reduceMotion,
    // Fly a scripted route; each point may carry its own speed and done().
    fly(points) { route = points.slice(); },
    jumpTo(x, y) { pos.x = target.x = x; pos.y = target.y = y; },
    burst,
    onMove(fn) { listeners.push(fn); },
  };

  if (reduceMotion) {
    // Keep her still, glowing beside the button.
    const place = () => {
      const b = buttonCenter();
      tink.style.transform = `translate3d(${b.x + b.r.width / 2 + 30}px, ${b.y - 20}px, 0)`;
    };
    place();
    window.addEventListener("resize", place);
    return;
  }

  requestAnimationFrame(step);
})();
