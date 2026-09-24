/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 13:54:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 13:54:00
 */
(function () {
  function formatName(login, name) {
    var n = typeof name === "string" ? name.trim() : "";
    return n || login || "Author";
  }

  function applyName(login, name) {
    var label = formatName(login, name);
    document.querySelectorAll('[data-github-user="' + login + '"]').forEach(function (el) {
      var current = el.textContent || "";
      el.textContent = /^by\s+/i.test(current) ? "by " + label : label;
    });
  }

  function loadUser(login) {
    if (!login) return;
    var cacheKey = "gh-user-name:" + login;
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.at && Date.now() - parsed.at < 3600000) {
          applyName(login, parsed.name);
          return;
        }
      }
    } catch (err) {}

    if (loadUser._inflight[login]) return;
    loadUser._inflight[login] = true;

    fetch("https://api.github.com/users/" + encodeURIComponent(login), {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
      })
      .then(function (data) {
        var name = formatName(login, data && data.name);
        applyName(login, name);
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ name: data && data.name ? String(data.name) : "", at: Date.now() })
          );
        } catch (err) {}
      })
      .catch(function () {
        applyName(login, login);
      })
      .finally(function () {
        delete loadUser._inflight[login];
      });
  }

  loadUser._inflight = {};

  function refreshGithubAuthors(root) {
    var scope = root || document;
    var seen = {};
    scope.querySelectorAll("[data-github-user]").forEach(function (el) {
      var login = (el.getAttribute("data-github-user") || "").trim();
      if (!login || seen[login]) return;
      seen[login] = true;
      loadUser(login);
    });
  }

  window.refreshGithubAuthors = refreshGithubAuthors;
  refreshGithubAuthors(document);
})();
