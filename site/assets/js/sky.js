// Twinkling starfield and the odd shooting star.
(function () {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let golds = [];
  let shooting = [];
  let nextShootAt = 2500;
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // A little bigger than the window so parallax never shows an edge.
    w = window.innerWidth + 80;
    h = window.innerHeight + 80;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.position = "fixed";
    canvas.style.left = canvas.style.top = "-40px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round((w * h) / 4000);
    stars = Array.from({ length: count }, () => {
      const big = Math.random() < 0.06;
      return {
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: big ? Math.random() * 0.8 + 1.4 : Math.random() * 1.1 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.5 + 0.4,
        tint: Math.random() < 0.15 ? "#cfe9ff" : Math.random() < 0.1 ? "#fff1c4" : "#ffffff",
        big,
      };
    });

    // A few big golden stars with a soft glow, like a storybook sky.
    golds = Array.from({ length: Math.round(Math.min(16, Math.max(7, w / 90))) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      r: Math.random() * 2 + 2.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.3,
    }));
  }

  function drawGold(s, t) {
    const tw = reduceMotion ? 0.9 : 0.7 + 0.3 * Math.sin(t / 1000 * s.speed + s.phase);
    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
    glow.addColorStop(0, `rgba(255, 244, 200, ${tw})`);
    glow.addColorStop(0.25, `rgba(255, 214, 110, ${tw * 0.55})`);
    glow.addColorStop(1, "rgba(255, 214, 110, 0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
    ctx.fill();
    // Four-pointed sparkle in the middle
    const len = s.r * 2.4;
    ctx.globalAlpha = tw;
    ctx.fillStyle = "#fff3c4";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? len : len * 0.25;
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(s.x + Math.cos(a) * rad, s.y + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function spawnShootingStar() {
    const fromLeft = Math.random() < 0.5;
    const angle = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.3;
    const speed = 14 + Math.random() * 8;
    shooting.push({
      x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
      y: Math.random() * h * 0.35,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 45 + Math.random() * 20,
    });
  }

  function drawStar(s, t) {
    const twinkle = reduceMotion ? 0.8 : 0.5 + 0.5 * Math.sin(t / 1000 * s.speed + s.phase);
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = s.tint;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    if (s.big) {
      // Soft cross-shaped glint on the brightest stars.
      const len = s.r * 5 * twinkle;
      ctx.globalAlpha = twinkle * 0.6;
      ctx.strokeStyle = s.tint;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(s.x - len, s.y);
      ctx.lineTo(s.x + len, s.y);
      ctx.moveTo(s.x, s.y - len);
      ctx.lineTo(s.x, s.y + len);
      ctx.stroke();
    }
  }

  function drawShootingStars(t) {
    if (t > nextShootAt) {
      spawnShootingStar();
      nextShootAt = t + 4000 + Math.random() * 7000;
    }
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      const fade = Math.sin((s.life / s.maxLife) * Math.PI);
      if (s.life >= s.maxLife) {
        shooting.splice(i, 1);
        continue;
      }
      const tailX = s.x - s.vx * 9;
      const tailY = s.y - s.vy * 9;
      const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      g.addColorStop(0, `rgba(255,255,255,${fade})`);
      g.addColorStop(0.3, `rgba(200,230,255,${fade * 0.5})`);
      g.addColorStop(1, "rgba(200,230,255,0)");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) drawStar(s, t);
    for (const s of golds) drawGold(s, t);
    if (!reduceMotion) drawShootingStars(t);
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw(0);
  });
  resize();
  requestAnimationFrame(draw);
})();
