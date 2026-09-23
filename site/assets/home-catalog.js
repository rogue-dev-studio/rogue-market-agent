/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:27:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 12:56:00
 */
(function () {
  function detailHref(item, kind) {
    if (window.RogueSite && RogueSite.detailPath) {
      return RogueSite.detailPath(kind, item);
    }
    var root = "/";
    if (kind === "products") {
      return root + "products/detail/?id=" + encodeURIComponent(item.id || item.slug || "");
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
      '"><strong class="asset-card-title">' +
      item.name +
      "</strong></a></li>"
    );
  }

  function emptyHtml(kind) {
    if (kind === "servers") return '<li class="empty-state">No MCP servers yet.</li>';
    if (kind === "products") return '<li class="empty-state">No products yet.</li>';
    return '<li class="empty-state">No skills yet.</li>';
  }

  function renderHome() {
    var catalog = window.RogueCatalog || {};
    var serversHost = document.querySelector('[data-home-catalog="servers"]');
    var skillsHost = document.querySelector('[data-home-catalog="skills"]');
    var productsHost = document.querySelector('[data-home-catalog="products"]');

    if (serversHost) {
      var servers = catalog.servers || [];
      serversHost.innerHTML = servers.length
        ? servers.slice(0, 6).map(function (item) {
            return card(item, "servers");
          }).join("")
        : emptyHtml("servers");
    }

    if (skillsHost) {
      var skills = catalog.skills || [];
      skillsHost.innerHTML = skills.length
        ? skills.slice(0, 6).map(function (item) {
            return card(item, "skills");
          }).join("")
        : emptyHtml("skills");
    }

    if (productsHost) {
      var products = catalog.products || [];
      productsHost.innerHTML = products.length
        ? products.slice(0, 6).map(function (item) {
            return card(item, "products");
          }).join("")
        : emptyHtml("products");
      if (products.length && typeof window.refreshGithubStars === "function") {
        window.refreshGithubStars(productsHost);
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
  document.addEventListener("rogue-catalog:products-loaded", renderHome);
  renderHome();
})();
