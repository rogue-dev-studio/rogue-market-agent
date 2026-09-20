/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:17:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 12:22:00
 */
(function () {
  function formatStars(n) {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    if (n < 1000) return String(n);
    if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return Math.round(n / 1000) + "k";
  }

  function applyCount(repo, count) {
    document.querySelectorAll('[data-github-repo="' + repo + '"]').forEach(function (el) {
      var countEl = el.querySelector("[data-star-count]") || (el.hasAttribute("data-star-count") ? el : null);
      if (countEl) countEl.textContent = formatStars(count);
    });
  }

  function loadStars(el) {
    var repo = (el.getAttribute("data-github-repo") || "").trim();
    if (!repo) return;

    var cacheKey = "gh-stars:" + repo;
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && typeof parsed.count === "number" && Date.now() - parsed.at < 3600000) {
          applyCount(repo, parsed.count);
          return;
        }
      }
    } catch (err) {}

    if (loadStars._inflight[repo]) return;
    loadStars._inflight[repo] = true;

    fetch("https://api.github.com/repos/" + encodeURI(repo), {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
      })
      .then(function (data) {
        var count = typeof data.stargazers_count === "number" ? data.stargazers_count : 0;
        applyCount(repo, count);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ count: count, at: Date.now() }));
        } catch (err) {}
      })
      .catch(function () {
        document.querySelectorAll('[data-github-repo="' + repo + '"]').forEach(function (node) {
          var countEl = node.querySelector("[data-star-count]");
          if (countEl && (!countEl.textContent || countEl.textContent === "…")) {
            countEl.textContent = "—";
          }
        });
      })
      .finally(function () {
        delete loadStars._inflight[repo];
      });
  }

  loadStars._inflight = {};

  function refreshGithubStars(root) {
    var scope = root || document;
    var seen = {};
    scope.querySelectorAll("[data-github-repo]").forEach(function (el) {
      var repo = (el.getAttribute("data-github-repo") || "").trim();
      if (!repo || seen[repo]) return;
      seen[repo] = true;
      loadStars(el);
    });
  }

  window.refreshGithubStars = refreshGithubStars;
  refreshGithubStars(document);
})();
