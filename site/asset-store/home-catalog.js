/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:27:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-24 12:10:00
 */
(function () {
  var HOME_CARD_COUNT = 5;
  /** Prefer these asset ids on the home Assets strip (store raw ids ok). */
  var HOME_ASSET_FEATURED = [
    "shutterstock-2056453337",
    "shutterstock-2056492070",
    "2056453337",
    "2056492070"
  ];

  function detailHref(item, kind) {
    if (window.RogueSite && RogueSite.detailPath) {
      return RogueSite.detailPath(kind, item);
    }
    var root = "/";
    if (kind === "assets") {
      return root + "assets/detail/?id=" + encodeURIComponent(item.id || item.slug || "");
    }
    var repo = item.githubRepo || "";
    if (repo) return root + kind + "/detail/?repo=" + encodeURIComponent(repo);
    return "#";
  }

  function card(item, kind) {
    if (window.RogueCards && RogueCards.html) {
      return RogueCards.html(item, kind, { href: detailHref(item, kind) });
    }
    return (
      '<li><a class="asset-card" href="' +
      detailHref(item, kind) +
      '"><strong class="asset-card-title" data-tooltip="' +
      item.name +
      '">' +
      item.name +
      "</strong></a></li>"
    );
  }

  function emptyHtml(kind) {
    function tx(key, fallback) {
      if (window.RogueStoreI18n && RogueStoreI18n.t) return RogueStoreI18n.t(key);
      return fallback;
    }
    if (kind === "servers") {
      return '<li class="empty-state">' + tx("noServers", "No MCP servers yet.") + "</li>";
    }
    if (kind === "assets") {
      return '<li class="empty-state">' + tx("noAssets", "No assets yet.") + "</li>";
    }
    return '<li class="empty-state">' + tx("noSkills", "No skills yet.") + "</li>";
  }

  function diversityKey(item, kind) {
    if (!item) return "Other";
    if (kind === "assets") {
      var content = String(item.contentCategory || "").trim();
      var source = String(item.source || "").trim();
      if (content && source) return content + "::" + source;
      if (source) return source;
      if (content) return content;
      return String(item.category || "Other").trim() || "Other";
    }
    return String(item.category || "Other").trim() || "Other";
  }

  /** Prefer one item per category/source before repeating a bucket. */
  function pickDiverse(items, limit, kind) {
    var list = Array.isArray(items) ? items : [];
    if (!list.length || limit <= 0) return [];
    var byKey = {};
    var order = [];
    list.forEach(function (item) {
      var key = diversityKey(item, kind);
      if (!byKey[key]) {
        byKey[key] = [];
        order.push(key);
      }
      byKey[key].push(item);
    });
    var picked = [];
    var round = 0;
    while (picked.length < limit) {
      var added = false;
      for (var i = 0; i < order.length && picked.length < limit; i++) {
        var bucket = byKey[order[i]];
        if (bucket && bucket[round]) {
          picked.push(bucket[round]);
          added = true;
        }
      }
      if (!added) break;
      round += 1;
    }
    if (picked.length < limit) {
      list.forEach(function (item) {
        if (picked.length >= limit) return;
        if (picked.indexOf(item) === -1) picked.push(item);
      });
    }
    return picked;
  }

  function productIdKeys(item) {
    var id = String((item && item.id) || "");
    var slug = String((item && item.slug) || "");
    var keys = [];
    if (id) {
      keys.push(id);
      var dash = id.indexOf("-");
      if (dash > 0) keys.push(id.slice(dash + 1));
    }
    if (slug && keys.indexOf(slug) === -1) keys.push(slug);
    return keys;
  }

  function pickHomeAssets(items, limit) {
    var list = Array.isArray(items) ? items : [];
    if (!list.length || limit <= 0) return [];
    var byKey = {};
    list.forEach(function (item) {
      productIdKeys(item).forEach(function (key) {
        if (!byKey[key]) byKey[key] = item;
      });
    });
    var featured = [];
    var seen = {};
    HOME_ASSET_FEATURED.forEach(function (want) {
      var item = byKey[String(want)];
      if (!item || seen[item.id] || featured.length >= limit) return;
      seen[item.id] = true;
      featured.push(item);
    });
    if (featured.length >= limit) return featured.slice(0, limit);
    var rest = pickDiverse(
      list.filter(function (item) {
        return !seen[item.id];
      }),
      limit - featured.length,
      "assets"
    );
    return featured.concat(rest);
  }

  function renderHome() {
    var catalog = window.RogueCatalog || {};
    var serversHost = document.querySelector('[data-home-catalog="servers"]');
    var skillsHost = document.querySelector('[data-home-catalog="skills"]');
    var assetsHost = document.querySelector('[data-home-catalog="assets"]');

    if (serversHost) {
      var servers = pickDiverse(catalog.servers || [], HOME_CARD_COUNT, "servers");
      serversHost.innerHTML = servers.length
        ? servers
            .map(function (item) {
              return card(item, "servers");
            })
            .join("")
        : emptyHtml("servers");
    }

    if (skillsHost) {
      var skills = pickDiverse(catalog.skills || [], HOME_CARD_COUNT, "skills");
      skillsHost.innerHTML = skills.length
        ? skills
            .map(function (item) {
              return card(item, "skills");
            })
            .join("")
        : emptyHtml("skills");
    }

    if (assetsHost) {
      var assets = pickHomeAssets(catalog.assets || [], HOME_CARD_COUNT);
      assetsHost.innerHTML = assets.length
        ? assets
            .map(function (item) {
              return card(item, "assets");
            })
            .join("")
        : emptyHtml("assets");
      if (assets.length && typeof window.refreshGithubStars === "function") {
        window.refreshGithubStars(assetsHost);
      }
    }

    if (typeof window.refreshGithubStars === "function") {
      if (serversHost) window.refreshGithubStars(serversHost);
      if (skillsHost) window.refreshGithubStars(skillsHost);
    }
    if (typeof window.refreshGithubAuthors === "function") {
      if (serversHost) window.refreshGithubAuthors(serversHost);
      if (skillsHost) window.refreshGithubAuthors(skillsHost);
    }
  }

  document.addEventListener("rogue-catalog:loaded", renderHome);
  document.addEventListener("rogue-catalog:assets-loaded", renderHome);
  renderHome();
})();
