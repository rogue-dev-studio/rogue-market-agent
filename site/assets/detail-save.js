/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 17:30:00
 */
(function () {
  var STORAGE_KEY = "rogue-market-bookmarks";
  var saveCountBase = 0;

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
    }, 2200);
  }

  function storageAvailable() {
    try {
      var k = "__rm_probe__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (err) {
      return false;
    }
  }

  function readBookmarks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  }

  function writeBookmarks(list) {
    if (!storageAvailable()) {
      showToast("Browser blocked saving (localStorage)");
      return false;
    }
    try {
      var payload = JSON.stringify(list);
      localStorage.setItem(STORAGE_KEY, payload);
      var check = localStorage.getItem(STORAGE_KEY);
      if (check !== payload) {
        showToast("Save failed — storage mismatch");
        return false;
      }
      return true;
    } catch (err) {
      showToast("Save failed — " + (err && err.name ? err.name : "storage error"));
      return false;
    }
  }

  function hrefFrom(el) {
    if (!el) return "";
    var attr = (el.getAttribute("href") || "").trim();
    if (!attr || attr === "#" || /^#/.test(attr)) return "";
    if (/^https?:\/\//i.test(attr)) return attr;
    try {
      var abs = el.href;
      if (abs && /^https?:\/\//i.test(abs) && !/#$/.test(abs)) return abs;
    } catch (err) {}
    return "";
  }

  /** Product → primary storefront; Skill/MCP → Repo. Never the detail page URL. */
  function resolveSaveUrl(btn) {
    if (btn) {
      var explicit = (btn.getAttribute("data-save-url") || "").trim();
      if (/^https?:\/\//i.test(explicit)) return explicit;
    }

    var primaryBuy = document.querySelector("[data-detail-buy-primary], [data-detail-buy]");
    if (primaryBuy) {
      var buyUrl = hrefFrom(primaryBuy);
      if (buyUrl) return buyUrl;
    }

    var repo = document.querySelector("[data-detail-repo]");
    if (repo) {
      var repoUrl = hrefFrom(repo);
      if (repoUrl) return repoUrl;
    }

    return "";
  }

  function formatSaveCount(n) {
    var v = Math.max(0, Math.floor(Number(n) || 0));
    if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(v);
  }

  function publicSaveBase(item) {
    if (item && typeof item.saves === "number" && item.saves >= 0) {
      return Math.floor(item.saves);
    }
    return 0;
  }

  function displayedSaveCount(url) {
    var local = isSaved(url) ? 1 : 0;
    if (saveCountBase > 0) return Math.max(saveCountBase, local);
    return local;
  }

  function syncSaveCount(btn) {
    var wrap = btn && btn.closest ? btn.closest(".detail-save-wrap") : null;
    var countEl =
      (wrap && wrap.querySelector("[data-save-count]")) ||
      document.querySelector("[data-save-count]");
    if (!countEl) return;
    var url = resolveSaveUrl(btn);
    var total = displayedSaveCount(url);
    countEl.textContent = formatSaveCount(total);
    countEl.setAttribute(
      "data-tooltip",
      total === 1 ? "1 save" : total + " saves"
    );
    countEl.setAttribute(
      "aria-label",
      total === 1 ? "1 save" : total + " saves"
    );
  }

  function pinSaveUrl(url) {
    if (!url || !/^https?:\/\//i.test(url)) return;
    document.querySelectorAll("[data-save-bookmark]").forEach(function (btn) {
      btn.setAttribute("data-save-url", url);
      btn.removeAttribute("disabled");
    });
    syncAll();
  }

  function pinSaveCount(n) {
    var value = Math.max(0, Math.floor(Number(n) || 0));
    saveCountBase = value;
    document.querySelectorAll("[data-save-bookmark]").forEach(function (btn) {
      btn.setAttribute("data-save-count-base", String(value));
      syncSaveCount(btn);
    });
  }

  function isSaved(url) {
    if (!url) return false;
    return readBookmarks().some(function (row) {
      return row && row.url === url;
    });
  }

  function syncButton(btn) {
    var url = resolveSaveUrl(btn);
    var on = isSaved(url);
    var baseAttr = parseInt(btn.getAttribute("data-save-count-base") || "", 10);
    if (!isNaN(baseAttr) && baseAttr >= 0) saveCountBase = baseAttr;
    btn.classList.toggle("is-saved", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("data-tooltip", on ? "Saved" : "Save");
    btn.setAttribute("aria-label", on ? "Saved" : "Save");
    btn.removeAttribute("disabled");
    syncSaveCount(btn);
  }

  function syncAll() {
    document.querySelectorAll("[data-save-bookmark]").forEach(syncButton);
  }

  function toggleSave(btn) {
    var url = resolveSaveUrl(btn);
    if (!url) {
      showToast("Link not ready yet — wait a moment");
      return;
    }
    var list = readBookmarks();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].url === url) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      list.splice(idx, 1);
      if (!writeBookmarks(list)) return;
      syncButton(btn);
      showToast("Removed from saved");
      return;
    }
    list.unshift({
      url: url,
      title: document.title || url,
      savedAt: new Date().toISOString()
    });
    if (!writeBookmarks(list.slice(0, 100))) return;
    syncButton(btn);
    showToast("Saved · open Saved Assets in menu");
  }

  function onClick(event) {
    var btn = event.target && event.target.closest
      ? event.target.closest("[data-save-bookmark]")
      : null;
    if (!btn || !document.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    toggleSave(btn);
  }

  window.pinDetailSaveUrl = pinSaveUrl;
  window.pinDetailSaveCount = pinSaveCount;
  window.detailSaveCountFromItem = publicSaveBase;

  window.refreshDetailSaveButtons = function () {
    var buy = document.querySelector("[data-detail-buy]");
    var repo = document.querySelector("[data-detail-repo]");
    var url = "";
    if (buy) url = hrefFrom(buy);
    if (!url && repo) url = hrefFrom(repo);
    if (url) pinSaveUrl(url);
    else syncAll();
  };

  document.addEventListener("click", onClick, true);

  function boot() {
    syncAll();
    window.refreshDetailSaveButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  document.addEventListener("rogue-catalog:products-loaded", boot);
  document.addEventListener("rogue-catalog:loaded", boot);
})();
