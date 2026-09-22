/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 12:28:00
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog) return;

  catalog.products = [
    {
      id: "night-drive-car-mountains",
      slug: "night-drive-car-mountains",
      name: "Night Drive — Car Near Mountains",
      description:
        "Flat night-drive motion pack: 1080p MP4 (12s) plus editable Remotion (React) source. Parallax mountains, pines, dashed road, rolling car.",
      category: "Motion & Media",
      tags: ["motion", "remotion", "mp4", "flat-design", "night"],
      badge: "MP4",
      price: 0,
      priceSuggested: 12,
      gumroadUrl: "https://roguedevstudio.gumroad.com/l/hppwla",
      owner: "rogue-dev-studio",
      addedAt: "2026-09-22",
      votes: 0,
      includes: [
        "car-near-mountains.mp4 — 1920×1080, 12s, 30fps",
        "Remotion (React) source project",
        "Commercial license (LICENSE.txt)"
      ]
    }
  ];

  if (catalog.categories.indexOf("Motion & Media") === -1) {
    catalog.categories = catalog.categories.concat(["Motion & Media"]);
  }

  var tagSet = {};
  (catalog.tags || []).forEach(function (t) {
    tagSet[String(t).toLowerCase()] = t;
  });
  catalog.products.forEach(function (p) {
    (p.tags || []).forEach(function (t) {
      var key = String(t).toLowerCase();
      if (!tagSet[key]) tagSet[key] = t;
    });
  });
  catalog.tags = Object.keys(tagSet)
    .sort()
    .map(function (k) {
      return tagSet[k];
    });

  catalog.productsLoaded = true;
  try {
    document.dispatchEvent(new CustomEvent("rogue-catalog:products-loaded"));
  } catch (err) {}
})();
