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
      category: "2D",
      badge: "Stock",
      authorUrl: "https://www.shutterstock.com/g/ArisHadisopiyan",
      profilePatterns: [/shutterstock\.com\/g\//i]
    },
    {
      store: "turbosquid",
      url: STUDIO + "/turbosquid/catalog.json",
      category: "3D",
      badge: "3D",
      authorUrl: "https://www.turbosquid.com/Search/Artists/ArisHadisopiyan",
      profilePatterns: [/turbosquid\.com\/Search\/Artists\//i]
    },
    {
      store: "cgtrader",
      url: STUDIO + "/cgtrader/catalog.json",
      category: "3D",
      badge: "3D",
      authorUrl: "https://www.cgtrader.com/aris-hadisopiyan",
      profilePatterns: [/cgtrader\.com\/[^/]+\/?$/i]
    },
    {
      store: "itch",
      url: STUDIO + "/itch/catalog.json",
      category: "2D",
      badge: "itch",
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

  function mapItem(feed, raw) {
    if (!raw) return null;
    var url = String(raw.url || raw.productUrl || "").trim();
    var name = String(raw.title || raw.name || "").trim();
    var thumb = String(raw.thumb || raw.image || "").trim();
    if (!url || !name) return null;
    if (isProfileUrl(feed, url)) return null;
    var idBase = String(raw.id || slugify(name)).trim() || slugify(name);
    var id = idBase.indexOf(feed.store + "-") === 0 ? idBase : feed.store + "-" + idBase;
    var tags = Array.isArray(raw.tags)
      ? raw.tags.slice()
      : raw.kind
        ? [String(raw.kind)]
        : ["Props"];
    return {
      id: id,
      slug: raw.slug || id,
      name: name,
      description:
        String(raw.description || "").trim() ||
        name + " \u2014 listed on " + (feed.store === "itch" ? "itch.io" : feed.store) + ".",
      category: raw.category || feed.category,
      tags: tags,
      badge: raw.badge || feed.badge,
      price: typeof raw.price === "number" ? raw.price : parseFloat(raw.price) || 0,
      rating: typeof raw.rating === "number" ? raw.rating : 0,
      ratingCount: typeof raw.ratingCount === "number" ? raw.ratingCount : 0,
      votes: typeof raw.votes === "number" ? raw.votes : 0,
      image: thumb,
      stores: [{ id: feed.store, url: url, primary: true }],
      addedAt: String(raw.addedAt || raw.publishedAt || "").slice(0, 10),
      license: raw.license || "",
      source: feed.store,
      author: AUTHOR.author,
      authorName: AUTHOR.authorName,
      authorUrl: feed.authorUrl || AUTHOR.authorUrl,
      owner: AUTHOR.owner
    };
  }

  function notify() {
    catalog.productsLoaded = true;
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
