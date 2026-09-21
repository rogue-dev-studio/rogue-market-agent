/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:14:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-21 12:45:00
 */
(function () {
  var openMenu = null;

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

  function sharePayload(btn) {
    var url = (btn && btn.getAttribute("data-share-url")) || location.href;
    var title =
      (btn && btn.getAttribute("data-share-title")) ||
      document.title ||
      "Rogue Market Agent";
    var text =
      (btn && btn.getAttribute("data-share-text")) ||
      title;
    return { url: url, title: title, text: text };
  }

  function closeMenu() {
    if (!openMenu) return;
    openMenu.classList.remove("is-open");
    openMenu.setAttribute("hidden", "");
    var btn = openMenu._shareBtn;
    if (btn) btn.setAttribute("aria-expanded", "false");
    openMenu = null;
  }

  function socialTargets(payload) {
    var u = encodeURIComponent(payload.url);
    var t = encodeURIComponent(payload.title);
    var tx = encodeURIComponent(payload.text + "\n" + payload.url);
    return [
      {
        id: "x",
        label: "X",
        href: "https://twitter.com/intent/tweet?text=" + t + "&url=" + u,
        icon: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L5.1 22H1.84l8.03-9.17L1.5 2h6.75l4.66 6.2L18.244 2zm-1.16 18h1.83L7.03 3.94H5.07L17.084 20z"/></svg>'
      },
      {
        id: "facebook",
        label: "Facebook",
        href: "https://www.facebook.com/sharer/sharer.php?u=" + u,
        icon: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M13.5 22v-8.1h2.72l.41-3.17H13.5V8.7c0-.92.25-1.54 1.57-1.54H16.8V4.32C16.4 4.26 15.1 4.15 13.58 4.15 10.4 4.15 8.25 6.07 8.25 9.3v2.43H5.6v3.17h2.65V22h5.25z"/></svg>'
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/sharing/share-offsite/?url=" + u,
        icon: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M6.5 9.5H3.7V20h2.8V9.5zM5.1 4A1.63 1.63 0 103 5.62 1.62 1.62 0 005.1 4zM20.3 20h-2.8v-5.6c0-1.55-.56-2.61-1.96-2.61a2.12 2.12 0 00-2 1.42 2.6 2.6 0 00-.13.94V20H10.6s.04-8.8 0-9.7h2.8v1.37A3.49 3.49 0 0116.5 9.2c2.3 0 4 1.5 4 4.72V20z"/></svg>'
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        href: "https://wa.me/?text=" + tx,
        icon: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M12.04 3C7.35 3 3.55 6.72 3.55 11.3c0 1.55.44 3.05 1.27 4.37L3.5 21l5.5-1.43a8.5 8.5 0 003.98.98h.01c4.69 0 8.49-3.72 8.49-8.3C21.48 6.72 17.73 3 12.04 3zm4.85 11.84c-.2.56-1.16 1.03-1.62 1.1-.42.06-.95.09-1.53-.1-.35-.11-.8-.26-1.38-.51-2.43-1.05-4.01-3.5-4.13-3.66-.12-.16-1-1.32-1-2.52s.63-1.79.86-2.03c.22-.24.49-.3.65-.3h.47c.15 0 .35-.06.55.42.2.5.69 1.72.75 1.84.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.24-.1.47.14.23.63 1.03 1.35 1.67.93.82 1.71 1.08 1.95 1.2.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.14 1.14z"/></svg>'
      },
      {
        id: "telegram",
        label: "Telegram",
        href: "https://t.me/share/url?url=" + u + "&text=" + t,
        icon: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M21.5 4.3L2.9 11.4c-1.27.5-1.25 1.2-.23 1.52l4.78 1.49 1.84 5.63c.23.65.12.91.83.91.54 0 .78-.25 1.08-.54l2.6-2.53 5.4 4c.99.55 1.7.26 1.95-.92l3.53-16.63c.36-1.44-.55-2.1-1.58-1.64z"/></svg>'
      }
    ];
  }

  function ensureMenu(btn) {
    var wrap = btn.closest(".detail-actions") || btn.parentElement;
    if (!wrap) return null;
    wrap.classList.add("share-anchor");

    var menu = wrap.querySelector("[data-share-menu]");
    if (menu) {
      menu._shareBtn = btn;
      return menu;
    }

    menu = document.createElement("div");
    menu.className = "share-menu";
    menu.setAttribute("data-share-menu", "");
    menu.setAttribute("role", "menu");
    menu.setAttribute("hidden", "");
    menu._shareBtn = btn;

    var payload = sharePayload(btn);
    var items = socialTargets(payload);
    var html = items
      .map(function (item) {
        return (
          '<a class="share-menu-item" role="menuitem" data-share-social="' +
          item.id +
          '" href="' +
          item.href +
          '" target="_blank" rel="noopener">' +
          item.icon +
          "<span>" +
          item.label +
          "</span></a>"
        );
      })
      .join("");

    html +=
      '<button type="button" class="share-menu-item" role="menuitem" data-share-copy>' +
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 012-2h10"/></svg>' +
      "<span>Copy link</span></button>";

    if (navigator.share) {
      html +=
        '<button type="button" class="share-menu-item" role="menuitem" data-share-native>' +
        '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.4 13.2l7.2 4.1M15.6 6.7l-7.2 4.1"/></svg>' +
        "<span>More…</span></button>";
    }

    menu.innerHTML = html;
    wrap.appendChild(menu);

    menu.addEventListener("click", function (event) {
      var copyBtn = event.target.closest("[data-share-copy]");
      var nativeBtn = event.target.closest("[data-share-native]");
      var social = event.target.closest("[data-share-social]");
      var current = sharePayload(btn);

      if (copyBtn) {
        event.preventDefault();
        copyText(current.url).then(function (ok) {
          closeMenu();
          showToast(ok ? "Link copied" : "Copy failed");
        });
        return;
      }

      if (nativeBtn) {
        event.preventDefault();
        closeMenu();
        navigator
          .share({ title: current.title, text: current.text, url: current.url })
          .then(function () {
            showToast("Shared");
          })
          .catch(function (err) {
            if (err && err.name === "AbortError") return;
            showToast("Share cancelled");
          });
        return;
      }

      if (social) {
        closeMenu();
        showToast("Opening " + (social.getAttribute("data-share-social") || "share"));
      }
    });

    return menu;
  }

  function refreshMenuLinks(menu, btn) {
    var payload = sharePayload(btn);
    var map = {};
    socialTargets(payload).forEach(function (item) {
      map[item.id] = item.href;
    });
    menu.querySelectorAll("[data-share-social]").forEach(function (a) {
      var id = a.getAttribute("data-share-social");
      if (map[id]) a.setAttribute("href", map[id]);
    });
  }

  function toggleMenu(btn) {
    var menu = ensureMenu(btn);
    if (!menu) return;
    refreshMenuLinks(menu, btn);

    var already = openMenu === menu && !menu.hasAttribute("hidden");
    closeMenu();
    if (already) return;

    menu.removeAttribute("hidden");
    menu.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-haspopup", "menu");
    openMenu = menu;
  }

  document.querySelectorAll("[data-share-page]").forEach(function (btn) {
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu(btn);
    });
  });

  document.addEventListener("click", function (event) {
    if (!openMenu) return;
    if (event.target.closest("[data-share-menu]") || event.target.closest("[data-share-page]")) {
      return;
    }
    closeMenu();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });
})();
