/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 17:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 18:05:00
 *
 * License types aligned to Unity Asset Store EULA (when relevant):
 * 1. Extension Asset — tools / per-seat (MCP, Skills)
 * 2. Single Entity — one individual or one company (assets)
 * 3. Multi-Entity — affiliates + contractors
 * Plus Open-Source for SPDX/GitHub copyright licenses (not a Unity EULA tier).
 *
 * Refs: unity.com/legal/as-terms · Unity Support “Asset Store licenses”
 * UI: clickable type → “Asset Licenses” popup (Unity Asset Store pattern).
 */
(function () {
  var TYPE_INFO = {
    extension: {
      label: "Extension Asset",
      shortLabel: "Extension Asset",
      summary: "One license required for each individual user."
    },
    single: {
      label: "Single Entity",
      shortLabel: "Single Entity",
      summary:
        "Recommended for individuals and small businesses. Share within one company or legal entity (employees of that entity)."
    },
    multi: {
      label: "Multi-Entity",
      shortLabel: "Multi-Entity",
      summary:
        "Covers parent, child, and sister companies, as well as contractors on a project."
    },
    opensource: {
      label: "Open-Source License",
      shortLabel: "Open-Source License",
      summary:
        "Governed by the named open-source license. Follow that license’s terms for use, modification, and distribution."
    }
  };

  /** Legacy marketplace labels → Unity-aligned keys */
  var ALIAS = {
    personal: "single",
    commercial: "single",
    extended: "multi",
    plr: "multi",
    "extension-asset": "extension",
    "single-entity": "single",
    "multi-entity": "multi",
    "multi entity": "multi",
    "single entity": "single",
    "extension asset": "extension"
  };

  var TYPE_LABEL = {};
  Object.keys(TYPE_INFO).forEach(function (key) {
    TYPE_LABEL[key] = TYPE_INFO[key].label;
  });

  function resolveTypeKey(key) {
    var k = String(key || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");
    if (TYPE_INFO[k]) return k;
    if (ALIAS[k]) return ALIAS[k];
    return "";
  }

  function headText(raw) {
    return String(raw || "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map(function (line) {
        return line.replace(/^\uFEFF/, "").trim();
      })
      .filter(Boolean)
      .slice(0, 10)
      .join("\n");
  }

  function detectSpdx(head, full) {
    var s = full || head;
    if (/\bMIT License\b/i.test(head) || /^MIT$/i.test(s.trim()) || (/\bMIT\b/i.test(head) && /Permission is hereby granted/i.test(s))) {
      return "MIT";
    }
    if (/\bApache License\b[\s\S]{0,40}Version 2\.0\b/i.test(head) || /\bApache-2\.0\b/i.test(s)) return "Apache-2.0";
    if (/\bGNU GENERAL PUBLIC LICENSE\b[\s\S]{0,40}Version 3\b/i.test(head) || /\bGPL-3\.0\b/i.test(s)) return "GPL-3.0";
    if (/\bGNU GENERAL PUBLIC LICENSE\b[\s\S]{0,40}Version 2\b/i.test(head) || /\bGPL-2\.0\b/i.test(s)) return "GPL-2.0";
    if (/\bBSD 3-Clause\b/i.test(head) || /\bBSD-3-Clause\b/i.test(s)) return "BSD-3-Clause";
    if (/\bBSD 2-Clause\b/i.test(head) || /\bBSD-2-Clause\b/i.test(s)) return "BSD-2-Clause";
    if (/\bMozilla Public License\b[\s\S]{0,20}2\.0\b/i.test(head) || /\bMPL-2\.0\b/i.test(s)) return "MPL-2.0";
    if (/\bISC License\b/i.test(head) || /^ISC$/i.test(s.trim())) return "ISC";
    if (/\bUnlicense\b/i.test(head)) return "Unlicense";
    if (/^[A-Za-z0-9.+-]{2,40}$/.test(s.trim()) && !/^(NOASSERTION|NONE|Other)$/i.test(s.trim())) {
      return s.trim();
    }
    return "";
  }

  function emptyResult() {
    return {
      type: "",
      detail: "",
      label: "",
      shortLabel: "",
      summary: ""
    };
  }

  function enrich(type, detail) {
    var key = resolveTypeKey(type) || type;
    var info = TYPE_INFO[key];
    if (!info) return emptyResult();
    var shortLabel = info.shortLabel;
    if (key === "opensource" && detail) {
      shortLabel = info.shortLabel + " (" + detail + ")";
    }
    return {
      type: key,
      detail: detail || "",
      label: key === "opensource" && detail ? info.label + " (" + detail + ")" : info.label,
      shortLabel: shortLabel,
      summary: info.summary
    };
  }

  function classify(raw) {
    var full = String(raw || "").replace(/^\uFEFF/, "").trim();
    if (!full || /^(NOASSERTION|NONE|Other)$/i.test(full)) {
      return emptyResult();
    }

    var head = headText(full);
    var lower = (head + "\n" + full).toLowerCase();

    var knownOpen = head.match(
      /^(?:software\s*\/\s*)?open[- ]source(?:\s+license)?(?:\s*\(([^)]+)\))?$/i
    );
    if (knownOpen) {
      return enrich("opensource", (knownOpen[1] || "").trim());
    }

    if (/^extension(?:\s+asset)?$/i.test(head)) return enrich("extension");
    if (/^single(?:\s+entity)?$/i.test(head)) return enrich("single");
    if (/^multi(?:\s*[- ]?\s*entity)?$/i.test(head)) return enrich("multi");

    if (/^personal(?:\s+license)?$/i.test(head)) return enrich("single");
    if (/^commercial(?:\s+license)?$/i.test(head)) return enrich("single");
    if (/^extended(?:\s*\/\s*unlimited)?(?:\s+license)?$/i.test(head)) return enrich("multi");
    if (/^(?:reseller(?:\s*\/\s*plr)?|plr)(?:\s+license)?$/i.test(head)) return enrich("multi");

    if (/\bextension\s+asset\b/i.test(lower) || /\bper[- ]seat\b/i.test(lower)) {
      return enrich("extension");
    }
    if (/\bmulti[- ]entity\b/i.test(lower)) return enrich("multi");
    if (/\bsingle[- ]entity\b/i.test(lower)) return enrich("single");

    if (/\b(plr|private label rights?|reseller license|resell(?:er)? rights?)\b/i.test(lower)) {
      return enrich("multi");
    }
    if (/\b(extended|unlimited)\s+license\b/i.test(lower)) {
      return enrich("multi");
    }
    if (
      /\bpersonal\s+license\b/i.test(lower) ||
      /\bpersonal use only\b/i.test(lower) ||
      /\bfor personal(?:\/non-commercial)? use\b/i.test(lower)
    ) {
      return enrich("single");
    }
    if (
      /\bcommercial\s+license\b/i.test(lower) ||
      /^commercial\b/i.test(head) ||
      /\bsingle product\b/i.test(lower)
    ) {
      return enrich("single");
    }

    var spdx = detectSpdx(head, full);
    if (spdx) {
      return enrich("opensource", spdx);
    }

    if (/\b(open[- ]source|software license)\b/i.test(lower)) {
      return enrich("opensource");
    }

    return emptyResult();
  }

  function defaultForKind(kind) {
    var k = String(kind || "").toLowerCase();
    if (k === "servers" || k === "skills" || k === "tools") return enrich("extension");
    if (k === "assets" || k === "product") return enrich("single");
    return emptyResult();
  }

  function labelFromSource(raw) {
    var result = classify(raw);
    return result.shortLabel || result.label || "";
  }

  function classifyFromItem(item, kindHint) {
    if (!item) return emptyResult();
    var keyed = resolveTypeKey(item.licenseTypeKey);
    if (keyed) {
      return enrich(keyed, item.licenseDetail || "");
    }
    var fromRaw = classify(item.license || item.licenseType || item.licenseSpdx || "");
    if (fromRaw.type) return fromRaw;
    return defaultForKind(kindHint || item.kind || item.catalogKind || "");
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linkHtml(classified) {
    if (!classified || !classified.type || !classified.shortLabel) {
      return "—";
    }
    return (
      '<button type="button" class="detail-license-link" data-license-info' +
      ' data-license-type="' +
      esc(classified.type) +
      '"' +
      (classified.detail ? ' data-license-detail="' + esc(classified.detail) + '"' : "") +
      ' aria-haspopup="dialog">' +
      esc(classified.shortLabel) +
      "</button>"
    );
  }

  var popupEl = null;
  var lastFocus = null;

  function ensurePopup() {
    if (popupEl) return popupEl;
    popupEl = document.createElement("div");
    popupEl.className = "license-popup-root";
    popupEl.hidden = true;
    popupEl.innerHTML =
      '<div class="license-popup-backdrop" data-license-popup-close tabindex="-1"></div>' +
      '<div class="license-popup" role="dialog" aria-modal="true" aria-labelledby="license-popup-title" tabindex="-1">' +
      '<div class="license-popup-head">' +
      '<h2 id="license-popup-title" class="license-popup-title">Asset Licenses</h2>' +
      '<button type="button" class="license-popup-close" data-license-popup-close aria-label="Close">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M6 6l12 12M18 6L6 18"></path>' +
      "</svg>" +
      "</button>" +
      "</div>" +
      '<div class="license-popup-body">' +
      '<p class="license-popup-type" data-license-popup-type></p>' +
      '<p class="license-popup-summary" data-license-popup-summary></p>' +
      "</div>" +
      "</div>";
    document.body.appendChild(popupEl);

    popupEl.addEventListener("click", function (e) {
      if (e.target.closest("[data-license-popup-close]")) {
        closePopup();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && popupEl && !popupEl.hidden) {
        closePopup();
      }
    });

    return popupEl;
  }

  function openPopup(type, detail) {
    var key = resolveTypeKey(type) || type;
    var info = TYPE_INFO[key];
    if (!info) return;
    var root = ensurePopup();
    var typeEl = root.querySelector("[data-license-popup-type]");
    var summaryEl = root.querySelector("[data-license-popup-summary]");
    var typeName = info.shortLabel;
    if (key === "opensource" && detail) {
      typeName = info.shortLabel + " (" + detail + ")";
    }
    if (typeEl) typeEl.textContent = typeName;
    if (summaryEl) summaryEl.textContent = info.summary;
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("license-popup-open");
    var dialog = root.querySelector(".license-popup");
    if (dialog) dialog.focus();
  }

  function closePopup() {
    if (!popupEl || popupEl.hidden) return;
    popupEl.hidden = true;
    document.body.classList.remove("license-popup-open");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  function bindLicenseLinks(root) {
    var scope = root || document;
    scope.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-license-info]");
      if (!btn || !scope.contains(btn)) return;
      e.preventDefault();
      openPopup(btn.getAttribute("data-license-type") || "", btn.getAttribute("data-license-detail") || "");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindLicenseLinks(document);
    });
  } else {
    bindLicenseLinks(document);
  }

  window.RogueLicense = {
    types: TYPE_LABEL,
    info: TYPE_INFO,
    alias: ALIAS,
    classify: classify,
    classifyFromItem: classifyFromItem,
    defaultForKind: defaultForKind,
    labelFromSource: labelFromSource,
    linkHtml: linkHtml,
    openPopup: openPopup,
    closePopup: closePopup
  };
})();
