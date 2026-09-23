/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 12:56:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 20:00:00
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
  function isCountOnlyRating(item, kind) {
    if (!item) return kind === "servers" || kind === "skills";
    if (item.hasStarRating === true || item.ratingScale === 5) return false;
    if (item.ratingScale === "count" || item.ratingMode === "count") return true;
    if (item.source === "sketchfab" || item.sketchfabUid) return true;
    if (item.githubRepo || kind === "servers" || kind === "skills") return true;
    if (kind === "products" && item.source && item.source !== "gumroad") return true;
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
    return resolveScore({ likes: likes, source: "sketchfab" }, "products");
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
      (kind === "servers" ? "MCP" : kind === "products" ? "DIG" : String(item.name || "??").slice(0, 2).toUpperCase())
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
    var countMode = isCountOnlyRating(item, kind);
    var repo = kind !== "products" && item.githubRepo ? String(item.githubRepo) : "";
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

  function cardHtml(item, kind, opts) {
    opts = opts || {};
    var href = opts.href || "#";
    var rank = opts.rank;
    var category = item.category || (kind === "products" ? "Product" : "Other");
    var ownerLogin = "";
    if (item.githubRepo) ownerLogin = String(item.githubRepo).split("/")[0] || "";
    if (!ownerLogin) ownerLogin = item.owner || "";
    var authorLabel =
      kind === "products"
        ? item.authorName || item.author || item.owner || "Author"
        : ownerLogin || item.owner || "Author";
    var authorAttrs =
      kind !== "products" && ownerLogin
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
      '<span class="asset-card-cat">' +
      esc(category) +
      "</span>" +
      '<strong class="asset-card-title">' +
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
    countStarGlyph: countStarGlyph,
    starsGlyph: starsGlyph,
    formatScore: formatScore,
    relativePublishedLabel: relativePublishedLabel
  };
})();
