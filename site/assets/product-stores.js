/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 18:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 19:40:00
 *
 * Digital-product storefronts (not Gumroad-only):
 * Gumroad, Sketchfab, Shutterstock, Adobe Stock, Unity Asset Store, etc.
 */
(function () {
  var STORE_META = {
    gumroad: {
      id: "gumroad",
      label: "Gumroad",
      host: /(^|\.)gumroad\.com$/i
    },
    sketchfab: {
      id: "sketchfab",
      label: "Sketchfab",
      host: /(^|\.)sketchfab\.com$/i
    },
    shutterstock: {
      id: "shutterstock",
      label: "Shutterstock",
      host: /(^|\.)shutterstock\.com$/i
    },
    "adobe-stock": {
      id: "adobe-stock",
      label: "Adobe Stock",
      host: /(^|\.)stock\.adobe\.com$/i
    },
    turbosquid: {
      id: "turbosquid",
      label: "TurboSquid",
      host: /(^|\.)turbosquid\.com$/i
    },
    cgtrader: {
      id: "cgtrader",
      label: "CGTrader",
      host: /(^|\.)cgtrader\.com$/i
    },
    itch: {
      id: "itch",
      label: "itch.io",
      host: /(^|\.)itch\.io$/i
    },
    unity: {
      id: "unity",
      label: "Unity Asset Store",
      host: /(^|\.)assetstore\.unity\.com$/i
    },
    fab: {
      id: "fab",
      label: "Fab",
      host: /(^|\.)fab\.com$/i
    },
    other: {
      id: "other",
      label: "Store",
      host: null
    }
  };

  var LEGACY_URL_KEYS = [
    ["gumroadUrl", "gumroad"],
    ["sketchfabUrl", "sketchfab"],
    ["shutterstockUrl", "shutterstock"],
    ["adobeStockUrl", "adobe-stock"],
    ["turbosquidUrl", "turbosquid"],
    ["cgtraderUrl", "cgtrader"],
    ["itchUrl", "itch"],
    ["unityUrl", "unity"],
    ["fabUrl", "fab"],
    ["buyUrl", ""],
    ["url", ""]
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function metaFor(id) {
    var key = String(id || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");
    return STORE_META[key] || STORE_META.other;
  }

  function detectIdFromUrl(url) {
    try {
      var host = new URL(url).hostname.replace(/^www\./i, "");
      var keys = Object.keys(STORE_META);
      for (var i = 0; i < keys.length; i++) {
        var m = STORE_META[keys[i]];
        if (m.host && m.host.test(host)) return m.id;
      }
    } catch (err) {}
    return "other";
  }

  function normalizeEntry(raw, fallbackId) {
    if (!raw) return null;
    if (typeof raw === "string") {
      var urlOnly = String(raw).trim();
      if (!urlOnly) return null;
      var idFromUrl = fallbackId || detectIdFromUrl(urlOnly);
      var meta = metaFor(idFromUrl);
      return {
        id: meta.id,
        label: meta.label,
        url: urlOnly,
        primary: false
      };
    }
    var url = String(raw.url || raw.href || "").trim();
    if (!url) return null;
    var id = raw.id || raw.store || raw.provider || fallbackId || detectIdFromUrl(url);
    var meta = metaFor(id);
    return {
      id: meta.id,
      label: String(raw.label || meta.label),
      url: url,
      primary: !!raw.primary
    };
  }

  function listFromItem(item) {
    if (!item) return [];
    var out = [];
    var seen = {};

    function push(entry) {
      if (!entry || !entry.url) return;
      var key = entry.id + "|" + entry.url.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push(entry);
    }

    if (Array.isArray(item.stores)) {
      item.stores.forEach(function (row) {
        push(normalizeEntry(row));
      });
    }

    LEGACY_URL_KEYS.forEach(function (pair) {
      var field = pair[0];
      var forcedId = pair[1];
      if (!item[field]) return;
      push(normalizeEntry(item[field], forcedId));
    });

    if (!out.length) return out;

    var primaryIdx = -1;
    for (var i = 0; i < out.length; i++) {
      if (out[i].primary) {
        primaryIdx = i;
        break;
      }
    }
    if (primaryIdx < 0) primaryIdx = 0;
    out.forEach(function (row, idx) {
      row.primary = idx === primaryIdx;
    });
    if (primaryIdx > 0) {
      var primary = out.splice(primaryIdx, 1)[0];
      out.unshift(primary);
    }
    return out;
  }

  function primaryUrl(item) {
    var list = listFromItem(item);
    return list.length ? list[0].url : "";
  }

  function iconSvg(id) {
    if (id === "gumroad") {
      return (
        '<svg role="img" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0Zm-.007 5.12c4.48 0 5.995 3.025 6.064 4.744h-3.239c-.069-.962-.897-2.406-2.896-2.406-2.136 0-3.514 1.857-3.514 4.126 0 2.27 1.378 4.125 3.514 4.125 1.93 0 2.758-1.512 3.103-3.025h-3.103v-1.238h6.509v6.327h-2.855v-3.989c-.207 1.444-1.102 4.264-4.617 4.264-3.516 0-5.584-2.82-5.584-6.326 0-3.645 2.276-6.602 6.618-6.602z"></path>' +
        "</svg>"
      );
    }
    if (id === "sketchfab") {
      return (
        '<svg role="img" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M11.3 0A11.983 11.983 0 0 0 .037 11a13.656 13.656 0 0 0 0 2 11.983 11.983 0 0 0 11.29 11h1.346a12.045 12.045 0 0 0 11.3-11.36 13.836 13.836 0 0 0 0-1.7A12.049 12.049 0 0 0 12.674 0zM15 6.51l2.99 1.74s-6.064 3.24-6.084 3.24S5.812 8.27 5.8 8.26l2.994-1.77 2.992-1.76zm-6.476 5.126L11 13v5.92l-2.527-1.4-2.46-1.43v-5.76zm9.461 1.572v2.924L15.5 17.574 13 19.017v-6.024l2.489-1.345 2.5-1.355z"></path>' +
        "</svg>"
      );
    }
    var letter = (metaFor(id).label || "S").charAt(0).toUpperCase();
    return '<span class="detail-store-letter" aria-hidden="true">' + esc(letter) + "</span>";
  }

  function actionsHtml(item) {
    var list = listFromItem(item);
    if (!list.length) return "";
    return list
      .map(function (store) {
        var title = "Get on " + store.label;
        return (
          '<a class="detail-icon-btn detail-store-btn detail-store-' +
          esc(store.id) +
          (store.primary ? " is-primary" : "") +
          '" href="' +
          esc(store.url) +
          '" rel="noopener" target="_blank" title="' +
          esc(title) +
          '" aria-label="' +
          esc(title) +
          '" data-detail-buy' +
          (store.primary ? ' data-detail-buy-primary' : "") +
          ">" +
          iconSvg(store.id) +
          "</a>"
        );
      })
      .join("");
  }

  function aboutRowsHtml(item) {
    var list = listFromItem(item);
    if (!list.length) return "";
    var links = list
      .map(function (store) {
        return (
          '<a href="' +
          esc(store.url) +
          '" rel="noopener" target="_blank">' +
          esc(store.label) +
          "</a>"
        );
      })
      .join('<span class="detail-store-sep" aria-hidden="true"> · </span>');
    return "<dt>Available on</dt><dd class=\"detail-store-list\">" + links + "</dd>";
  }

  window.RogueProductStores = {
    meta: STORE_META,
    listFromItem: listFromItem,
    primaryUrl: primaryUrl,
    actionsHtml: actionsHtml,
    aboutRowsHtml: aboutRowsHtml
  };
})();
