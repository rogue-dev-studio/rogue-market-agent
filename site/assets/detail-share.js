/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:14:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 12:27:00
 */
(function () {
  function ensureToast() {
    var el = document.querySelector("[data-share-toast]");
    if (el) return el;
    el = document.createElement("div");
    el.className = "share-toast";
    el.setAttribute("data-share-toast", "");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
    return el;
  }

  function showToast(message) {
    var el = ensureToast();
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 1800);
  }

  function copyWithTextarea(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return copyWithTextarea(text);
      });
    }
    return Promise.resolve(copyWithTextarea(text));
  }

  function markButton(btn, ok) {
    var prev = btn.getAttribute("data-share-label") || btn.getAttribute("title") || "Share";
    if (!btn.getAttribute("data-share-label")) {
      btn.setAttribute("data-share-label", prev);
    }
    btn.classList.toggle("is-shared", !!ok);
    btn.setAttribute("title", ok ? "Link copied" : prev);
    btn.setAttribute("aria-label", ok ? "Link copied" : prev);
    clearTimeout(btn._shareTimer);
    btn._shareTimer = setTimeout(function () {
      btn.classList.remove("is-shared");
      btn.setAttribute("title", prev);
      btn.setAttribute("aria-label", prev);
    }, 1600);
  }

  function sharePage(btn) {
    var url = location.href;
    var title = document.title || "Rogue Market Agent";

    function fallbackCopy() {
      return copyText(url).then(function (ok) {
        if (ok) {
          markButton(btn, true);
          showToast("Link copied");
          return;
        }
        window.prompt("Copy this link:", url);
        showToast("Copy the link manually");
      });
    }

    if (navigator.share) {
      navigator
        .share({ title: title, text: title, url: url })
        .then(function () {
          markButton(btn, true);
          showToast("Shared");
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") return;
          fallbackCopy();
        });
      return;
    }

    fallbackCopy();
  }

  document.querySelectorAll("[data-share-page]").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      sharePage(btn);
    });
  });
})();
