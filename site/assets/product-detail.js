/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 12:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 20:30:00
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function priceLabel(item) {
    if (window.RogueCards && RogueCards.priceLabel) return RogueCards.priceLabel(item);
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    if (isNaN(n) || n <= 0) return "Free";
    if (Number.isInteger(n)) return "$" + n;
    return "$" + n.toFixed(2);
  }

  function itemPriceIsFree(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    return isNaN(n) || n <= 0;
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

  function findProduct(id) {
    var list = (window.RogueCatalog && RogueCatalog.products) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id || list[i].slug === id) return list[i];
    }
    return null;
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

  function resolveImage(item) {
    if (window.RogueCards && RogueCards.itemImage) return RogueCards.itemImage(item, "products");
    if (!item.image) return "";
    if (/^https?:\/\//i.test(item.image)) return item.image;
    var root = (window.RogueSite && RogueSite.root && RogueSite.root()) || "/";
    return root + String(item.image).replace(/^\//, "");
  }

  function pillsHtml(item) {
    var root = (window.RogueSite && RogueSite.root && RogueSite.root()) || "../../";
    var parts = [];
    parts.push('<span class="price-pill" title="Price">' + esc(priceLabel(item)) + "</span>");
    if (item.category) {
      parts.push(
        '<a class="pill pill-link" href="' +
          esc(root + "products/search/?category=" + encodeURIComponent(item.category)) +
          '">' +
          esc(item.category) +
          "</a>"
      );
    }
    var seen = {};
    (item.tags || []).forEach(function (tag) {
      String(tag)
        .split(/\s*›\s*/)
        .forEach(function (part) {
          part = part.trim();
          if (!part) return;
          var key = part.toLowerCase();
          if (seen[key]) return;
          seen[key] = true;
          parts.push(
            '<a class="pill pill-link" href="' +
              esc(root + "products/search/?tag=" + encodeURIComponent(part)) +
              '">' +
              esc(part) +
              "</a>"
          );
        });
    });
    return parts.join("");
  }

  function resolveAuthor(item) {
    var isSketchfab = !!(item && (item.source === "sketchfab" || item.sketchfabUid));
    if (isSketchfab) {
      var sfHandle = item.author || item.owner || "rogue-dev-studio";
      var sfName = item.authorName || item.displayName || sfHandle;
      var sfUrl =
        item.authorUrl ||
        item.profileUrl ||
        (window.RogueCatalog && RogueCatalog.studioStores && RogueCatalog.studioStores.sketchfab) ||
        "https://sketchfab.com/" + encodeURIComponent(sfHandle);
      return { name: sfName, handle: sfHandle, url: sfUrl };
    }

    var handle = item.author || item.owner || "rogue-dev-studio";
    var name = item.authorName || item.displayName || "";
    var url = item.authorUrl || "";
    var storeUrl =
      (window.RogueProductStores && RogueProductStores.primaryUrl(item)) ||
      item.gumroadUrl ||
      item.buyUrl ||
      "";
    if (!url && storeUrl) {
      try {
        var u = new URL(storeUrl);
        if (/\.gumroad\.com$/i.test(u.hostname)) {
          url = u.protocol + "//" + u.hostname + "/";
          if (!item.author) handle = u.hostname.replace(/\.gumroad\.com$/i, "");
        } else if (/^(www\.)?gumroad\.com$/i.test(u.hostname)) {
          var parts = u.pathname.split("/").filter(Boolean);
          if (parts[0] && parts[0] !== "l") {
            handle = item.author || parts[0];
            url = u.origin + "/" + parts[0];
          }
        } else if (/(^|\.)sketchfab\.com$/i.test(u.hostname)) {
          var sfParts = u.pathname.split("/").filter(Boolean);
          if (sfParts[0] && sfParts[0] !== "3d-models" && sfParts[0] !== "models") {
            handle = item.author || sfParts[0];
            url = u.origin + "/" + sfParts[0];
          } else {
            url =
              (window.RogueCatalog && RogueCatalog.studioStores && RogueCatalog.studioStores.sketchfab) ||
              u.origin + "/";
          }
        } else {
          url = u.origin + "/";
        }
      } catch (err) {}
    }
    if (!url && item.githubRepo) {
      var owner = (item.githubRepo.split("/")[0] || item.owner || handle).trim();
      handle = item.author || owner;
      url = "https://github.com/" + owner;
    }
    if (!url) {
      url = "https://github.com/" + (item.owner || handle);
    }
    if (!name) name = handle;
    return { name: name, handle: handle, url: url };
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

  function licenseCellHtml(item) {
    if (window.RogueLicense && typeof RogueLicense.classifyFromItem === "function") {
      var classified = RogueLicense.classifyFromItem(item, "products");
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

  function formatCompactCount(n) {
    if (typeof n !== "number" || isNaN(n) || n < 0) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(Math.round(n));
  }

  function numOrZero(v) {
    if (typeof v === "number" && !isNaN(v) && v >= 0) return v;
    var n = parseInt(v, 10);
    return !isNaN(n) && n >= 0 ? n : 0;
  }

  function sketchfabEngagementStat(iconSvg, count, label) {
    return (
      '<span class="detail-engagement-stat" title="' +
      esc(label) +
      '">' +
      '<span class="detail-engagement-icon" aria-hidden="true">' +
      iconSvg +
      "</span>" +
      '<span class="detail-engagement-count">' +
      esc(formatCompactCount(count)) +
      '</span><span class="sr-only"> ' +
      esc(label) +
      "</span></span>"
    );
  }

  var ICON_DOWNLOAD =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v11"/><path d="M8 10l4 4 4-4"/><path d="M5 18h14"/></svg>';
  var ICON_VIEWS =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.5"/></svg>';
  var ICON_COMMENTS =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5.5h14a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H10l-4 3.5V15.5H5A1.5 1.5 0 013.5 14V7A1.5 1.5 0 015 5.5z"/></svg>';
  var ICON_STAR =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M12 3.6l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16l-4.8 2.5.9-5.4L4.2 9.3l5.4-.8L12 3.6z"/></svg>';

  function applySketchfabEngagement(item) {
    var host = document.querySelector("[data-detail-engagement]");
    var ratingEl = document.querySelector("[data-detail-rating]");
    var isSketchfab = !!(item && (item.source === "sketchfab" || item.sketchfabUid));
    if (!host) return isSketchfab;

    if (!isSketchfab) {
      host.hidden = true;
      host.innerHTML = "";
      if (ratingEl) ratingEl.hidden = false;
      return false;
    }

    var downloads = numOrZero(item.downloadCount);
    var views = numOrZero(
      typeof item.views === "number" ? item.views : item.votes
    );
    var comments = numOrZero(item.commentCount);
    var likes =
      window.RogueCards && typeof RogueCards.itemLikes === "function"
        ? RogueCards.itemLikes(item)
        : numOrZero(item.likes);

    host.innerHTML =
      sketchfabEngagementStat(ICON_DOWNLOAD, downloads, "Downloads") +
      sketchfabEngagementStat(ICON_VIEWS, views, "Views") +
      sketchfabEngagementStat(ICON_COMMENTS, comments, "Comments") +
      sketchfabEngagementStat(ICON_STAR, likes, "Likes");
    host.hidden = false;
    if (ratingEl) ratingEl.hidden = true;
    return true;
  }

  function formatPublished(raw) {
    if (!raw) return "";
    var t = Date.parse(raw);
    if (isNaN(t)) return String(raw).slice(0, 10);
    try {
      return new Date(t).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (err) {
      return String(raw).slice(0, 10);
    }
  }

  function sketchfabAboutRows(item) {
    if (!(item && (item.source === "sketchfab" || item.sketchfabUid))) return "";
    var parts = [];
    function row(label, valueHtml) {
      if (!valueHtml) return;
      parts.push("<dt>" + esc(label) + "</dt><dd>" + valueHtml + "</dd>");
    }
    row("Published", esc(formatPublished(item.addedAt || item.publishedAt)));
    if (typeof item.faceCount === "number") {
      row("Triangles", esc(formatCompactCount(item.faceCount)));
    }
    if (typeof item.vertexCount === "number") {
      row("Vertices", esc(formatCompactCount(item.vertexCount)));
    }
    if (typeof item.animationCount === "number") {
      row("Animations", esc(String(item.animationCount)));
    }
    if (typeof item.materialCount === "number") {
      row("Materials", esc(String(item.materialCount)));
    }
    if (typeof item.textureCount === "number") {
      row("Textures", esc(String(item.textureCount)));
    }
    if (item.pbrType) row("PBR", esc(String(item.pbrType)));
    if (typeof item.isDownloadable === "boolean") {
      row("Downloadable", item.isDownloadable ? "Yes" : "No");
    }
    if (item.sketchfabCategories && item.sketchfabCategories.length) {
      row("Categories", esc(item.sketchfabCategories.join(", ")));
    }
    if (item.sketchfabTags && item.sketchfabTags.length) {
      row("Tags", esc(item.sketchfabTags.join(", ")));
    }
    if (item.licenseRequirements) {
      row("License notes", esc(item.licenseRequirements));
    }
    return parts.join("");
  }

  function aboutHtml(item) {
    var author = resolveAuthor(item);
    var storesRow =
      window.RogueProductStores && typeof RogueProductStores.aboutRowsHtml === "function"
        ? RogueProductStores.aboutRowsHtml(item)
        : "";
    return (
      '<dl class="detail-about-list">' +
      "<dt>Author</dt>" +
      '<dd><a href="' +
      esc(author.url) +
      '" rel="noopener" target="_blank">' +
      esc(author.name) +
      "</a></dd>" +
      storesRow +
      "<dt>License type</dt>" +
      "<dd>" +
      licenseCellHtml(item) +
      "</dd>" +
      "<dt>File size</dt><dd>" +
      esc(formatFileSize(item.sizeKb, item.sizeBytes)) +
      "</dd>" +
      sketchfabAboutRows(item) +
      "</dl>"
    );
  }

  function showError(msg) {
    var loading = document.querySelector("[data-detail-loading]");
    if (loading) {
      loading.hidden = false;
      loading.textContent = msg || "Product not found.";
    }
    var main = document.querySelector("[data-detail-main]");
    if (main) main.hidden = true;
  }

  function applyProductRating(item) {
    if (applySketchfabEngagement(item)) return;

    var countMode =
      window.RogueCards && typeof RogueCards.isCountOnlyRating === "function"
        ? RogueCards.isCountOnlyRating(item, "products")
        : false;
    var ratingEl = document.querySelector("[data-detail-rating]");
    var starsEl = document.querySelector("[data-detail-stars]");
    var scoreEl = document.querySelector("[data-detail-score]");
    var countEl = document.querySelector("[data-detail-rating-count]");
    if (ratingEl) ratingEl.hidden = false;

    if (countMode) {
      var count =
        window.RogueCards && typeof RogueCards.engagementCount === "function"
          ? RogueCards.engagementCount(item, "products")
          : typeof item.likes === "number"
            ? item.likes
            : 0;
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
        ratingEl.setAttribute("title", "Stars");
      }
      return;
    }

    var scoreRaw = typeof item.rating === "number" ? item.rating : parseFloat(item.rating);
    var hasScore = !isNaN(scoreRaw) && scoreRaw > 0;
    var score = hasScore ? scoreRaw : 0;
    var count =
      typeof item.ratingCount === "number"
        ? item.ratingCount
        : parseInt(item.ratingCount, 10) || 0;
    if (starsEl) {
      starsEl.textContent =
        window.RogueCards && RogueCards.starsGlyph
          ? RogueCards.starsGlyph(score)
          : starsGlyph(score);
      starsEl.removeAttribute("data-star-glyph");
    }
    if (scoreEl) {
      scoreEl.hidden = false;
      scoreEl.textContent =
        window.RogueCards && RogueCards.formatScore
          ? RogueCards.formatScore(score)
          : formatScore(score);
    }
    if (countEl) countEl.textContent = String(count);
    if (ratingEl) {
      ratingEl.classList.remove("asset-card-rating-count");
      ratingEl.classList.toggle("asset-card-rating-empty", !hasScore);
      ratingEl.setAttribute("data-rating-mode", "average");
      ratingEl.setAttribute("title", "Rating");
    }
  }

  var galleryState = { slides: [], index: 0, itemId: "" };

  function sketchfabEmbedUrl(item) {
    if (!item) return "";
    var raw = item.embedUrl || "";
    if (!raw && item.sketchfabUid) {
      raw = "https://sketchfab.com/models/" + item.sketchfabUid + "/embed";
    }
    if (!raw) return "";
    try {
      var u = new URL(raw);
      if (!u.searchParams.has("autostart")) u.searchParams.set("autostart", "0");
      if (!u.searchParams.has("ui_theme")) u.searchParams.set("ui_theme", "dark");
      if (!u.searchParams.has("ui_infos")) u.searchParams.set("ui_infos", "0");
      if (!u.searchParams.has("ui_watermark_link")) u.searchParams.set("ui_watermark_link", "0");
      return u.toString();
    } catch (err) {
      return raw;
    }
  }

  function pushUniqueSlide(slides, seen, slide) {
    if (!slide || !slide.src) return;
    var key = slide.type + "|" + slide.src;
    if (seen[key]) return;
    seen[key] = true;
    slides.push(slide);
  }

  function collectMediaSlides(item) {
    var slides = [];
    var seen = {};
    if (!item) return slides;

    var isSketchfab = !!(item.source === "sketchfab" || item.sketchfabUid);
    var embed = isSketchfab ? sketchfabEmbedUrl(item) : "";
    var cover = resolveImage(item);

    if (embed) {
      pushUniqueSlide(slides, seen, {
        type: "embed",
        src: embed,
        thumb: cover || "",
        label: "3D"
      });
    }

    var video =
      item.videoUrl ||
      item.youtubeUrl ||
      (item.video && (item.video.url || item.video)) ||
      "";
    if (video) {
      var v = String(video);
      var isYt = /youtu\.?be/i.test(v);
      pushUniqueSlide(slides, seen, {
        type: isYt ? "youtube" : "video",
        src: v,
        thumb: cover || "",
        label: "Video"
      });
    }

    var list = [];
    if (Array.isArray(item.gallery) && item.gallery.length) list = list.concat(item.gallery);
    if (Array.isArray(item.images) && item.images.length) list = list.concat(item.images);
    if (Array.isArray(item.media) && item.media.length) list = list.concat(item.media);
    list.forEach(function (entry) {
      if (!entry) return;
      if (typeof entry === "string") {
        pushUniqueSlide(slides, seen, { type: "image", src: entry, thumb: entry, label: "Image" });
        return;
      }
      var src = entry.src || entry.url || entry.image || "";
      if (!src) return;
      var type = entry.type || "image";
      if (type === "embed" || type === "3d") type = "embed";
      pushUniqueSlide(slides, seen, {
        type: type,
        src: src,
        thumb: entry.thumb || entry.thumbnail || src,
        label: entry.label || (type === "embed" ? "3D" : "Image")
      });
    });

    if (cover) {
      pushUniqueSlide(slides, seen, {
        type: "image",
        src: cover,
        thumb: cover,
        label: "Preview"
      });
    }

    return slides;
  }

  function youtubeEmbedUrl(url) {
    try {
      var u = new URL(url);
      var id = "";
      if (/youtu\.be$/i.test(u.hostname)) id = u.pathname.replace(/^\//, "");
      else id = u.searchParams.get("v") || "";
      if (!id) return "";
      return "https://www.youtube.com/embed/" + encodeURIComponent(id) + "?rel=0";
    } catch (err) {
      return "";
    }
  }

  function stageHtml(slide, title) {
    if (!slide) return "";
    if (slide.type === "embed") {
      return (
        '<iframe class="detail-media-frame" src="' +
        esc(slide.src) +
        '" title="' +
        esc(title || "3D model viewer") +
        '" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe>'
      );
    }
    if (slide.type === "youtube") {
      var yt = youtubeEmbedUrl(slide.src) || slide.src;
      return (
        '<iframe class="detail-media-frame" src="' +
        esc(yt) +
        '" title="' +
        esc(title || "Video") +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>'
      );
    }
    if (slide.type === "video") {
      return (
        '<video class="detail-media-video" src="' +
        esc(slide.src) +
        '" controls playsinline preload="metadata"></video>'
      );
    }
    return (
      '<img class="detail-media-image" src="' +
      esc(slide.src) +
      '" alt="' +
      esc(title || "") +
      '" loading="lazy" decoding="async" />'
    );
  }

  function thumbBadge(slide) {
    if (slide.type === "embed") return '<span class="detail-media-thumb-badge" aria-hidden="true">3D</span>';
    if (slide.type === "youtube" || slide.type === "video") {
      return (
        '<span class="detail-media-thumb-play" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        "</span>"
      );
    }
    return "";
  }

  function showGallerySlide(index) {
    var slides = galleryState.slides;
    if (!slides.length) return;
    var i = ((index % slides.length) + slides.length) % slides.length;
    galleryState.index = i;
    var stage = document.querySelector("[data-gallery-stage]");
    var counter = document.querySelector("[data-gallery-counter]");
    var thumbs = document.querySelector("[data-gallery-thumbs]");
    var prevBtn = document.querySelector("[data-gallery-prev]");
    var nextBtn = document.querySelector("[data-gallery-next]");
    var slide = slides[i];
    var title = document.querySelector("[data-detail-title]");
    var name = title ? title.textContent : "Media";
    if (stage) stage.innerHTML = stageHtml(slide, name);
    if (counter) {
      counter.hidden = slides.length < 2;
      counter.textContent = i + 1 + "/" + slides.length;
    }
    if (prevBtn) prevBtn.hidden = slides.length < 2;
    if (nextBtn) nextBtn.hidden = slides.length < 2;
    if (thumbs) {
      thumbs.querySelectorAll("[data-gallery-index]").forEach(function (btn) {
        var active = parseInt(btn.getAttribute("data-gallery-index"), 10) === i;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }
  }

  function stepGallery(delta) {
    if (galleryState.slides.length < 2) return;
    showGallerySlide(galleryState.index + delta);
  }

  function wireGalleryNav() {
    var gallery = document.querySelector("[data-detail-gallery]");
    if (!gallery || gallery.getAttribute("data-gallery-wired") === "1") return;
    gallery.setAttribute("data-gallery-wired", "1");
    var prevBtn = document.querySelector("[data-gallery-prev]");
    var nextBtn = document.querySelector("[data-gallery-next]");
    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        stepGallery(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        stepGallery(1);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (gallery.hidden) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepGallery(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepGallery(1);
      }
    });
  }

  function applyMediaGallery(item) {
    var gallery = document.querySelector("[data-detail-gallery]");
    var stage = document.querySelector("[data-gallery-stage]");
    var counter = document.querySelector("[data-gallery-counter]");
    var thumbs = document.querySelector("[data-gallery-thumbs]");
    var prevBtn = document.querySelector("[data-gallery-prev]");
    var nextBtn = document.querySelector("[data-gallery-next]");
    if (!gallery || !stage) return;

    wireGalleryNav();

    var slides = collectMediaSlides(item);
    var itemId = item && (item.id || item.slug || "");
    galleryState.slides = slides;
    galleryState.itemId = itemId;

    if (!slides.length) {
      gallery.hidden = true;
      stage.innerHTML = "";
      if (counter) counter.hidden = true;
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      if (thumbs) {
        thumbs.hidden = true;
        thumbs.innerHTML = "";
      }
      return;
    }

    gallery.hidden = false;
    if (thumbs) {
      if (slides.length > 1) {
        thumbs.hidden = false;
        thumbs.innerHTML = slides
          .map(function (slide, idx) {
            return (
              '<button type="button" class="detail-media-thumb' +
              (idx === 0 ? " is-active" : "") +
              '" data-gallery-index="' +
              idx +
              '" role="tab" aria-selected="' +
              (idx === 0 ? "true" : "false") +
              '" title="' +
              esc(slide.label || "Media " + (idx + 1)) +
              '">' +
              thumbBadge(slide) +
              '<span class="sr-only">' +
              esc(slide.label || "Media " + (idx + 1)) +
              "</span></button>"
            );
          })
          .join("");
        thumbs.querySelectorAll("[data-gallery-index]").forEach(function (btn) {
          var idx = parseInt(btn.getAttribute("data-gallery-index"), 10) || 0;
          var slide = slides[idx];
          var thumbSrc = slide && (slide.thumb || (slide.type === "image" ? slide.src : ""));
          if (thumbSrc) btn.style.backgroundImage = 'url("' + String(thumbSrc).replace(/"/g, "%22") + '")';
          btn.addEventListener("click", function () {
            showGallerySlide(idx);
          });
        });
      } else {
        thumbs.hidden = true;
        thumbs.innerHTML = "";
      }
    }

    showGallerySlide(0);
  }

  function render() {
    var params = new URLSearchParams(window.location.search);
    var id = (params.get("id") || params.get("slug") || "").trim();
    if (!id) {
      showError("Missing product id");
      return;
    }
    var item = findProduct(id);
    if (!item) {
      if (!(window.RogueCatalog && RogueCatalog.productsLoaded)) return;
      showError("Product not found");
      return;
    }

    var author = resolveAuthor(item);
    var badge = (item.badge || item.name || "PR").slice(0, 2).toUpperCase();

    document.title = item.name + " — Product - Rogue Assets Store";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", item.description || item.name);

    setText("[data-detail-crumb]", item.name);
    setText("[data-detail-title]", item.name);
    setText("[data-detail-lede]", item.description || "");
    setText("[data-detail-overview]", "");
    setText("[data-detail-author-label]", "by " + author.name);
    setText("[data-detail-avatar]", badge);
    setHref("[data-detail-author]", author.url);
    applyProductRating(item);
    applyMediaGallery(item);

    var storesMount = document.querySelector("[data-detail-stores]");
    var buyUrl =
      (window.RogueProductStores && RogueProductStores.primaryUrl(item)) ||
      item.gumroadUrl ||
      item.buyUrl ||
      item.url ||
      "";
    if (storesMount && window.RogueProductStores) {
      storesMount.innerHTML = RogueProductStores.actionsHtml(item);
    } else {
      var buy = document.querySelector("[data-detail-buy]");
      if (buy) {
        buy.href = buyUrl || "#";
        buy.setAttribute("title", "Download");
        buy.setAttribute("aria-label", "Download");
      }
    }
    var saveBtn = document.querySelector("[data-save-bookmark]");
    if (saveBtn && buyUrl) {
      saveBtn.setAttribute("data-save-url", buyUrl);
      saveBtn.removeAttribute("disabled");
    }
    if (buyUrl && typeof window.pinDetailSaveUrl === "function") {
      window.pinDetailSaveUrl(buyUrl);
    }
    if (typeof window.pinDetailSaveCount === "function") {
      window.pinDetailSaveCount(
        typeof item.saves === "number" && item.saves >= 0 ? item.saves : 0
      );
    }

    setHtml("[data-detail-pills]", pillsHtml(item) || '<span class="pill">Other</span>');
    setHtml("[data-detail-about]", aboutHtml(item));

    if (
      (item.source === "sketchfab" || item.sketchfabUid) &&
      window.RogueSketchfab &&
      typeof RogueSketchfab.enrichItem === "function"
    ) {
      RogueSketchfab.enrichItem(item).then(function (enriched) {
        if (!enriched) return;
        setText("[data-detail-lede]", enriched.description || "");
        setHtml("[data-detail-about]", aboutHtml(enriched));
        setHtml("[data-detail-pills]", pillsHtml(enriched) || '<span class="pill">Other</span>');
        applyProductRating(enriched);
        applyMediaGallery(enriched);
      });
    }

    var includes = Array.isArray(item.includes) ? item.includes : [];
    setHtml(
      "[data-detail-includes]",
      includes.length
        ? includes.map(function (row) {
            return "<li>" + esc(row) + "</li>";
          }).join("")
        : "<li>See product page for full download contents.</li>"
    );

    var highlights = document.querySelector("[data-detail-highlights]");
    if (highlights) {
      if (includes.length) {
        highlights.hidden = false;
        highlights.innerHTML = includes.slice(0, 4).map(function (h) {
          return "<li>" + esc(h) + "</li>";
        }).join("");
      } else {
        highlights.innerHTML = "";
        highlights.hidden = true;
      }
    }

    var loading = document.querySelector("[data-detail-loading]");
    if (loading) loading.hidden = true;
    var main = document.querySelector("[data-detail-main]");
    if (main) main.hidden = false;

    if (typeof window.refreshDetailSaveButtons === "function") {
      window.refreshDetailSaveButtons();
    }
  }

  document.addEventListener("rogue-catalog:products-loaded", render);
  render();
})();
