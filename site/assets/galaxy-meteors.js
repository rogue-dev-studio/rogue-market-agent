/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 22:48:26
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 22:48:26
 */
(function () {
  var MAX_METEORS = 5;
  var SPAWN_CHANCE = 0.012;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function createMeteor(w, h) {
    var fromRight = Math.random() > 0.35;
    var len = 36 + Math.random() * 70;
    var speed = 1.1 + Math.random() * 1.6;
    var angle = fromRight ? (0.55 + Math.random() * 0.35) : (0.9 + Math.random() * 0.35);
    return {
      x: fromRight ? w * (0.15 + Math.random() * 0.95) : -40 + Math.random() * w * 0.4,
      y: -30 - Math.random() * h * 0.25,
      vx: Math.cos(angle) * speed * (fromRight ? -1 : 1),
      vy: Math.sin(angle) * speed,
      len: len,
      life: 1,
      decay: 0.002 + Math.random() * 0.0035,
      width: 1 + Math.random() * 1.4,
      hue: Math.random() > 0.7 ? 28 : 210
    };
  }

  function init(canvas) {
    if (!canvas || prefersReducedMotion()) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var meteors = [];
    var raf = 0;
    var running = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawMeteor(m) {
      var tx = m.x - m.vx * (m.len / Math.hypot(m.vx, m.vy));
      var ty = m.y - m.vy * (m.len / Math.hypot(m.vx, m.vy));
      var grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
      if (m.hue === 28) {
        grad.addColorStop(0, "rgba(255, 143, 31, 0)");
        grad.addColorStop(0.55, "rgba(255, 180, 90, " + 0.35 * m.life + ")");
        grad.addColorStop(1, "rgba(255, 245, 230, " + 0.95 * m.life + ")");
      } else {
        grad.addColorStop(0, "rgba(180, 210, 255, 0)");
        grad.addColorStop(0.55, "rgba(200, 220, 255, " + 0.3 * m.life + ")");
        grad.addColorStop(1, "rgba(255, 255, 255, " + 0.9 * m.life + ")");
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      ctx.fillStyle =
        m.hue === 28
          ? "rgba(255, 200, 120, " + 0.85 * m.life + ")"
          : "rgba(255, 255, 255, " + 0.85 * m.life + ")";
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.width * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    function tick() {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      var w = window.innerWidth;
      var h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (meteors.length < MAX_METEORS && Math.random() < SPAWN_CHANCE) {
        meteors.push(createMeteor(w, h));
      }

      for (var i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;
        if (m.life <= 0 || m.y > h + 60 || m.x < -80 || m.x > w + 80) {
          meteors.splice(i, 1);
          continue;
        }
        drawMeteor(m);
      }
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
        return;
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(tick);

    window.addEventListener(
      "pagehide",
      function () {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
      },
      { once: true }
    );
  }

  function boot() {
    init(document.querySelector("[data-galaxy-meteors]"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
