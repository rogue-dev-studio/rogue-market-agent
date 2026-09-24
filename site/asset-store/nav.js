/*
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 10:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 21:00:00
 */
(function () {
  var base = document.body.getAttribute("data-base") || "./";
  if (base.slice(-1) !== "/") base += "/";
  var studioHome = "https://rogue-dev-studio.github.io/";

  function href(path) {
    return base + path.replace(/^\//, "");
  }

  function searchTarget() {
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("/servers") !== -1) return href("servers/");
    if (path.indexOf("/skills") !== -1) return href("skills/");
    if (path.indexOf("asset-store") === -1 && /(?:^|\/)assets(?:\/|$)/.test(path)) {
      return href("assets/");
    }
    return href("assets/");
  }

  function searchPlaceholder() {
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("/servers") !== -1) return "Search MCP servers...";
    if (path.indexOf("/skills") !== -1) return "Search agent skills...";
    if (path.indexOf("asset-store") === -1 && /(?:^|\/)assets(?:\/|$)/.test(path)) {
      return "Search assets...";
    }
    return "Search catalog...";
  }

  function injectNav() {
    var mount = document.querySelector("[data-site-nav]");
    if (!mount) return;

    var q = "";
    try {
      q = new URLSearchParams(location.search).get("q") || "";
    } catch (err) {}

    mount.innerHTML =
      '<a class="brand" href="' + href("") + '">Rogue Asset Store</a>' +
      '<form class="site-header-search" action="' + searchTarget() + '" method="get" role="search">' +
        '<span class="search-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="11" cy="11" r="6.5"></circle>' +
            '<path d="M16.5 16.5L21 21"></path>' +
          "</svg>" +
        "</span>" +
        '<label class="sr-only" for="site-header-q">Search</label>' +
        '<input id="site-header-q" type="search" name="q" data-site-search data-catalog-search placeholder="' +
          searchPlaceholder().replace(/"/g, "&quot;") +
          '" value="' +
          String(q).replace(/"/g, "&quot;") +
          '" autocomplete="off" />' +
      "</form>" +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
      "</button>" +
      '<nav class="nav" id="site-nav" aria-label="Primary">' +
        '<div class="nav-dd">' +
          '<button type="button" class="nav-dd-btn" aria-expanded="false" aria-haspopup="true" aria-label="MCP Servers" data-tooltip="MCP Servers">' +
            '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">' +
              '<path d="M9 2v6"></path><path d="M15 2v6"></path>' +
              '<rect x="6" y="8" width="12" height="6" rx="1.5"></rect>' +
              '<path d="M12 14v8"></path>' +
            "</svg>" +
            '<span class="nav-label">MCP Servers</span>' +
          "</button>" +
          '<div class="nav-dd-menu" role="menu">' +
            '<a href="' + href("servers/") + '" role="menuitem">All Servers</a>' +
            '<a href="' + href("servers/categories/") + '" role="menuitem">Categories</a>' +
            '<a href="' + href("servers/tags/") + '" role="menuitem">Tags</a>' +
            '<a href="' + href("servers/top/") + '" role="menuitem">Top Servers</a>' +
          "</div>" +
        "</div>" +
        '<div class="nav-dd">' +
          '<button type="button" class="nav-dd-btn" aria-expanded="false" aria-haspopup="true" aria-label="Agent Skills" data-tooltip="Agent Skills">' +
            '<svg class="nav-icon nav-icon-fill" viewBox="0 0 24 24" aria-hidden="true">' +
              '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"></rect>' +
              '<rect x="13.5" y="3.5" width="7" height="7" rx="1.2"></rect>' +
              '<rect x="3.5" y="13.5" width="7" height="7" rx="1.2"></rect>' +
              '<rect x="13.5" y="13.5" width="7" height="7" rx="1.2"></rect>' +
            "</svg>" +
            '<span class="nav-label">Agent Skills</span>' +
          "</button>" +
          '<div class="nav-dd-menu" role="menu">' +
            '<a href="' + href("skills/") + '" role="menuitem">All Skills</a>' +
            '<a href="' + href("skills/categories/") + '" role="menuitem">Categories</a>' +
            '<a href="' + href("skills/tags/") + '" role="menuitem">Tags</a>' +
            '<a href="' + href("skills/top/") + '" role="menuitem">Top Skills</a>' +
          "</div>" +
        "</div>" +
        '<div class="nav-dd">' +
          '<button type="button" class="nav-dd-btn" aria-expanded="false" aria-haspopup="true" aria-label="Assets" data-tooltip="Assets">' +
            '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">' +
              '<path d="M4 7h16v12H4z"></path><path d="M8 7V5h8v2"></path>' +
            "</svg>" +
            '<span class="nav-label">Assets</span>' +
          "</button>" +
          '<div class="nav-dd-menu" role="menu">' +
            '<a href="' + href("assets/") + '" role="menuitem">All Assets</a>' +
            '<a href="' + href("assets/categories/") + '" role="menuitem">Categories</a>' +
            '<a href="' + href("assets/tags/") + '" role="menuitem">Tags</a>' +
            '<a href="' + href("assets/top/") + '" role="menuitem">Top Assets</a>' +
          "</div>" +
        "</div>" +
        '<a class="nav-icon-link" href="' + href("saved/") + '" aria-label="Saved Assets" data-tooltip="Saved Assets">' +
          '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M7 3h10v18l-5-3.2L7 21V3z"></path>' +
          "</svg>" +
          '<span class="nav-label">Saved Assets</span>' +
        "</a>" +
      "</nav>";
  }

  var PATREON_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><circle cx="14.48" cy="9.73" r="7.23"/><rect x="2" y="2.5" width="4.5" height="19" rx="0.5"/></svg>';

  function ensureBootstrapIcons() {
    if (document.querySelector("link[data-bootstrap-icons]")) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    link.setAttribute("data-bootstrap-icons", "");
    document.head.appendChild(link);
  }

  function socialIconMarkup(icon) {
    if (icon === "patreon") {
      return '<span class="site-footer-icon site-footer-icon-svg" aria-hidden="true">' + PATREON_ICON_SVG + "</span>";
    }
    var bi = icon === "itch" ? "controller" : icon;
    return '<i class="bi bi-' + bi + '" aria-hidden="true"></i>';
  }

  function externalLink(label, url) {
    return (
      '<a href="' +
      url +
      '" rel="noopener" target="_blank">' +
      label +
      "</a>"
    );
  }

  function injectFooter() {
    var mount = document.querySelector("[data-site-footer]") || document.querySelector("footer.foot");
    if (!mount) return;

    ensureBootstrapIcons();

    var contactUrl = studioHome + "#contact";
    var stores =
      (window.RogueCatalog && RogueCatalog.studioStores) || {
        gumroad: "https://roguedevstudio.gumroad.com",
        sketchfab: "https://sketchfab.com/rogue-dev-studio",
        shutterstock: "https://www.shutterstock.com/g/ArisHadisopiyan",
        turbosquid: "https://www.turbosquid.com/Search/Artists/ArisHadisopiyan",
        cgtrader: "https://www.cgtrader.com/aris-hadisopiyan",
        itch: "https://rogue-dev-studio.itch.io"
      };

    // Same set as https://rogue-dev-studio.github.io/ contact socials (Bootstrap Icons).
    var socials = [
      { label: "GitHub", url: "https://github.com/rogue-dev-studio", icon: "github" },
      { label: "GitLab", url: "https://gitlab.com/rogue-dev-studio", icon: "gitlab" },
      { label: "Patreon", url: "https://www.patreon.com/cw/roguedevstudio", icon: "patreon" },
      { label: "itch.io", url: "https://rogue-dev-studio.itch.io", icon: "itch" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/arishadisopiyan/", icon: "linkedin" },
      { label: "Instagram", url: "https://www.instagram.com/aya.erisu/", icon: "instagram" }
    ];

    var sources = [
      { label: "Sketchfab", url: stores.sketchfab },
      { label: "Shutterstock", url: stores.shutterstock },
      { label: "TurboSquid", url: stores.turbosquid },
      { label: "CGTrader", url: stores.cgtrader },
      { label: "itch.io", url: stores.itch },
      { label: "Gumroad", url: stores.gumroad }
    ];

    var sponsors = [
      {
        label: "GitHub Sponsors",
        url: "https://github.com/sponsors/rogue-dev-studio",
        icon: "heart"
      },
      {
        label: "Patreon",
        url: "https://www.patreon.com/cw/roguedevstudio",
        icon: "patreon"
      },
      {
        label: "Buy Me a Coffee",
        url: "https://www.buymeacoffee.com/roguedevstudio",
        icon: "cup-hot"
      },
      {
        label: "Ko-fi",
        url: "https://ko-fi.com/roguedevstudio",
        icon: "cup-straw"
      },
      {
        label: "PayPal",
        url: "https://www.paypal.com/ncp/payment/AQRMXB39CCQTW",
        icon: "paypal"
      }
    ];

    mount.className = "site-footer";
    mount.setAttribute("data-site-footer", "");
    mount.innerHTML =
      '<div class="site-footer-main">' +
        '<div class="site-footer-brand">' +
          '<a class="site-footer-logo" href="' + href("") + '">Rogue Asset Store</a>' +
          '<p>Browse MCP servers, agent skills, and digital assets curated for AI builders.</p>' +
        "</div>" +
        '<div class="site-footer-cols">' +
          '<div class="site-footer-col site-footer-lang-col">' +
            "<h3>Language</h3>" +
            '<label class="sr-only" for="site-footer-lang">Language</label>' +
            '<select id="site-footer-lang" class="site-footer-lang" data-site-lang aria-label="Language">' +
              '<option value="en" selected>English</option>' +
            "</select>" +
          "</div>" +
          '<div class="site-footer-col">' +
            "<h3>Browse</h3>" +
            '<a href="' + href("servers/") + '">MCP Servers</a>' +
            '<a href="' + href("skills/") + '">Agent Skills</a>' +
            '<a href="' + href("assets/") + '">Assets</a>' +
            '<a href="https://github.com/rogue-dev-studio/ai-agents-rogue" rel="noopener" target="_blank">Agents Complete</a>' +
            '<a href="https://github.com/rogue-dev-studio/ai-agents-rogue-programmer" rel="noopener" target="_blank">Agent Programmer</a>' +
          "</div>" +
          '<div class="site-footer-col">' +
            "<h3>Sources</h3>" +
            sources
              .map(function (s) {
                return externalLink(s.label, s.url);
              })
              .join("") +
          "</div>" +
          '<div class="site-footer-col">' +
            "<h3>Company</h3>" +
            '<a href="' + studioHome + '" rel="noopener">Studio site</a>' +
            '<a href="' + href("privacy/") + '">Privacy</a>' +
            '<a href="' + href("terms/") + '">Terms</a>' +
            '<a href="' + contactUrl + '" rel="noopener">Contact us</a>' +
          "</div>" +
          '<div class="site-footer-col">' +
            "<h3>Support</h3>" +
            '<div class="site-footer-sponsors" aria-label="Sponsor links">' +
              sponsors
                .map(function (s) {
                  return (
                    '<a class="site-footer-sponsor" href="' +
                    s.url +
                    '" rel="noopener" target="_blank">' +
                    socialIconMarkup(s.icon) +
                    "<span>" +
                    s.label +
                    "</span></a>"
                  );
                })
                .join("") +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="site-footer-bottom">' +
        '<p>© 2026 Rogue Asset Store</p>' +
        '<div class="site-footer-socials site-footer-socials--bottom" aria-label="Social links">' +
          socials
            .map(function (s) {
              return (
                '<a class="site-footer-social" href="' +
                s.url +
                '" rel="noopener" target="_blank" aria-label="' +
                s.label +
                '" data-tooltip="' +
                s.label +
                '">' +
                socialIconMarkup(s.icon) +
                "</a>"
              );
            })
            .join("") +
        "</div>" +
      "</div>";
  }

  function wireHeaderSearch() {
    var form = document.querySelector(".site-header-search");
    var input = document.querySelector("[data-site-search]");
    if (!form || !input) return;

    var hasCatalog = !!document.querySelector("[data-catalog]");
    if (hasCatalog) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      return;
    }

    form.addEventListener("submit", function (e) {
      var value = (input.value || "").trim();
      if (!value) {
        e.preventDefault();
        location.href = searchTarget();
        return;
      }
    });
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
  wireHeaderSearch();
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
