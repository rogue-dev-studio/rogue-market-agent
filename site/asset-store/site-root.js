/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 14:22:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 14:22:00
 */
(function () {
  function resolveSiteRoot() {
    var raw = document.body.getAttribute("data-base") || "./";
    var anchor = document.createElement("a");
    anchor.href = raw;
    var path = anchor.pathname || "/";
    if (!/\/$/.test(path)) {
      var last = path.split("/").pop() || "";
      if (/\.[a-z0-9]+$/i.test(last)) {
        path = path.replace(/\/[^/]+$/, "/");
      } else {
        path += "/";
      }
    }
    return path;
  }

  window.RogueSite = window.RogueSite || {};
  window.RogueSite.root = resolveSiteRoot;

  function detailPath(kind, item) {
    var root = resolveSiteRoot();
    if (kind === "assets") {
      var id = (item && (item.id || item.slug)) || "";
      if (id) return root + "assets/detail/?id=" + encodeURIComponent(id);
      return root + "assets/";
    }
    var repo = (item && (item.githubRepo || item.full_name)) || "";
    if (!repo && item && item.owner && item.name) {
      repo = item.owner + "/" + item.name;
    }
    if (repo) {
      return root + kind + "/detail/?repo=" + encodeURIComponent(repo);
    }
    if (kind === "skills" && item && item.slug) {
      return root + "skills/" + item.slug + "/";
    }
    if (item && item.slug) {
      return root + "servers/" + item.slug + "/";
    }
    return root + kind + "/";
  }

  window.RogueSite.detailPath = detailPath;
})();
