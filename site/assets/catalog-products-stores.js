/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 23:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 23:40:00
 *
 * Merge digital products from Shutterstock / TurboSquid / CGTrader / itch.io
 * when per-asset rows exist (studio catalog.json feeds). Profile URLs alone
 * are never turned into product cards.
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog) return;

  var STUDIO = "https://rogue-dev-studio.github.io";
  var AUTHOR = {
    author: "rogue-dev-studio",
    authorName: "Rogue Dev Studio",
    authorUrl: "https://rogue-dev-studio.github.io/",
    owner: "rogue-dev-studio"
  };

  var FEEDS = [
    {
      store: "shutterstock",
      url: STUDIO + "/stock/catalog.json",
      category: "Platforms",
      badge: "Stock",
      author: "ArisHadisopiyan",
      authorName: "Rogue Developer Studio",
      authorUrl: "https://www.shutterstock.com/g/ArisHadisopiyan",
      profilePatterns: [/shutterstock\.com\/g\//i]
    },
    {
      store: "turbosquid",
      url: STUDIO + "/turbosquid/catalog.json",
      category: "Platforms",
      badge: "3D",
      author: "ArisHadisopiyan",
      authorName: "ArisHadisopiyan",
      authorUrl: "https://www.turbosquid.com/Search/Artists/ArisHadisopiyan",
      profilePatterns: [/turbosquid\.com\/Search\/Artists\//i]
    },
    {
      store: "cgtrader",
      url: STUDIO + "/cgtrader/catalog.json",
      category: "Platforms",
      badge: "3D",
      author: "aris-hadisopiyan",
      authorName: "Aris Hadisopiyan",
      authorUrl: "https://www.cgtrader.com/aris-hadisopiyan",
      profilePatterns: [/cgtrader\.com\/[^/]+\/?$/i]
    },
    {
      store: "itch",
      url: STUDIO + "/itch/catalog.json",
      category: "Platforms",
      badge: "itch",
      author: "rogue-dev-studio",
      authorName: "Rogue Dev Studio",
      authorUrl: "https://rogue-dev-studio.itch.io",
      profilePatterns: [/^https?:\/\/rogue-dev-studio\.itch\.io\/?$/i]
    }
  ];

  function slugify(value) {
    var s = String(value || "asset")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return s || "asset";
  }

  function isProfileUrl(feed, url) {
    return (feed.profilePatterns || []).some(function (re) {
      return re.test(url);
    });
  }

  var COLLECTION_TAGS = {
    "Christmas & Holiday Vectors": ["Props", "Holiday", "Christmas"],
    "Color Palettes & Gradients": ["Textures & Materials", "Abstract", "Gradients"],
    "UI/UX & Gadget Icon Packs": ["GUI", "Icons", "UI"],
    "Business & Professional Avatars": ["Characters", "Avatars", "Business"],
    "Abstract & Conceptual Vectors": ["Textures & Materials", "Abstract", "Conceptual"],
    "Indonesian & Islamic Culture": ["Props", "Culture", "Indonesian"]
  };

  var PLATFORM_LABEL = {
    shutterstock: "Shutterstock",
    turbosquid: "TurboSquid",
    cgtrader: "CGTrader",
    itch: "itch.io",
    sketchfab: "Sketchfab",
    gumroad: "Gumroad"
  };

  function tagsFromCollection(name) {
    var key = String(name || "");
    if (COLLECTION_TAGS[key]) return COLLECTION_TAGS[key].slice();
    return ["Vectors"];
  }

  function uniqueTags(list) {
    var out = [];
    var seen = {};
    (list || []).forEach(function (tag) {
      var t = String(tag || "").trim();
      if (!t) return;
      var k = t.toLowerCase();
      if (seen[k]) return;
      seen[k] = true;
      out.push(t);
    });
    return out;
  }

  function shortenStoreTitle(raw, url, store) {
    if (store !== "shutterstock") return raw;
    var m = String(url || "").match(
      /image-(?:vector|photo|illustration)\/([^/?#]+)-(\d{7,})/i
    );
    var stop = {
      image: 1,
      features: 1,
      illustration: 1,
      illustrations: 1,
      vector: 1,
      with: 1,
      and: 1,
      the: 1,
      a: 1,
      an: 1,
      of: 1,
      on: 1,
      for: 1,
      to: 1,
      in: 1,
      amid: 1,
      different: 1,
      collection: 1,
      colorful: 1,
      vibrant: 1,
      adorned: 1,
      outlined: 1,
      styles: 1,
      background: 1,
      intricate: 1,
      featuring: 1,
      shows: 1,
      show: 1,
      white: 1,
      brown: 1
    };
    if (m) {
      var words = m[1]
        .split("-")
        .filter(function (w) {
          return w && !/^\d+$/.test(w) && !stop[w.toLowerCase()];
        })
        .slice(0, 5)
        .map(function (w) {
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        });
      if (words.length >= 2) return words.join(" ");
    }
    var t = String(raw || "")
      .split(/[.;]/)[0]
      .trim()
      .replace(/\s+/g, " ");
    if (t.length > 42) {
      var cut = t.slice(0, 42);
      var sp = cut.lastIndexOf(" ");
      t = (sp > 18 ? cut.slice(0, sp) : cut).trim();
    }
    return t || raw;
  }

  function mapItem(feed, raw) {
    if (!raw) return null;
    var url = String(raw.url || raw.productUrl || "").trim();
    var thumb = String(raw.thumb || raw.image || "").trim();
    if (!url || !thumb) return null;
    if (isProfileUrl(feed, url)) return null;
    var idBase = String(raw.id || slugify(raw.title || raw.name || "asset")).trim();
    var id = idBase.indexOf(feed.store + "-") === 0 ? idBase : feed.store + "-" + idBase;
    var tags =
      Array.isArray(raw.tags) && raw.tags.length
        ? raw.tags.slice()
        : tagsFromCollection(raw.collection || "");
    var platform = PLATFORM_LABEL[feed.store] || feed.store;
    tags = uniqueTags([platform].concat(tags));
    if (raw.collection) tags = uniqueTags(tags.concat([String(raw.collection)]));
    var name = shortenStoreTitle(
      String(raw.title || raw.name || "").trim(),
      url,
      feed.store
    );
    if (!name) return null;
    var addedRaw = String(
      raw.addedAt || raw.publishedAt || raw.added_time || raw.added_date || ""
    ).trim();
    var addedAt = addedRaw ? addedRaw.slice(0, 10) : "";
    var contentCategory =
      (window.RogueCatalog &&
        RogueCatalog.platformContentCategory &&
        (RogueCatalog.platformContentCategory[platform] ||
          RogueCatalog.platformContentCategory[feed.store])) ||
      (feed.store === "shutterstock" || feed.store === "itch" || feed.store === "gumroad"
        ? "2D"
        : "3D");
    return {
      id: id,
      slug: raw.slug || id,
      name: name,
      description:
        String(raw.description || "").trim() ||
        name + " \u2014 listed on " + (feed.store === "itch" ? "itch.io" : feed.store) + ".",
      category: "Platforms",
      contentCategory: contentCategory,
      tags: tags,
      badge: raw.badge || feed.badge,
      price: typeof raw.price === "number" ? raw.price : parseFloat(raw.price) || 0,
      rating: typeof raw.rating === "number" ? raw.rating : 0,
      ratingCount: 0,
      likes: 0,
      votes: typeof raw.votes === "number" ? raw.votes : 0,
      image: thumb,
      stores: [{ id: feed.store, url: url, primary: true }],
      addedAt: addedAt,
      license: raw.license || "",
      source: feed.store,
      collection: raw.collection || "",
      author: feed.author || AUTHOR.author,
      authorName: feed.authorName || AUTHOR.authorName,
      authorUrl: feed.authorUrl || AUTHOR.authorUrl,
      owner: AUTHOR.owner
    };
  }

  function notify() {
    catalog.productsLoaded = true;
    if (catalog.mergeProductDiscoveryTags) {
      catalog.mergeProductDiscoveryTags(catalog.products || []);
    }
    try {
      document.dispatchEvent(new CustomEvent("rogue-catalog:products-loaded"));
    } catch (err) {}
  }

  function applyStore(storeId, items) {
    if (!items.length) return;
    var keep = (catalog.products || []).filter(function (p) {
      return !(p && p.source === storeId);
    });
    catalog.products = keep.concat(items);
    notify();
  }

  function loadFeed(feed) {
    return fetch(feed.url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error(feed.store + " " + res.status);
        return res.json();
      })
      .then(function (data) {
        var rows = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : [];
        var mapped = rows
          .map(function (row) {
            return mapItem(feed, row);
          })
          .filter(Boolean);
        applyStore(feed.store, mapped);
      })
      .catch(function () {});
  }

  FEEDS.forEach(loadFeed);
})();
