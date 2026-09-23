/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 14:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 20:45:00
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

  function priceLabel(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    if (isNaN(n) || n <= 0) return "Free";
    if (Number.isInteger(n)) return "$" + n;
    return "$" + n.toFixed(2);
  }

  function starsGlyph(scoreOutOf5) {
    var filled = Math.round(Math.max(0, Math.min(5, scoreOutOf5 || 0)));
    var out = "";
    for (var i = 0; i < 5; i++) out += i < filled ? "★" : "☆";
    return out;
  }

  function formatScore(score) {
    if (typeof score !== "number" || isNaN(score) || score <= 0) return "0";
    var n = Math.max(0, Math.min(5, score));
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(1);
  }

  function applyRating(item, repoFull) {
    var countMode =
      window.RogueCards && typeof RogueCards.isCountOnlyRating === "function"
        ? RogueCards.isCountOnlyRating(item, kind)
        : !!(item && item.githubRepo);
    var ratingEl = document.querySelector("[data-detail-rating]");
    var starsEl = document.querySelector("[data-detail-stars]");
    var scoreEl = document.querySelector("[data-detail-score]");
    var countEl = document.querySelector("[data-detail-rating-count]");

    if (countMode) {
      var count =
        window.RogueCards && typeof RogueCards.engagementCount === "function"
          ? RogueCards.engagementCount(item, kind)
          : typeof item.stars === "number"
            ? item.stars
            : item.votes || 0;
      var hasCount = count > 0;
      if (starsEl) {
        starsEl.textContent =
          window.RogueCards && RogueCards.countStarGlyph
            ? RogueCards.countStarGlyph(count)
            : hasCount
              ? "★"
              : "☆";
        starsEl.setAttribute("data-star-glyph", "");
      }
      if (scoreEl) {
        scoreEl.hidden = true;
        scoreEl.textContent = "";
      }
      if (countEl) countEl.textContent = String(count);
      if (ratingEl) {
        ratingEl.classList.add("asset-card-rating-count");
        ratingEl.classList.toggle("asset-card-rating-empty", !hasCount);
        ratingEl.setAttribute("data-rating-mode", "count");
        ratingEl.setAttribute("title", "GitHub stars");
        if (repoFull) ratingEl.setAttribute("data-github-repo", repoFull);
        else ratingEl.removeAttribute("data-github-repo");
      }
      return;
    }

    var scoreRaw = typeof item.rating === "number" ? item.rating : parseFloat(item.rating);
    var hasScore = !isNaN(scoreRaw) && scoreRaw > 0;
    var score = hasScore ? scoreRaw : 0;
    var countRaw =
      typeof item.ratingCount === "number" ? item.ratingCount : parseInt(item.ratingCount, 10);
    var votes = typeof item.votes === "number" ? item.votes : item.stars || 0;
    var total = !isNaN(countRaw) && countRaw >= 0 ? countRaw : votes || 0;

    if (starsEl) {
      starsEl.textContent = starsGlyph(score);
      starsEl.removeAttribute("data-star-glyph");
    }
    if (scoreEl) {
      scoreEl.hidden = false;
      scoreEl.textContent = formatScore(score);
    }
    if (countEl) countEl.textContent = String(total);
    if (ratingEl) {
      ratingEl.classList.remove("asset-card-rating-count");
      ratingEl.classList.toggle("asset-card-rating-empty", !hasScore);
      ratingEl.setAttribute("data-rating-mode", "average");
      ratingEl.setAttribute("title", "Rating");
      if (repoFull) ratingEl.setAttribute("data-github-repo", repoFull);
      else ratingEl.removeAttribute("data-github-repo");
    }
  }

  function pillsHtml(item) {
    var root = (window.RogueSite && RogueSite.root && RogueSite.root()) || base;
    var parts = [];
    parts.push('<span class="price-pill" title="Price">' + esc(priceLabel(item)) + "</span>");
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

  function formatFileSize(sizeKb, sizeBytes) {
    var bytes =
      typeof sizeBytes === "number" && sizeBytes >= 0
        ? sizeBytes
        : typeof sizeKb === "number" && sizeKb >= 0
          ? sizeKb * 1024
          : NaN;
    if (isNaN(bytes) || bytes < 0) return "—";
    if (bytes < 1024) return bytes + " B";
    var kb = bytes / 1024;
    if (kb < 1024) return (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + " KB";
    var mb = kb / 1024;
    if (mb < 1024) return (mb < 10 ? mb.toFixed(1) : Math.round(mb)) + " MB";
    return (mb / 1024).toFixed(2) + " GB";
  }

  function normalizeLicenseFromSource(raw) {
    if (window.RogueLicense && typeof RogueLicense.labelFromSource === "function") {
      return RogueLicense.labelFromSource(raw);
    }
    var s = String(raw || "")
      .replace(/^\uFEFF/, "")
      .trim();
    if (!s || /^(NOASSERTION|NONE|Other)$/i.test(s)) return "";
    if (/\bMIT\b/i.test(s)) return "Open-Source License (MIT)";
    if (/^Commercial\b/i.test(s) || /^Single Entity$/i.test(s)) return "Single Entity";
    if (/^Extension Asset$/i.test(s)) return "Extension Asset";
    if (/^Multi[- ]?Entity$/i.test(s)) return "Multi-Entity";
    return s;
  }

  function licenseFromGithubRepo(repo) {
    if (!repo || !repo.license) return "";
    return (
      normalizeLicenseFromSource(repo.license.spdx_id) ||
      normalizeLicenseFromSource(repo.license.key) ||
      normalizeLicenseFromSource(repo.license.name) ||
      ""
    );
  }

  function fetchLicenseFile(owner, name) {
    return fetchRaw(owner, name, "LICENSE").then(function (text) {
      if (text && String(text).trim()) return text;
      return fetchRaw(owner, name, "LICENSE.md").then(function (md) {
        if (md && String(md).trim()) return md;
        return fetchRaw(owner, name, "LICENSE.txt");
      });
    });
  }

  function applyLicenseClassification(item, raw, allowKindDefault) {
    if (!window.RogueLicense || typeof RogueLicense.classify !== "function") {
      var fallback = normalizeLicenseFromSource(raw);
      if (fallback) item.license = fallback;
      return fallback;
    }
    var classified = RogueLicense.classify(raw);
    if ((!classified || !classified.type) && allowKindDefault) {
      classified = RogueLicense.defaultForKind ? RogueLicense.defaultForKind(kind) : null;
    }
    if (!classified || !classified.type) return "";
    item.licenseTypeKey = classified.type;
    item.licenseDetail = classified.detail || "";
    item.license = classified.shortLabel || classified.label;
    return item.license;
  }

  function resolveItemLicense(item, owner, name) {
    var rawExisting = item.license || item.licenseType || item.licenseSpdx || "";
    if (rawExisting && applyLicenseClassification(item, rawExisting, false)) {
      return Promise.resolve(item.license);
    }
    return fetchLicenseFile(owner, name)
      .then(function (text) {
        if (text && applyLicenseClassification(item, text, false)) {
          return item.license;
        }
        return applyLicenseClassification(item, "", true) || "";
      })
      .catch(function () {
        return applyLicenseClassification(item, "", true) || "";
      });
  }

  function licenseCellHtml(item) {
    if (window.RogueLicense && typeof RogueLicense.classifyFromItem === "function") {
      var classified = RogueLicense.classifyFromItem(item, kind);
      if (classified && classified.type) {
        item.licenseTypeKey = classified.type;
        item.licenseDetail = classified.detail || "";
        return RogueLicense.linkHtml(classified);
      }
    }
    var raw = normalizeLicenseFromSource(
      (item && (item.license || item.licenseType || item.licenseSpdx)) || ""
    );
    return raw ? esc(raw) : "—";
  }

  function aboutHtml(item, full, github) {
    var owner = item.owner || full.split("/")[0];
    var parts = [];
    parts.push(
      '<dl class="detail-about-list">' +
        "<dt>Author</dt>" +
        '<dd><a href="https://github.com/' +
        esc(owner) +
        '" rel="noopener" data-github-user="' +
        esc(owner) +
        '">' +
        esc(owner) +
        "</a></dd>" +
        "<dt>License type</dt>" +
        "<dd>" +
        licenseCellHtml(item) +
        "</dd>" +
        "<dt>File size</dt>" +
        "<dd>" +
        esc(formatFileSize(item.sizeKb, item.sizeBytes)) +
        "</dd>" +
        "</dl>"
    );

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

    document.title = title + (kind === "skills" ? " — Skill" : " — MCP Server") + " - Rogue Assets Store";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    setText("[data-detail-crumb]", title);
    setText("[data-detail-title]", title);
    setText("[data-detail-author-label]", "by " + owner);
    var authorLabel = document.querySelector("[data-detail-author-label]");
    if (authorLabel) {
      authorLabel.setAttribute("data-github-user", owner);
      authorLabel.textContent = "by " + owner;
    }
    var authorLink = document.querySelector("[data-detail-author]");
    if (authorLink) authorLink.setAttribute("data-github-user-host", owner);
    setText("[data-detail-avatar]", badge.slice(0, 2).toUpperCase());
    setHref("[data-detail-author]", "https://github.com/" + owner);
    setHref("[data-detail-repo]", github);
    var saveBtn = document.querySelector("[data-save-bookmark]");
    if (saveBtn && github) {
      saveBtn.setAttribute("data-save-url", github);
      saveBtn.removeAttribute("disabled");
    }
    if (github && typeof window.pinDetailSaveUrl === "function") {
      window.pinDetailSaveUrl(github);
    }
    if (typeof window.pinDetailSaveCount === "function") {
      window.pinDetailSaveCount(
        typeof item.saves === "number" && item.saves >= 0 ? item.saves : 0
      );
    }
    applyRating(item, full);

    setHtml("[data-detail-pills]", pillsHtml(item) || '<span class="pill">Other</span>');
    setText("[data-detail-lede]", desc);
    setText("[data-detail-overview]", "");

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
    if (typeof window.refreshGithubAuthors === "function") {
      window.refreshGithubAuthors(document);
    }
    if (typeof window.refreshDetailSaveButtons === "function") {
      window.refreshDetailSaveButtons();
    }
  }

  function showError(msg) {
    setText("[data-detail-loading]", msg || "Item not found.");
  }

  function parsePriceFromTopics(topics) {
    var list = Array.isArray(topics) ? topics : [];
    for (var i = 0; i < list.length; i++) {
      var m = String(list[i] || "").match(/^price-(\d+(?:\.\d+)?)$/i);
      if (m) {
        var n = parseFloat(m[1]);
        if (!isNaN(n) && n >= 0) return n;
      }
    }
    return 0;
  }

  function mergeRepo(item, repo) {
    var topics = Array.isArray(repo.topics) ? repo.topics : [];
    var price =
      typeof item.price === "number" && !isNaN(item.price)
        ? item.price
        : parsePriceFromTopics(topics);
    return {
      name: item.name || repo.name,
      owner: item.owner || (repo.owner && repo.owner.login) || parseRepo(repo.full_name).owner,
      githubRepo: item.githubRepo || repo.full_name,
      githubUrl: item.githubUrl || repo.html_url,
      description: item.description || repo.description || "No description yet.",
      category: item.category || "Other",
      tags: item.tags && item.tags.length ? item.tags : topics,
      badge: item.badge || (kind === "servers" ? "MCP" : (repo.name || "").slice(0, 2).toUpperCase()),
      stars: typeof item.stars === "number" ? item.stars : repo.stargazers_count || 0,
      price: price,
      language: item.language || repo.language || "",
      homepage: item.homepage || repo.homepage || "",
      addedAt: item.addedAt || (repo.created_at || "").slice(0, 10),
      updatedAt: item.updatedAt || (repo.pushed_at || repo.updated_at || "").slice(0, 10),
      packageName: item.packageName || "",
      license:
        normalizeLicenseFromSource(item.license) ||
        licenseFromGithubRepo(repo) ||
        "",
      sizeKb:
        typeof item.sizeKb === "number"
          ? item.sizeKb
          : typeof repo.size === "number"
            ? repo.size
            : null
    };
  }

  function loadItem(parsed) {
    var fromCatalog = findInCatalog(parsed.full);

    return fetchRepo(parsed.full)
      .then(function (repo) {
        var topics = Array.isArray(repo.topics) ? repo.topics : [];
        var baseItem = fromCatalog || {
          name: repo.name,
          owner: (repo.owner && repo.owner.login) || parsed.owner,
          githubRepo: repo.full_name,
          githubUrl: repo.html_url,
          description: repo.description || "No description yet.",
          category: "Other",
          tags: topics,
          badge: kind === "servers" ? "MCP" : repo.name.slice(0, 2).toUpperCase(),
          stars: repo.stargazers_count || 0,
          price: parsePriceFromTopics(topics),
          license: licenseFromGithubRepo(repo),
          sizeKb: typeof repo.size === "number" ? repo.size : null
        };
        return mergeRepo(baseItem, repo);
      })
      .catch(function () {
        if (fromCatalog) return fromCatalog;
        throw new Error("repo missing");
      })
      .then(function (item) {
        return resolveItemLicense(item, parsed.owner, parsed.name).then(function () {
          return Promise.all([
            fetchDoc(parsed.owner, parsed.name),
            fetchInstallConfig(parsed.owner, parsed.name, item, parsed.full)
          ]).then(function (parts) {
            render(item, parts[0], parts[1]);
          });
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
