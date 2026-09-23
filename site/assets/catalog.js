/*
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 10:46:47
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 19:55:00
 */
(function () {
  var root = document.querySelector("[data-catalog]");
  if (!root || !window.RogueCatalog) return;

  var kind = root.getAttribute("data-catalog");
  var mode = root.getAttribute("data-mode") || "all";
  var filterStyle = root.getAttribute("data-filter-style") || mode;
  var PAGE_SIZE_OPTIONS = [6, 12, 24, 48, 96];
  var items = [];
  var expandedNodes = {};
  var kindTreeCache = null;
  var label =
    kind === "skills" ? "skills" : kind === "products" ? "products" : "MCP servers";

  function siteRoot() {
    return (window.RogueSite && RogueSite.root && RogueSite.root()) || "/";
  }

  function syncItems() {
    if (kind === "skills") items = (RogueCatalog.skills || []).slice();
    else if (kind === "products") items = (RogueCatalog.products || []).slice();
    else items = (RogueCatalog.servers || []).slice();
    kindTreeCache = null;
  }

  syncItems();
  var params = new URLSearchParams(window.location.search);

  function parsePageSize() {
    var raw = parseInt(params.get("perPage") || params.get("size") || "", 10);
    if (PAGE_SIZE_OPTIONS.indexOf(raw) >= 0) return raw;
    var fallback = parseInt(RogueCatalog.pageSize, 10) || 12;
    if (PAGE_SIZE_OPTIONS.indexOf(fallback) >= 0) return fallback;
    return 12;
  }

  function parseListParam(key) {
    var all = params.getAll(key);
    if (all.length > 1) {
      return all
        .map(function (v) {
          return String(v || "").trim();
        })
        .filter(Boolean);
    }
    var raw = (params.get(key) || "").trim();
    if (!raw) return [];
    return raw
      .split(",")
      .map(function (v) {
        return v.trim();
      })
      .filter(Boolean);
  }

  var PRICE_BUCKETS = [
    { id: "free", label: "Free" },
    { id: "under-20", label: "Under $20" },
    { id: "20-50", label: "$20 – $50" },
    { id: "50-100", label: "$50 – $100" },
    { id: "100-200", label: "$100 – $200" },
    { id: "over-200", label: "Over $200" }
  ];

  var RATING_BUCKETS = [
    { id: "5", label: "5 stars", stars: 5 },
    { id: "4", label: "4 stars", stars: 4 },
    { id: "3", label: "3 stars", stars: 3 },
    { id: "2", label: "2 stars", stars: 2 },
    { id: "1", label: "1 star", stars: 1 },
    { id: "0", label: "Unrated", stars: 0 }
  ];

  var RELEASE_BUCKETS = [
    { id: "1d", label: "Last day", days: 1 },
    { id: "1w", label: "Last week", days: 7 },
    { id: "1m", label: "Last month", days: 30 },
    { id: "3m", label: "Last 3 months", days: 90 },
    { id: "6m", label: "Last 6 months", days: 180 },
    { id: "1y", label: "Last year", days: 365 },
    { id: "older-1y", label: "Older than 1 year", olderThanDays: 365 }
  ];

  var SORT_OPTIONS = [
    { id: "relevance", label: "Relevance" },
    { id: "popularity", label: "Popularity" },
    { id: "rating-asc", label: "Rating (Low to High)" },
    { id: "rating-desc", label: "Rating (High to Low)" },
    { id: "published-asc", label: "Published Date (Oldest)" },
    { id: "published-desc", label: "Published Date (Newest)" },
    { id: "updated-asc", label: "Recently Updated (Oldest)" },
    { id: "updated-desc", label: "Recently Updated (Newest)" },
    { id: "price-asc", label: "Price (Low to High)" },
    { id: "price-desc", label: "Price (High to Low)" }
  ];

  var SORT_ALIASES = {
    rating: "rating-desc",
    published: "published-desc",
    updated: "updated-desc"
  };

  function parseSort() {
    var raw = (params.get("sort") || "relevance").trim().toLowerCase();
    if (SORT_ALIASES[raw]) raw = SORT_ALIASES[raw];
    for (var i = 0; i < SORT_OPTIONS.length; i++) {
      if (SORT_OPTIONS[i].id === raw) return raw;
    }
    return "relevance";
  }

  function parseBucketIds(paramKey, buckets) {
    var fromParam = parseListParam(paramKey);
    if (!fromParam.length) return [];
    var allowed = {};
    buckets.forEach(function (b) {
      allowed[b.id] = true;
    });
    return fromParam.filter(function (id) {
      return allowed[id];
    });
  }

  function parsePriceBuckets() {
    var fromParam = parseBucketIds("price", PRICE_BUCKETS);
    if (fromParam.length) return fromParam;
    var minP = params.has("minPrice") ? parseFloat(params.get("minPrice")) : null;
    var maxP = params.has("maxPrice") ? parseFloat(params.get("maxPrice")) : null;
    if (minP != null && isNaN(minP)) minP = null;
    if (maxP != null && isNaN(maxP)) maxP = null;
    if (maxP === 0 && (minP == null || minP === 0)) return ["free"];
    return [];
  }

  var state = {
    page: Math.max(1, parseInt(params.get("page") || "1", 10) || 1),
    pageSize: parsePageSize(),
    query: (params.get("q") || "").trim(),
    categories: parseListParam("category"),
    tags: parseListParam("tag"),
    range: (params.get("range") || "all-time").trim() === "new" ? "new" : "all-time",
    priceBuckets: parsePriceBuckets(),
    ratingBuckets: parseBucketIds("rating", RATING_BUCKETS),
    releaseBuckets: parseBucketIds("released", RELEASE_BUCKETS),
    sort: parseSort()
  };

  function hasCategoryFilter() {
    return state.categories.length > 0;
  }

  function hasTagFilter() {
    return state.tags.length > 0;
  }

  function isCategorySelected(name) {
    var key = String(name || "").toLowerCase();
    return state.categories.some(function (c) {
      return c.toLowerCase() === key;
    });
  }

  function parseScopedTag(value) {
    var raw = String(value || "");
    var idx = raw.indexOf("::");
    if (idx === -1) return { category: "", label: raw };
    return {
      category: raw.slice(0, idx),
      label: raw.slice(idx + 2)
    };
  }

  function scopeTagKey(categoryLabel, label) {
    var tag = String(label || "").trim();
    if (!tag) return "";
    var cat = String(categoryLabel || "").trim();
    return cat ? cat + "::" + tag : tag;
  }

  function isTagSelected(name, categoryLabel) {
    var key = String(name || "").toLowerCase();
    if (!key) return false;
    if (categoryLabel) {
      var scoped = String(categoryLabel).toLowerCase() + "::" + key;
      return state.tags.some(function (t) {
        return t.toLowerCase() === scoped;
      });
    }
    return state.tags.some(function (t) {
      var parsed = parseScopedTag(t);
      return parsed.label.toLowerCase() === key;
    });
  }

  function toggleListValue(list, value, on) {
    var key = String(value || "").toLowerCase();
    var next = list.filter(function (v) {
      return v.toLowerCase() !== key;
    });
    if (on && value) next.push(value);
    return next;
  }

  function itemHref(item) {
    if (window.RogueSite && RogueSite.detailPath) {
      return RogueSite.detailPath(kind, item);
    }
    var root = siteRoot();
    var repo = item.githubRepo || "";
    if (repo) return root + kind + "/detail/?repo=" + encodeURIComponent(repo);
    if (kind === "skills") return root + "skills/" + item.slug + "/";
    return root + "servers/" + item.slug + "/";
  }

  function itemLinkAttrs() {
    return "";
  }

  function emptyMessage() {
    var hasFilter = !!(
      state.query ||
      hasCategoryFilter() ||
      hasTagFilter() ||
      state.priceBuckets.length ||
      state.ratingBuckets.length ||
      state.releaseBuckets.length
    );
    if (hasFilter) return "No results found.";
    if (kind === "products") {
      if (!RogueCatalog.productsLoaded && !(RogueCatalog.products || []).length) return "Loading…";
      return "No products yet.";
    }
    if (!RogueCatalog.loaded) return "Loading…";
    return kind === "skills" ? "No skills yet." : "No MCP servers yet.";
  }

  function itemPrice(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    return isNaN(n) ? 0 : n;
  }

  function itemRatingStars(item) {
    if (window.RogueCards && typeof RogueCards.resolveScore === "function") {
      var resolved = RogueCards.resolveScore(item, kind);
      if (resolved > 0) return Math.round(Math.max(1, Math.min(5, resolved)));
      return 0;
    }
    var n = typeof item.rating === "number" ? item.rating : parseFloat(item.rating);
    if (isNaN(n) || n <= 0) return 0;
    return Math.round(Math.max(1, Math.min(5, n)));
  }

  /** Parse catalog dates; YYYY-MM-DD uses local calendar noon to avoid UTC edge cases. */
  function parseCatalogDate(raw) {
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

  function startOfLocalDay(ms) {
    var d = new Date(ms);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
  }

  function itemAddedTime(item) {
    if (!item) return 0;
    return parseCatalogDate(item.addedAt || item.publishedAt || item.createdAt || "");
  }

  function itemUpdatedTime(item) {
    if (!item) return 0;
    return parseCatalogDate(
      item.updatedAt || item.pushedAt || item.addedAt || item.publishedAt || item.createdAt || ""
    );
  }

  function itemNameKey(item) {
    return String((item && item.name) || "").toLowerCase();
  }

  function priceInBucket(price, bucket) {
    if (!bucket) return false;
    if (bucket.id === "free") return price <= 0;
    if (bucket.id === "under-20") return price > 0 && price < 20;
    if (bucket.id === "20-50") return price >= 20 && price < 50;
    if (bucket.id === "50-100") return price >= 50 && price < 100;
    if (bucket.id === "100-200") return price >= 100 && price < 200;
    if (bucket.id === "over-200") return price >= 200;
    return false;
  }

  function ratingInBucket(stars, bucket) {
    if (!bucket) return false;
    var n = typeof stars === "number" && !isNaN(stars) ? stars : 0;
    if (bucket.stars === 0) return n <= 0;
    if (n <= 0) return false;
    return n === bucket.stars;
  }

  /** Inclusive last N local calendar days, or older-than window for archive items. */
  function releaseInBucket(addedMs, bucket) {
    if (!bucket || !addedMs) return false;
    var todayStart = startOfLocalDay(Date.now());
    var dayMs = 24 * 60 * 60 * 1000;
    if (typeof bucket.olderThanDays === "number" && bucket.olderThanDays > 0) {
      var olderCutoff = todayStart - bucket.olderThanDays * dayMs;
      return addedMs < olderCutoff;
    }
    if (typeof bucket.days !== "number" || bucket.days <= 0) return false;
    var cutoff = todayStart - (bucket.days - 1) * dayMs;
    return addedMs >= cutoff;
  }

  function bucketById(buckets, id) {
    for (var i = 0; i < buckets.length; i++) {
      if (buckets[i].id === id) return buckets[i];
    }
    return null;
  }

  function itemMatchesPriceBuckets(item) {
    if (!state.priceBuckets.length) return true;
    var price = itemPrice(item);
    return state.priceBuckets.some(function (id) {
      return priceInBucket(price, bucketById(PRICE_BUCKETS, id));
    });
  }

  function itemMatchesRatingBuckets(item) {
    if (!state.ratingBuckets.length) return true;
    var stars = itemRatingStars(item);
    return state.ratingBuckets.some(function (id) {
      return ratingInBucket(stars, bucketById(RATING_BUCKETS, id));
    });
  }

  function itemMatchesReleaseBuckets(item) {
    if (!state.releaseBuckets.length) return true;
    var added = itemAddedTime(item);
    return state.releaseBuckets.some(function (id) {
      return releaseInBucket(added, bucketById(RELEASE_BUCKETS, id));
    });
  }

  function priceLabel(item) {
    var n = itemPrice(item);
    if (n <= 0) return "Free";
    if (Number.isInteger(n)) return "$" + n;
    return "$" + n.toFixed(2);
  }

  function priceHtml(item) {
    return '<span class="price-pill" title="Price">' + priceLabel(item) + "</span>";
  }

  function searchHref(category) {
    return siteRoot() + kind + "/search/?category=" + encodeURIComponent(category);
  }

  function searchTagHref(tag) {
    return siteRoot() + kind + "/search/?tag=" + encodeURIComponent(tag);
  }

  function itemTags(item) {
    var raw = Array.isArray(item.tags) ? item.tags : [];
    if (kind !== "products") return raw;
    var out = [];
    var seen = {};
    raw.forEach(function (tag) {
      String(tag)
        .split(/\s*›\s*/)
        .forEach(function (part) {
          part = part.trim();
          if (!part) return;
          var key = part.toLowerCase();
          if (seen[key]) return;
          seen[key] = true;
          out.push(part);
        });
    });
    return out;
  }

  function cardHtml(item, rank) {
    if (window.RogueCards && RogueCards.html) {
      return RogueCards.html(item, kind, {
        href: itemHref(item),
        rank: mode === "top" ? rank : undefined
      });
    }
    var votes = typeof item.votes === "number" ? item.votes : item.stars || 0;
    return (
      '<li><a class="skill-card market-card" href="' +
      itemHref(item) +
      '"><strong class="skill-name">' +
      item.name +
      '</strong><span class="skill-desc">' +
      item.description +
      '</span><span class="card-foot"><span class="pill">' +
      item.category +
      '</span><span class="price-pill">' +
      priceLabel(item) +
      "</span> ★ " +
      votes +
      "</span></a></li>"
    );
  }

  function filteredItems() {
    var list = items.slice();

    if (mode === "top") {
      if (state.range === "new") {
        list.sort(function (a, b) {
          var tb = itemAddedTime(b);
          var ta = itemAddedTime(a);
          if (!ta && !tb) return itemNameKey(a).localeCompare(itemNameKey(b));
          if (!ta) return 1;
          if (!tb) return -1;
          if (tb !== ta) return tb - ta;
          return itemNameKey(a).localeCompare(itemNameKey(b));
        });
      } else {
        list.sort(function (a, b) {
          var vb = (b.votes != null ? b.votes : b.stars) || 0;
          var va = (a.votes != null ? a.votes : a.stars) || 0;
          if (vb !== va) return vb - va;
          return (a.rank || 999) - (b.rank || 999);
        });
      }
      list = list.slice(0, 100);
    }

    if (hasCategoryFilter() || hasTagFilter()) {
      list = list.filter(function (item) {
        var catOk =
          hasCategoryFilter() &&
          state.categories.some(function (c) {
            return item.category.toLowerCase() === c.toLowerCase();
          });
        var tagOk =
          hasTagFilter() &&
          itemTags(item).some(function (tag) {
            var tagKey = tag.toLowerCase();
            return state.tags.some(function (t) {
              var parsed = parseScopedTag(t);
              if (parsed.category) {
                if (item.category.toLowerCase() !== parsed.category.toLowerCase()) {
                  return false;
                }
                return tagKey === parsed.label.toLowerCase();
              }
              return tagKey === t.toLowerCase();
            });
          });
        return catOk || tagOk;
      });
    }
    if (state.query) {
      var q = state.query.toLowerCase();
      list = list.filter(function (item) {
        var hay = (item.name + " " + item.description + " " + item.category + " " + item.owner + " " + itemTags(item).join(" "))
          .toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }
    if (state.priceBuckets.length) {
      list = list.filter(itemMatchesPriceBuckets);
    }
    if (state.ratingBuckets.length) {
      list = list.filter(itemMatchesRatingBuckets);
    }
    if (state.releaseBuckets.length) {
      list = list.filter(itemMatchesReleaseBuckets);
    }
    if (mode !== "top") {
      list = sortItems(list);
    }
    return list;
  }

  function sortItems(list) {
    var sorted = list.slice();
    var key = state.sort || "relevance";
    function popularity(item) {
      if (window.RogueCards && typeof RogueCards.engagementCount === "function") {
        return RogueCards.engagementCount(item, kind);
      }
      return (item.votes != null ? item.votes : item.stars) || 0;
    }
    function compareTime(a, b, asc) {
      var ta = itemAddedTime(a);
      var tb = itemAddedTime(b);
      var aMissing = !ta;
      var bMissing = !tb;
      if (aMissing && bMissing) return itemNameKey(a).localeCompare(itemNameKey(b));
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (ta !== tb) return asc ? ta - tb : tb - ta;
      return itemNameKey(a).localeCompare(itemNameKey(b));
    }
    function compareUpdated(a, b, asc) {
      var ta = itemUpdatedTime(a);
      var tb = itemUpdatedTime(b);
      var aMissing = !ta;
      var bMissing = !tb;
      if (aMissing && bMissing) return itemNameKey(a).localeCompare(itemNameKey(b));
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (ta !== tb) return asc ? ta - tb : tb - ta;
      return itemNameKey(a).localeCompare(itemNameKey(b));
    }
    if (key === "popularity") {
      sorted.sort(function (a, b) {
        var pb = popularity(b);
        var pa = popularity(a);
        if (pb !== pa) return pb - pa;
        return itemNameKey(a).localeCompare(itemNameKey(b));
      });
    } else if (key === "rating-asc" || key === "rating") {
      sorted.sort(function (a, b) {
        var ra = itemRatingStars(a);
        var rb = itemRatingStars(b);
        if (ra !== rb) return ra - rb;
        return popularity(a) - popularity(b);
      });
    } else if (key === "rating-desc") {
      sorted.sort(function (a, b) {
        var rb = itemRatingStars(b);
        var ra = itemRatingStars(a);
        if (rb !== ra) return rb - ra;
        return popularity(b) - popularity(a);
      });
    } else if (key === "published-asc") {
      sorted.sort(function (a, b) {
        return compareTime(a, b, true);
      });
    } else if (key === "published-desc" || key === "published") {
      sorted.sort(function (a, b) {
        return compareTime(a, b, false);
      });
    } else if (key === "updated-asc") {
      sorted.sort(function (a, b) {
        return compareUpdated(a, b, true);
      });
    } else if (key === "updated-desc" || key === "updated") {
      sorted.sort(function (a, b) {
        return compareUpdated(a, b, false);
      });
    } else if (key === "price-asc") {
      sorted.sort(function (a, b) {
        var d = itemPrice(a) - itemPrice(b);
        if (d !== 0) return d;
        return itemNameKey(a).localeCompare(itemNameKey(b));
      });
    } else if (key === "price-desc") {
      sorted.sort(function (a, b) {
        var d = itemPrice(b) - itemPrice(a);
        if (d !== 0) return d;
        return itemNameKey(a).localeCompare(itemNameKey(b));
      });
    }
    return sorted;
  }

  function listBeforeFacets(skipKey) {
    var savedPrice = state.priceBuckets;
    var savedRating = state.ratingBuckets;
    var savedRelease = state.releaseBuckets;
    if (skipKey === "price" || skipKey === "all") state.priceBuckets = [];
    if (skipKey === "rating" || skipKey === "all") state.ratingBuckets = [];
    if (skipKey === "release" || skipKey === "all") state.releaseBuckets = [];
    try {
      return filteredItems();
    } finally {
      state.priceBuckets = savedPrice;
      state.ratingBuckets = savedRating;
      state.releaseBuckets = savedRelease;
    }
  }

  function syncUrl() {
    var next = new URLSearchParams();
    if (state.query) next.set("q", state.query);
    state.categories.forEach(function (c) {
      next.append("category", c);
    });
    state.tags.forEach(function (t) {
      next.append("tag", t);
    });
    if (mode === "top" && state.range !== "all-time") next.set("range", state.range);
    state.priceBuckets.forEach(function (id) {
      next.append("price", id);
    });
    state.ratingBuckets.forEach(function (id) {
      next.append("rating", id);
    });
    state.releaseBuckets.forEach(function (id) {
      next.append("released", id);
    });
    if (state.sort && state.sort !== "relevance") next.set("sort", state.sort);
    if (state.pageSize && state.pageSize !== 12) next.set("perPage", String(state.pageSize));
    if (state.page > 1) next.set("page", String(state.page));
    var qs = next.toString();
    var url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    history.replaceState(null, "", url);
  }

  function resultsMetaText(total, page, pages) {
    if (!total) return "0 results";
    return (
      "Page " +
      page +
      " of " +
      pages +
      " · " +
      total +
      " result" +
      (total === 1 ? "" : "s")
    );
  }

  function updateFacetResultsMeta(total, page, pages) {
    var meta = document.querySelector("[data-facet-results-meta]");
    if (!meta) return;
    meta.textContent = resultsMetaText(total, page, pages);
  }

  function renderPager(total, page, pages) {
    updateFacetResultsMeta(total, page, pages);
    var host = root.querySelector("[data-catalog-pager]");
    if (!host) return;
    if (pages <= 1) {
      host.innerHTML = "";
      return;
    }

    var buttons = "";
    buttons += '<button type="button" class="pager-btn" data-page="' + (page - 1) + '"' +
      (page <= 1 ? " disabled" : "") + ">Prev</button>";

    var windowSize = 5;
    var start = Math.max(1, page - Math.floor(windowSize / 2));
    var end = Math.min(pages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    for (var i = start; i <= end; i++) {
      buttons += '<button type="button" class="pager-btn' + (i === page ? " is-active" : "") +
        '" data-page="' + i + '">' + i + "</button>";
    }

    buttons += '<button type="button" class="pager-btn" data-page="' + (page + 1) + '"' +
      (page >= pages ? " disabled" : "") + ">Next</button>";

    host.innerHTML = '<div class="pager-controls">' + buttons + "</div>";

    host.querySelectorAll("[data-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nextPage = parseInt(btn.getAttribute("data-page"), 10);
        if (!nextPage || nextPage < 1 || nextPage > pages || nextPage === state.page) return;
        state.page = nextPage;
        syncUrl();
        render();
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function renderList() {
    var list = filteredItems();
    var pages = Math.max(1, Math.ceil(list.length / state.pageSize) || 1);
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.pageSize;
    var pageItems = list.slice(start, start + state.pageSize);
    var ul = root.querySelector("[data-catalog-list]");
    if (!ul) return;
    if (!pageItems.length) {
      ul.innerHTML = '<li class="empty-state">' + emptyMessage() + "</li>";
      var emptyPager = root.querySelector("[data-catalog-pager]");
      if (emptyPager) emptyPager.innerHTML = "";
      updateFacetResultsMeta(list.length, state.page, pages);
    } else {
      ul.innerHTML = pageItems.map(function (item, index) {
        return cardHtml(item, start + index + 1);
      }).join("");
      renderPager(list.length, state.page, pages);
    }
  }

  function countForCategory(name) {
    return items.filter(function (item) {
      return item.category.toLowerCase() === name.toLowerCase();
    }).length;
  }

  function countForTag(name) {
    return items.filter(function (item) {
      return itemTags(item).some(function (tag) {
        return tag.toLowerCase() === name.toLowerCase();
      });
    }).length;
  }

  function iconSvg(paths) {
    return (
      '<svg class="category-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      paths +
      "</svg>"
    );
  }

  function catalogCategories() {
    if (kind === "products") return RogueCatalog.productCategories || [];
    return RogueCatalog.categories || [];
  }

  function catalogTags() {
    if (kind === "products") {
      if (state.categories.length === 1 && RogueCatalog.productTagsByCategory) {
        var scoped = RogueCatalog.productTagsByCategory[state.categories[0]];
        if (Array.isArray(scoped) && scoped.length) return scoped.slice();
      }
      return (RogueCatalog.productTags || []).slice();
    }
    return (RogueCatalog.tags || []).slice();
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
      other: iconSvg('<circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l2.5 2.5"></path>'),
      official: iconSvg('<path d="M12 3l2 5h5l-4 3.5 1.5 5.5L12 14l-4.5 3 1.5-5.5L5 8h5z"></path>')
    };
    return map[key] || iconSvg('<rect x="5" y="5" width="14" height="14" rx="2"></rect><path d="M9 12h6M12 9v6"></path>');
  }

  function tagIcon() {
    return iconSvg('<path d="M4 10V5h5l9 9-5 5z"></path><circle cx="8" cy="8" r="1.2"></circle>');
  }

  function renderCategories() {
    var host = root.querySelector("[data-catalog-categories]");
    if (!host) return;
    var cats = catalogCategories();
    host.innerHTML =
      '<ul class="category-grid">' +
      cats.map(function (name) {
        var count = countForCategory(name);
        return (
          '<li><a class="category-card" href="' + searchHref(name) + '">' +
            '<span class="category-icon" aria-hidden="true">' + categoryIcon(name) + "</span>" +
            '<span class="category-name">' + name + "</span>" +
            '<span class="category-count">' + count + " " + label + "</span>" +
          "</a></li>"
        );
      }).join("") +
      "</ul>";
  }

  function renderTags() {
    var host = root.querySelector("[data-catalog-tags-grid]");
    if (!host) return;
    var tags = catalogTags();
    host.innerHTML =
      '<ul class="category-grid tag-grid">' +
      tags.map(function (name) {
        var count = countForTag(name);
        return (
          '<li><a class="category-card tag-card" href="' + searchTagHref(name) + '">' +
            '<span class="category-icon" aria-hidden="true">' + tagIcon() + "</span>" +
            '<span class="category-name">' + name + "</span>" +
            '<span class="category-count">' + count + " " + label + "</span>" +
          "</a></li>"
        );
      }).join("") +
      "</ul>";
  }

  function render() {
    if (mode === "categories") {
      renderCategories();
      return;
    }
    if (mode === "tags") {
      renderTags();
      return;
    }
    renderList();
    refreshBrowseFacetsUI();
    if (typeof window.refreshGithubStars === "function") {
      window.refreshGithubStars(root);
    }
    if (typeof window.refreshGithubAuthors === "function") {
      window.refreshGithubAuthors(root);
    }
  }

  function syncChipActive(chipHost) {
    chipHost.querySelectorAll("[data-category]").forEach(function (el) {
      var value = el.getAttribute("data-category") || "";
      var active = value === ""
        ? !hasCategoryFilter()
        : isCategorySelected(value);
      el.classList.toggle("is-active", active);
    });
  }

  function syncTagActive(tagHost) {
    tagHost.querySelectorAll("[data-tag]").forEach(function (el) {
      var value = el.getAttribute("data-tag") || "";
      var active = value === ""
        ? !hasTagFilter()
        : isTagSelected(value);
      el.classList.toggle("is-active", active);
    });
  }

  function setSingleCategory(name) {
    state.categories = name ? [name] : [];
    if (kind === "products" && state.tags.length) {
      var allowed = catalogTags().map(function (t) {
        return t.toLowerCase();
      });
      state.tags = state.tags.filter(function (t) {
        var label = parseScopedTag(t).label || t;
        return allowed.indexOf(label.toLowerCase()) !== -1;
      });
    }
  }

  function setSingleTag(name) {
    state.tags = name ? [name] : [];
  }

  function wireFilters() {
    var input =
      document.querySelector("[data-site-search]") ||
      document.querySelector("[data-catalog-search]");
    if (input && !input.getAttribute("data-wired")) {
      input.setAttribute("data-wired", "1");
      input.value = state.query;
      input.addEventListener("input", function () {
        state.query = input.value.trim();
        state.page = 1;
        syncUrl();
        render();
      });
    } else if (input) {
      input.value = state.query;
    }

    refreshFilterChips();
  }

  function escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function slugifyLabel(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function titleCaseTag(raw) {
    var special = {
      mcp: "MCP",
      ml: "ML",
      ai: "AI",
      api: "API",
      ui: "UI",
      ux: "UX",
      db: "DB",
      devops: "DevOps",
      github: "GitHub",
      gitlab: "GitLab",
      openai: "OpenAI",
      "chrome-devtools": "Chrome DevTools"
    };
    var key = String(raw || "").toLowerCase();
    if (special[key]) return special[key];
    return key
      .split("-")
      .filter(Boolean)
      .map(function (part) {
        if (special[part]) return special[part];
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function nestTagNodes(tagMap, parentId) {
    var keys = Object.keys(tagMap).sort(function (a, b) {
      return a.length - b.length || a.localeCompare(b);
    });
    var nodes = {};
    keys.forEach(function (key) {
      var raw = tagMap[key];
      nodes[key] = {
        id: "",
        slug: key,
        label: raw,
        displayLabel: titleCaseTag(raw),
        children: []
      };
    });
    var roots = [];
    keys.forEach(function (key) {
      var parentKey = "";
      keys.forEach(function (cand) {
        if (cand === key) return;
        if (key.indexOf(cand + "-") === 0) {
          if (!parentKey || cand.length > parentKey.length) parentKey = cand;
        }
      });
      if (parentKey && nodes[parentKey]) {
        nodes[parentKey].children.push(nodes[key]);
      } else {
        roots.push(nodes[key]);
      }
    });

    function assignIds(node, baseId) {
      node.id = baseId + "/" + node.slug;
      node.children
        .sort(function (a, b) {
          return String(a.displayLabel || a.label).localeCompare(
            String(b.displayLabel || b.label)
          );
        })
        .forEach(function (child) {
          assignIds(child, node.id);
        });
    }

    roots
      .sort(function (a, b) {
        return String(a.displayLabel || a.label).localeCompare(
          String(b.displayLabel || b.label)
        );
      })
      .forEach(function (node) {
        assignIds(node, parentId);
      });
    return roots;
  }

  function categorySeedTags(cat) {
    var seeds = {
      "Developer Tools": ["developer-tools", "mcp", "mcp-server"],
      "Data Science & ML": ["data-science-ml", "machine-learning", "ml"],
      "API Development": ["api-development", "api"],
      "Productivity & Workflow": ["productivity-workflow", "automation"],
      "Analytics & Monitoring": ["analytics-monitoring", "monitoring"],
      "Security & Testing": ["security-testing", "security", "testing"],
      "Web Scraping & Data Collection": ["web-scraping", "scraping"],
      "Deployment & DevOps": ["deployment-devops", "devops", "ci-cd"],
      "Learning & Documentation": ["learning-documentation", "docs"],
      "Database Management": ["database-management", "database"],
      "Content Management": ["content-management", "cms"],
      "Collaboration Tools": ["collaboration-tools", "atlassian", "jira", "linear", "confluence"],
      "Cloud Infrastructure": ["cloud-infrastructure", "cloud"],
      "Marketing Automation": ["marketing-automation", "marketing"],
      "E-commerce Solutions": ["e-commerce", "ecommerce"],
      "Design Tools": ["design-tools", "blender", "illustrator", "photoshop", "3d", "sculpting"],
      "Browser Automation": ["browser-automation", "playwright", "chrome-devtools", "cdp"],
      "Social Media Management": ["social-media-management", "youtube", "publishing"],
      "Game Development": ["game-development", "gamedev"],
      "Mobile Development": ["mobile-development", "mobile"],
      Other: ["other"],
      Official: ["official"]
    };
    return (seeds[cat] || []).slice();
  }

  function buildKindTaxonomyTree() {
    var catOrder = catalogCategories();
    var byCat = {};
    catOrder.forEach(function (name) {
      byCat[name] = {};
      categorySeedTags(name).forEach(function (tag) {
        var raw = String(tag || "").trim();
        if (!raw) return;
        byCat[name][raw.toLowerCase()] = raw;
      });
    });

    items.forEach(function (item) {
      var cat = item.category || "Other";
      if (!byCat[cat]) byCat[cat] = {};
      itemTags(item).forEach(function (tag) {
        var raw = String(tag || "").trim();
        if (!raw) return;
        var key = raw.toLowerCase();
        if (!byCat[cat][key]) byCat[cat][key] = raw;
      });
    });

    return catOrder.map(function (cat) {
      var catId = slugifyLabel(cat);
      return {
        id: catId,
        slug: catId,
        label: cat,
        children: nestTagNodes(byCat[cat] || {}, catId)
      };
    });
  }

  function taxonomyTree() {
    if (kind === "products") return (RogueCatalog.productTaxonomyTree || []).slice();
    if (!kindTreeCache) kindTreeCache = buildKindTaxonomyTree();
    return kindTreeCache.slice();
  }

  function countForNode(node, categoryLabel) {
    if (!node) return 0;
    if (!node.children || !node.children.length) {
      if (categoryLabel) {
        return items.filter(function (item) {
          return (
            item.category.toLowerCase() === categoryLabel.toLowerCase() &&
            itemTags(item).some(function (tag) {
              return tag.toLowerCase() === node.label.toLowerCase();
            })
          );
        }).length;
      }
      return countForTag(node.label);
    }
    if (!categoryLabel) return countForCategory(node.label);
    if (kind !== "products") {
      var labels = collectNodeLabels(node);
      return items.filter(function (item) {
        if (item.category.toLowerCase() !== categoryLabel.toLowerCase()) return false;
        return itemTags(item).some(function (tag) {
          return labels.some(function (label) {
            return tag.toLowerCase() === label.toLowerCase();
          });
        });
      }).length;
    }
    return items.filter(function (item) {
      return (
        item.category.toLowerCase() === categoryLabel.toLowerCase() &&
        itemTags(item).some(function (tag) {
          return tag.toLowerCase() === node.label.toLowerCase();
        })
      );
    }).length;
  }

  function isNodeChecked(node, categoryLabel, depth) {
    return nodeCheckState(node, categoryLabel, depth) === "checked";
  }

  function nodeCheckState(node, categoryLabel, depth) {
    if (!node) return "unchecked";
    if (depth === 0) {
      if (isCategorySelected(node.label)) return "checked";
      var rootLabels = collectDescendantLabels(node);
      if (!rootLabels.length) return "unchecked";
      var selected = 0;
      rootLabels.forEach(function (label) {
        if (isTagSelected(label, node.label)) selected += 1;
      });
      if (selected === 0) return "unchecked";
      if (selected === rootLabels.length) return "checked";
      return "indeterminate";
    }
    if (categoryLabel && isCategorySelected(categoryLabel)) return "checked";
    var kids = node.children || [];
    if (kids.length) {
      var labels = collectNodeLabels(node);
      var hit = 0;
      labels.forEach(function (label) {
        if (isTagSelected(label, categoryLabel)) hit += 1;
      });
      if (hit === 0) return "unchecked";
      if (hit === labels.length) return "checked";
      return "indeterminate";
    }
    return isTagSelected(node.label, categoryLabel) ? "checked" : "unchecked";
  }

  function findTreeChildren(host, id) {
    if (!host || !id) return null;
    var nodes = host.querySelectorAll("[data-tree-children]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getAttribute("data-tree-children") === id) return nodes[i];
    }
    return null;
  }

  function applyExpandState(host, id, expanded) {
    var children = findTreeChildren(host, id);
    if (children) {
      children.hidden = !expanded;
      children.classList.toggle("is-collapsed", !expanded);
    }
    host.querySelectorAll("[data-tree-toggle]").forEach(function (btn) {
      if (btn.getAttribute("data-tree-toggle") !== id) return;
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">' +
        (expanded
          ? '<path d="M6 9l6 6 6-6"></path>'
          : '<path d="M9 6l6 6-6 6"></path>') +
        "</svg>";
      var row = btn.closest(".filter-tree-row");
      if (row) row.classList.toggle("is-expanded", expanded);
    });
  }

  function renderTreeNode(node, depth, categoryLabel) {
    var children = node.children || [];
    var hasChildren = children.length > 0;
    var expanded = !!expandedNodes[node.id];
    var catLabel = depth === 0 ? node.label : categoryLabel;
    var count = countForNode(node, depth === 0 ? "" : catLabel);
    var checkState = nodeCheckState(node, catLabel, depth);
    var checked = checkState === "checked";
    var indeterminate = checkState === "indeterminate";
    var labelText = node.displayLabel || node.label;
    var iconHtml =
      depth === 0
        ? '<span class="filter-tree-icon" aria-hidden="true">' + categoryIcon(node.label) + "</span>"
        : '<span class="filter-tree-icon filter-tree-icon-tag" aria-hidden="true">' + tagIcon() + "</span>";
    var toggle = hasChildren
      ? '<button type="button" class="filter-tree-toggle" data-tree-toggle="' +
        escAttr(node.id) +
        '" aria-expanded="' +
        (expanded ? "true" : "false") +
        '" aria-label="' +
        (expanded ? "Collapse" : "Expand") +
        " " +
        escAttr(labelText) +
        '">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">' +
        (expanded
          ? '<path d="M6 9l6 6 6-6"></path>'
          : '<path d="M9 6l6 6-6 6"></path>') +
        "</svg>" +
        "</button>"
      : '<span class="filter-tree-toggle is-empty" aria-hidden="true"></span>';

    var row =
      '<div class="filter-tree-row' +
      (checked ? " is-checked" : "") +
      (indeterminate ? " is-indeterminate" : "") +
      (expanded ? " is-expanded" : "") +
      (count === 0 ? " is-empty" : "") +
      '" style="--tree-depth:' +
      depth +
      '">' +
      '<label class="filter-tree-label" data-tooltip="' +
      escAttr(labelText) +
      '">' +
      '<input type="checkbox" class="filter-tree-check" data-node-id="' +
      escAttr(node.id) +
      '" data-depth="' +
      depth +
      '" data-category="' +
      escAttr(catLabel) +
      '" data-tag="' +
      escAttr(depth === 0 ? "" : node.label) +
      '"' +
      (checked ? " checked" : "") +
      (indeterminate ? ' data-indeterminate="1"' : "") +
      " />" +
      iconHtml +
      '<span class="filter-link-label">' +
      escAttr(labelText) +
      "</span>" +
      '<span class="filter-count">' +
      count +
      "</span>" +
      "</label>" +
      toggle +
      "</div>";

    var kids = "";
    if (hasChildren) {
      kids =
        '<div class="filter-tree-children' +
        (expanded ? "" : " is-collapsed") +
        '"' +
        (expanded ? "" : " hidden") +
        ' data-tree-children="' +
        escAttr(node.id) +
        '">' +
        children
          .map(function (child) {
            return renderTreeNode(child, depth + 1, catLabel);
          })
          .join("") +
        "</div>";
    }

    return '<div class="filter-tree-node" data-depth="' + depth + '">' + row + kids + "</div>";
  }

  function applyTreeIndeterminate(chipHost) {
    if (!chipHost) return;
    chipHost.querySelectorAll(".filter-tree-check[data-indeterminate='1']").forEach(function (input) {
      input.indeterminate = true;
      input.checked = false;
    });
  }

  function wireFilterTooltips(chipHost) {
    if (!chipHost || chipHost.getAttribute("data-tip-wired")) return;
    chipHost.setAttribute("data-tip-wired", "1");
    var tip = document.getElementById("filter-tree-floating-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "filter-tree-floating-tip";
      tip.className = "filter-tree-floating-tip";
      tip.hidden = true;
      tip.setAttribute("role", "tooltip");
      document.body.appendChild(tip);
    }
    function hideTip() {
      tip.hidden = true;
    }
    function placeTip(anchor) {
      var text = anchor.getAttribute("data-tooltip") || "";
      if (!text) {
        hideTip();
        return;
      }
      tip.textContent = text;
      tip.hidden = false;
      var rect = anchor.getBoundingClientRect();
      var tipWidth = tip.offsetWidth || 160;
      var left = Math.min(Math.max(8, rect.left), window.innerWidth - tipWidth - 8);
      var top = rect.bottom + 6;
      if (top + tip.offsetHeight > window.innerHeight - 8) {
        top = Math.max(8, rect.top - tip.offsetHeight - 6);
      }
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
    chipHost.addEventListener("pointerover", function (event) {
      var el = event.target.closest ? event.target.closest("[data-tooltip]") : null;
      if (!el || !chipHost.contains(el)) return;
      placeTip(el);
    });
    chipHost.addEventListener("pointerout", function (event) {
      var el = event.target.closest ? event.target.closest("[data-tooltip]") : null;
      if (!el || !chipHost.contains(el)) return;
      var next = event.relatedTarget;
      if (next && el.contains(next)) return;
      hideTip();
    });
    chipHost.addEventListener("scroll", hideTip, true);
    window.addEventListener("scroll", hideTip, true);
  }

  function findNodeById(nodes, id) {
    var list = nodes || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
      var found = findNodeById(list[i].children || [], id);
      if (found) return found;
    }
    return null;
  }

  function collectNodeLabels(node) {
    var labels = [node.label];
    (node.children || []).forEach(function (child) {
      labels = labels.concat(collectNodeLabels(child));
    });
    return labels;
  }

  function collectDescendantLabels(node) {
    var labels = [];
    (node.children || []).forEach(function (child) {
      labels = labels.concat(collectNodeLabels(child));
    });
    return labels;
  }

  function applyLabelsToTags(labels, on, categoryLabel) {
    (labels || []).forEach(function (label) {
      if (!label) return;
      state.tags = toggleListValue(state.tags, scopeTagKey(categoryLabel, label), on);
    });
  }

  function findRootByCategory(categoryLabel) {
    var key = String(categoryLabel || "").toLowerCase();
    var found = null;
    taxonomyTree().some(function (n) {
      if (n.label.toLowerCase() === key) {
        found = n;
        return true;
      }
      return false;
    });
    return found;
  }

  function explodeCategoryToTags(categoryLabel, exceptLabel) {
    var rootNode = findRootByCategory(categoryLabel);
    if (!rootNode) return;
    state.categories = toggleListValue(state.categories, categoryLabel, false);
    var except = String(exceptLabel || "").toLowerCase();
    var descendants = collectDescendantLabels(rootNode);
    applyLabelsToTags(descendants, false, categoryLabel);
    applyLabelsToTags(
      descendants.filter(function (label) {
        return !except || label.toLowerCase() !== except;
      }),
      true,
      categoryLabel
    );
  }

  function wireProductTree(chipHost) {
    if (chipHost.getAttribute("data-tree-wired")) return;
    chipHost.setAttribute("data-tree-wired", "1");

    chipHost.addEventListener("click", function (event) {
      var toggle = event.target.closest
        ? event.target.closest("button[data-tree-toggle]")
        : null;
      if (!toggle || toggle.classList.contains("is-empty") || !chipHost.contains(toggle)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      var id = toggle.getAttribute("data-tree-toggle") || "";
      if (!id) return;
      expandedNodes[id] = !expandedNodes[id];
      applyExpandState(chipHost, id, !!expandedNodes[id]);
    });

    chipHost.addEventListener("change", function (event) {
      var input = event.target;
      if (!input || !input.classList || !input.classList.contains("filter-tree-check")) return;
      if (!chipHost.contains(input)) return;

      var nodeId = (input.getAttribute("data-node-id") || "").trim();
      var category = (input.getAttribute("data-category") || "").trim();
      var tag = (input.getAttribute("data-tag") || "").trim();
      var depth = parseInt(input.getAttribute("data-depth") || "0", 10) || 0;
      var on = !!input.checked;
      var node = findNodeById(taxonomyTree(), nodeId);
      var catLabel = category || (depth === 0 && node ? node.label : "") || "";
      var hasKids = !!(node && node.children && node.children.length);

      if (depth === 0) {
        var rootName = catLabel || (node && node.label) || "";
        state.categories = toggleListValue(state.categories, rootName, on);
        if (node) applyLabelsToTags(collectDescendantLabels(node), false, rootName);
      } else if (hasKids) {
        if (!on && isCategorySelected(catLabel)) {
          explodeCategoryToTags(catLabel, "");
        }
        applyLabelsToTags(collectNodeLabels(node), on, catLabel);
      } else {
        if (!on && isCategorySelected(catLabel)) {
          explodeCategoryToTags(catLabel, tag || (node && node.label) || "");
        } else {
          state.tags = toggleListValue(
            state.tags,
            scopeTagKey(catLabel, tag || (node && node.label) || ""),
            on
          );
        }
      }

      state.page = 1;
      syncUrl();
      refreshFilterChips();
      render();
    });
  }

  function refreshFilterChips() {
    var chipHost = document.querySelector("[data-catalog-chips]");
    var tagHost = document.querySelector("[data-catalog-tags]");
    var useSidebar =
      filterStyle === "sidebar" ||
      !!document.querySelector("[data-filter-layout='sidebar']");
    var useSoftChips = !useSidebar && (filterStyle === "search" || mode === "search");
    var cats = catalogCategories();
    var tags = catalogTags();

    if (chipHost) {
      var tree = useSidebar ? taxonomyTree() : [];
      if (useSidebar && tree.length) {
        wireProductTree(chipHost);
        chipHost.innerHTML = tree
          .map(function (node) {
            return renderTreeNode(node, 0, node.label);
          })
          .join("");
        applyTreeIndeterminate(chipHost);
        wireFilterTooltips(chipHost);
      } else if (useSidebar) {
        chipHost.innerHTML = cats
          .map(function (name) {
            var count = countForCategory(name);
            return (
              '<button type="button" class="filter-link" data-category="' +
              name +
              '">' +
              '<span class="filter-tree-icon" aria-hidden="true">' +
              categoryIcon(name) +
              "</span>" +
              '<span class="filter-link-label">' +
              name +
              "</span>" +
              '<span class="filter-count">' +
              count +
              "</span>" +
              "</button>"
            );
          })
          .join("");
        syncChipActive(chipHost);
        chipHost.querySelectorAll("[data-category]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var name = btn.getAttribute("data-category") || "";
            if (isCategorySelected(name)) setSingleCategory("");
            else setSingleCategory(name);
            state.page = 1;
            syncUrl();
            syncChipActive(chipHost);
            refreshFilterChips();
            render();
          });
        });
      } else if (useSoftChips) {
        chipHost.innerHTML =
          '<button type="button" class="chip-soft" data-category="">All categories (' + items.length + ")</button>" +
          cats.map(function (name) {
            var count = countForCategory(name);
            return '<button type="button" class="chip-soft" data-category="' + name + '">' +
              name + " (" + count + ")</button>";
          }).join("");
        syncChipActive(chipHost);
        chipHost.querySelectorAll("[data-category]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var name = btn.getAttribute("data-category") || "";
            setSingleCategory(name);
            state.page = 1;
            syncUrl();
            syncChipActive(chipHost);
            refreshFilterChips();
            render();
          });
        });
      } else {
        chipHost.innerHTML =
          '<button type="button" class="chip-browse" data-category="">ALL</button>' +
          cats.map(function (name) {
            return '<button type="button" class="chip-browse" data-category="' + name + '">' +
              name.toUpperCase() + "</button>";
          }).join("");
        syncChipActive(chipHost);
        chipHost.querySelectorAll("[data-category]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var name = btn.getAttribute("data-category") || "";
            setSingleCategory(name);
            state.page = 1;
            syncUrl();
            syncChipActive(chipHost);
            refreshFilterChips();
            render();
          });
        });
      }
    }

    if (tagHost) {
      if (useSidebar && taxonomyTree().length) {
        tagHost.innerHTML = "";
        return;
      }
      if (useSidebar) {
        tagHost.innerHTML = tags
          .map(function (name) {
            var count = countForTag(name);
            return (
              '<button type="button" class="filter-link" data-tag="' +
              name +
              '">' +
              '<span class="filter-link-label">' +
              name +
              "</span>" +
              '<span class="filter-count">' +
              count +
              "</span>" +
              "</button>"
            );
          })
          .join("");
      } else if (useSoftChips) {
        tagHost.innerHTML =
          '<button type="button" class="chip-soft chip-tag" data-tag="">All tags</button>' +
          tags.map(function (name) {
            var count = countForTag(name);
            return '<button type="button" class="chip-soft chip-tag" data-tag="' + name + '">' +
              name + " (" + count + ")</button>";
          }).join("");
      } else {
        tagHost.innerHTML =
          '<button type="button" class="chip-browse chip-tag" data-tag="">ALL TAGS</button>' +
          tags.map(function (name) {
            return '<button type="button" class="chip-browse chip-tag" data-tag="' + name + '">' +
              name.toUpperCase() + "</button>";
          }).join("");
      }

      syncTagActive(tagHost);
      tagHost.querySelectorAll("[data-tag]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var name = btn.getAttribute("data-tag") || "";
          if (useSidebar && name && isTagSelected(name)) setSingleTag("");
          else setSingleTag(name);
          state.page = 1;
          syncUrl();
          syncTagActive(tagHost);
          render();
        });
      });
    }
  }

  function wireTopRange() {
    var host = document.querySelector("[data-top-range]");
    if (!host) return;

    host.querySelectorAll("[data-range]").forEach(function (btn) {
      var active = btn.getAttribute("data-range") === state.range;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.addEventListener("click", function () {
        state.range = btn.getAttribute("data-range") === "new" ? "new" : "all-time";
        state.page = 1;
        host.querySelectorAll("[data-range]").forEach(function (el) {
          var on = el.getAttribute("data-range") === state.range;
          el.classList.toggle("is-active", on);
          el.setAttribute("aria-selected", on ? "true" : "false");
        });
        syncUrl();
        render();
      });
    });
  }

  var facetControllers = [];

  function closeAllFacets(except) {
    facetControllers.forEach(function (ctl) {
      if (except && ctl === except) return;
      ctl.setOpen(false);
    });
  }

  function refreshBrowseFacetsUI() {
    facetControllers.forEach(function (ctl) {
      ctl.refresh();
    });
  }

  function createFacetDropdown(host, config) {
    var key = config.key;
    var buckets = config.buckets;
    var getSelected = config.getSelected;
    var setSelected = config.setSelected;
    var matches = config.matches;
    var optionPrefix = config.optionPrefix || "";

    var rowsHtml = buckets
      .map(function (bucket) {
        var prefix =
          typeof config.optionPrefixFor === "function"
            ? config.optionPrefixFor(bucket)
            : optionPrefix;
        return (
          '<label class="price-filter-option" data-facet-bucket="' +
          bucket.id +
          '">' +
          '<input type="checkbox" value="' +
          bucket.id +
          '" />' +
          prefix +
          '<span class="price-filter-option-label">' +
          bucket.label +
          "</span>" +
          '<span class="price-filter-option-count" data-facet-count>0</span>' +
          "</label>"
        );
      })
      .join("");

    var wrap = document.createElement("div");
    wrap.className = "price-filter-unity";
    wrap.setAttribute("data-facet", key);
    wrap.innerHTML =
      '<button type="button" class="price-filter-trigger" data-facet-trigger aria-expanded="false" aria-haspopup="true">' +
        '<span data-facet-label>' +
        config.label +
        "</span>" +
        '<svg class="price-filter-chevron" viewBox="0 0 12 8" aria-hidden="true">' +
          '<path d="M1 1.5L6 6.5L11 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>' +
        "</svg>" +
      "</button>" +
      '<div class="price-filter-panel" data-facet-panel hidden role="group" aria-label="' +
      config.label +
      '">' +
        rowsHtml +
        '<button type="button" class="price-filter-clear-link" data-facet-clear hidden>Clear</button>' +
      "</div>";

    host.appendChild(wrap);

    var trigger = wrap.querySelector("[data-facet-trigger]");
    var panel = wrap.querySelector("[data-facet-panel]");
    var labelEl = wrap.querySelector("[data-facet-label]");
    var clearBtn = wrap.querySelector("[data-facet-clear]");

    var ctl = {
      key: key,
      setOpen: function () {},
      refresh: function () {}
    };

    function setOpen(open) {
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      wrap.classList.toggle("is-open", open);
      if (open) {
        closeAllFacets(ctl);
        positionPanel();
      }
    }

    function positionPanel() {
      var rect = trigger.getBoundingClientRect();
      var panelWidth = Math.max(220, rect.width + 48);
      var left = rect.left;
      if (left + panelWidth > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - panelWidth - 12);
      }
      panel.style.top = Math.round(rect.bottom + 6) + "px";
      panel.style.left = Math.round(left) + "px";
      panel.style.width = panelWidth + "px";
    }

    function refresh() {
      var selected = getSelected();
      var count = selected.length;
      labelEl.textContent = count ? config.label + " (" + count + ")" : config.label;
      trigger.classList.toggle("is-active", count > 0);
      clearBtn.hidden = count === 0;

      var base = listBeforeFacets(key);
      buckets.forEach(function (bucket) {
        var row = wrap.querySelector('[data-facet-bucket="' + bucket.id + '"]');
        if (!row) return;
        var n = 0;
        for (var i = 0; i < base.length; i++) {
          if (matches(base[i], bucket)) n += 1;
        }
        var countEl = row.querySelector("[data-facet-count]");
        var input = row.querySelector('input[type="checkbox"]');
        var on = selected.some(function (id) {
          return String(id) === String(bucket.id);
        });
        if (countEl) countEl.textContent = String(n);
        row.classList.toggle("is-empty", n === 0);
        row.classList.toggle("is-checked", on);
        if (input) {
          input.checked = on;
          input.disabled = n === 0 && !on;
        }
      });
    }

    ctl.setOpen = setOpen;
    ctl.refresh = refresh;
    facetControllers.push(ctl);

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(panel.hidden);
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    panel.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.addEventListener("change", function () {
        setSelected(toggleListValue(getSelected(), input.value, input.checked));
        state.page = 1;
        syncUrl();
        render();
      });
    });

    clearBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setSelected([]);
      state.page = 1;
      syncUrl();
      render();
    });

    return ctl;
  }

  function wireBrowseFacets() {
    var host =
      document.querySelector("[data-browse-facets]") ||
      document.querySelector("[data-price-filters]");
    if (!host || host.getAttribute("data-wired")) return;
    host.setAttribute("data-wired", "1");
    host.classList.add("browse-facet-row");
    host.innerHTML =
      '<div class="browse-facet-left" data-facet-left></div>' +
      '<div class="browse-facet-center"><p class="facet-results-meta" data-facet-results-meta></p></div>' +
      '<div class="browse-facet-right" data-facet-right></div>';

    var left = host.querySelector("[data-facet-left]");
    var right = host.querySelector("[data-facet-right]");

    var starIcon =
      '<span class="price-filter-option-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 3.6l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 16.9l-4.8 2.52.92-5.34L4.24 9.24l5.36-.78L12 3.6z"></path></svg>' +
      "</span>";
    var starEmptyIcon =
      '<span class="price-filter-option-icon price-filter-option-icon-empty" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M12 3.6l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 16.9l-4.8 2.52.92-5.34L4.24 9.24l5.36-.78L12 3.6z"></path></svg>' +
      "</span>";

    createFacetDropdown(left, {
      key: "price",
      label: "Price",
      buckets: PRICE_BUCKETS,
      getSelected: function () {
        return state.priceBuckets;
      },
      setSelected: function (next) {
        state.priceBuckets = next;
      },
      matches: function (item, bucket) {
        return priceInBucket(itemPrice(item), bucket);
      }
    });

    createFacetDropdown(left, {
      key: "rating",
      label: "Rating",
      buckets: RATING_BUCKETS,
      optionPrefix: starIcon,
      optionPrefixFor: function (bucket) {
        return bucket.stars === 0 ? starEmptyIcon : starIcon;
      },
      getSelected: function () {
        return state.ratingBuckets;
      },
      setSelected: function (next) {
        state.ratingBuckets = next;
      },
      matches: function (item, bucket) {
        return ratingInBucket(itemRatingStars(item), bucket);
      }
    });

    createFacetDropdown(left, {
      key: "release",
      label: "Release Date",
      buckets: RELEASE_BUCKETS,
      getSelected: function () {
        return state.releaseBuckets;
      },
      setSelected: function (next) {
        state.releaseBuckets = next;
      },
      matches: function (item, bucket) {
        return releaseInBucket(itemAddedTime(item), bucket);
      }
    });

    createSortDropdown(right);
    createPageSizeDropdown(right);

    document.addEventListener("click", function () {
      closeAllFacets();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllFacets();
    });

    window.addEventListener("resize", function () {
      facetControllers.forEach(function (ctl) {
        var wrap = document.querySelector('[data-facet="' + ctl.key + '"]');
        if (wrap && wrap.classList.contains("is-open")) ctl.setOpen(true);
      });
    });

    window.addEventListener(
      "scroll",
      function () {
        facetControllers.forEach(function (ctl) {
          var wrap = document.querySelector('[data-facet="' + ctl.key + '"]');
          if (wrap && wrap.classList.contains("is-open")) {
            var panel = wrap.querySelector("[data-facet-panel]");
            var trigger = wrap.querySelector("[data-facet-trigger]");
            if (!panel || !trigger || panel.hidden) return;
            var rect = trigger.getBoundingClientRect();
            var panelWidth;
            var leftPos;
            if (ctl.alignToTrigger) {
              panelWidth = Math.round(rect.width);
              leftPos = rect.left;
              panel.style.minWidth = panelWidth + "px";
              panel.style.maxWidth = panelWidth + "px";
            } else {
              panel.style.width = "max-content";
              panel.style.minWidth = "13.5rem";
              panel.style.maxWidth = "min(20rem, calc(100vw - 24px))";
              panelWidth = Math.ceil(panel.getBoundingClientRect().width);
              leftPos = rect.right - panelWidth;
              if (leftPos < 12) leftPos = 12;
              if (leftPos + panelWidth > window.innerWidth - 12) {
                leftPos = Math.max(12, window.innerWidth - panelWidth - 12);
              }
              panel.style.minWidth = panelWidth + "px";
              panel.style.maxWidth = panelWidth + "px";
            }
            panel.style.top = Math.round(rect.bottom + 6) + "px";
            panel.style.left = Math.round(leftPos) + "px";
            panel.style.width = panelWidth + "px";
          }
        });
      },
      true
    );

    refreshBrowseFacetsUI();
  }

  function createSortDropdown(host) {
    if (!host) return;

    function sortLabel() {
      for (var i = 0; i < SORT_OPTIONS.length; i++) {
        if (SORT_OPTIONS[i].id === state.sort) return SORT_OPTIONS[i].label;
      }
      return "Relevance";
    }

    var optionsHtml = SORT_OPTIONS.map(function (opt) {
      return (
        '<button type="button" class="sort-filter-option" data-sort-option="' +
        opt.id +
        '">' +
        opt.label +
        "</button>"
      );
    }).join("");

    var wrap = document.createElement("div");
    wrap.className = "sort-filter-unity price-filter-unity";
    wrap.setAttribute("data-facet", "sort");
    wrap.innerHTML =
      '<button type="button" class="sort-filter-trigger price-filter-trigger" data-facet-trigger aria-expanded="false" aria-haspopup="true">' +
        '<span data-sort-label>Sort by: ' +
        sortLabel() +
        "</span>" +
        '<svg class="price-filter-chevron" viewBox="0 0 12 8" aria-hidden="true">' +
          '<path d="M1 1.5L6 6.5L11 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>' +
        "</svg>" +
      "</button>" +
      '<div class="sort-filter-panel price-filter-panel" data-facet-panel hidden role="listbox" aria-label="Sort by">' +
        optionsHtml +
      "</div>";

    host.appendChild(wrap);

    var trigger = wrap.querySelector("[data-facet-trigger]");
    var panel = wrap.querySelector("[data-facet-panel]");
    var labelEl = wrap.querySelector("[data-sort-label]");

    var ctl = {
      key: "sort",
      setOpen: function () {},
      refresh: function () {}
    };

    function positionPanel() {
      var rect = trigger.getBoundingClientRect();
      panel.style.width = "max-content";
      panel.style.minWidth = "13.5rem";
      panel.style.maxWidth = "min(20rem, calc(100vw - 24px))";
      var panelWidth = Math.ceil(panel.getBoundingClientRect().width);
      var left = rect.right - panelWidth;
      if (left < 12) left = 12;
      if (left + panelWidth > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - panelWidth - 12);
      }
      panel.style.top = Math.round(rect.bottom + 6) + "px";
      panel.style.left = Math.round(left) + "px";
      panel.style.width = panelWidth + "px";
      panel.style.minWidth = panelWidth + "px";
      panel.style.maxWidth = panelWidth + "px";
    }

    function setOpen(open) {
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      wrap.classList.toggle("is-open", open);
      if (open) {
        closeAllFacets(ctl);
        positionPanel();
      }
    }

    function refresh() {
      labelEl.textContent = "Sort by: " + sortLabel();
      panel.querySelectorAll("[data-sort-option]").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-sort-option") === state.sort);
      });
    }

    ctl.setOpen = setOpen;
    ctl.refresh = refresh;
    ctl.alignToTrigger = false;
    facetControllers.push(ctl);

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(panel.hidden);
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    panel.querySelectorAll("[data-sort-option]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        state.sort = btn.getAttribute("data-sort-option") || "relevance";
        state.page = 1;
        setOpen(false);
        syncUrl();
        render();
      });
    });

    refresh();
  }

  function createPageSizeDropdown(host) {
    if (!host) return;

    var optionsHtml = PAGE_SIZE_OPTIONS.map(function (size) {
      return (
        '<button type="button" class="sort-filter-option" data-page-size="' +
        size +
        '">' +
        size +
        "</button>"
      );
    }).join("");

    var wrap = document.createElement("div");
    wrap.className = "sort-filter-unity price-filter-unity";
    wrap.setAttribute("data-facet", "page-size");
    wrap.innerHTML =
      '<button type="button" class="sort-filter-trigger price-filter-trigger" data-facet-trigger aria-expanded="false" aria-haspopup="true">' +
        '<span data-page-size-label>Results: ' +
        state.pageSize +
        "</span>" +
        '<svg class="price-filter-chevron" viewBox="0 0 12 8" aria-hidden="true">' +
          '<path d="M1 1.5L6 6.5L11 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>' +
        "</svg>" +
      "</button>" +
      '<div class="sort-filter-panel price-filter-panel" data-facet-panel hidden role="listbox" aria-label="Results per page">' +
        optionsHtml +
      "</div>";

    host.appendChild(wrap);

    var trigger = wrap.querySelector("[data-facet-trigger]");
    var panel = wrap.querySelector("[data-facet-panel]");
    var labelEl = wrap.querySelector("[data-page-size-label]");

    var ctl = {
      key: "page-size",
      setOpen: function () {},
      refresh: function () {}
    };

    function positionPanel() {
      var rect = trigger.getBoundingClientRect();
      var panelWidth = Math.round(rect.width);
      panel.style.top = Math.round(rect.bottom + 6) + "px";
      panel.style.left = Math.round(rect.left) + "px";
      panel.style.width = panelWidth + "px";
      panel.style.minWidth = panelWidth + "px";
      panel.style.maxWidth = panelWidth + "px";
    }

    function setOpen(open) {
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      wrap.classList.toggle("is-open", open);
      if (open) {
        closeAllFacets(ctl);
        positionPanel();
      }
    }

    function refresh() {
      labelEl.textContent = "Results: " + state.pageSize;
      panel.querySelectorAll("[data-page-size]").forEach(function (btn) {
        var size = parseInt(btn.getAttribute("data-page-size"), 10);
        btn.classList.toggle("is-active", size === state.pageSize);
      });
    }

    ctl.setOpen = setOpen;
    ctl.refresh = refresh;
    ctl.alignToTrigger = true;
    facetControllers.push(ctl);

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(panel.hidden);
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    panel.querySelectorAll("[data-page-size]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var size = parseInt(btn.getAttribute("data-page-size"), 10);
        if (PAGE_SIZE_OPTIONS.indexOf(size) < 0) return;
        state.pageSize = size;
        state.page = 1;
        setOpen(false);
        syncUrl();
        render();
      });
    });

    refresh();
  }

  if (mode === "all" || mode === "search") {
    wireFilters();
    wireBrowseFacets();
  }
  if (mode === "top") {
    wireTopRange();
  }

  document.addEventListener("rogue-catalog:loaded", function () {
    syncItems();
    if (mode === "all" || mode === "search") {
      wireFilters();
      wireBrowseFacets();
    }
    render();
  });

  document.addEventListener("rogue-catalog:products-loaded", function () {
    if (kind !== "products") return;
    syncItems();
    if (mode === "all" || mode === "search") {
      wireFilters();
      wireBrowseFacets();
    }
    render();
  });

  render();
})();
