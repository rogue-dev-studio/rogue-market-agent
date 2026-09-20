/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:26:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 12:26:00
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog || !catalog.topics) return;

  var CACHE_MS = 30 * 60 * 1000;
  var TOPIC_META = {
    "rogue-market-skills": 1,
    "rogue-market-mcp": 1
  };

  function cacheKey(topic) {
    return "rm-topic:" + topic;
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
    for (var i = 0; i < topics.length; i++) {
      var t = topics[i];
      for (var j = 0; j < known.length; j++) {
        if (known[j].toLowerCase() === String(t).replace(/-/g, " ").toLowerCase()) {
          return known[j];
        }
      }
    }
    return "Other";
  }

  function mapRepo(repo, kind) {
    var topics = Array.isArray(repo.topics) ? repo.topics.slice() : [];
    var tags = topics.filter(function (t) {
      return !TOPIC_META[t];
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
      htmlUrl: repo.html_url,
      rank: 0,
      stars: stars,
      votes: stars,
      addedAt: (repo.created_at || "").slice(0, 10),
      description: repo.description || "No description yet.",
      source: "github"
    };
  }

  function searchTopic(topic) {
    var cached = readCache(topic);
    if (cached) return Promise.resolve(cached);

    var owner = catalog.org || catalog.owner || "";
    var q = "topic:" + topic + " fork:true";
    if (owner) q += " user:" + owner;
    var url =
      "https://api.github.com/search/repositories?q=" +
      encodeURIComponent(q) +
      "&sort=stars&order=desc&per_page=50";

    return fetch(url, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub search " + res.status);
        return res.json();
      })
      .then(function (data) {
        var items = Array.isArray(data.items) ? data.items : [];
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
