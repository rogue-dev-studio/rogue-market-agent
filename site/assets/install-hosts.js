/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-21 12:33:55
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-21 12:33:55
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function icon(letter, bg) {
    return (
      '<span class="host-icon" style="--host-icon-bg:' +
      esc(bg) +
      '" aria-hidden="true">' +
      esc(letter) +
      "</span>"
    );
  }

  var HOSTS = [
    { id: "telegram", label: "Telegram", agent: "telegram", icon: icon("Tg", "#229ED9"), skill: true, mcp: false },
    { id: "slack", label: "Slack", agent: "slack", icon: icon("Sl", "#4A154B"), skill: true, mcp: false },
    { id: "claude-code", label: "Claude Code", agent: "claude", icon: icon("CC", "#D97757"), skill: true, mcp: true },
    { id: "codex", label: "Codex", agent: "codex", icon: icon("Cx", "#1F2937"), skill: true, mcp: true },
    { id: "openclaw", label: "OpenClaw", agent: "openclaw", icon: icon("Oc", "#0F766E"), skill: true, mcp: true },
    { id: "cursor", label: "Cursor", agent: "cursor", icon: icon("Cu", "#E47909"), skill: true, mcp: true },
    { id: "amp", label: "Amp", agent: "amp", icon: icon("Am", "#6366F1"), skill: true, mcp: true },
    { id: "github-copilot", label: "GitHub Copilot", agent: "copilot", icon: icon("Gh", "#24292F"), skill: true, mcp: true },
    { id: "gemini-cli", label: "Gemini CLI", agent: "gemini", icon: icon("Ge", "#4285F4"), skill: true, mcp: true },
    { id: "kilo", label: "Kilo Code", agent: "kilo", icon: icon("Ki", "#7C3AED"), skill: true, mcp: true },
    { id: "junie", label: "Junie", agent: "junie", icon: icon("Ju", "#DB2777"), skill: true, mcp: false },
    { id: "replit", label: "Replit", agent: "replit", icon: icon("Re", "#F26207"), skill: true, mcp: true },
    { id: "windsurf", label: "Windsurf", agent: "windsurf", icon: icon("Ws", "#0EA5E9"), skill: true, mcp: true },
    { id: "cline", label: "Cline", agent: "cline", icon: icon("Cl", "#F59E0B"), skill: true, mcp: true },
    { id: "continue", label: "Continue", agent: "continue", icon: icon("Co", "#22C55E"), skill: true, mcp: true },
    { id: "opencode", label: "OpenCode", agent: "opencode", icon: icon("Op", "#111827"), skill: true, mcp: true },
    { id: "openhands", label: "OpenHands", agent: "openhands", icon: icon("Oh", "#2563EB"), skill: true, mcp: true },
    { id: "roo", label: "Roo Code", agent: "roo", icon: icon("Ro", "#EA580C"), skill: true, mcp: true },
    { id: "augment", label: "Augment", agent: "augment", icon: icon("Au", "#8B5CF6"), skill: true, mcp: true },
    { id: "goose", label: "Goose", agent: "goose", icon: icon("Go", "#CA8A04"), skill: true, mcp: true },
    { id: "trae", label: "Trae", agent: "trae", icon: icon("Tr", "#06B6D4"), skill: true, mcp: true },
    { id: "zencoder", label: "Zencoder", agent: "zencoder", icon: icon("Ze", "#EC4899"), skill: true, mcp: true },
    { id: "antigravity", label: "Antigravity", agent: "antigravity", icon: icon("Ag", "#334155"), skill: true, mcp: true },
    { id: "download", label: "Download skill", agent: null, icon: icon("Dl", "#64748B"), skill: true, mcp: false, download: true }
  ];

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

  function mcpCommands(host, mcpJson, githubUrl) {
    var pretty = typeof mcpJson === "string" ? mcpJson : prettyJson(mcpJson);
    var info = mcpServerEntry(mcpJson);
    var key = info ? info.key : "server";
    var entry = info ? info.entry : null;
    var blocks = [];

    if (host.id === "cursor" || host.id === "windsurf" || host.id === "cline" || host.id === "continue" || host.id === "amp" || host.id === "augment" || host.id === "trae" || host.id === "zencoder" || host.id === "antigravity" || host.id === "kilo" || host.id === "roo" || host.id === "goose" || host.id === "openhands" || host.id === "replit" || host.id === "github-copilot") {
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
      var joined = [cmd].concat(args).map(function (a) {
        return /\s/.test(String(a)) ? JSON.stringify(String(a)) : String(a);
      }).join(" ");
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
          body: githubUrl
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
          note: "Download or open the skill source, then place it in your host skills folder."
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
    var requirements = options.requirements && options.requirements.length
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
        var blocks =
          kind === "skills"
            ? skillBlocks(host, skillUrl, downloadUrl)
            : mcpCommands(host, mcpJson, githubUrl);
        var panelId = "host-panel-" + host.id;
        var body = blocks
          .map(function (block) {
            return (
              '<div class="host-install-block">' +
              "<p class=\"host-install-title\">" +
              esc(block.title) +
              "</p>" +
              '<div class="install-row">' +
              "<code>" +
              esc(block.body) +
              "</code>" +
              '<button type="button" class="copy-btn" data-copy-install>Copy</button>' +
              "</div>" +
              (block.note ? '<p class="host-install-note">' + esc(block.note) + "</p>" : "") +
              "</div>"
            );
          })
          .join("");

        return (
          '<div class="host-item' +
          (idx === 0 ? " is-open" : "") +
          '" data-host-item data-host-id="' +
          esc(host.id) +
          '">' +
          '<button type="button" class="host-toggle" data-host-toggle aria-expanded="' +
          (idx === 0 ? "true" : "false") +
          '" aria-controls="' +
          panelId +
          '">' +
          host.icon +
          '<span class="host-label">' +
          esc(host.label) +
          "</span>" +
          '<span class="host-chevron" aria-hidden="true"></span>' +
          "</button>" +
          '<div class="host-panel" id="' +
          panelId +
          '" data-host-panel' +
          (idx === 0 ? "" : " hidden") +
          ">" +
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
