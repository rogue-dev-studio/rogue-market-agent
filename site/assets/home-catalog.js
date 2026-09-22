/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:27:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 12:30:00
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

  function priceLabel(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    if (isNaN(n) || n <= 0) return "$0+";
    if (Number.isInteger(n)) return "$" + n;
    return "$" + n.toFixed(2);
  }

  function card(item, kind) {
    var href = detailHref(item, kind);
    var badge =
      item.badge ||
      (kind === "servers" ? "MCP" : kind === "products" ? "DIG" : item.name.slice(0, 2).toUpperCase());
    var meta =
      (kind === "servers" ? "MCP" : kind === "products" ? "Product" : "Skill") +
      " · " +
      (item.owner || "rogue-dev-studio");
    var foot =
      kind === "products"
        ? '<span class="card-foot"><span class="pill">' +
          (item.category || "Product") +
          '</span><span class="price-pill">' +
          priceLabel(item) +
          "</span></span>"
        : "";
    return (
      '<li><a class="skill-card' +
      (kind === "servers" ? " server-card" : "") +
      (kind === "products" ? " product-card" : "") +
      '" href="' +
      href +
      '">' +
      (kind === "servers" || kind === "products"
        ? '<span class="server-card-icon" aria-hidden="true">' + badge + "</span>"
        : "") +
      '<span class="skill-meta">' +
      meta +
      "</span>" +
      '<strong class="skill-name">' +
      item.name +
      "</strong>" +
      '<span class="skill-desc">' +
      item.description +
      "</span>" +
      foot +
      "</a></li>"
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
    }
  }

  document.addEventListener("rogue-catalog:loaded", renderHome);
  document.addEventListener("rogue-catalog:products-loaded", renderHome);
  renderHome();
})();
