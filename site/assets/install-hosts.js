/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-21 12:33:55
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-21 12:50:00
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Brand icons: Lobe Icons (AI hosts) + Simple Icons (Telegram/Slack) */
  var LOBE = "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@1.86.0/icons/";
  var SIMPLE = "https://cdn.simpleicons.org/";

  function logoWrap(src, bg, fallbackSrc) {
    var fb = fallbackSrc
      ? ' onerror="this.onerror=null;this.src=\'' + esc(fallbackSrc) + '\'"'
      : "";
    return (
      '<span class="host-icon host-icon--logo" style="--host-icon-bg:' +
      esc(bg || "#2a2a2a") +
      '" aria-hidden="true">' +
      '<img src="' +
      esc(src) +
      '" alt="" width="18" height="18" loading="lazy" decoding="async"' +
      fb +
      " /></span>"
    );
  }

  function lobe(name, bg, preferColor) {
    var primary = preferColor ? name + "-color" : name;
    var fallback = preferColor ? name : name + "-color";
    return logoWrap(LOBE + primary + ".svg", bg, LOBE + fallback + ".svg");
  }

  function simple(slug, color, bg) {
    var hex = String(color || "ffffff").replace(/^#/, "");
    return logoWrap(SIMPLE + slug + "/" + hex, bg || "#2a2a2a");
  }

  function logoSvg(path, bg) {
    return (
      '<span class="host-icon host-icon--logo" style="--host-icon-bg:' +
      esc(bg || "#2a2a2a") +
      '" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
      path +
      "</svg></span>"
    );
  }

  var I = {
    telegram: simple("telegram", "ffffff", "#229ED9"),
    slack: simple("slack", "ffffff", "#4A154B"),
    claude: lobe("claudecode", "#D97757", true),
    codex: lobe("codex", "#10A37F", true),
    openclaw: lobe("openclaw", "#0F766E", true),
    cursor: lobe("cursor", "#111111", false),
    amp: lobe("amp", "#6366F1", false),
    github: lobe("githubcopilot", "#24292F", false),
    gemini: lobe("geminicli", "#4285F4", true),
    kilo: lobe("kilocode", "#7C3AED", false),
    junie: lobe("junie", "#000000", true),
    replit: lobe("replit", "#F26207", true),
    windsurf: lobe("windsurf", "#0EA5E9", false),
    cline: lobe("cline", "#F59E0B", false),
    continue: logoSvg(
      '<path d="M8 5v14l11-7L8 5z"/>',
      "#14532D"
    ),
    opencode: lobe("opencode", "#111827", false),
    openhands: lobe("openhands", "#2563EB", true),
    roo: lobe("roocode", "#EA580C", false),
    augment: logoSvg(
      '<path d="M12 2l3.2 6.5L22 9.2l-5 4.9 1.2 7L12 17.8 5.8 21l1.2-7-5-4.9 6.8-.7L12 2z"/>',
      "#4C1D95"
    ),
    goose: lobe("goose", "#CA8A04", false),
    trae: lobe("trae", "#06B6D4", true),
    zencoder: lobe("zencoder", "#EC4899", true),
    antigravity: lobe("antigravity", "#334155", true),
    download: logoSvg(
      '<path d="M11 3h2v10h3l-4 5-4-5h3V3zm-6 15h14v3H5v-3z"/>',
      "#64748B"
    )
  };

  var HOSTS = [
    { id: "telegram", label: "Telegram", agent: "telegram", icon: I.telegram, skill: true, mcp: false },
    { id: "slack", label: "Slack", agent: "slack", icon: I.slack, skill: true, mcp: false },
    { id: "claude-code", label: "Claude Code", agent: "claude", icon: I.claude, skill: true, mcp: true },
    { id: "codex", label: "Codex", agent: "codex", icon: I.codex, skill: true, mcp: true },
    { id: "openclaw", label: "OpenClaw", agent: "openclaw", icon: I.openclaw, skill: true, mcp: true },
    { id: "cursor", label: "Cursor", agent: "cursor", icon: I.cursor, skill: true, mcp: true },
    { id: "amp", label: "Amp", agent: "amp", icon: I.amp, skill: true, mcp: true },
    { id: "github-copilot", label: "GitHub Copilot", agent: "copilot", icon: I.github, skill: true, mcp: true },
    { id: "gemini-cli", label: "Gemini CLI", agent: "gemini", icon: I.gemini, skill: true, mcp: true },
    { id: "kilo", label: "Kilo Code", agent: "kilo", icon: I.kilo, skill: true, mcp: true },
    { id: "junie", label: "Junie", agent: "junie", icon: I.junie, skill: true, mcp: false },
    { id: "replit", label: "Replit", agent: "replit", icon: I.replit, skill: true, mcp: true },
    { id: "windsurf", label: "Windsurf", agent: "windsurf", icon: I.windsurf, skill: true, mcp: true },
    { id: "cline", label: "Cline", agent: "cline", icon: I.cline, skill: true, mcp: true },
    { id: "continue", label: "Continue", agent: "continue", icon: I.continue, skill: true, mcp: true },
    { id: "opencode", label: "OpenCode", agent: "opencode", icon: I.opencode, skill: true, mcp: true },
    { id: "openhands", label: "OpenHands", agent: "openhands", icon: I.openhands, skill: true, mcp: true },
    { id: "roo", label: "Roo Code", agent: "roo", icon: I.roo, skill: true, mcp: true },
    { id: "augment", label: "Augment", agent: "augment", icon: I.augment, skill: true, mcp: true },
    { id: "goose", label: "Goose", agent: "goose", icon: I.goose, skill: true, mcp: true },
    { id: "trae", label: "Trae", agent: "trae", icon: I.trae, skill: true, mcp: true },
    { id: "zencoder", label: "Zencoder", agent: "zencoder", icon: I.zencoder, skill: true, mcp: true },
    { id: "antigravity", label: "Antigravity", agent: "antigravity", icon: I.antigravity, skill: true, mcp: true },
    {
      id: "download",
      labelSkill: "Download skill",
      labelMcp: "Download MCP",
      agent: null,
      icon: I.download,
      skill: true,
      mcp: true,
      download: true
    }
  ];

  function hostLabel(host, kind) {
    if (host.download) {
      return kind === "skills" ? host.labelSkill || "Download skill" : host.labelMcp || "Download MCP";
    }
    return host.label;
  }

  function skillCommand(skillUrl, agent) {
    return "npx -y skills add " + skillUrl + " --agent " + agent;
  }

  function mcpServerKey(mcpJson) {
    try {
      var parsed = typeof mcpJson === "string" ? JSON.parse(mcpJson) : mcpJson;
      var servers = parsed && parsed.mcpServers ? parsed.mcpServers : parsed;
      var keys = servers ? Object.keys(servers) : [];
      return keys[0] || "server";
    } catch (err) {
      return "server";
    }
  }

  function mcpServerEntry(mcpJson) {
    try {
      var parsed = typeof mcpJson === "string" ? JSON.parse(mcpJson) : mcpJson;
      var servers = parsed && parsed.mcpServers ? parsed.mcpServers : parsed;
      var key = mcpServerKey(mcpJson);
      return { key: key, entry: servers[key] };
    } catch (err) {
      return null;
    }
  }

  function prettyJson(obj) {
    return JSON.stringify(obj, null, 2);
  }

  function mcpCommands(host, mcpJson, githubUrl, downloadUrl) {
    if (host.download) {
      return [
        {
          title: "Download MCP:",
          body: downloadUrl || githubUrl,
          note: "Download the repository archive, then follow the README to run or configure the server.",
          href: downloadUrl || githubUrl
        }
      ];
    }

    var pretty = typeof mcpJson === "string" ? mcpJson : prettyJson(mcpJson);
    var info = mcpServerEntry(mcpJson);
    var key = info ? info.key : "server";
    var entry = info ? info.entry : null;
    var blocks = [];

    if (
      host.id === "cursor" ||
      host.id === "windsurf" ||
      host.id === "cline" ||
      host.id === "continue" ||
      host.id === "amp" ||
      host.id === "augment" ||
      host.id === "trae" ||
      host.id === "zencoder" ||
      host.id === "antigravity" ||
      host.id === "kilo" ||
      host.id === "roo" ||
      host.id === "goose" ||
      host.id === "openhands" ||
      host.id === "replit" ||
      host.id === "github-copilot"
    ) {
      blocks.push({
        title: "Install to " + host.label + ":",
        body: pretty,
        note: "Merge into your MCP settings JSON, then restart " + host.label + "."
      });
      return blocks;
    }

    if (host.id === "claude-code" && entry) {
      var args = Array.isArray(entry.args) ? entry.args : [];
      var cmd = entry.command || "uvx";
      var joined = [cmd]
        .concat(args)
        .map(function (a) {
          return /\s/.test(String(a)) ? JSON.stringify(String(a)) : String(a);
        })
        .join(" ");
      blocks.push({
        title: "Install to Claude Code:",
        body: "claude mcp add " + key + " -- " + joined,
        note: "Requires Claude Code CLI. Restart the session after adding."
      });
      blocks.push({
        title: "Or paste MCP config:",
        body: pretty
      });
      return blocks;
    }

    if (host.id === "codex" || host.id === "opencode" || host.id === "openclaw" || host.id === "gemini-cli") {
      blocks.push({
        title: "Install to " + host.label + ":",
        body: pretty,
        note: "Add this MCP server block in " + host.label + " settings, then restart."
      });
      if (githubUrl) {
        blocks.push({
          title: "Repository:",
          body: githubUrl,
          href: githubUrl
        });
      }
      return blocks;
    }

    blocks.push({
      title: "Install to " + host.label + ":",
      body: pretty,
      note: "Use this MCP config if your host supports local MCP servers."
    });
    return blocks;
  }

  function skillBlocks(host, skillUrl, downloadUrl) {
    if (host.download) {
      return [
        {
          title: "Download skill:",
          body: downloadUrl || skillUrl,
          note: "Download or open the skill source, then place it in your host skills folder.",
          href: downloadUrl || skillUrl
        }
      ];
    }
    return [
      {
        title: "Install to " + host.label + ":",
        body: skillCommand(skillUrl, host.agent),
        note: "Requires Node.js / npx. Start a new chat after install."
      }
    ];
  }

  function defaultRequirements(kind) {
    if (kind === "skills") {
      return [
        "Node.js 18+ with <code>npx</code> on PATH",
        "An agent host that supports skills install",
        "Fresh chat/session after install so the skill loads"
      ];
    }
    return [
      "An MCP-capable agent host",
      "<code>uv</code> / <code>uvx</code> on PATH (or the command shown for your host)",
      "Any desktop app / extension required by the server (see README)",
      "Restart the host after saving MCP config"
    ];
  }

  function bindAccordion(root) {
    root.querySelectorAll("[data-host-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest("[data-host-item]");
        if (!item) return;
        var open = item.classList.contains("is-open");
        root.querySelectorAll("[data-host-item].is-open").forEach(function (el) {
          el.classList.remove("is-open");
          var t = el.querySelector("[data-host-toggle]");
          if (t) t.setAttribute("aria-expanded", "false");
          var p = el.querySelector("[data-host-panel]");
          if (p) p.hidden = true;
        });
        if (!open) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          var panel = item.querySelector("[data-host-panel]");
          if (panel) panel.hidden = false;
        }
      });
    });

    root.querySelectorAll("[data-copy-install]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.parentElement && btn.parentElement.querySelector("code");
        if (!code) return;
        navigator.clipboard.writeText(code.textContent.trim()).then(function () {
          var prev = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(function () {
            btn.textContent = prev;
          }, 1400);
        });
      });
    });
  }

  function render(target, options) {
    if (!target) return;
    var kind = options.kind || "skills";
    var skillUrl = options.skillUrl || "";
    var downloadUrl = options.downloadUrl || skillUrl;
    var mcpJson = options.mcpJson || "";
    var githubUrl = options.githubUrl || "";
    var requirements =
      options.requirements && options.requirements.length
        ? options.requirements
        : defaultRequirements(kind);

    var hosts = HOSTS.filter(function (h) {
      return kind === "skills" ? h.skill : h.mcp;
    });

    var reqHtml =
      '<div class="host-reqs">' +
      "<h3>Requirements</h3>" +
      "<ul>" +
      requirements
        .map(function (r) {
          return "<li>" + r + "</li>";
        })
        .join("") +
      "</ul></div>";

    var listHtml = hosts
      .map(function (host, idx) {
        var label = hostLabel(host, kind);
        var blocks =
          kind === "skills"
            ? skillBlocks(host, skillUrl, downloadUrl)
            : mcpCommands(host, mcpJson, githubUrl, downloadUrl);
        var panelId = "host-panel-" + host.id + "-" + kind;
        var body = blocks
          .map(function (block) {
            var actions =
              '<button type="button" class="copy-btn" data-copy-install>Copy</button>' +
              (block.href
                ? '<a class="copy-btn host-download-btn" href="' +
                  esc(block.href) +
                  '" rel="noopener" target="_blank">Open</a>'
                : "");
            return (
              '<div class="host-install-block">' +
              '<p class="host-install-title">' +
              esc(block.title) +
              "</p>" +
              '<div class="install-row">' +
              "<code>" +
              esc(block.body) +
              "</code>" +
              actions +
              "</div>" +
              (block.note ? '<p class="host-install-note">' + esc(block.note) + "</p>" : "") +
              "</div>"
            );
          })
          .join("");

        return (
          '<div class="host-item" data-host-item data-host-id="' +
          esc(host.id) +
          '">' +
          '<button type="button" class="host-toggle" data-host-toggle aria-expanded="false" aria-controls="' +
          panelId +
          '">' +
          host.icon +
          '<span class="host-label">' +
          esc(label) +
          "</span>" +
          '<span class="host-chevron" aria-hidden="true"></span>' +
          "</button>" +
          '<div class="host-panel" id="' +
          panelId +
          '" data-host-panel hidden>' +
          body +
          "</div></div>"
        );
      })
      .join("");

    target.innerHTML =
      reqHtml +
      '<div class="host-install" data-host-install>' +
      '<p class="host-install-lede">Choose a host to expand install instructions.</p>' +
      '<div class="host-list" role="list">' +
      listHtml +
      "</div></div>";

    bindAccordion(target);
  }

  window.RogueInstallHosts = {
    hosts: HOSTS,
    render: render,
    skillCommand: skillCommand,
    defaultRequirements: defaultRequirements
  };
})();
