/* ============================================================
   PIDPAL AGENCY — landing JS
   Embers canvas + burn-on-click cards + matchbox + brief form
   ============================================================ */

// -----------------------------------------------------------
// 1. EMBERS — floating sparks across full viewport, fixed bg
// -----------------------------------------------------------
(function embersCanvas() {
  const canvas = document.getElementById("embers");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const COUNT = 60;
  const embers = Array.from({ length: COUNT }, () => spawn(true));

  function spawn(initial) {
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.8 + 0.4),
      r: Math.random() * 1.8 + 0.6,
      life: 0,
      maxLife: Math.random() * 320 + 220,
      hue: 18 + Math.random() * 22, // 18-40 = orange/amber
      alpha: 0
    };
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.x += e.vx + Math.sin(e.life * 0.03) * 0.4;
      e.y += e.vy;
      e.life++;
      // fade in then out
      const t = e.life / e.maxLife;
      e.alpha = t < 0.2 ? t * 5 : 1 - (t - 0.2) / 0.8;
      if (e.alpha < 0) e.alpha = 0;

      // draw glow
      const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
      grd.addColorStop(0, `hsla(${e.hue}, 100%, 70%, ${0.9 * e.alpha})`);
      grd.addColorStop(0.4, `hsla(${e.hue}, 100%, 55%, ${0.35 * e.alpha})`);
      grd.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
      ctx.fill();
      // bright core
      ctx.fillStyle = `hsla(${e.hue + 20}, 100%, 92%, ${e.alpha})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();

      if (e.life > e.maxLife || e.y < -20) embers[i] = spawn(false);
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// -----------------------------------------------------------
// 2. BURN-ON-CLICK CARDS
// -----------------------------------------------------------
(function cardBurn() {
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.addEventListener("click", (ev) => {
      // ignore clicks on links/buttons inside the back face
      if (ev.target.closest(".card-link, .card-back a")) return;

      if (card.classList.contains("burning")) {
        // click on "↺ скласти назад" pseudo-element area? we approximate via top-right click
        const rect = card.getBoundingClientRect();
        const offX = ev.clientX - rect.left;
        const offY = ev.clientY - rect.top;
        if (offY < 0 || (offY < 30 && offX > rect.width * 0.55)) {
          card.classList.remove("burning");
          return;
        }
        // any inner click on already-burned card: do nothing
        return;
      }

      card.classList.add("burning");
      spawnBurnEmbers(card);
    });
  });

  // spawn small burst of canvas-particles from the card location
  function spawnBurnEmbers(card) {
    const r = card.getBoundingClientRect();
    const burst = [];
    for (let i = 0; i < 35; i++) {
      burst.push({
        x: r.left + Math.random() * r.width,
        y: r.top + r.height * (0.85 + Math.random() * 0.15),
        vx: (Math.random() - 0.5) * 2.2,
        vy: -(Math.random() * 3 + 1.5),
        r: Math.random() * 2.4 + 0.8,
        life: 0,
        maxLife: 90 + Math.random() * 60,
        hue: 14 + Math.random() * 26
      });
    }

    // overlay canvas for the burst (uses same ctx as embers? no — separate transient layer)
    const overlay = document.createElement("canvas");
    overlay.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:50";
    overlay.width = window.innerWidth * 2;
    overlay.height = window.innerHeight * 2;
    overlay.style.width = window.innerWidth + "px";
    overlay.style.height = window.innerHeight + "px";
    document.body.appendChild(overlay);
    const oc = overlay.getContext("2d");
    oc.setTransform(2, 0, 0, 2, 0, 0);

    function step() {
      oc.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = 0;
      for (const e of burst) {
        if (e.life > e.maxLife) continue;
        alive++;
        e.x += e.vx;
        e.y += e.vy;
        e.vy += 0.025;
        e.life++;
        const t = e.life / e.maxLife;
        const a = t < 0.15 ? t * 6 : 1 - (t - 0.15) / 0.85;
        const grd = oc.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 7);
        grd.addColorStop(0, `hsla(${e.hue}, 100%, 70%, ${0.95 * a})`);
        grd.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
        oc.fillStyle = grd;
        oc.beginPath();
        oc.arc(e.x, e.y, e.r * 7, 0, Math.PI * 2);
        oc.fill();
        oc.fillStyle = `hsla(${e.hue + 20}, 100%, 92%, ${a})`;
        oc.beginPath();
        oc.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        oc.fill();
      }
      if (alive > 0) requestAnimationFrame(step);
      else overlay.remove();
    }
    step();
  }
})();

// -----------------------------------------------------------
// 3. MATCHBOX — open/close + brief form
// -----------------------------------------------------------
(function matchbox() {
  const box = document.getElementById("matchbox");
  if (!box) return;

  const lid = box.querySelector(".matchbox-lid");
  const form = box.querySelector("#briefForm");
  const success = box.querySelector(".brief-success");
  const output = box.querySelector(".brief-output");

  lid.addEventListener("click", (ev) => {
    ev.stopPropagation();
    box.classList.toggle("is-open");
    box.setAttribute("aria-expanded", box.classList.contains("is-open"));
  });

  box.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      if (ev.target === box || ev.target === lid) {
        ev.preventDefault();
        lid.click();
      }
    }
  });

  if (form) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const text =
        `🔥 Новий бриф для PIDPAL AGENCY\n\n` +
        `Ім'я: ${data.name}\n` +
        `Бренд: ${data.brand}\n` +
        `Бриф: ${data.brief}\n` +
        `Контакт: ${data.contact}`;
      output.textContent = text;
      form.hidden = true;
      success.hidden = false;
      // fire burst from submit button
      const btn = form.querySelector(".btn-submit");
      if (btn) {
        const r = btn.getBoundingClientRect();
        burstAt(r.left + r.width / 2, r.top + r.height / 2, 50);
      }
    });

    const copyBtn = success.querySelector(".copy-btn");
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(output.textContent);
        copyBtn.textContent = "✓ скопійовано";
        setTimeout(() => (copyBtn.textContent = "📋 скопіювати"), 1800);
      } catch (e) {
        copyBtn.textContent = "не вдалось — виділи вручну";
      }
    });
  }
})();

// helper used by form submit
function burstAt(x, y, n = 30) {
  const overlay = document.createElement("canvas");
  overlay.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60";
  overlay.width = window.innerWidth * 2;
  overlay.height = window.innerHeight * 2;
  overlay.style.width = window.innerWidth + "px";
  overlay.style.height = window.innerHeight + "px";
  document.body.appendChild(overlay);
  const oc = overlay.getContext("2d");
  oc.setTransform(2, 0, 0, 2, 0, 0);

  const burst = Array.from({ length: n }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 6,
    vy: -(Math.random() * 5 + 2),
    r: Math.random() * 2.4 + 0.6,
    life: 0,
    maxLife: 80 + Math.random() * 80,
    hue: 14 + Math.random() * 30
  }));

  function step() {
    oc.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const e of burst) {
      if (e.life > e.maxLife) continue;
      alive++;
      e.x += e.vx; e.y += e.vy; e.vy += 0.08; e.life++;
      const t = e.life / e.maxLife;
      const a = t < 0.1 ? t * 10 : 1 - (t - 0.1) / 0.9;
      const grd = oc.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 8);
      grd.addColorStop(0, `hsla(${e.hue}, 100%, 70%, ${a})`);
      grd.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
      oc.fillStyle = grd;
      oc.beginPath(); oc.arc(e.x, e.y, e.r * 8, 0, Math.PI * 2); oc.fill();
      oc.fillStyle = `hsla(${e.hue + 20}, 100%, 92%, ${a})`;
      oc.beginPath(); oc.arc(e.x, e.y, e.r, 0, Math.PI * 2); oc.fill();
    }
    if (alive > 0) requestAnimationFrame(step);
    else overlay.remove();
  }
  step();
}

// -----------------------------------------------------------
// 4. MATCHSTICK CURSOR + spark trail
// -----------------------------------------------------------
(function matchCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;
  // Skip on touch devices
  if (window.matchMedia("(hover: none)").matches) {
    cursor.style.display = "none";
    return;
  }

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let lastSparkAt = 0;
  let lastSparkPos = { x: mx, y: my };

  const sparkCanvas = document.createElement("canvas");
  sparkCanvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998";
  document.body.appendChild(sparkCanvas);
  const sctx = sparkCanvas.getContext("2d");
  let SW = 0, SH = 0;
  function resizeSpark() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    SW = window.innerWidth; SH = window.innerHeight;
    sparkCanvas.width = SW * dpr; sparkCanvas.height = SH * dpr;
    sparkCanvas.style.width = SW + "px"; sparkCanvas.style.height = SH + "px";
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeSpark();
  window.addEventListener("resize", resizeSpark);

  const sparks = [];

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    // emit sparks proportional to mouse speed
    const dx = mx - lastSparkPos.x;
    const dy = my - lastSparkPos.y;
    const dist = Math.hypot(dx, dy);
    const now = performance.now();
    if (dist > 8 && now - lastSparkAt > 24) {
      const count = Math.min(5, Math.floor(dist / 18) + 1);
      for (let i = 0; i < count; i++) {
        // sparks emit from the FLAME TIP — which is above-left of cursor center
        // The cursor svg is rotated -22°; flame tip is roughly at (mx - 6, my - 6) in screen space
        const angle = Math.atan2(dy, dx);
        sparks.push({
          x: mx - Math.cos(angle) * 14 + (Math.random() - 0.5) * 6,
          y: my - Math.sin(angle) * 14 + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.6 - dx * 0.1,
          vy: -(Math.random() * 1.4 + 0.6) - dy * 0.08,
          r: Math.random() * 1.4 + 0.5,
          life: 0,
          maxLife: 36 + Math.random() * 30,
          hue: 14 + Math.random() * 32
        });
      }
      lastSparkAt = now;
      lastSparkPos = { x: mx, y: my };
    }
  });

  // Hide on leaving page
  document.addEventListener("mouseleave", () => cursor.style.opacity = "0");
  document.addEventListener("mouseenter", () => cursor.style.opacity = "1");

  // Click → big burst at click point
  window.addEventListener("mousedown", (e) => {
    for (let i = 0; i < 22; i++) {
      sparks.push({
        x: e.clientX + (Math.random() - 0.5) * 8,
        y: e.clientY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 5,
        vy: -(Math.random() * 4 + 1),
        r: Math.random() * 2 + 0.6,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        hue: 14 + Math.random() * 30
      });
    }
  });

  // Hot state on interactive elements
  const hotSelector = 'a, button, .card, .matchbox-lid, .polaroid, input, textarea, [role="button"]';
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hotSelector)) cursor.classList.add("is-hot");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hotSelector)) cursor.classList.remove("is-hot");
  });

  function tick() {
    // smooth cursor follow (slight lag for liveness)
    cx += (mx - cx) * 0.45;
    cy += (my - cy) * 0.45;
    // tilt slightly toward movement direction
    const vx = mx - cx;
    const baseTilt = -22 + Math.max(-15, Math.min(15, vx * 0.5));
    cursor.style.transform = `translate(${cx}px, ${cy}px) rotate(${baseTilt}deg)`;

    // render sparks
    sctx.clearRect(0, 0, SW, SH);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.035;
      s.life++;
      if (s.life > s.maxLife) { sparks.splice(i, 1); continue; }
      const t = s.life / s.maxLife;
      const a = t < 0.15 ? t * 6.5 : 1 - (t - 0.15) / 0.85;

      const grd = sctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
      grd.addColorStop(0, `hsla(${s.hue}, 100%, 70%, ${0.9 * a})`);
      grd.addColorStop(1, `hsla(${s.hue}, 100%, 50%, 0)`);
      sctx.fillStyle = grd;
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2);
      sctx.fill();

      sctx.fillStyle = `hsla(${s.hue + 18}, 100%, 92%, ${a})`;
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// -----------------------------------------------------------
// 5. SCROLL-TRIGGERED REVEALS
// -----------------------------------------------------------
window.addEventListener("load", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // manifesto paper - tilt-in
  gsap.from(".paper", {
    scrollTrigger: { trigger: ".manifesto", start: "top 70%" },
    y: 60, opacity: 0, rotate: -6, duration: 1.1, ease: "power3.out"
  });
  // cards stagger
  gsap.from(".card", {
    scrollTrigger: { trigger: ".pinboard", start: "top 75%" },
    y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out"
  });
  // polaroids
  gsap.from(".polaroid", {
    scrollTrigger: { trigger: ".case-strip", start: "top 80%" },
    y: 30, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)"
  });
  // matchbox bounce in
  gsap.from(".matchbox", {
    scrollTrigger: { trigger: ".matchbox", start: "top 80%" },
    y: 50, opacity: 0, duration: 0.9, ease: "back.out(1.3)"
  });
});
