/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 18:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 20:25:00
 *
 * Live refresh of Sketchfab models for @rogue-dev-studio (same source as
 * https://rogue-dev-studio.github.io/3d/). Replaces snapshot Sketchfab rows;
 * keeps Gumroad and other non-sketchfab products.
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog) return;

  var USER = "rogue-dev-studio";
  var API = "https://api.sketchfab.com/v3/models";
  var CACHE_KEY = "rm-sketchfab-v6:" + USER;
  var CACHE_MS = 30 * 60 * 1000;

  var AUTHOR = {
    author: "rogue-dev-studio",
    authorName: "Rogue Developer",
    authorUrl: "https://sketchfab.com/rogue-dev-studio",
    owner: "rogue-dev-studio"
  };

  var TAG_MAP = {
    "furniture-home": "Furniture",
    "weapons-military": "Weapons",
    "nature-plants": "Vegetation",
    "electronics-gadgets": "Electronics",
    "science-technology": "Sci-Fi",
    "places-travel": "Environments",
    "animals-pets": "Animals",
    "characters-creatures": "Characters",
    "cars-vehicles": "Vehicles",
    architecture: "Environments",
    "food-drink": "Food",
    "fashion-style": "Clothing",
    "art-abstract": "Props",
    tree: "Trees",
    nature: "Nature",
    sword: "Weapons",
    weapon: "Weapons",
    furniture: "Furniture",
    environment: "Environments",
    lowpoly: "Props",
    gameasset: "Props",
    vehicle: "Vehicles",
    truck: "Vehicles",
    interior: "Interior",
    food: "Food"
  };

  function withAuthor(row) {
    var out = {};
    Object.keys(AUTHOR).forEach(function (k) {
      out[k] = AUTHOR[k];
    });
    Object.keys(row).forEach(function (k) {
      out[k] = row[k];
    });
    return out;
  }

  function authorFromUser(user) {
    if (!user) return {};
    var handle = user.username || AUTHOR.author;
    var out = {
      author: handle,
      owner: handle,
      authorName: user.displayName || handle,
      authorUrl: user.profileUrl || "https://sketchfab.com/" + encodeURIComponent(handle)
    };
    if (user.avatar && user.avatar.images && user.avatar.images.length) {
      var imgs = user.avatar.images.slice().sort(function (a, b) {
        return (b.width || 0) - (a.width || 0);
      });
      if (imgs[0] && imgs[0].url) out.authorAvatar = imgs[0].url;
    }
    return out;
  }

  function stripHtml(s) {
    return String(s || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(name, uid) {
    var s = String(name || "model")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!s) s = "model";
    if (s.length > 48) s = s.slice(0, 48).replace(/-$/, "");
    return "sf-" + s + "-" + String(uid || "").slice(0, 8);
  }

  function mapTags(model) {
    var raw = [];
    (model.categories || []).forEach(function (c) {
      if (c && c.name) raw.push(String(c.name).toLowerCase());
    });
    (model.tags || []).forEach(function (t) {
      if (t && t.name) raw.push(String(t.name).toLowerCase());
    });
    var seen = { sketchfab: true };
    var out = ["Sketchfab"];
    raw.forEach(function (k) {
      var label = TAG_MAP[k];
      if (!label && /^[a-z0-9]{2,20}$/.test(k)) {
        label = k.charAt(0).toUpperCase() + k.slice(1);
      }
      if (!label || seen[label.toLowerCase()]) return;
      seen[label.toLowerCase()] = true;
      out.push(label);
    });
    if (out.length === 1) out.push("Props");
    return out.slice(0, 7);
  }

  function bestThumb(model) {
    var images = (model.thumbnails && model.thumbnails.images) || [];
    if (!images.length) return "";
    var sorted = images.slice().sort(function (a, b) {
      return (b.width || 0) - (a.width || 0);
    });
    return sorted[0].url || "";
  }

  function galleryFromThumbnails(model) {
    var images = (model.thumbnails && model.thumbnails.images) || [];
    if (!images.length) return [];
    var best = images.slice().sort(function (a, b) {
      return (b.width || 0) - (a.width || 0);
    })[0];
    return best && best.url ? [best.url] : [];
  }

  function licenseLabel(model) {
    var lic = model.license && model.license.label ? String(model.license.label) : "";
    if (!lic) return "Open-Source License";
    if (/CC/i.test(lic)) return "Open-Source License (" + lic + ")";
    return lic;
  }

  function categoryNames(model) {
    return (model.categories || [])
      .map(function (c) {
        return c && c.name ? String(c.name) : "";
      })
      .filter(Boolean);
  }

  function tagNames(model) {
    return (model.tags || [])
      .map(function (t) {
        return t && t.name ? String(t.name) : "";
      })
      .filter(Boolean);
  }

  /** Prefer source archive size; else largest available format (bytes). */
  function archiveSizeBytes(model) {
    var archives = model && model.archives;
    if (!archives || typeof archives !== "object") return null;
    if (archives.source && typeof archives.source.size === "number" && archives.source.size >= 0) {
      return archives.source.size;
    }
    var best = null;
    Object.keys(archives).forEach(function (key) {
      var entry = archives[key];
      if (!entry || typeof entry.size !== "number" || entry.size < 0) return;
      if (best == null || entry.size > best) best = entry.size;
    });
    return best;
  }

  function applyArchiveSize(item, model) {
    if (!item) return item;
    var size = archiveSizeBytes(model);
    if (typeof size === "number") {
      item.sizeBytes = size;
      item.sizeKb = Math.round(size / 1024);
      if (model && model.archives) item.archives = model.archives;
    }
    return item;
  }

  function applyDetailFields(item, model) {
    if (!item || !model) return item;
    var likes = typeof model.likeCount === "number" ? model.likeCount : item.likes || 0;
    item.likes = likes;
    item.ratingCount = likes;
    item.rating =
      window.RogueCards && typeof RogueCards.ratingFromLikes === "function"
        ? RogueCards.ratingFromLikes(likes)
        : item.rating || 0;
    item.votes = typeof model.viewCount === "number" ? model.viewCount : item.votes;
    item.views = item.votes;
    item.vertexCount = typeof model.vertexCount === "number" ? model.vertexCount : item.vertexCount;
    item.faceCount = typeof model.faceCount === "number" ? model.faceCount : item.faceCount;
    item.animationCount =
      typeof model.animationCount === "number" ? model.animationCount : item.animationCount;
    item.materialCount =
      typeof model.materialCount === "number" ? model.materialCount : item.materialCount;
    item.textureCount =
      typeof model.textureCount === "number" ? model.textureCount : item.textureCount;
    item.soundCount = typeof model.soundCount === "number" ? model.soundCount : item.soundCount;
    item.downloadCount =
      typeof model.downloadCount === "number" ? model.downloadCount : item.downloadCount;
    item.commentCount =
      typeof model.commentCount === "number" ? model.commentCount : item.commentCount;
    if (typeof model.isDownloadable === "boolean") item.isDownloadable = model.isDownloadable;
    if (model.embedUrl) item.embedUrl = model.embedUrl;
    if (model.viewerUrl) {
      item.stores = [{ id: "sketchfab", url: model.viewerUrl, primary: true }];
    }
    if (model.pbrType) item.pbrType = model.pbrType;
    if (model.publishedAt) item.addedAt = String(model.publishedAt).slice(0, 10);
    if (model.license) {
      item.license = licenseLabel(model);
      item.licenseUrl = model.license.url || model.license.uri || "";
      item.licenseRequirements = model.license.requirements || "";
      item.licenseFullName = model.license.fullName || model.license.label || "";
    }
    var cats = categoryNames(model);
    if (cats.length) item.sketchfabCategories = cats;
    var tags = tagNames(model);
    if (tags.length) item.sketchfabTags = tags;
    var authorFields = authorFromUser(model.user);
    Object.keys(authorFields).forEach(function (k) {
      item[k] = authorFields[k];
    });
    applyArchiveSize(item, model);
    var gallery = galleryFromThumbnails(model);
    if (gallery.length) item.gallery = gallery;
    var desc = stripHtml(model.description);
    if (desc) {
      item.description = desc;
      item.descriptionFull = desc;
    }
    item.sketchfabDetailLoaded = true;
    return item;
  }

  function mapModel(model) {
    var uid = model.uid;
    var name = model.name || "Untitled";
    var desc = stripHtml(model.description);
    if (desc.length > 220) desc = desc.slice(0, 217) + "...";
    if (!desc) desc = name + " — 3D model on Sketchfab by Rogue Development.";
    var url = model.viewerUrl || "https://sketchfab.com/models/" + uid;
    var published = model.publishedAt ? String(model.publishedAt).slice(0, 10) : "";
    var price = typeof model.price === "number" ? model.price : parseFloat(model.price) || 0;
    var likes = typeof model.likeCount === "number" ? model.likeCount : 0;
    var rating =
      window.RogueCards && typeof RogueCards.ratingFromLikes === "function"
        ? RogueCards.ratingFromLikes(likes)
        : likes > 0
          ? Math.min(5, Math.round((1 + Math.log10(likes + 1) * 2.2) * 10) / 10)
          : 0;
    var authorFields = authorFromUser(model.user);
    var item = withAuthor({
      id: "sf-" + uid,
      slug: slugify(name, uid),
      sketchfabUid: uid,
      name: name,
      description: desc,
      category: "Platforms",
      contentCategory: "3D",
      tags: mapTags(model),
      badge: "3D",
      price: price,
      likes: likes,
      rating: rating,
      ratingCount: likes,
      votes: typeof model.viewCount === "number" ? model.viewCount : 0,
      views: typeof model.viewCount === "number" ? model.viewCount : 0,
      downloadCount: typeof model.downloadCount === "number" ? model.downloadCount : 0,
      commentCount: typeof model.commentCount === "number" ? model.commentCount : 0,
      image: bestThumb(model),
      stores: [{ id: "sketchfab", url: url, primary: true }],
      addedAt: published,
      license: licenseLabel(model),
      licenseUrl: model.license && (model.license.url || model.license.uri) ? model.license.url || model.license.uri : "",
      source: "sketchfab",
      vertexCount: typeof model.vertexCount === "number" ? model.vertexCount : null,
      faceCount: typeof model.faceCount === "number" ? model.faceCount : null,
      animationCount: typeof model.animationCount === "number" ? model.animationCount : null,
      isDownloadable: typeof model.isDownloadable === "boolean" ? model.isDownloadable : null,
      embedUrl: model.embedUrl || "",
      sketchfabCategories: categoryNames(model),
      sketchfabTags: tagNames(model),
      gallery: galleryFromThumbnails(model),
      author: authorFields.author || AUTHOR.author,
      authorName: authorFields.authorName || AUTHOR.authorName,
      authorUrl: authorFields.authorUrl || AUTHOR.authorUrl,
      owner: authorFields.owner || AUTHOR.owner,
      authorAvatar: authorFields.authorAvatar || ""
    });
    applyArchiveSize(item, model);
    return item;
  }

  function fetchModelDetail(uid) {
    return fetch(API + "/" + encodeURIComponent(uid)).then(function (res) {
      if (!res.ok) throw new Error("Sketchfab detail " + res.status);
      return res.json();
    });
  }

  function enrichItem(item) {
    if (!item || !item.sketchfabUid) return Promise.resolve(item);
    if (item.sketchfabDetailLoaded) return Promise.resolve(item);
    return fetchModelDetail(item.sketchfabUid)
      .then(function (model) {
        return applyDetailFields(item, model);
      })
      .catch(function () {
        return item;
      });
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return null;
      if (Date.now() - (parsed.at || 0) > CACHE_MS) return null;
      return parsed.items;
    } catch (err) {
      return null;
    }
  }

  function writeCache(items) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: items }));
    } catch (err) {}
  }

  function applySketchfab(items) {
    var keep = (catalog.assets || []).filter(function (p) {
      return !(p && (p.sketchfabUid || p.source === "sketchfab"));
    });
    catalog.assets = keep.concat(items);
    catalog.assetsLoaded = true;
    if (catalog.mergeAssetDiscoveryTags) {
      catalog.mergeAssetDiscoveryTags(catalog.assets || []);
    }
    try {
      document.dispatchEvent(new CustomEvent("rogue-catalog:assets-loaded"));
    } catch (err) {}
  }

  function fetchPage(url, acc) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Sketchfab " + res.status);
        return res.json();
      })
      .then(function (data) {
        var next = acc.concat((data.results || []).map(mapModel));
        if (data.next) return fetchPage(data.next, next);
        return next;
      });
  }

  function load() {
    var cached = readCache();
    if (cached && cached.length) {
      applySketchfab(cached);
    }
    fetchPage(API + "?user=" + encodeURIComponent(USER) + "&count=24&sort_by=-publishedAt", [])
      .then(function (items) {
        if (!items.length) return;
        writeCache(items);
        applySketchfab(items);
      })
      .catch(function () {});
  }

  window.RogueSketchfab = {
    mapModel: mapModel,
    enrichItem: enrichItem,
    applyDetailFields: applyDetailFields,
    fetchModelDetail: fetchModelDetail
  };

  load();
})();
