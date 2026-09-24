/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 12:56:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-24 12:15:00
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function iconSvg(paths) {
    return (
      '<svg class="category-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      paths +
      "</svg>"
    );
  }

  function categoryIcon(name) {
    var key = String(name || "").toLowerCase();
    var map = {
      "developer tools": iconSvg('<path d="M8 7l-5 5 5 5"></path><path d="M16 7l5 5-5 5"></path><path d="M14 4l-4 16"></path>'),
      "data science & ml": iconSvg('<circle cx="12" cy="12" r="3"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"></path>'),
      "api development": iconSvg('<path d="M4 8h6v8H4z"></path><path d="M14 8h6v3h-6z"></path><path d="M14 13h6v3h-6z"></path>'),
      "productivity & workflow": iconSvg('<path d="M4 6h16"></path><path d="M4 12h10"></path><path d="M4 18h13"></path><circle cx="18" cy="12" r="2"></circle>'),
      "analytics & monitoring": iconSvg('<path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M22 19V8"></path>'),
      "security & testing": iconSvg('<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"></path><path d="M9.5 12l2 2 3.5-3.5"></path>'),
      "web scraping & data collection": iconSvg('<circle cx="11" cy="11" r="6"></circle><path d="M20 20l-3.2-3.2"></path>'),
      "deployment & devops": iconSvg('<path d="M4 17l4-10 4 6 3-4 5 8"></path><path d="M3 19h18"></path>'),
      "learning & documentation": iconSvg('<path d="M4 5h7a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H4z"></path><path d="M20 5h-7a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h7z"></path>'),
      "database management": iconSvg('<ellipse cx="12" cy="6" rx="7" ry="3"></ellipse><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"></path><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path>'),
      "content management": iconSvg('<path d="M5 4h14v16H5z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>'),
      "collaboration tools": iconSvg('<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"></path><path d="M14 19c.3-2 1.8-3.5 4-3.5 1.5 0 2.8.7 3.5 1.8"></path>'),
      "cloud infrastructure": iconSvg('<path d="M7 17h11a4 4 0 0 0 .3-8 6 6 0 0 0-11.3-1.5A4.5 4.5 0 0 0 7 17z"></path>'),
      "marketing automation": iconSvg('<path d="M4 12h3l2-6 3 12 2-6h6"></path>'),
      "e-commerce solutions": iconSvg('<path d="M6 7h15l-1.5 8H8z"></path><circle cx="9" cy="19" r="1.5"></circle><circle cx="17" cy="19" r="1.5"></circle><path d="M3 4h2l1 3"></path>'),
      "design tools": iconSvg('<path d="M12 3l2.2 6.5L21 12l-6.8 2.5L12 21l-2.2-6.5L3 12l6.8-2.5z"></path>'),
      "browser automation": iconSvg('<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 9h18"></path><circle cx="7" cy="7" r="0.8" fill="currentColor" stroke="none"></circle>'),
      "social media management": iconSvg('<circle cx="12" cy="12" r="8"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"></circle><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"></circle>'),
      "game development": iconSvg('<rect x="3" y="9" width="18" height="8" rx="3"></rect><circle cx="8" cy="13" r="1.2"></circle><path d="M15 12h3M16.5 10.5v3"></path>'),
      "mobile development": iconSvg('<rect x="8" y="3" width="8" height="18" rx="2"></rect><path d="M11 18h2"></path>'),
      "motion & media": iconSvg('<rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M10 10l5 2-5 2z"></path>'),
      templates: iconSvg('<path d="M4 4h7v7H4z"></path><path d="M13 4h7v7h-7z"></path><path d="M4 13h7v7H4z"></path><path d="M13 13h7v7h-7z"></path>'),
      "2d": iconSvg('<rect x="4" y="5" width="16" height="14" rx="1.5"></rect><path d="M8 15l3-4 2.5 3L16 11l3 4"></path>'),
      "3d": iconSvg('<path d="M12 3l9 5v8l-9 5-9-5V8l9-5z"></path><path d="M12 12l9-5M12 12v10M12 12L3 7"></path>'),
      "add-ons": iconSvg('<path d="M12 5v14"></path><path d="M5 12h14"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect>'),
      audio: iconSvg('<path d="M4 10v4"></path><path d="M8 7v10"></path><path d="M12 4v16"></path><path d="M16 7v10"></path><path d="M20 10v4"></path>'),
      tools: iconSvg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-3-3 2.5-2.5z"></path>'),
      vfx: iconSvg('<path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"></path><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"></path>'),
      platforms: iconSvg('<rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M8 10h8M8 14h5"></path><circle cx="17" cy="14" r="1.2"></circle>'),
      product: iconSvg('<path d="M6 7h12l1 4H5z"></path><path d="M5 11v8h14v-8"></path><path d="M9 15h6"></path>'),
      other: iconSvg('<circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l2.5 2.5"></path>'),
      official: iconSvg('<path d="M12 3l2 5h5l-4 3.5 1.5 5.5L12 14l-4.5 3 1.5-5.5L5 8h5z"></path>')
    };
    return map[key] || iconSvg('<rect x="5" y="5" width="14" height="14" rx="2"></rect><path d="M9 12h6M12 9v6"></path>');
  }

  function itemPrice(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    return isNaN(n) ? 0 : n;
  }

  function priceLabel(item) {
    var n = itemPrice(item);
    if (n <= 0) return "Free";
    if (Number.isInteger(n)) return "$" + n;
    return "$" + n.toFixed(2);
  }

  function starsGlyph(scoreOutOf5) {
    var filled = Math.round(Math.max(0, Math.min(5, scoreOutOf5)));
    var out = "";
    for (var i = 0; i < 5; i++) out += i < filled ? "★" : "☆";
    return out;
  }

  /** Single star for like/star-count sources (GitHub, Sketchfab, …). */
  function countStarGlyph(count) {
    return count > 0 ? "★" : "☆";
  }

  function itemLikes(item) {
    if (!item) return 0;
    if (typeof item.likes === "number" && item.likes >= 0) return item.likes;
    if (typeof item.likeCount === "number" && item.likeCount >= 0) return item.likeCount;
    if (item.source === "sketchfab" || item.sketchfabUid) {
      var n =
        typeof item.ratingCount === "number"
          ? item.ratingCount
          : parseInt(item.ratingCount, 10);
      return !isNaN(n) && n >= 0 ? n : 0;
    }
    return 0;
  }

  function itemGithubStars(item) {
    if (!item) return 0;
    if (typeof item.stars === "number" && item.stars >= 0) return item.stars;
    var n =
      typeof item.ratingCount === "number"
        ? item.ratingCount
        : parseInt(item.ratingCount, 10);
    if (!isNaN(n) && n >= 0) return n;
    if (typeof item.votes === "number" && item.votes >= 0) return item.votes;
    return 0;
  }

  /**
   * True when the source only has “gave a star/like” counts — not a 1–5 average rating.
   * Sketchfab likes, GitHub stars, and similar.
   */
  function isShutterstockItem(item) {
    if (!item) return false;
    if (String(item.source || "").toLowerCase() === "shutterstock") return true;
    if (Array.isArray(item.stores)) {
      return item.stores.some(function (s) {
        return String((s && s.id) || "").toLowerCase() === "shutterstock";
      });
    }
    return false;
  }

  function isCountOnlyRating(item, kind) {
    if (!item) return kind === "servers" || kind === "skills";
    if (isShutterstockItem(item)) return false;
    if (item.hasStarRating === true || item.ratingScale === 5) return false;
    if (item.ratingScale === "count" || item.ratingMode === "count") return true;
    if (item.source === "sketchfab" || item.sketchfabUid) return true;
    if (item.githubRepo || kind === "servers" || kind === "skills") return true;
    if (
      kind === "assets" &&
      item.source &&
      item.source !== "gumroad" &&
      item.source !== "shutterstock" &&
      item.source !== "turbosquid" &&
      item.source !== "cgtrader" &&
      item.source !== "itch"
    ) {
      return true;
    }
    var scoreRaw = typeof item.rating === "number" ? item.rating : parseFloat(item.rating);
    var hasAverage = !isNaN(scoreRaw) && scoreRaw > 0 && scoreRaw <= 5;
    if (!hasAverage && (typeof item.likes === "number" || typeof item.stars === "number")) {
      return true;
    }
    return false;
  }

  function engagementCount(item, kind) {
    if (!item) return 0;
    if (item.source === "sketchfab" || item.sketchfabUid) return itemLikes(item);
    if (item.githubRepo || kind === "servers" || kind === "skills") {
      return itemGithubStars(item);
    }
    if (typeof item.likes === "number") return item.likes;
    var n =
      typeof item.ratingCount === "number"
        ? item.ratingCount
        : parseInt(item.ratingCount, 10);
    return !isNaN(n) && n >= 0 ? n : 0;
  }

  /** Keep for sort/filter helpers; count-only sources use engagement magnitude → 1–5 buckets. */
  function resolveScore(item, kind) {
    if (isCountOnlyRating(item, kind)) {
      var c = engagementCount(item, kind);
      if (c <= 0) return 0;
      if (c >= 100) return 5;
      if (c >= 50) return 4;
      if (c >= 20) return 3;
      if (c >= 5) return 2;
      return 1;
    }
    var scoreRaw = typeof item.rating === "number" ? item.rating : parseFloat(item.rating);
    if (!isNaN(scoreRaw) && scoreRaw > 0) return Math.max(0, Math.min(5, scoreRaw));
    return 0;
  }

  function ratingFromLikes(likes) {
    return resolveScore({ likes: likes, source: "sketchfab" }, "assets");
  }

  function itemImage(item, kind) {
    if (item.image || item.cover) {
      var src = item.image || item.cover;
      if (/^https?:\/\//i.test(src) || src.indexOf("//") === 0) return src;
      var root =
        (window.RogueSite && RogueSite.root && RogueSite.root()) || "/";
      return root + String(src).replace(/^\//, "");
    }
    if (item.githubRepo) {
      return "https://opengraph.githubassets.com/1/" + String(item.githubRepo);
    }
    return "";
  }

  function badgeText(item, kind) {
    return (
      item.badge ||
      (kind === "servers" ? "MCP" : kind === "assets" ? "AST" : String(item.name || "??").slice(0, 2).toUpperCase())
    );
  }

  function mediaHtml(item, kind) {
    var src = itemImage(item, kind);
    var badge = badgeText(item, kind);
    if (src) {
      return (
        '<span class="asset-card-media">' +
        '<img src="' +
        esc(src) +
        '" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\'" />' +
        '<span class="asset-card-media-fallback" aria-hidden="true">' +
        esc(badge) +
        "</span>" +
        "</span>"
      );
    }
    return (
      '<span class="asset-card-media asset-card-media-empty">' +
      '<span class="asset-card-media-fallback" aria-hidden="true">' +
      esc(badge) +
      "</span>" +
      "</span>"
    );
  }

  function formatScore(score) {
    if (typeof score !== "number" || isNaN(score) || score <= 0) return "0";
    var n = Math.max(0, Math.min(5, score));
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(1);
  }

  function parseItemDate(raw) {
    if (raw == null || raw === "") return 0;
    if (typeof raw === "number" && isFinite(raw)) return raw > 0 ? raw : 0;
    var s = String(raw).trim();
    if (!s) return 0;
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return new Date(
        parseInt(m[1], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10),
        12,
        0,
        0,
        0
      ).getTime();
    }
    var t = Date.parse(s);
    return isNaN(t) ? 0 : t;
  }

  function itemPublishedAt(item) {
    if (!item) return 0;
    return parseItemDate(item.addedAt || item.publishedAt || item.createdAt || "");
  }

  /** Relative published label, e.g. "4 years ago". */
  function relativePublishedLabel(item) {
    var ms = itemPublishedAt(item);
    if (!ms) return "";
    var now = Date.now();
    var diff = Math.max(0, now - ms);
    var dayMs = 24 * 60 * 60 * 1000;
    var days = Math.floor(diff / dayMs);
    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return days + " days ago";
    var weeks = Math.floor(days / 7);
    if (days < 30) {
      return weeks === 1 ? "1 week ago" : weeks + " weeks ago";
    }
    var months = Math.floor(days / 30);
    if (days < 365) {
      return months <= 1 ? "1 month ago" : months + " months ago";
    }
    var years = Math.floor(days / 365);
    return years <= 1 ? "1 year ago" : years + " years ago";
  }

  function ratingHtml(item, kind) {
    if (isShutterstockItem(item)) return "";
    var countMode = isCountOnlyRating(item, kind);
    var repo = kind !== "assets" && item.githubRepo ? String(item.githubRepo) : "";
    var attrs = repo ? ' data-github-repo="' + esc(repo) + '"' : "";

    if (countMode) {
      var count = engagementCount(item, kind);
      var hasCount = count > 0;
      var title =
        item && (item.source === "sketchfab" || item.sketchfabUid)
          ? "Sketchfab likes"
          : repo
            ? "GitHub stars"
            : "Stars";
      var countInner = repo
        ? '<span data-star-count>' + count + "</span>"
        : String(count);
      return (
        '<span class="asset-card-rating asset-card-rating-count' +
        (hasCount ? "" : " asset-card-rating-empty") +
        '"' +
        attrs +
        ' title="' +
        esc(title) +
        '" data-rating-mode="count">' +
        '<span class="asset-stars" aria-hidden="true" data-star-glyph>' +
        countStarGlyph(count) +
        "</span>" +
        '<span class="asset-reviews">(' +
        countInner +
        ")</span>" +
        "</span>"
      );
    }

    var score = resolveScore(item, kind);
    var hasScore = score > 0;
    var countRaw =
      typeof item.ratingCount === "number" ? item.ratingCount : parseInt(item.ratingCount, 10);
    var total = !isNaN(countRaw) && countRaw >= 0 ? countRaw : 0;

    return (
      '<span class="asset-card-rating' +
      (hasScore ? "" : " asset-card-rating-empty") +
      '"' +
      attrs +
      ' title="Rating" data-rating-mode="average">' +
      '<span class="asset-stars" aria-hidden="true">' +
      starsGlyph(score) +
      "</span>" +
      '<span class="asset-score">' +
      formatScore(score) +
      "</span>" +
      '<span class="asset-reviews">(' +
      total +
      ")</span>" +
      "</span>"
    );
  }

  function cardCategoryHtml(item, kind) {
    var category = item.category || (kind === "assets" ? "Asset" : "Other");
    var parts = [category];
    if (kind === "assets") {
      var content =
        item.contentCategory ||
        (window.RogueCatalog &&
          typeof RogueCatalog.contentCategoryForAsset === "function" &&
          RogueCatalog.contentCategoryForAsset(item)) ||
        "";
      content = String(content || "").trim();
      if (content && content.toLowerCase() !== String(category).toLowerCase()) {
        parts.push(content);
      }
    }
    return (
      '<span class="asset-card-cats">' +
      parts
        .map(function (label) {
          return (
            '<span class="asset-card-cat">' +
            '<span class="asset-card-cat-icon" aria-hidden="true">' +
            categoryIcon(label) +
            "</span>" +
            '<span class="asset-card-cat-label">' +
            esc(label) +
            "</span>" +
            "</span>"
          );
        })
        .join("") +
      "</span>"
    );
  }

  function cardHtml(item, kind, opts) {
    opts = opts || {};
    var href = opts.href || "#";
    var rank = opts.rank;
    var ownerLogin = "";
    if (item.githubRepo) ownerLogin = String(item.githubRepo).split("/")[0] || "";
    if (!ownerLogin) ownerLogin = item.owner || "";
    var authorLabel =
      kind === "assets"
        ? item.authorName || item.author || item.owner || "Author"
        : ownerLogin || item.owner || "Author";
    var authorAttrs =
      kind !== "assets" && ownerLogin
        ? ' data-github-user="' + esc(ownerLogin) + '"'
        : "";
    var rankHtml =
      typeof rank === "number"
        ? '<span class="asset-card-rank" aria-label="Rank ' + rank + '">#' + rank + "</span>"
        : "";
    var agoLabel = relativePublishedLabel(item);
    var agoHtml = agoLabel
      ? '<span class="asset-card-ago" title="Published">' + esc(agoLabel) + "</span>"
      : '<span class="asset-card-ago asset-card-ago-empty" aria-hidden="true"></span>';

    return (
      '<li><a class="asset-card" href="' +
      esc(href) +
      '">' +
      rankHtml +
      mediaHtml(item, kind) +
      '<span class="asset-card-body">' +
      cardCategoryHtml(item, kind) +
      '<strong class="asset-card-title" data-tooltip="' +
      esc(item.name || "Untitled") +
      '">' +
      esc(item.name || "Untitled") +
      "</strong>" +
      ratingHtml(item, kind) +
      '<span class="asset-card-author"' +
      authorAttrs +
      ">" +
      esc(authorLabel) +
      "</span>" +
      '<span class="asset-card-foot">' +
      '<span class="asset-card-price">' +
      esc(priceLabel(item)) +
      "</span>" +
      agoHtml +
      "</span>" +
      "</span>" +
      "</a></li>"
    );
  }

  function ensureSiteFloatingTip() {
    var tip = document.getElementById("site-floating-tip");
    if (tip) return tip;
    tip = document.createElement("div");
    tip.id = "site-floating-tip";
    tip.className = "site-floating-tip";
    tip.hidden = true;
    tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
    return tip;
  }

  function wireCardTitleTooltips() {
    if (document.documentElement.getAttribute("data-card-tip-wired")) return;
    document.documentElement.setAttribute("data-card-tip-wired", "1");
    var tip = ensureSiteFloatingTip();
    var selector = ".asset-card-title[data-tooltip], .skill-name[data-tooltip]";
    var active = null;

    function hideTip() {
      active = null;
      tip.classList.remove("is-visible");
      tip.hidden = true;
    }

    function placeTip(anchor) {
      var text = String(anchor.getAttribute("data-tooltip") || "").trim();
      if (!text) {
        hideTip();
        return;
      }
      active = anchor;
      tip.textContent = text;
      tip.hidden = false;
      tip.classList.remove("is-visible");
      var rect = anchor.getBoundingClientRect();
      var tipWidth = tip.offsetWidth || 180;
      var tipHeight = tip.offsetHeight || 36;
      var left = rect.left + rect.width / 2 - tipWidth / 2;
      left = Math.min(Math.max(8, left), window.innerWidth - tipWidth - 8);
      var top = rect.bottom + 8;
      var placeAbove = top + tipHeight > window.innerHeight - 8;
      if (placeAbove) top = Math.max(8, rect.top - tipHeight - 8);
      tip.style.left = left + "px";
      tip.style.top = top + "px";
      tip.classList.toggle("is-above", placeAbove);
      requestAnimationFrame(function () {
        if (active === anchor) tip.classList.add("is-visible");
      });
    }

    document.addEventListener(
      "pointerover",
      function (event) {
        var el = event.target.closest ? event.target.closest(selector) : null;
        if (!el) return;
        placeTip(el);
      },
      true
    );
    document.addEventListener(
      "pointerout",
      function (event) {
        var el = event.target.closest ? event.target.closest(selector) : null;
        if (!el || el !== active) return;
        var next = event.relatedTarget;
        if (next && el.contains(next)) return;
        hideTip();
      },
      true
    );
    document.addEventListener(
      "focusin",
      function (event) {
        var el = event.target.closest ? event.target.closest(selector) : null;
        if (!el) return;
        placeTip(el);
      },
      true
    );
    document.addEventListener(
      "focusout",
      function (event) {
        var el = event.target.closest ? event.target.closest(selector) : null;
        if (!el || el !== active) return;
        hideTip();
      },
      true
    );
    window.addEventListener("scroll", hideTip, true);
    window.addEventListener("resize", hideTip);
  }

  window.RogueCards = {
    html: cardHtml,
    priceLabel: priceLabel,
    itemImage: itemImage,
    ratingFromLikes: ratingFromLikes,
    resolveScore: resolveScore,
    itemLikes: itemLikes,
    itemGithubStars: itemGithubStars,
    engagementCount: engagementCount,
    isCountOnlyRating: isCountOnlyRating,
    isShutterstockItem: isShutterstockItem,
    countStarGlyph: countStarGlyph,
    starsGlyph: starsGlyph,
    formatScore: formatScore,
    relativePublishedLabel: relativePublishedLabel,
    categoryIcon: categoryIcon,
    iconSvg: iconSvg,
    ensureFloatingTip: ensureSiteFloatingTip
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireCardTitleTooltips);
  } else {
    wireCardTitleTooltips();
  }
})();
