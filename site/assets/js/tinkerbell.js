// Tinker Bell flits around the page leaving a pixie dust trail.
// She wanders between random points, visits the "enter" button now and then,
// and chases the visitor's pointer/finger when they move it.
(function () {
  const tink = document.getElementById("tink");
  const canvas = document.getElementById("dust");
  const ctx = canvas.getContext("2d");
  const enter = document.getElementById("enter");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLORS = ["#fff8d6", "#ffe58a", "#ffd76a", "#fff", "#c9f2ff"];
  const MAX_SPEED = 7;
  const STEER = 0.12;

  let w, h, dpr;
  const pos = { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 };
  const vel = { x: 0, y: 0 };
  let target = { x: pos.x, y: pos.y };
  let pointer = null;
  let pointerSeenAt = 0;
  let leaving = false;
  let facing = 1;
  const particles = [];

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

  function emit(x, y, n, spread) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: x + rand(-4, 4),
        y: y + rand(-4, 4),
        vx: rand(-spread, spread) - vel.x * 0.08,
        vy: rand(-spread, spread * 0.5) - vel.y * 0.08,
        life: 0,
        maxLife: rand(40, 90),
        size: rand(0.8, 2.6),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        sparkle: Math.random() < 0.2,
      });
    }
  }

  function drawSparkle(p, alpha) {
    const s = p.size * 2.5;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - s, p.y);
    ctx.lineTo(p.x + s, p.y);
    ctx.moveTo(p.x, p.y - s);
    ctx.lineTo(p.x, p.y + s);
    ctx.stroke();
  }

  function step(t) {
    // Decide where to fly.
    const chasing = pointer && t - pointerSeenAt < 1500 && !leaving;
    if (chasing) {
      // Hover just beside the pointer instead of sitting under it.
      target = { x: pointer.x - 40 * facing, y: pointer.y - 30 };
    } else if (!leaving && Math.hypot(target.x - pos.x, target.y - pos.y) < 40) {
      target = pickWaypoint();
    }

    // Steer toward the target, with a little bob so she never flies straight.
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = Math.min(MAX_SPEED * (leaving ? 1.8 : 1), dist * 0.08 + 1);
    vel.x += ((dx / dist) * speed - vel.x) * STEER;
    vel.y += ((dy / dist) * speed - vel.y) * STEER;
    pos.x += vel.x;
    pos.y += vel.y + Math.sin(t / 180) * 0.9;

    if (Math.abs(vel.x) > 0.4) facing = vel.x > 0 ? 1 : -1;
    const tilt = Math.max(-20, Math.min(20, vel.y * 3)) * facing;
    tink.style.transform =
      `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${facing}) rotate(${tilt}deg)`;

    // Pixie dust from her wand and wings.
    emit(pos.x - 8 * facing, pos.y + 6, 2, 0.6);
    if (Math.random() < 0.5) emit(pos.x + 17 * facing, pos.y - 9, 1, 0.4);

    // Update and draw dust.
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.vy += 0.03; // pixie dust falls gently
      p.vx *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      const alpha = 1 - p.life / p.maxLife;
      if (alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      if (p.sparkle) {
        drawSparkle(p, alpha);
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

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

    const b = buttonCenter();
    target = { x: b.x, y: b.y };
    emit(b.x, b.y, 120, 4);

    document.body.style.setProperty("--x", `${b.x}px`);
    document.body.style.setProperty("--y", `${b.y}px`);
    setTimeout(() => document.body.classList.add("leaving"), 250);
    setTimeout(() => { window.location.href = enter.href; }, 1100);
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

  target = pickWaypoint();
  requestAnimationFrame(step);
})();
