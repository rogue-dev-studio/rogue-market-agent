/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 12:05:00
 */
(function () {
  var root = document.querySelector("[data-detail-tabs]");
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-tab]"));
  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-panel]"));
  if (!tabs.length || !panels.length) return;

  function activate(id, pushHash) {
    var found = false;
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.setAttribute("tabindex", on ? "0" : "-1");
      if (on) found = true;
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-panel") === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
    if (!found && tabs[0]) {
      activate(tabs[0].getAttribute("data-tab"), false);
      return;
    }
    if (pushHash) {
      var url = location.pathname + location.search + "#" + id;
      history.replaceState(null, "", url);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab.getAttribute("data-tab"), true);
    });
  });

  root.addEventListener("keydown", function (e) {
    var current = document.activeElement;
    if (!current || !current.hasAttribute("data-tab")) return;
    var idx = tabs.indexOf(current);
    if (idx < 0) return;
    var next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    if (next < 0) return;
    e.preventDefault();
    tabs[next].focus();
    activate(tabs[next].getAttribute("data-tab"), true);
  });

  var hash = (location.hash || "").replace(/^#/, "");
  var initial = hash || root.getAttribute("data-default-tab") || (tabs[0] && tabs[0].getAttribute("data-tab"));
  activate(initial, false);

  window.addEventListener("hashchange", function () {
    var id = (location.hash || "").replace(/^#/, "");
    if (id) activate(id, false);
  });
})();
