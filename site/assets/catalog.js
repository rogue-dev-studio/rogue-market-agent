/*
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 10:46:47
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 11:32:00
 */
(function () {
  var root = document.querySelector("[data-catalog]");
  if (!root || !window.RogueCatalog) return;

  var kind = root.getAttribute("data-catalog");
  var mode = root.getAttribute("data-mode") || "all";
  var filterStyle = root.getAttribute("data-filter-style") || mode;
  var pageSize = RogueCatalog.pageSize || 12;
  var items = [];
  var label = kind === "skills" ? "skills" : "MCP servers";

  function siteRoot() {
    return (window.RogueSite && RogueSite.root && RogueSite.root()) || "/";
  }

  function syncItems() {
    items = kind === "skills"
      ? (RogueCatalog.skills || []).slice()
      : (RogueCatalog.servers || []).slice();
  }

  syncItems();
  var params = new URLSearchParams(window.location.search);
  var state = {
    page: Math.max(1, parseInt(params.get("page") || "1", 10) || 1),
    query: (params.get("q") || "").trim(),
    category: (params.get("category") || "").trim(),
    tag: (params.get("tag") || "").trim(),
    range: (params.get("range") || "all-time").trim() === "new" ? "new" : "all-time"
  };

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
    var hasFilter = !!(state.query || state.category || state.tag);
    if (hasFilter) return "No results found.";
    if (!RogueCatalog.loaded) return "Loading…";
    return kind === "skills" ? "No skills yet." : "No MCP servers yet.";
  }

  function searchHref(category) {
    return siteRoot() + kind + "/search/?category=" + encodeURIComponent(category);
  }

  function searchTagHref(tag) {
    return siteRoot() + kind + "/search/?tag=" + encodeURIComponent(tag);
  }

  function itemTags(item) {
    return Array.isArray(item.tags) ? item.tags : [];
  }

  function tagsHtml(item, limit) {
    var list = itemTags(item);
    if (!list.length) return "";
    var shown = typeof limit === "number" ? list.slice(0, limit) : list;
    return (
      '<span class="tag-row">' +
      shown.map(function (tag) {
        return '<span class="tag-pill">' + tag + "</span>";
      }).join("") +
      (list.length > shown.length ? '<span class="tag-pill tag-more">+' + (list.length - shown.length) + "</span>" : "") +
      "</span>"
    );
  }

  function starHtml(item, votes, cls) {
    var repo = item.githubRepo ? String(item.githubRepo) : "";
    var attrs = repo
      ? ' data-github-repo="' + repo + '"'
      : "";
    return (
      '<span class="' + cls + '"' + attrs + ' title="GitHub stars">★ <span data-star-count>' +
      votes +
      "</span></span>"
    );
  }

  function cardHtml(item, rank) {
    var votes = typeof item.votes === "number" ? item.votes : (item.stars || 0);
    var badge = item.badge || (kind === "servers" ? "MCP" : item.name.slice(0, 2).toUpperCase());

    if (mode === "top") {
      return (
        '<li><a class="top-card" href="' + itemHref(item) + '"' + itemLinkAttrs(item) + '>' +
          '<span class="top-rank">' + rank + "</span>" +
          '<span class="top-main">' +
            '<span class="top-head">' +
              '<span class="top-avatar" aria-hidden="true">' + badge + "</span>" +
              '<strong class="skill-name">' + item.name + "</strong>" +
            "</span>" +
            '<span class="skill-desc">' + item.description + "</span>" +
            tagsHtml(item, 3) +
            '<span class="card-foot">' +
              '<span class="pill">' + item.category + "</span>" +
              starHtml(item, votes, "top-votes") +
            "</span>" +
          "</span>" +
        "</a></li>"
      );
    }

    if (mode === "all") {
      return (
        '<li><a class="skill-card market-card browse-card" href="' + itemHref(item) + '"' + itemLinkAttrs(item) + '>' +
          '<span class="browse-card-top">' +
            '<span class="browse-card-icon" aria-hidden="true">' + badge + "</span>" +
            '<span class="browse-card-ext" aria-hidden="true">↗</span>' +
          "</span>" +
          '<strong class="skill-name">' + item.name + "</strong>" +
          '<span class="skill-desc">' + item.description + "</span>" +
          tagsHtml(item, 4) +
          '<span class="card-foot">' +
            '<span class="pill">' + item.category + "</span>" +
            starHtml(item, votes, "card-stars") +
          "</span>" +
        "</a></li>"
      );
    }

    if (mode === "search") {
      return (
        '<li><a class="skill-card market-card discover-card" href="' + itemHref(item) + '"' + itemLinkAttrs(item) + '>' +
          '<span class="discover-head">' +
            '<span class="server-card-icon" aria-hidden="true">' + badge + "</span>" +
            '<strong class="skill-name">' + item.name + "</strong>" +
            '<span class="discover-ext" aria-hidden="true">↗</span>' +
          "</span>" +
          '<span class="skill-desc">' + item.description + "</span>" +
          tagsHtml(item, 4) +
          '<span class="card-foot">' +
            '<span class="pill">' + item.category + "</span>" +
            starHtml(item, votes, "card-metric") +
          "</span>" +
        "</a></li>"
      );
    }

    if (kind === "servers") {
      return (
        '<li><a class="skill-card server-card market-card" href="' + itemHref(item) + '"' + itemLinkAttrs(item) + '>' +
          '<span class="server-card-icon" aria-hidden="true">' + badge + "</span>" +
          '<strong class="skill-name">' + item.name + "</strong>" +
          '<span class="skill-desc">' + item.description + "</span>" +
          tagsHtml(item, 3) +
          '<span class="card-foot">' +
            '<span class="pill">' + item.category + "</span>" +
            starHtml(item, votes, "card-stars") +
          "</span>" +
        "</a></li>"
      );
    }

    return (
      '<li><a class="skill-card market-card" href="' + itemHref(item) + '"' + itemLinkAttrs(item) + '>' +
        '<strong class="skill-name">' + item.name + "</strong>" +
        '<span class="skill-desc">' + item.description + "</span>" +
        tagsHtml(item, 3) +
        '<span class="card-foot">' +
          '<span class="pill">' + item.category + "</span>" +
          starHtml(item, votes, "card-stars") +
        "</span>" +
      "</a></li>"
    );
  }

  function filteredItems() {
    var list = items.slice();

    if (mode === "top") {
      if (state.range === "new") {
        list.sort(function (a, b) {
          return String(b.addedAt || "").localeCompare(String(a.addedAt || ""));
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

    if (state.category) {
      list = list.filter(function (item) {
        return item.category.toLowerCase() === state.category.toLowerCase();
      });
    }
    if (state.tag) {
      list = list.filter(function (item) {
        return itemTags(item).some(function (tag) {
          return tag.toLowerCase() === state.tag.toLowerCase();
        });
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
    return list;
  }

  function syncUrl() {
    var next = new URLSearchParams();
    if (state.query) next.set("q", state.query);
    if (state.category) next.set("category", state.category);
    if (state.tag) next.set("tag", state.tag);
    if (mode === "top" && state.range !== "all-time") next.set("range", state.range);
    if (state.page > 1) next.set("page", String(state.page));
    var qs = next.toString();
    var url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    history.replaceState(null, "", url);
  }

  function renderPager(total, page, pages) {
    var host = root.querySelector("[data-catalog-pager]");
    if (!host) return;
    if (pages <= 1) {
      host.innerHTML = total
        ? '<p class="pager-meta">' + total + " result" + (total === 1 ? "" : "s") + "</p>"
        : "";
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

    host.innerHTML =
      '<p class="pager-meta">Page ' + page + " of " + pages + " · " + total + " result" +
      (total === 1 ? "" : "s") + "</p>" +
      '<div class="pager-controls">' + buttons + "</div>";

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
    var pages = Math.max(1, Math.ceil(list.length / pageSize));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * pageSize;
    var pageItems = list.slice(start, start + pageSize);
    var ul = root.querySelector("[data-catalog-list]");
    if (!ul) return;
    if (!pageItems.length) {
      ul.innerHTML = '<li class="empty-state">' + emptyMessage() + "</li>";
      var emptyPager = root.querySelector("[data-catalog-pager]");
      if (emptyPager) emptyPager.innerHTML = "";
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
    var cats = RogueCatalog.categories || [];
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
    var tags = RogueCatalog.tags || [];
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
    if (typeof window.refreshGithubStars === "function") {
      window.refreshGithubStars(root);
    }
  }

  function syncChipActive(chipHost) {
    chipHost.querySelectorAll("[data-category]").forEach(function (el) {
      var value = el.getAttribute("data-category") || "";
      var active = value === ""
        ? !state.category
        : state.category.toLowerCase() === value.toLowerCase();
      el.classList.toggle("is-active", active);
    });
  }

  function syncTagActive(tagHost) {
    tagHost.querySelectorAll("[data-tag]").forEach(function (el) {
      var value = el.getAttribute("data-tag") || "";
      var active = value === ""
        ? !state.tag
        : state.tag.toLowerCase() === value.toLowerCase();
      el.classList.toggle("is-active", active);
    });
  }

  function wireFilters() {
    var input = document.querySelector("[data-catalog-search]");
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

  function refreshFilterChips() {
    var chipHost = document.querySelector("[data-catalog-chips]");
    var tagHost = document.querySelector("[data-catalog-tags]");
    var useSoftChips = filterStyle === "search" || mode === "search";
    var cats = (RogueCatalog.categories || []).slice();
    var tags = (RogueCatalog.tags || []).slice();

    if (chipHost) {
      if (useSoftChips) {
        chipHost.innerHTML =
          '<button type="button" class="chip-soft" data-category="">All categories (' + items.length + ")</button>" +
          cats.map(function (name) {
            var count = countForCategory(name);
            return '<button type="button" class="chip-soft" data-category="' + name + '">' +
              name + " (" + count + ")</button>";
          }).join("");
      } else {
        chipHost.innerHTML =
          '<button type="button" class="chip-browse" data-category="">ALL</button>' +
          cats.map(function (name) {
            return '<button type="button" class="chip-browse" data-category="' + name + '">' +
              name.toUpperCase() + "</button>";
          }).join("");
      }

      syncChipActive(chipHost);
      chipHost.querySelectorAll("[data-category]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var name = btn.getAttribute("data-category") || "";
          state.category = name;
          state.page = 1;
          syncUrl();
          syncChipActive(chipHost);
          render();
        });
      });
    }

    if (tagHost) {
      if (useSoftChips) {
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
          state.tag = name;
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

  if (mode === "all" || mode === "search") {
    wireFilters();
  }
  if (mode === "top") {
    wireTopRange();
  }

  document.addEventListener("rogue-catalog:loaded", function () {
    syncItems();
    if (mode === "all" || mode === "search") {
      wireFilters();
    }
    render();
  });

  render();
})();
