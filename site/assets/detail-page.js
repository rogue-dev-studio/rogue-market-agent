/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 14:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 14:35:00
 */
(function () {
  var kind = document.body.getAttribute("data-detail-kind") || "servers";
  var base = document.body.getAttribute("data-base") || "../../";
  if (base.slice(-1) !== "/") base += "/";

  var params = new URLSearchParams(window.location.search);
  var repoParam = (params.get("repo") || params.get("id") || "").trim();

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function setHtml(sel, html) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }

  function setHref(sel, href) {
    var el = document.querySelector(sel);
    if (el && href) el.setAttribute("href", href);
  }

  function parseRepo(raw) {
    var clean = String(raw || "")
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
    var parts = clean.split("/").filter(Boolean);
    if (parts.length >= 2) return { owner: parts[0], name: parts[1], full: parts[0] + "/" + parts[1] };
    if (parts.length === 1) {
      var owner = (window.RogueCatalog && RogueCatalog.org) || "rogue-dev-studio";
      return { owner: owner, name: parts[0], full: owner + "/" + parts[0] };
    }
    return null;
  }

  function findInCatalog(full) {
    var catalog = window.RogueCatalog || {};
    var list = kind === "skills" ? catalog.skills || [] : catalog.servers || [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.githubRepo === full || item.id === full || item.name === full.split("/")[1]) return item;
    }
    return null;
  }

  function fetchRepo(full) {
    return fetch("https://api.github.com/repos/" + full, {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("repo " + res.status);
      return res.json();
    });
  }

  function fetchRaw(owner, name, path) {
    var branches = ["main", "master"];
    function tryBranch(i) {
      if (i >= branches.length) return Promise.resolve("");
      var url =
        "https://raw.githubusercontent.com/" + owner + "/" + name + "/" + branches[i] + "/" + path;
      return fetch(url)
        .then(function (res) {
          if (!res.ok) return tryBranch(i + 1);
          return res.text();
        })
        .catch(function () {
          return tryBranch(i + 1);
        });
    }
    return tryBranch(0);
  }

  function fetchDoc(owner, name) {
    if (kind === "skills") {
      return fetchRaw(owner, name, "SKILL.md").then(function (text) {
        if (text) return { source: "SKILL.md", body: text };
        return fetchRaw(owner, name, "README.md").then(function (readme) {
          return { source: "README.md", body: readme || "" };
        });
      });
    }
    return fetchRaw(owner, name, "README.md").then(function (readme) {
      return { source: "README.md", body: readme || "" };
    });
  }

  function fetchInstallConfig(owner, name, item, full) {
    if (kind === "skills") {
      return Promise.resolve({
        label: "Install",
        body: "npx -y skills add https://github.com/" + full + " --agent cursor",
        tips: [],
        requirements: [
          "Node.js 18+ with <code>npx</code> on PATH",
          "An agent host that supports the skills CLI",
          "Fresh chat/session after install so the skill loads"
        ]
      });
    }

    return fetchRaw(owner, name, "cursor.mcp.fragment.json").then(function (raw) {
      var body = "";
      if (raw) {
        try {
          body = JSON.stringify(JSON.parse(raw), null, 2);
        } catch (err) {
          body = raw.trim();
        }
      }
      if (!body) {
        var pkg = item.packageName || item.name || full.split("/")[1];
        var cfg = { mcpServers: {} };
        cfg.mcpServers[pkg] = {
          command: "uvx",
          args: ["--from", "git+https://github.com/" + full + ".git", pkg]
        };
        body = JSON.stringify(cfg, null, 2);
      }
      return {
        label: "MCP config",
        body: body,
        tips: [],
        requirements: [
          "An MCP-capable agent host",
          "<code>uv</code> / <code>uvx</code> on PATH (when the config uses uvx)",
          "Any desktop app / extension required by the server (see README)",
          "Restart the host after saving MCP config"
        ]
      };
    });
  }

  function extractHighlights(doc, item) {
    var lines = String(doc || "").split(/\r?\n/);
    var bullets = [];
    var i;
    for (i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var m = line.match(/^[-*+]\s+(.+)/);
      if (!m) continue;
      var text = m[1]
        .replace(/\*\*/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();
      if (text.length < 8 || text.length > 140) continue;
      if (/^https?:\/\//i.test(text)) continue;
      if (/license|contact|email|copyright/i.test(text)) continue;
      bullets.push(text);
      if (bullets.length >= 6) break;
    }
    if (bullets.length) return bullets;
    return (item.tags || []).slice(0, 6).map(function (tag) {
      return String(tag).replace(/-/g, " ");
    });
  }

  function pillsHtml(item) {
    var root = (window.RogueSite && RogueSite.root && RogueSite.root()) || base;
    var parts = [];
    if (item.category) {
      parts.push(
        '<a class="pill pill-link" href="' +
          esc(root + kind + "/search/?category=" + encodeURIComponent(item.category)) +
          '">' +
          esc(item.category) +
          "</a>"
      );
    }
    (item.tags || []).forEach(function (tag) {
      parts.push(
        '<a class="pill pill-link" href="' +
          esc(root + kind + "/search/?tag=" + encodeURIComponent(tag)) +
          '">' +
          esc(tag) +
          "</a>"
      );
    });
    return parts.join("");
  }

  function overviewMetaHtml(item) {
    var root = (window.RogueSite && RogueSite.root && RogueSite.root()) || base;
    var bits = [];
    if (item.category) {
      bits.push(
        'Category: <a href="' +
          esc(root + kind + "/search/?category=" + encodeURIComponent(item.category)) +
          '">' +
          esc(item.category) +
          "</a>"
      );
    }
    if (item.tags && item.tags.length) {
      var tagLinks = item.tags
        .map(function (tag) {
          return (
            '<a href="' +
            esc(root + kind + "/search/?tag=" + encodeURIComponent(tag)) +
            '">' +
            esc(tag) +
            "</a>"
          );
        })
        .join(", ");
      bits.push("Tags: " + tagLinks);
    }
    return bits.join(" · ");
  }

  function aboutHtml(item, full, github) {
    var parts = [];
    parts.push("<p>" + esc(item.description || "No description yet.") + "</p>");

    parts.push("<h3>Repository</h3><ul>");
    parts.push(
      "<li>Owner: <a href=\"https://github.com/" +
        esc(item.owner || full.split("/")[0]) +
        "\" rel=\"noopener\">" +
        esc(item.owner || full.split("/")[0]) +
        "</a></li>"
    );
    parts.push(
      "<li>Repo: <a href=\"" + esc(github) + "\" rel=\"noopener\">" + esc(full) + "</a></li>"
    );
    if (item.language) parts.push("<li>Language: " + esc(item.language) + "</li>");
    if (typeof item.stars === "number") parts.push("<li>Stars: " + esc(String(item.stars)) + "</li>");
    if (item.addedAt) parts.push("<li>Created: " + esc(item.addedAt) + "</li>");
    if (item.homepage) {
      parts.push(
        "<li>Homepage: <a href=\"" + esc(item.homepage) + "\" rel=\"noopener\">" + esc(item.homepage) + "</a></li>"
      );
    }
    parts.push("</ul>");

    if (kind === "skills") {
      parts.push("<h3>When to use</h3><ul>");
      parts.push("<li>Install this skill when your agent needs the workflow described above</li>");
      parts.push("<li>Use it in a fresh chat after install so the host loads the skill file</li>");
      parts.push("<li>Point the agent at the linked GitHub repo for the canonical skill source</li>");
      parts.push("</ul>");
    } else {
      parts.push("<h3>When to use</h3><ul>");
      parts.push("<li>Connect this MCP server when your agent needs the tools in the README</li>");
      parts.push("<li>Keep any required desktop app or daemon running before calling tools</li>");
      parts.push("<li>Restart the host after updating MCP config so tools register</li>");
      parts.push("</ul>");
    }

    if (item.tags && item.tags.length) {
      parts.push("<h3>Topics</h3><ul>");
      item.tags.forEach(function (tag) {
        parts.push("<li>" + esc(tag) + "</li>");
      });
      parts.push("</ul>");
    }

    return parts.join("");
  }

  function render(item, doc, install) {
    var full = item.githubRepo || item.owner + "/" + item.name;
    var github = item.githubUrl || item.htmlUrl || "https://github.com/" + full;
    var title = item.name || full.split("/")[1];
    var desc = item.description || "No description yet.";
    var owner = item.owner || full.split("/")[0];
    var badge = item.badge || (kind === "servers" ? "MCP" : title.slice(0, 2).toUpperCase());
    var highlights = extractHighlights(doc.body, item);

    document.title = title + (kind === "skills" ? " — Skill" : " — MCP Server") + " - Rogue Market Agent";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    setText("[data-detail-crumb]", title);
    setText("[data-detail-title]", title);
    setText("[data-detail-lede]", desc);
    setText("[data-detail-author-label]", "by " + owner);
    setText("[data-detail-avatar]", badge.slice(0, 2).toUpperCase());
    setHref("[data-detail-author]", "https://github.com/" + owner);
    setHref("[data-detail-github]", github);
    setHref("[data-detail-repo]", github);
    setHref("[data-detail-star]", github);

    var starEl = document.querySelector("[data-detail-star]");
    if (starEl) starEl.setAttribute("data-github-repo", full);

    setHtml("[data-detail-pills]", pillsHtml(item) || '<span class="pill">Other</span>');
    setText("[data-detail-overview]", desc);

    var highlightEl = document.querySelector("[data-detail-highlights]");
    if (highlightEl) {
      if (highlights.length) {
        highlightEl.hidden = false;
        highlightEl.innerHTML = highlights.map(function (h) {
          return "<li>" + esc(h) + "</li>";
        }).join("");
      } else {
        highlightEl.innerHTML = "";
        highlightEl.hidden = true;
      }
    }

    setHtml("[data-detail-overview-meta]", overviewMetaHtml(item));
    setHtml("[data-detail-about]", aboutHtml(item, full, github));

    setText("[data-readme-source]", doc.source || "README.md");
    setText("[data-readme]", doc.body || (doc.source || "README.md") + " not found.");

    var installIntro = document.querySelector("[data-install-intro]");
    if (installIntro) {
      installIntro.textContent =
        kind === "skills"
          ? "Pick a host below to expand install instructions."
          : "Pick a host below to expand MCP install instructions.";
    }

    var hostMount = document.querySelector("[data-install-hosts]");
    if (hostMount && window.RogueInstallHosts) {
      var skillUrl = github;
      if (kind === "skills") {
        skillUrl = "https://github.com/" + full;
      }
      RogueInstallHosts.render(hostMount, {
        kind: kind,
        skillUrl: skillUrl,
        downloadUrl: "https://github.com/" + full + "/archive/refs/heads/main.zip",
        mcpJson: install.body,
        githubUrl: github,
        requirements: install.requirements || null
      });
    } else {
      var label = document.querySelector("[data-install-label]");
      if (label) label.textContent = install.label;
      setText("[data-install-cmd]", install.body);
      var tipList = document.querySelector("[data-install-tips]");
      if (tipList) {
        tipList.innerHTML = (install.tips || [])
          .map(function (tip) {
            return "<li>" + tip + "</li>";
          })
          .join("");
      }
    }

    var loading = document.querySelector("[data-detail-loading]");
    if (loading) loading.hidden = true;
    var main = document.querySelector("[data-detail-main]");
    if (main) main.hidden = false;

    if (typeof window.refreshGithubStars === "function") {
      window.refreshGithubStars(document);
    }
  }

  function showError(msg) {
    setText("[data-detail-loading]", msg || "Item not found.");
  }

  function mergeRepo(item, repo) {
    return {
      name: item.name || repo.name,
      owner: item.owner || (repo.owner && repo.owner.login) || parseRepo(repo.full_name).owner,
      githubRepo: item.githubRepo || repo.full_name,
      githubUrl: item.githubUrl || repo.html_url,
      description: item.description || repo.description || "No description yet.",
      category: item.category || "Other",
      tags: item.tags && item.tags.length ? item.tags : Array.isArray(repo.topics) ? repo.topics : [],
      badge: item.badge || (kind === "servers" ? "MCP" : (repo.name || "").slice(0, 2).toUpperCase()),
      stars: typeof item.stars === "number" ? item.stars : repo.stargazers_count || 0,
      language: item.language || repo.language || "",
      homepage: item.homepage || repo.homepage || "",
      addedAt: item.addedAt || (repo.created_at || "").slice(0, 10),
      packageName: item.packageName || ""
    };
  }

  function loadItem(parsed) {
    var fromCatalog = findInCatalog(parsed.full);

    return fetchRepo(parsed.full)
      .then(function (repo) {
        var baseItem = fromCatalog || {
          name: repo.name,
          owner: (repo.owner && repo.owner.login) || parsed.owner,
          githubRepo: repo.full_name,
          githubUrl: repo.html_url,
          description: repo.description || "No description yet.",
          category: "Other",
          tags: Array.isArray(repo.topics) ? repo.topics : [],
          badge: kind === "servers" ? "MCP" : repo.name.slice(0, 2).toUpperCase(),
          stars: repo.stargazers_count || 0
        };
        return mergeRepo(baseItem, repo);
      })
      .catch(function () {
        if (fromCatalog) return fromCatalog;
        throw new Error("repo missing");
      })
      .then(function (item) {
        return Promise.all([
          fetchDoc(parsed.owner, parsed.name),
          fetchInstallConfig(parsed.owner, parsed.name, item, parsed.full)
        ]).then(function (parts) {
          render(item, parts[0], parts[1]);
        });
      });
  }

  function start() {
    if (!repoParam) {
      showError("Missing repo. Open this page from a catalog card.");
      return;
    }
    var parsed = parseRepo(repoParam);
    if (!parsed) {
      showError("Invalid repository id.");
      return;
    }

    function run() {
      loadItem(parsed).catch(function () {
        showError("Could not load " + parsed.full + ".");
      });
    }

    if (window.RogueCatalog && RogueCatalog.loaded) {
      run();
      return;
    }
    document.addEventListener("rogue-catalog:loaded", run, { once: true });
    setTimeout(run, 2500);
  }

  var copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var cmd = document.querySelector("[data-install-cmd]");
      if (!cmd) return;
      navigator.clipboard.writeText(cmd.textContent.trim()).then(function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy";
        }, 1400);
      });
    });
  }

  start();
})();
