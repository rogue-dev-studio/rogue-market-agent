/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 14:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 14:20:00
 */
(function () {
  var STORAGE_KEY = "rogue-market-bookmarks";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {}
  }

  function hostLabel(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (err) {
      return "Link";
    }
  }

  function removeUrl(url) {
    writeBookmarks(
      readBookmarks().filter(function (row) {
        return !(row && row.url === url);
      })
    );
    render();
  }

  function render() {
    var mount = document.querySelector("[data-saved-list]");
    if (!mount) return;
    var list = readBookmarks();
    if (!list.length) {
      mount.innerHTML =
        '<li class="empty-state">No saved links yet. Open a product, skill, or MCP detail and tap Save.</li>';
      return;
    }
    mount.innerHTML = list
      .map(function (row) {
        var url = row && row.url ? String(row.url) : "";
        if (!url) return "";
        var title = (row.title || hostLabel(url)).trim();
        return (
          '<li class="saved-item">' +
          '<a class="saved-link" href="' +
          esc(url) +
          '" rel="noopener" target="_blank">' +
          '<span class="saved-title">' +
          esc(title) +
          "</span>" +
          '<span class="saved-url">' +
          esc(url) +
          "</span>" +
          "</a>" +
          '<button type="button" class="saved-remove" data-remove-url="' +
          esc(url) +
          '" aria-label="Remove saved link">Remove</button>' +
          "</li>"
        );
      })
      .join("");
  }

  document.addEventListener("click", function (event) {
    var btn = event.target && event.target.closest
      ? event.target.closest("[data-remove-url]")
      : null;
    if (!btn) return;
    event.preventDefault();
    removeUrl(btn.getAttribute("data-remove-url") || "");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
