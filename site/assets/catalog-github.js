/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:26:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-21 15:35:00
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog || !catalog.topics) return;

  var CACHE_MS = 30 * 60 * 1000;
  var TOPIC_META = {
    "rogue-market-skills": 1,
    "rogue-market-mcp": 1,
    "rogue-development": 1
  };
  var CATEGORY_ALIASES = {
    "design-tools": "Design Tools",
    "developer-tools": "Developer Tools",
    "browser-automation": "Browser Automation",
    "social-media-management": "Social Media Management",
    "collaboration-tools": "Collaboration Tools",
    "productivity-workflow": "Productivity & Workflow",
    "productivity-and-workflow": "Productivity & Workflow",
    "data-science-ml": "Data Science & ML",
    "data-science-and-ml": "Data Science & ML",
    "api-development": "API Development",
    "analytics-monitoring": "Analytics & Monitoring",
    "security-testing": "Security & Testing",
    "web-scraping-data-collection": "Web Scraping & Data Collection",
    "deployment-devops": "Deployment & DevOps",
    "learning-documentation": "Learning & Documentation",
    "database-management": "Database Management",
    "content-management": "Content Management",
    "cloud-infrastructure": "Cloud Infrastructure",
    "marketing-automation": "Marketing Automation",
    "e-commerce-solutions": "E-commerce Solutions",
    "game-development": "Game Development",
    "mobile-development": "Mobile Development"
  };

  function cacheKey(topic) {
    return "rm-topic-v7:" + topic;
  }

  function readCache(topic) {
    try {
      var raw = sessionStorage.getItem(cacheKey(topic));
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return null;
      if (Date.now() - (parsed.at || 0) > CACHE_MS) return null;
      return parsed.items;
    } catch (err) {
      return null;
    }
  }

  function writeCache(topic, items) {
    try {
      sessionStorage.setItem(cacheKey(topic), JSON.stringify({ at: Date.now(), items: items }));
    } catch (err) {}
  }

  function pickCategory(topics) {
    var known = catalog.categories || [];
    var i;
    for (i = 0; i < topics.length; i++) {
      var slug = String(topics[i] || "").toLowerCase();
      if (CATEGORY_ALIASES[slug]) return CATEGORY_ALIASES[slug];
    }
    for (i = 0; i < topics.length; i++) {
      var normalized = String(topics[i] || "")
        .replace(/-/g, " ")
        .replace(/&/g, "and")
        .toLowerCase();
      for (var j = 0; j < known.length; j++) {
        var knownNorm = known[j]
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/\s+/g, " ")
          .trim();
        if (knownNorm === normalized) return known[j];
      }
    }
    if (
      topics.indexOf("blender") !== -1 ||
      topics.indexOf("illustrator") !== -1 ||
      topics.indexOf("photoshop") !== -1 ||
      topics.indexOf("3d") !== -1 ||
      topics.indexOf("sculpting") !== -1
    ) {
      return "Design Tools";
    }
    if (
      topics.indexOf("playwright") !== -1 ||
      topics.indexOf("chrome-devtools") !== -1 ||
      topics.indexOf("cdp") !== -1
    ) {
      return "Browser Automation";
    }
    if (topics.indexOf("youtube") !== -1 || topics.indexOf("publishing") !== -1) {
      return "Social Media Management";
    }
    if (
      topics.indexOf("atlassian") !== -1 ||
      topics.indexOf("jira") !== -1 ||
      topics.indexOf("linear") !== -1 ||
      topics.indexOf("confluence") !== -1
    ) {
      return "Collaboration Tools";
    }
    if (topics.indexOf("mcp-server") !== -1 || topics.indexOf("mcp") !== -1) {
      return "Developer Tools";
    }
    return "Other";
  }

  function parsePrice(topics) {
    for (var i = 0; i < topics.length; i++) {
      var m = String(topics[i] || "").match(/^price-(\d+(?:\.\d+)?)$/i);
      if (m) {
        var n = parseFloat(m[1]);
        if (!isNaN(n) && n >= 0) return n;
      }
    }
    return 0;
  }

  function mapRepo(repo, kind) {
    var topics = Array.isArray(repo.topics) ? repo.topics.slice() : [];
    var tags = topics.filter(function (t) {
      return !TOPIC_META[t] && !/^price-\d/i.test(String(t || ""));
    });
    var owner = (repo.owner && repo.owner.login) || catalog.org || "rogue-dev-studio";
    var name = repo.name || "untitled";
    var stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
    return {
      id: name,
      name: name,
      slug: kind === "skills" ? owner + "/" + name : name,
      owner: owner,
      category: pickCategory(topics),
      tags: tags,
      badge: kind === "servers" ? "MCP" : name.slice(0, 2).toUpperCase(),
      githubRepo: repo.full_name,
      githubUrl: repo.html_url,
      htmlUrl: "",
      rank: 0,
      stars: stars,
      votes: stars,
      price: parsePrice(topics),
      addedAt: (repo.created_at || "").slice(0, 10),
      description: repo.description || "No description yet.",
      source: "github"
    };
  }

  function linkHasNext(linkHeader) {
    return Boolean(linkHeader && /rel="next"/i.test(linkHeader));
  }

  function searchTopicPage(topic, page) {
    var owner = catalog.org || catalog.owner || "";
    var q = "topic:" + topic + " fork:true";
    if (owner) q += " user:" + owner;
    var url =
      "https://api.github.com/search/repositories?q=" +
      encodeURIComponent(q) +
      "&sort=stars&order=desc&per_page=100&page=" +
      page;

    return fetch(url, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    }).then(function (res) {
      if (!res.ok) throw new Error("GitHub search " + res.status);
      var hasNext = linkHasNext(res.headers.get("Link"));
      return res.json().then(function (data) {
        return {
          items: Array.isArray(data.items) ? data.items : [],
          hasNext: hasNext,
          totalCount: typeof data.total_count === "number" ? data.total_count : 0
        };
      });
    });
  }

  function searchTopic(topic) {
    var cached = readCache(topic);
    if (cached) return Promise.resolve(cached);

    function loadPages(page, acc) {
      return searchTopicPage(topic, page).then(function (part) {
        var merged = acc.concat(part.items);
        // GitHub search hard-caps at 1000 results; stop when page is short or no next link
        if (part.hasNext && part.items.length > 0 && merged.length < 1000 && page < 10) {
          return loadPages(page + 1, merged);
        }
        return merged;
      });
    }

    return loadPages(1, [])
      .then(function (items) {
        writeCache(topic, items);
        return items;
      })
      .catch(function () {
        return cached || [];
      });
  }

  function uniqueTags(list) {
    var seen = {};
    var out = [];
    list.forEach(function (item) {
      (item.tags || []).forEach(function (tag) {
        var key = String(tag).toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        out.push(tag);
      });
    });
    return out.sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  function applyLists(skills, servers) {
    catalog.skills = skills;
    catalog.servers = servers;
    catalog.tags = uniqueTags(skills.concat(servers));
    catalog.loaded = true;
    document.dispatchEvent(
      new CustomEvent("rogue-catalog:loaded", {
        detail: { skills: skills.length, servers: servers.length }
      })
    );
  }

  function load() {
    var skillTopic = catalog.topics.skills;
    var serverTopic = catalog.topics.servers;

    return Promise.all([searchTopic(skillTopic), searchTopic(serverTopic)]).then(function (parts) {
      var skills = (parts[0] || []).map(function (repo) {
        return mapRepo(repo, "skills");
      });
      var servers = (parts[1] || []).map(function (repo) {
        return mapRepo(repo, "servers");
      });
      applyLists(skills, servers);
      return catalog;
    });
  }

  window.loadRogueCatalog = load;
  load();
})();
