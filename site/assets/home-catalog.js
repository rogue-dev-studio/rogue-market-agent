/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:27:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 12:27:00
 */
(function () {
  function card(item, kind) {
    var href = item.htmlUrl || "#";
    var badge = item.badge || (kind === "servers" ? "MCP" : item.name.slice(0, 2).toUpperCase());
    var meta = (kind === "servers" ? "MCP" : "Skill") + " · " + (item.owner || "rogue-dev-studio");
    return (
      '<li><a class="skill-card' + (kind === "servers" ? " server-card" : "") +
      '" href="' + href + '" target="_blank" rel="noopener">' +
      (kind === "servers"
        ? '<span class="server-card-icon" aria-hidden="true">' + badge + "</span>"
        : "") +
      '<span class="skill-meta">' + meta + "</span>" +
      '<strong class="skill-name">' + item.name + "</strong>" +
      '<span class="skill-desc">' + item.description + "</span>" +
      "</a></li>"
    );
  }

  function emptyHtml(kind) {
    return (
      '<li class="empty-state">' +
      (kind === "servers" ? "No MCP servers yet." : "No skills yet.") +
      "</li>"
    );
  }

  function renderHome() {
    var catalog = window.RogueCatalog || {};
    var serversHost = document.querySelector('[data-home-catalog="servers"]');
    var skillsHost = document.querySelector('[data-home-catalog="skills"]');

    if (serversHost) {
      var servers = catalog.servers || [];
      serversHost.innerHTML = servers.length
        ? servers.slice(0, 6).map(function (item) {
            return card(item, "servers");
          }).join("")
        : emptyHtml("servers");
    }

    if (skillsHost) {
      var skills = catalog.skills || [];
      skillsHost.innerHTML = skills.length
        ? skills.slice(0, 6).map(function (item) {
            return card(item, "skills");
          }).join("")
        : emptyHtml("skills");
    }
  }

  document.addEventListener("rogue-catalog:loaded", renderHome);
  renderHome();
})();
