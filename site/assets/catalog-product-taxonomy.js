/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 13:26:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 14:40:00
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog) return;

  var PATHS = [
    "templates > packs",
    "templates > systems",
    "templates > tutorials",
    "2d > characters",
    "2d > environments",
    "2d > fonts",
    "2d > gui",
    "2d > gui > icons",
    "2d > textures-materials",
    "2d > textures-materials > abstract",
    "2d > textures-materials > brick",
    "2d > textures-materials > building",
    "2d > textures-materials > concrete",
    "2d > textures-materials > fabric",
    "2d > textures-materials > floors",
    "2d > textures-materials > food",
    "2d > textures-materials > metals",
    "2d > textures-materials > nature",
    "2d > textures-materials > roads",
    "2d > textures-materials > roofing",
    "2d > textures-materials > sky",
    "2d > textures-materials > stone",
    "2d > textures-materials > tiles",
    "2d > textures-materials > water",
    "2d > textures-materials > wood",
    "3d > animations",
    "3d > characters",
    "3d > characters > animals",
    "3d > characters > animals > birds",
    "3d > characters > animals > fish",
    "3d > characters > animals > insects",
    "3d > characters > animals > mammals",
    "3d > characters > animals > reptiles",
    "3d > characters > creatures",
    "3d > characters > humanoids",
    "3d > characters > humanoids > fantasy",
    "3d > characters > humanoids > humans",
    "3d > characters > humanoids > sci-fi",
    "3d > characters > robots",
    "3d > environments",
    "3d > environments > dungeons",
    "3d > environments > fantasy",
    "3d > environments > historic",
    "3d > environments > industrial",
    "3d > environments > landscapes",
    "3d > environments > roadways",
    "3d > environments > sci-fi",
    "3d > environments > urban",
    "3d > gui",
    "3d > props",
    "3d > props > clothing",
    "3d > props > clothing > accessories",
    "3d > props > clothing > armor",
    "3d > props > electronics",
    "3d > props > exterior",
    "3d > props > food",
    "3d > props > furniture",
    "3d > props > guns",
    "3d > props > industrial",
    "3d > props > interior",
    "3d > props > tools",
    "3d > props > weapons",
    "3d > vegetation",
    "3d > vegetation > flowers",
    "3d > vegetation > plants",
    "3d > vegetation > trees",
    "3d > vehicles",
    "3d > vehicles > air",
    "3d > vehicles > land",
    "3d > vehicles > sea",
    "3d > vehicles > space",
    "add-ons > machine-learning",
    "add-ons > services",
    "audio > ambient",
    "audio > ambient > fantasy",
    "audio > ambient > nature",
    "audio > ambient > noise",
    "audio > ambient > sci-fi",
    "audio > ambient > urban",
    "audio > music",
    "audio > music > electronic",
    "audio > music > orchestral",
    "audio > music > pop",
    "audio > music > rock",
    "audio > music > world",
    "audio > sound-fx",
    "audio > sound-fx > animals",
    "audio > sound-fx > creatures",
    "audio > sound-fx > foley",
    "audio > sound-fx > transportation",
    "audio > sound-fx > voices",
    "audio > sound-fx > weapons",
    "tools > ai-ml-integration",
    "tools > animation",
    "tools > audio",
    "tools > behavior-ai",
    "tools > camera",
    "tools > game-toolkits",
    "tools > generative-ai",
    "tools > gui",
    "tools > input-management",
    "tools > integration",
    "tools > level-design",
    "tools > localization",
    "tools > modeling",
    "tools > network",
    "tools > painting",
    "tools > particles-effects",
    "tools > physics",
    "tools > sprite-management",
    "tools > terrain",
    "tools > utilities",
    "tools > version-control",
    "tools > video",
    "tools > visual-scripting",
    "vfx > particles",
    "vfx > particles > environment",
    "vfx > particles > fire-explosions",
    "vfx > particles > spells",
    "vfx > shaders",
    "vfx > shaders > fullscreen-camera-effects",
    "vfx > shaders > substances"
  ];

  var CATEGORY_LABEL = {
    templates: "Templates",
    "2d": "2D",
    "3d": "3D",
    "add-ons": "Add-Ons",
    audio: "Audio",
    tools: "Tools",
    vfx: "VFX"
  };

  function titleCase(slug) {
    var raw = String(slug || "");
    var special = {
      fx: "FX",
      gui: "GUI",
      ai: "AI",
      ml: "ML",
      "textures-materials": "Textures & Materials",
      "sound-fx": "Sound FX",
      "fire-explosions": "Fire & Explosions",
      "machine-learning": "Machine Learning",
      "ai-ml-integration": "AI / ML Integration",
      "fullscreen-camera-effects": "Fullscreen Camera Effects",
      "particles-effects": "Particles & Effects",
      "sprite-management": "Sprite Management",
      "input-management": "Input Management",
      "version-control": "Version Control",
      "visual-scripting": "Visual Scripting",
      "game-toolkits": "Game Toolkits",
      "generative-ai": "Generative AI",
      "behavior-ai": "Behavior AI",
      "level-design": "Level Design",
      "sci-fi": "Sci-Fi"
    };
    if (special[raw.toLowerCase()]) return special[raw.toLowerCase()];
    return raw
      .split("-")
      .filter(Boolean)
      .map(function (part) {
        if (special[part.toLowerCase()]) return special[part.toLowerCase()];
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function tagsFromPath(path) {
    var parts = String(path)
      .split(">")
      .map(function (p) {
        return p.trim();
      })
      .filter(Boolean);
    if (parts.length < 2) {
      var only = titleCase(parts[0] || path);
      return only ? [only] : [];
    }
    return parts.slice(1).map(titleCase).filter(Boolean);
  }

  function ensureChild(parentMap, parentId, slug, label) {
    var id = parentId ? parentId + "/" + slug : slug;
    if (!parentMap[id]) {
      parentMap[id] = {
        id: id,
        slug: slug,
        label: label,
        children: [],
        childMap: {}
      };
    }
    return parentMap[id];
  }

  var categories = ["Templates", "2D", "3D", "Add-Ons", "Audio", "Tools", "VFX"];
  var tagsByCategory = {};
  var tagSet = {};
  var rootMap = {};
  var treeOrder = ["templates", "2d", "3d", "add-ons", "audio", "tools", "vfx"];

  categories.forEach(function (name) {
    tagsByCategory[name] = [];
  });

  treeOrder.forEach(function (slug) {
    ensureChild(rootMap, "", slug, CATEGORY_LABEL[slug] || titleCase(slug));
  });

  PATHS.forEach(function (path) {
    var parts = String(path)
      .split(">")
      .map(function (p) {
        return p.trim();
      })
      .filter(Boolean);
    if (!parts.length) return;

    var topSlug = parts[0].toLowerCase();
    var category = CATEGORY_LABEL[topSlug];
    if (!category) return;

    var root = ensureChild(rootMap, "", topSlug, category);
    var cursor = root;
    var parentId = topSlug;

    for (var i = 1; i < parts.length; i++) {
      var slug = parts[i].toLowerCase();
      var label = titleCase(parts[i]);
      var node = ensureChild(cursor.childMap, parentId, slug, label);
      if (cursor.children.indexOf(node) < 0) cursor.children.push(node);
      cursor = node;
      parentId = node.id;
    }

    tagsFromPath(path).forEach(function (tag) {
      var key = tag.toLowerCase();
      if (!tagSet[key]) {
        tagSet[key] = tag;
        tagsByCategory[category].push(tag);
      } else if (tagsByCategory[category].indexOf(tagSet[key]) < 0) {
        tagsByCategory[category].push(tagSet[key]);
      }
    });
  });

  function cleanNode(node) {
    return {
      id: node.id,
      slug: node.slug,
      label: node.label,
      children: (node.children || []).map(cleanNode)
    };
  }

  var productTaxonomyTree = treeOrder
    .map(function (slug) {
      return rootMap[slug] ? cleanNode(rootMap[slug]) : null;
    })
    .filter(Boolean);

  var productTags = Object.keys(tagSet)
    .sort()
    .map(function (k) {
      return tagSet[k];
    });

  catalog.productCategories = categories;
  catalog.productTags = productTags;
  catalog.productTagsByCategory = tagsByCategory;
  catalog.productTaxonomyTree = productTaxonomyTree;
  catalog.productTaxonomyReady = true;
})();
