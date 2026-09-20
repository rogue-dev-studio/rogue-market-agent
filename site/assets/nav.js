/*
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 10:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 13:20:00
 */
(function () {
  var base = document.body.getAttribute("data-base") || "./";
  if (base.slice(-1) !== "/") base += "/";
  var studioHome = "https://rogue-dev-studio.github.io/";

  function href(path) {
    return base + path.replace(/^\//, "");
  }

  function injectNav() {
    var mount = document.querySelector("[data-site-nav]");
    if (!mount) return;

    mount.innerHTML =
      '<a class="brand" href="' + href("") + '">Rogue Market Agent</a>' +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
      "</button>" +
      '<nav class="nav" id="site-nav" aria-label="Primary">' +
        '<div class="nav-dd">' +
          '<button type="button" class="nav-dd-btn" aria-expanded="false" aria-haspopup="true">' +
            '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">' +
              '<path d="M9 2v6"></path><path d="M15 2v6"></path>' +
              '<rect x="6" y="8" width="12" height="6" rx="1.5"></rect>' +
              '<path d="M12 14v8"></path>' +
            "</svg>" +
            "<span>MCP Servers</span>" +
            '<svg class="nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>' +
          "</button>" +
          '<div class="nav-dd-menu" role="menu">' +
            '<a href="' + href("servers/") + '" role="menuitem">All Servers</a>' +
            '<a href="' + href("servers/categories/") + '" role="menuitem">Categories</a>' +
            '<a href="' + href("servers/tags/") + '" role="menuitem">Tags</a>' +
            '<a href="' + href("servers/top/") + '" role="menuitem">Top Servers</a>' +
            '<a href="' + href("servers/search/") + '" role="menuitem">Search Servers</a>' +
          "</div>" +
        "</div>" +
        '<div class="nav-dd">' +
          '<button type="button" class="nav-dd-btn" aria-expanded="false" aria-haspopup="true">' +
            '<svg class="nav-icon nav-icon-fill" viewBox="0 0 24 24" aria-hidden="true">' +
              '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"></rect>' +
              '<rect x="13.5" y="3.5" width="7" height="7" rx="1.2"></rect>' +
              '<rect x="3.5" y="13.5" width="7" height="7" rx="1.2"></rect>' +
              '<rect x="13.5" y="13.5" width="7" height="7" rx="1.2"></rect>' +
            "</svg>" +
            "<span>Agent Skills</span>" +
            '<svg class="nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>' +
          "</button>" +
          '<div class="nav-dd-menu" role="menu">' +
            '<a href="' + href("skills/") + '" role="menuitem">All Skills</a>' +
            '<a href="' + href("skills/categories/") + '" role="menuitem">Categories</a>' +
            '<a href="' + href("skills/tags/") + '" role="menuitem">Tags</a>' +
            '<a href="' + href("skills/top/") + '" role="menuitem">Top Skills</a>' +
            '<a href="' + href("skills/search/") + '" role="menuitem">Search Skills</a>' +
          "</div>" +
        "</div>" +
        '<a class="nav-studio" href="' + studioHome + '" rel="noopener">Rogue.dev</a>' +
        '<a class="nav-cta" href="https://github.com/rogue-dev-studio" rel="noopener">GitHub</a>' +
      "</nav>";
  }

  function injectFooter() {
    var mount = document.querySelector("[data-site-footer]") || document.querySelector("footer.foot");
    if (!mount) return;

    mount.className = "site-footer";
    mount.setAttribute("data-site-footer", "");
    mount.innerHTML =
      '<div class="site-footer-main">' +
        '<div class="site-footer-brand">' +
          '<a class="site-footer-logo" href="' + href("") + '">Rogue Market Agent</a>' +
          '<p>Discover MCP servers and Agent Skills that connect AI agents to your tools. Browse the catalog to get started.</p>' +
        "</div>" +
        '<div class="site-footer-cols">' +
          '<div class="site-footer-col">' +
            "<h3>Browse</h3>" +
            '<a href="' + href("servers/search/") + '">MCP Search</a>' +
            '<a href="' + href("servers/") + '">MCP Servers</a>' +
            '<a href="' + href("skills/") + '">Agent Skills</a>' +
          "</div>" +
          '<div class="site-footer-col">' +
            "<h3>Publish</h3>" +
            '<a href="' + studioHome + '" rel="noopener">Rogue Development</a>' +
            '<a href="https://github.com/rogue-dev-studio/ai-agents-rogue" rel="noopener">AI Agents Rogue</a>' +
            '<a href="https://github.com/rogue-dev-studio" rel="noopener">Submit on GitHub</a>' +
          "</div>" +
          '<div class="site-footer-col">' +
            "<h3>Company</h3>" +
            '<a href="' + studioHome + '" rel="noopener">Studio site</a>' +
            '<a href="' + href("privacy/") + '">Privacy</a>' +
            '<a href="' + href("terms/") + '">Terms</a>' +
            '<a href="mailto:aris.hadisopiyan@gmail.com">Contact</a>' +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="site-footer-bottom">' +
        '<p>© 2026 Rogue Market Agent · <a href="' + studioHome + '" rel="noopener">Rogue Development</a></p>' +
        '<p class="site-footer-legal"><a href="' + href("privacy/") + '">Privacy</a><span aria-hidden="true">·</span><a href="' + href("terms/") + '">Terms</a></p>' +
      "</div>";
  }

  function wireDropdowns() {
    var menus = document.querySelectorAll(".nav-dd");
    if (!menus.length) return;

    function closeAll(except) {
      menus.forEach(function (dd) {
        if (except && dd === except) return;
        dd.classList.remove("is-open");
        var btn = dd.querySelector(".nav-dd-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    menus.forEach(function (dd) {
      var btn = dd.querySelector(".nav-dd-btn");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = dd.classList.contains("is-open");
        closeAll();
        if (!open) {
          dd.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.addEventListener("click", function () {
      closeAll();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAll();
        closeMobileNav();
      }
    });
  }

  function closeMobileNav() {
    var top = document.querySelector(".top");
    var toggle = document.querySelector(".nav-toggle");
    if (!top) return;
    top.classList.remove("is-nav-open");
    document.body.classList.remove("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }

  function wireMobileNav() {
    var top = document.querySelector(".top");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!top || !toggle || !nav) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = top.classList.toggle("is-nav-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.addEventListener("click", function (e) {
      e.stopPropagation();
      if (e.target && e.target.closest && e.target.closest('a[href]')) {
        closeMobileNav();
      }
    });

    document.addEventListener("click", function () {
      closeMobileNav();
    });
  }

  injectNav();
  injectFooter();
  wireDropdowns();
  wireMobileNav();

  document.querySelectorAll(".subnav a").forEach(function (a) {
    try {
      var here = location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
      var link = new URL(a.getAttribute("href"), location.href).pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
      if (here === link) a.setAttribute("aria-current", "page");
    } catch (err) {}
  });
})();
