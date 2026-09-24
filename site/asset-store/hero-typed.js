/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 22:35:47
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 22:41:00
 */
(function () {
  var SLIDES = [
    {
      title: "MCP Servers",
      lede: "Connect tools and apps to your AI agent — ready for Cursor, Claude Code, and other hosts."
    },
    {
      title: "Agent Skills",
      lede: "Installable agent playbooks and workflows for Cursor, Claude Code, OpenCode, and more."
    },
    {
      title: "Assets",
      lede: "Motion packs, 3D models, and stock downloads from studio storefronts."
    }
  ];
  var TYPE_MS = 72;
  var DELETE_MS = 48;
  var HOLD_MS = 3200;
  var GAP_MS = 550;
  var MIN_PX = 18;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function longestTitle() {
    var best = SLIDES[0].title;
    for (var i = 1; i < SLIDES.length; i++) {
      if (SLIDES[i].title.length > best.length) best = SLIDES[i].title;
    }
    return best;
  }

  function fitTypedLine(line) {
    if (!line) return;
    var textEl = line.querySelector("[data-hero-typed]");
    var title = line.closest(".hero-title");
    if (!textEl || !title) return;

    var base = window.getComputedStyle(title).fontSize;
    var basePx = parseFloat(base) || 34;
    line.style.fontSize = basePx + "px";

    var probe = document.createElement("span");
    probe.textContent = longestTitle();
    probe.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;" +
      "font:inherit;letter-spacing:inherit;";
    line.appendChild(probe);

    var available = line.clientWidth;
    var caret = line.querySelector(".hero-typed-caret");
    var caretW = caret ? caret.offsetWidth + 4 : 8;
    var needed = probe.offsetWidth + caretW;
    line.removeChild(probe);

    if (available <= 0 || needed <= available) return;

    var next = Math.max(MIN_PX, Math.floor(basePx * (available / needed)));
    line.style.fontSize = next + "px";
  }

  function setLede(ledeEl, text) {
    if (!ledeEl) return;
    ledeEl.classList.remove("is-swap");
    void ledeEl.offsetWidth;
    ledeEl.textContent = text;
    ledeEl.classList.add("is-swap");
  }

  function runTyped(el, ledeEl) {
    if (!el) return;
    var line = el.closest(".hero-title-typed") || el.parentElement;
    var index = 0;
    var timer = 0;

    function setText(value) {
      el.textContent = value;
      fitTypedLine(line);
    }

    function wait(ms) {
      return new Promise(function (resolve) {
        timer = window.setTimeout(resolve, ms);
      });
    }

    function typePhrase(phrase) {
      return new Promise(function (resolve) {
        var i = 0;
        function step() {
          i += 1;
          setText(phrase.slice(0, i));
          if (i >= phrase.length) {
            resolve();
            return;
          }
          timer = window.setTimeout(step, TYPE_MS);
        }
        step();
      });
    }

    function deletePhrase() {
      return new Promise(function (resolve) {
        function step() {
          var current = el.textContent || "";
          if (!current.length) {
            resolve();
            return;
          }
          setText(current.slice(0, -1));
          timer = window.setTimeout(step, DELETE_MS);
        }
        step();
      });
    }

    async function loop() {
      while (true) {
        var slide = SLIDES[index % SLIDES.length];
        setLede(ledeEl, slide.lede);
        await typePhrase(slide.title);
        await wait(HOLD_MS);
        await deletePhrase();
        await wait(GAP_MS);
        index += 1;
      }
    }

    fitTypedLine(line);
    window.addEventListener("resize", function () {
      fitTypedLine(line);
    });

    setLede(ledeEl, SLIDES[0].lede);

    if (prefersReducedMotion()) {
      setText(SLIDES[0].title);
      return;
    }

    loop();

    window.addEventListener(
      "pagehide",
      function () {
        window.clearTimeout(timer);
      },
      { once: true }
    );
  }

  function init() {
    runTyped(
      document.querySelector("[data-hero-typed]"),
      document.querySelector("[data-hero-lede]")
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
