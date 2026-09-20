/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 14:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 14:15:00
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
    var clean = String(raw || "").replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/, "").replace(/\/$/, "");
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

  function fetchReadme(owner, name) {
    var branches = ["main", "master"];
    function tryBranch(i) {
      if (i >= branches.length) return Promise.resolve("");
      var url = "https://raw.githubusercontent.com/" + owner + "/" + name + "/" + branches[i] + "/README.md";
      return fetch(url).then(function (res) {
        if (!res.ok) return tryBranch(i + 1);
        return res.text();
      }).catch(function () {
        return tryBranch(i + 1);
      });
    }
    return tryBranch(0);
  }

  function installSnippet(item, full) {
    if (kind === "skills") {
      return "npx -y skills add https://github.com/" + full + " --agent cursor";
    }
    var pkg = item.name || full.split("/")[1];
    var cfg = { mcpServers: {} };
    cfg.mcpServers[pkg] = {
      command: "uvx",
      args: ["--from", "git+https://github.com/" + full + ".git", pkg]
    };
    return JSON.stringify(cfg, null, 2);
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

  function render(item, readme) {
    var full = item.githubRepo || item.owner + "/" + item.name;
    var github = item.githubUrl || item.htmlUrl || "https://github.com/" + full;
    var title = item.name || full.split("/")[1];
    var desc = item.description || "No description yet.";
    var owner = item.owner || full.split("/")[0];
    var badge = item.badge || (kind === "servers" ? "MCP" : title.slice(0, 2).toUpperCase());
    var install = installSnippet(item, full);

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
    setText("[data-detail-about]", desc);
    setText("[data-readme]", readme || "README.md not found.");
    setText("[data-install-cmd]", install);

    var label = document.querySelector("[data-install-label]");
    if (label) label.textContent = kind === "skills" ? "Install (Cursor)" : "Cursor MCP config";

    var tipList = document.querySelector("[data-install-tips]");
    if (tipList) {
      tipList.innerHTML =
        kind === "skills"
          ? "<li>Make sure Node.js is on your PATH</li>" +
            "<li>Change <code>--agent</code> for your host when supported</li>" +
            "<li>Start a new chat after install so the skill loads</li>"
          : "<li>Restart Cursor after saving MCP config</li>" +
            "<li>Open the linked GitHub repo for addon or extension setup</li>" +
            "<li>Confirm the MCP server appears in your host tool list</li>";
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

  function loadItem(parsed) {
    var fromCatalog = findInCatalog(parsed.full);
    var itemPromise = fromCatalog
      ? Promise.resolve(fromCatalog)
      : fetchRepo(parsed.full).then(function (repo) {
          return {
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
        });

    return itemPromise.then(function (item) {
      return fetchReadme(parsed.owner, parsed.name).then(function (readme) {
        render(item, readme);
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
