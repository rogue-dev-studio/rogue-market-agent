/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 23:40:00
 *
 * Real digital products only (per-asset URLs — never profile hubs as cards):
 * - Gumroad: Night Drive
 * - Sketchfab: public models for @rogue-dev-studio (snapshot + live refresh)
 * - Shutterstock / TurboSquid / CGTrader / itch: local snapshots below + live
 *   feeds via catalog-products-stores.js (studio catalog.json when populated)
 * Profiles: catalog.studioStores / rogue-dev-studio.github.io
 */
(function () {
  var catalog = window.RogueCatalog;
  if (!catalog) return;

  var GUMROAD_AUTHOR = {
    author: "roguedevstudio",
    authorName: "Rogue Dev Studio",
    authorUrl: "https://roguedevstudio.gumroad.com",
    owner: "rogue-dev-studio"
  };

  var SKETCHFAB_AUTHOR = {
    author: "rogue-dev-studio",
    authorName: "Rogue Developer",
    authorUrl: "https://sketchfab.com/rogue-dev-studio",
    owner: "rogue-dev-studio"
  };

  catalog.studioStores = {
    gumroad: "https://roguedevstudio.gumroad.com",
    sketchfab: "https://sketchfab.com/rogue-dev-studio",
    shutterstock: "https://www.shutterstock.com/g/ArisHadisopiyan",
    turbosquid: "https://www.turbosquid.com/Search/Artists/ArisHadisopiyan",
    cgtrader: "https://www.cgtrader.com/aris-hadisopiyan",
    itch: "https://rogue-dev-studio.itch.io",
    gallery3d: "https://rogue-dev-studio.github.io/3d/"
  };

  function withAuthor(row, author) {
    var base = author || GUMROAD_AUTHOR;
    var out = {};
    Object.keys(base).forEach(function (k) {
      out[k] = base[k];
    });
    Object.keys(row).forEach(function (k) {
      out[k] = row[k];
    });
    return out;
  }

  function withSketchfab(row) {
    return withAuthor(row, SKETCHFAB_AUTHOR);
  }

  var gumroadProducts = [
    withAuthor({
      id: "night-drive-car-mountains",
      slug: "night-drive-car-mountains",
      name: "Night Drive \u2014 Car Near Mountains",
      description:
        "Flat night-drive motion pack: 1080p MP4 (12s) plus editable Remotion (React) source. Parallax mountains, pines, dashed road, rolling car.",
      category: "Platforms",
      contentCategory: "2D",
      tags: ["Gumroad", "Environments", "Textures & Materials", "Sky", "Nature"],
      badge: "MP4",
      price: 0,
      priceSuggested: 12,
      rating: 0,
      ratingCount: 0,
      image: "assets/covers/night-drive.svg",
      stores: [
        {
          id: "gumroad",
          url: "https://roguedevstudio.gumroad.com/l/hppwla",
          primary: true
        }
      ],
      gumroadUrl: "https://roguedevstudio.gumroad.com/l/hppwla",
      addedAt: "2026-09-22",
      votes: 0,
      license: "Single Entity",
      sizeBytes: 2380914,
      source: "gumroad",
      includes: [
        "car-near-mountains.mp4 \u2014 1920\u00d71080, 12s, 30fps",
        "Remotion (React) source project",
        "Single Entity license (LICENSE.txt)"
      ]
    })
  ];

  var sketchfabSnapshot = [
    withSketchfab({
      id: "sf-36d4f820c84345289990d45377d8b9da",
      slug: "sf-oak-chair-36d4f820",
      sketchfabUid: "36d4f820c84345289990d45377d8b9da",
      name: "Oak Chair",
      description: "Procedural solid white oak dining chair with beveled planks and PBR wood materials. This stylized 3D model is perfect for games, rendering, or animations. Highly optimized geometry.",
      category: "3D",
      tags: ["Props", "Furniture", "Rpg", "3d", "Stylized"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 10,
      image: "https://media.sketchfab.com/models/36d4f820c84345289990d45377d8b9da/thumbnails/ea80899924f74fd7ba4036ae14b607dd/2a5d13b534d84ab39ba8bbe46dd416c8.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-36d4f820c84345289990d45377d8b9da", primary: true }],
      addedAt: "2026-07-19",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-1e493cf6ae294d32b8115439190d260a",
      slug: "sf-rpg-sword-1e493cf6",
      sketchfabUid: "1e493cf6ae294d32b8115439190d260a",
      name: "Rpg Sword",
      description: "Stylized RPG sword (Blade, Guard, Handle with rings, Pommel) with connected structure. This stylized 3D model is perfect for games, rendering, or animations. Highly optimized geometry.",
      category: "3D",
      tags: ["Props", "Weapons", "Rpg", "3d", "Stylized", "Fantasy"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 8,
      image: "https://media.sketchfab.com/models/1e493cf6ae294d32b8115439190d260a/thumbnails/95039c82867248d0a3e44e66a5985c4c/e5ed9efbddb5493d9dca40d8a661a8a2.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-1e493cf6ae294d32b8115439190d260a", primary: true }],
      addedAt: "2026-07-18",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-1892b4dc832c41258ff170de960a7546",
      slug: "sf-lowpoly-nature-bundle-1892b4dc",
      sketchfabUid: "1892b4dc832c41258ff170de960a7546",
      name: "Lowpoly Nature Bundle",
      description: "Low-poly 3D nature diorama bundle containing mountains, trees, clouds, and rocks. This stylized 3D model is perfect for games, rendering, or animations. Highly optimized geometry",
      category: "3D",
      tags: ["Vegetation", "Environments", "Trees", "Landscape", "Mountain", "Diorama"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 24,
      image: "https://media.sketchfab.com/models/1892b4dc832c41258ff170de960a7546/thumbnails/6e4ce22f3ee041f2a8a8b5accc7978d5/243e4a031d17414c98e695936649c56d.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-1892b4dc832c41258ff170de960a7546", primary: true }],
      addedAt: "2026-07-18",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-81294b37a52045978c3339d990d79713",
      slug: "sf-3d-solar-system-with-orbits-81294b37",
      sketchfabUid: "81294b37a52045978c3339d990d79713",
      name: "3D Solar System with Orbits",
      description: "A highly-detailed, procedurally generated 3D Solar System model featuring the Sun, the 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), Saturn's rings, and circular orbit lines.\n\nKey Features...",
      category: "3D",
      tags: ["Props", "Sci-Fi", "Solarsystem", "Jupiter", "Saturn", "Earth"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 1,
      votes: 819,
      image: "https://media.sketchfab.com/models/81294b37a52045978c3339d990d79713/thumbnails/0f1fb3ac6a6441aab1ed6877cccf8978/3f979edcd3164dad87c6e0c043c768fa.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-81294b37a52045978c3339d990d79713", primary: true }],
      addedAt: "2026-07-16",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-0fb71178d2b94aeb9597e7b57a1de146",
      slug: "sf-rubik-0fb71178",
      sketchfabUid: "0fb71178d2b94aeb9597e7b57a1de146",
      name: "Rubik",
      description: "Rubik cube 3x3",
      category: "3D",
      tags: ["Electronics", "Clothing", "Rubiks", "Rubik", "Rubikcube", "Rubiks3x3"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 2,
      votes: 321,
      image: "https://media.sketchfab.com/models/0fb71178d2b94aeb9597e7b57a1de146/thumbnails/177ce0212dcf476bb3a3baf7ef01a60a/978c186b387f4c5e951b59b92689a8c7.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-0fb71178d2b94aeb9597e7b57a1de146", primary: true }],
      addedAt: "2022-05-09",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-5fb833b15ff64025ac507dd0db4fb6ad",
      slug: "sf-water-melon-5fb833b1",
      sketchfabUid: "5fb833b15ff64025ac507dd0db4fb6ad",
      name: "Water Melon",
      description: "watermelon",
      category: "3D",
      tags: ["Food", "Vegetation", "Fruit", "Fruits", "Watermelon", "Watermelons"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 6,
      votes: 730,
      image: "https://media.sketchfab.com/models/5fb833b15ff64025ac507dd0db4fb6ad/thumbnails/ffd00a0e22254f5e9add5d582e2e0d77/62f40cd99c274b0697dcca32ca22b2c3.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-5fb833b15ff64025ac507dd0db4fb6ad", primary: true }],
      addedAt: "2022-05-09",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-7bc41196bd164d1394f86303efba084c",
      slug: "sf-eggs-7bc41196",
      sketchfabUid: "7bc41196bd164d1394f86303efba084c",
      name: "Eggs",
      description: "Eggs animals",
      category: "3D",
      tags: ["Animals", "Food", "Egg", "Eggs", "Foods", "Eggman"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 20,
      votes: 511,
      image: "https://media.sketchfab.com/models/7bc41196bd164d1394f86303efba084c/thumbnails/7375eeddd6334ee1b5b8d5cac328a954/3b034712f2ef42b5a9c8fd46e4330a84.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-7bc41196bd164d1394f86303efba084c", primary: true }],
      addedAt: "2022-04-28",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-224e658021ac457282e6072d547ceb7b",
      slug: "sf-dorayaki-224e6580",
      sketchfabUid: "224e658021ac457282e6072d547ceb7b",
      name: "Dorayaki",
      description: "Dorayaki japan",
      category: "3D",
      tags: ["Food", "Japan", "Foods", "Food3dmodel", "Dorayaki"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 5,
      votes: 208,
      image: "https://media.sketchfab.com/models/224e658021ac457282e6072d547ceb7b/thumbnails/c3c515dd426f4edebcda1c26ad85c173/c9599ed517c44ea2be3551a2cec4c275.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-224e658021ac457282e6072d547ceb7b", primary: true }],
      addedAt: "2022-04-28",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-427cc7e0e6fa4b7483babfb189f858c0",
      slug: "sf-grass-427cc7e0",
      sketchfabUid: "427cc7e0e6fa4b7483babfb189f858c0",
      name: "Grass",
      description: "Grass model 3d",
      category: "3D",
      tags: ["Food", "Vegetation", "Grass", "Grassy", "Grasshopper3d", "Grassblade"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 8,
      votes: 459,
      image: "https://media.sketchfab.com/models/427cc7e0e6fa4b7483babfb189f858c0/thumbnails/94e1563081f345f28eb97424adae2420/3f344cf0714441738691bd017d0ea235.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-427cc7e0e6fa4b7483babfb189f858c0", primary: true }],
      addedAt: "2022-04-28",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-a60eb60f01a146e892f2fdfe6d623f96",
      slug: "sf-money-coin-token-indonesia-a60eb60f",
      sketchfabUid: "a60eb60f01a146e892f2fdfe6d623f96",
      name: "Indonesian Money Coin Token",
      description: "Indonesian payment token coin — 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Props", "Coin", "Money", "Coins", "Moneybank", "Moneystack"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 62,
      image: "https://media.sketchfab.com/models/a60eb60f01a146e892f2fdfe6d623f96/thumbnails/c0e0bdb95d864e0f9a98791758196308/dc50cfdda47f43d3808f692134685856.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-a60eb60f01a146e892f2fdfe6d623f96", primary: true }],
      addedAt: "2022-04-26",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-37189717bb1046b8b63eeca95421cabe",
      slug: "sf-blood-character-bloody-37189717",
      sketchfabUid: "37189717bb1046b8b63eeca95421cabe",
      name: "Blood Character Bloody",
      description: "This caharacter \"the bloody\"",
      category: "3D",
      tags: ["Characters", "People", "Blood", "Assets", "Characterart", "Charactermodel"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 54,
      image: "https://media.sketchfab.com/models/37189717bb1046b8b63eeca95421cabe/thumbnails/deab64e130df4f84bd8951d32c19d887/b5bf0ce4f7784cbf8e477bcff775dd7a.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-37189717bb1046b8b63eeca95421cabe", primary: true }],
      addedAt: "2022-04-26",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-98b0d65a9ed54507a004c7ce9a3bb751",
      slug: "sf-barrel-assets-game-98b0d65a",
      sketchfabUid: "98b0d65a9ed54507a004c7ce9a3bb751",
      name: "Barrel Assets Game",
      description: "**Render**\n\n![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhgQbuxvsOfHFOTEEVoa8jOE_-3otmTmlD4TvBgSTTcuwqluQNiwJmslBg8M9_dgLiTyti06cCokmTh328Lh49BMCBelgMnBoJ9exAJcGQ3G88PAMDeflLyNPVi2ai2lCDInc1NP24f_MoB...",
      category: "3D",
      tags: ["Furniture", "Weapons", "Barrel", "Assets", "Barrels", "Assetstore"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 20,
      image: "https://media.sketchfab.com/models/98b0d65a9ed54507a004c7ce9a3bb751/thumbnails/d5880c4281a643bdaa91391c85c5ccdc/43f421adf5ec4beaa4877dcdbe86f28a.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-98b0d65a9ed54507a004c7ce9a3bb751", primary: true }],
      addedAt: "2022-04-24",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-63171b7f228d48db90f0b4131d017067",
      slug: "sf-cupboard-beautiful-with-book-63171b7f",
      sketchfabUid: "63171b7f228d48db90f0b4131d017067",
      name: "Cupboard beautiful with book",
      description: "Cupboard beautiful with book - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Clothing", "Furniture", "Books", "Bookshelf", "Cupboard", "Dictionary"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 2,
      votes: 55,
      image: "https://media.sketchfab.com/models/63171b7f228d48db90f0b4131d017067/thumbnails/77a7dd83c9dc4231aee8c92744c5d187/962a31eadbb54782afda785f698e7774.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-63171b7f228d48db90f0b4131d017067", primary: true }],
      addedAt: "2022-04-18",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-82869e95f75b44049a2975c44509f455",
      slug: "sf-tree-pine-82869e95",
      sketchfabUid: "82869e95f75b44049a2975c44509f455",
      name: "Tree Pine",
      description: "Tree Pine - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Vegetation", "Trees", "Pine", "Game", "Props"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 33,
      image: "https://media.sketchfab.com/models/82869e95f75b44049a2975c44509f455/thumbnails/fa80658c8db34323bd0cacc6273be582/f61be2abe84a419b939d4793441aa214.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-82869e95f75b44049a2975c44509f455", primary: true }],
      addedAt: "2022-04-17",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-e79d10b33ef544f697d5d053fd3dc9d7",
      slug: "sf-living-room-e79d10b3",
      sketchfabUid: "e79d10b33ef544f697d5d053fd3dc9d7",
      name: "Living Room",
      description: "Living Room - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Environments", "Furniture", "Pillow", "Chairs", "Pillows", "Chairmodel"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 1,
      votes: 38,
      image: "https://media.sketchfab.com/models/e79d10b33ef544f697d5d053fd3dc9d7/thumbnails/bc62df82fde34509924092c28885b393/003a9c0054db430586ad872388f74638.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-e79d10b33ef544f697d5d053fd3dc9d7", primary: true }],
      addedAt: "2022-04-17",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-3b0e454211244776962385c33211088e",
      slug: "sf-fence-barbed-wire-3b0e4542",
      sketchfabUid: "3b0e454211244776962385c33211088e",
      name: "Fence barbed wire",
      description: "Fence barbed wire - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Environments", "Furniture", "Fence", "Wire", "Fences", "Fenceforgame"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 12,
      votes: 1719,
      image: "https://media.sketchfab.com/models/3b0e454211244776962385c33211088e/thumbnails/078246a0823c4b58b6f0412a443b9085/1854cfad97954ea59ef6d85360c755b3.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-3b0e454211244776962385c33211088e", primary: true }],
      addedAt: "2022-04-16",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-d290abd04b8445099b4c603aa4c6fd10",
      slug: "sf-truck-d290abd0",
      sketchfabUid: "d290abd04b8445099b4c603aa4c6fd10",
      name: "Truck",
      description: "Truck - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Vehicles"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 28,
      image: "https://media.sketchfab.com/models/d290abd04b8445099b4c603aa4c6fd10/thumbnails/a4cfeaa59dc5474c84e5217ccb8cdf67/fc5a1e641cec4c4d986d6b0b3f216c9c.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-d290abd04b8445099b4c603aa4c6fd10", primary: true }],
      addedAt: "2022-04-09",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-f61e85dc6ed04743a2fb382b9b9375b7",
      slug: "sf-scene-setup-table-gaming-desktop-room-f61e85dc",
      sketchfabUid: "f61e85dc6ed04743a2fb382b9b9375b7",
      name: "Scene Setup Table Gaming Desktop Room",
      description: "Scene Setup Table Gaming Desktop Room - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Furniture", "Sci-Fi", "Scene", "Room", "Gaming", "Desktop"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 18,
      votes: 764,
      image: "https://media.sketchfab.com/models/f61e85dc6ed04743a2fb382b9b9375b7/thumbnails/05ae469ee8944a7ea4e17ed9b404f61f/ca93b8c98213468c91550ac7660a0707.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-f61e85dc6ed04743a2fb382b9b9375b7", primary: true }],
      addedAt: "2022-04-07",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-a69f22dccbf540a4ba86766911cbb7e9",
      slug: "sf-calender-a69f22dc",
      sketchfabUid: "a69f22dccbf540a4ba86766911cbb7e9",
      name: "Calender",
      description: "Calender - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Clothing", "Furniture", "Calender"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 3,
      votes: 602,
      image: "https://media.sketchfab.com/models/a69f22dccbf540a4ba86766911cbb7e9/thumbnails/9b3e397a0d364600adeb5d947ffe10de/b2780bea0b4d4877a63b5aa916646390.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-a69f22dccbf540a4ba86766911cbb7e9", primary: true }],
      addedAt: "2022-04-07",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-bff3ac0d4ad7472980650d214c0b8cbe",
      slug: "sf-red-envelope-bff3ac0d",
      sketchfabUid: "bff3ac0d4ad7472980650d214c0b8cbe",
      name: "Red Envelope",
      description: "Red Envelope - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Clothing", "People", "Red", "Envelope", "Hongbao"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 1,
      votes: 212,
      image: "https://media.sketchfab.com/models/bff3ac0d4ad7472980650d214c0b8cbe/thumbnails/43366ae7775849709e1b9dc9a895ba34/64caacb60de246c0bb60dde2026c0332.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-bff3ac0d4ad7472980650d214c0b8cbe", primary: true }],
      addedAt: "2022-04-07",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-a9e754d0fc944605bd7a134108635e42",
      slug: "sf-eid-ketupat-indonesian-traditional-a9e754d0",
      sketchfabUid: "a9e754d0fc944605bd7a134108635e42",
      name: "Eid Ketupat — Indonesian Traditional Food",
      description: "Eid ketupat (Indonesian woven rice dumpling) — 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Food", "Indonesian", "Eid", "Mubarak", "Indonesian Culture", "Ketupat"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 7,
      votes: 1047,
      image: "https://media.sketchfab.com/models/a9e754d0fc944605bd7a134108635e42/thumbnails/3dd73907a4564634b095275b3097e5c4/f8cc0580f656456f91a7faa44db077b8.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-a9e754d0fc944605bd7a134108635e42", primary: true }],
      addedAt: "2022-04-07",
      license: "Open-Source License (CC Attribution-NonCommercial-ShareAlike)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-0e57fa962bc9403dbe5dc22ebe304526",
      slug: "sf-manequin-statue-0e57fa96",
      sketchfabUid: "0e57fa962bc9403dbe5dc22ebe304526",
      name: "Manequin Statue",
      description: "Manequin Statue - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Characters", "Furniture", "Statue", "Statues", "Mannequin"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 41,
      votes: 2982,
      image: "https://media.sketchfab.com/models/0e57fa962bc9403dbe5dc22ebe304526/thumbnails/dd96ba8521a24cd39a4ebed3f51742a7/90b32bee50f74908aeb0ffe74decf7be.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-0e57fa962bc9403dbe5dc22ebe304526", primary: true }],
      addedAt: "2022-03-31",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-306ae7314a214c62b0d441a96d47d3e9",
      slug: "sf-peci-cap-islam-306ae731",
      sketchfabUid: "306ae7314a214c62b0d441a96d47d3e9",
      name: "Peci — Islamic Cap",
      description: "Peci (Islamic songkok cap) — 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Props", "Clothing", "Islam", "Islamic", "Cap", "Peci", "Songkok"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 8,
      votes: 1177,
      image: "https://media.sketchfab.com/models/306ae7314a214c62b0d441a96d47d3e9/thumbnails/d1601f24783847d69105cd480fc7bd54/b70837f526994e2e978209e26dcab4b9.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-306ae7314a214c62b0d441a96d47d3e9", primary: true }],
      addedAt: "2022-03-31",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-9e7f3cdd1180444ca648cdedf5f2a159",
      slug: "sf-fun-9e7f3cdd",
      sketchfabUid: "9e7f3cdd1180444ca648cdedf5f2a159",
      name: "Fun",
      description: "Fun - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Props", "Furniture", "Fun", "Funny"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 15,
      image: "https://media.sketchfab.com/models/9e7f3cdd1180444ca648cdedf5f2a159/thumbnails/ef7a80f674b44a5eb71cddfde14b9b65/92af8963509f486484ceb72c40f57a62.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-9e7f3cdd1180444ca648cdedf5f2a159", primary: true }],
      addedAt: "2022-03-29",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-009c7350e92848fb8ec3424c1bda2263",
      slug: "sf-chair-old-009c7350",
      sketchfabUid: "009c7350e92848fb8ec3424c1bda2263",
      name: "Chair Old",
      description: "Chair Old - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Environments", "Furniture", "Chairs", "Chair"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 1,
      votes: 26,
      image: "https://media.sketchfab.com/models/009c7350e92848fb8ec3424c1bda2263/thumbnails/25fd13d7ae3b44d6a2d6f61db5f562fa/5cc0d1b43c2c4b9f8707537b0cf3a976.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-009c7350e92848fb8ec3424c1bda2263", primary: true }],
      addedAt: "2022-03-29",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-07ea9179f7eb47c38750c9cfc5162fc5",
      slug: "sf-frame-photo-07ea9179",
      sketchfabUid: "07ea9179f7eb47c38750c9cfc5162fc5",
      name: "Frame photo",
      description: "Frame photo - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Photo", "Frame", "Frames", "Border", "Photoscan"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 7,
      votes: 546,
      image: "https://media.sketchfab.com/models/07ea9179f7eb47c38750c9cfc5162fc5/thumbnails/72d3797f58ab4ff29049c3c8986b6332/b3fcc6286e78487cb1e7cfea73b7ef7b.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-07ea9179f7eb47c38750c9cfc5162fc5", primary: true }],
      addedAt: "2022-03-29",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-2661cf97b7c84197a3c4a6e66769692c",
      slug: "sf-wooden-lighter-2661cf97",
      sketchfabUid: "2661cf97b7c84197a3c4a6e66769692c",
      name: "Wooden Lighter",
      description: "Wooden Lighter - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Furniture", "Wooden", "Zippo", "Lighter", "Lighting", "Wood"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 3,
      votes: 100,
      image: "https://media.sketchfab.com/models/2661cf97b7c84197a3c4a6e66769692c/thumbnails/4a832eb0131449fea9e4354627953812/2391159d3ed041b8943abec454fec0a3.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-2661cf97b7c84197a3c4a6e66769692c", primary: true }],
      addedAt: "2022-03-29",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-d6c7ed9bbb2a44e591a8c5168adfe362",
      slug: "sf-mug-glass-ceramic-d6c7ed9b",
      sketchfabUid: "d6c7ed9bbb2a44e591a8c5168adfe362",
      name: "Mug Glass Ceramic",
      description: "Mug Glass Ceramic - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Environments", "Furniture", "Mug", "Ceramic", "Glasses", "Ceramics"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 1,
      votes: 98,
      image: "https://media.sketchfab.com/models/d6c7ed9bbb2a44e591a8c5168adfe362/thumbnails/ca7b9d25fe024aeaaa3b159529b7d2f5/76f3617d76ee4f189fe45e421f22eb30.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-d6c7ed9bbb2a44e591a8c5168adfe362", primary: true }],
      addedAt: "2022-03-29",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-2a4a821350ca4527a9b702cf893499a7",
      slug: "sf-headphone-headsets-cute-2a4a8213",
      sketchfabUid: "2a4a821350ca4527a9b702cf893499a7",
      name: "Headphone Headsets cute",
      description: "Headphone Headsets cute - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Electronics", "Music", "Headset", "Headphones", "Headphone", "Pink"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 29,
      votes: 1192,
      image: "https://media.sketchfab.com/models/2a4a821350ca4527a9b702cf893499a7/thumbnails/a35daf2f0c8e4bd99b9768e9ff50dd60/1065ce04380549809d135e22f5de7154.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-2a4a821350ca4527a9b702cf893499a7", primary: true }],
      addedAt: "2022-03-27",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-1df839fda36e4adc99e0b22484aeacce",
      slug: "sf-chair-1df839fd",
      sketchfabUid: "1df839fda36e4adc99e0b22484aeacce",
      name: "Chair",
      description: "Chair - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Environments", "Furniture", "Wooden", "Chair", "Wood"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 22,
      image: "https://media.sketchfab.com/models/1df839fda36e4adc99e0b22484aeacce/thumbnails/1bb479afcc2a49f6a43ac9509c880bc6/e3a4db0656c941519bd3632359300917.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-1df839fda36e4adc99e0b22484aeacce", primary: true }],
      addedAt: "2022-03-25",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-730f6d0a4fd64520911be0b50601172d",
      slug: "sf-ramadhan-kareem-730f6d0a",
      sketchfabUid: "730f6d0a4fd64520911be0b50601172d",
      name: "Ramadan Kareem",
      description: "Ramadan Kareem scene — 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Environments", "Furniture", "Lamp", "Moon", "Moonlight", "Ramadan"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 5,
      votes: 901,
      image: "https://media.sketchfab.com/models/730f6d0a4fd64520911be0b50601172d/thumbnails/9bc08ee8f35049d0bf9759e9a4bff97d/3a72abb2164a4d92872e800a6fd790d1.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-730f6d0a4fd64520911be0b50601172d", primary: true }],
      addedAt: "2022-03-25",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-c858dc63d7ae48a4be328c4c30a7e867",
      slug: "sf-target-c858dc63",
      sketchfabUid: "c858dc63d7ae48a4be328c4c30a7e867",
      name: "Target",
      description: "Target - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Weapons", "Archery", "Target"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 11,
      votes: 6583,
      image: "https://media.sketchfab.com/models/c858dc63d7ae48a4be328c4c30a7e867/thumbnails/df6e6ef1c9ca41ff97ff4d1447b7441d/2e8b3a3411b141728ad6510a580e5eee.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-c858dc63d7ae48a4be328c4c30a7e867", primary: true }],
      addedAt: "2022-03-24",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-63b7bfcfb114460d874ea9d765f9a252",
      slug: "sf-computer-set-63b7bfcf",
      sketchfabUid: "63b7bfcfb114460d874ea9d765f9a252",
      name: "Computer Set",
      description: "Computer Set - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Electronics", "Furniture", "Computer", "Speaker", "Monitors", "Monitor"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 1,
      votes: 92,
      image: "https://media.sketchfab.com/models/63b7bfcfb114460d874ea9d765f9a252/thumbnails/859d44e593644fe2a4ca2093f9030a9d/c164061606f8412e857a548c67889c6b.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-63b7bfcfb114460d874ea9d765f9a252", primary: true }],
      addedAt: "2022-03-24",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-33377e066f6948d2b0f939985b7691eb",
      slug: "sf-loop-33377e06",
      sketchfabUid: "33377e066f6948d2b0f939985b7691eb",
      name: "Loop",
      description: "Loop - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Looking", "Looper", "Look", "Looping", "Loop", "Loops"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 64,
      image: "https://media.sketchfab.com/models/33377e066f6948d2b0f939985b7691eb/thumbnails/4c18aa66995543ce8f071685a8b333ae/1a72acd5f6b84ce6a1e5c626e25287d8.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-33377e066f6948d2b0f939985b7691eb", primary: true }],
      addedAt: "2022-03-24",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-e107cd716bf24a0fb0317b0bf72dabe0",
      slug: "sf-document-e107cd71",
      sketchfabUid: "e107cd716bf24a0fb0317b0bf72dabe0",
      name: "Document",
      description: "Document - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Business", "Sheet", "Documentation", "Bookshelf", "Document", "Documents"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 8,
      votes: 943,
      image: "https://media.sketchfab.com/models/e107cd716bf24a0fb0317b0bf72dabe0/thumbnails/b6a9a83ec479400c8e066361f4a18904/f15d75aa33e9494fbf51dc3d903f7262.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-e107cd716bf24a0fb0317b0bf72dabe0", primary: true }],
      addedAt: "2022-03-24",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-d61ed8963b264a71b25e8e04aed2b5a0",
      slug: "sf-soccer-ball-d61ed896",
      sketchfabUid: "d61ed8963b264a71b25e8e04aed2b5a0",
      name: "Soccer Ball",
      description: "Soccer Ball - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Clothing", "Soccer", "Soccerball", "Ball"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 2,
      votes: 191,
      image: "https://media.sketchfab.com/models/d61ed8963b264a71b25e8e04aed2b5a0/thumbnails/47df337174a544ecb438d308fd3b09c3/da24ac81bc1e442c9fbef26ba5c86627.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-d61ed8963b264a71b25e8e04aed2b5a0", primary: true }],
      addedAt: "2022-03-20",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-3bc1d459ff0f4de58b6f21a45fe842e8",
      slug: "sf-hammer-3bc1d459",
      sketchfabUid: "3bc1d459ff0f4de58b6f21a45fe842e8",
      name: "Hammer",
      description: "Hammer - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Furniture", "Weapons", "Hammer", "Hammerhead", "Hammers"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 0,
      votes: 30,
      image: "https://media.sketchfab.com/models/3bc1d459ff0f4de58b6f21a45fe842e8/thumbnails/4d0981b0b60c4ba6980c929766e13ce8/626612f06d73472d958bca9e10067ef2.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-3bc1d459ff0f4de58b6f21a45fe842e8", primary: true }],
      addedAt: "2022-03-20",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-12bbde6266e9455887bc25184ce664e6",
      slug: "sf-syringe-medicine-object-12bbde62",
      sketchfabUid: "12bbde6266e9455887bc25184ce664e6",
      name: "Syringe Medicine Object",
      description: "Syringe Medicine Object - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Props", "Sci-Fi", "Medicine", "Health", "Syringe", "Healthcare"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 8,
      votes: 457,
      image: "https://media.sketchfab.com/models/12bbde6266e9455887bc25184ce664e6/thumbnails/970a77fdccc2481aae6994bd475d2638/ba96866f69034c1daa3c289ab95d2e39.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-12bbde6266e9455887bc25184ce664e6", primary: true }],
      addedAt: "2022-03-20",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-e42d749ba8af4e98a54a82f9e4312510",
      slug: "sf-paper-bag-icon-website-e42d749b",
      sketchfabUid: "e42d749ba8af4e98a54a82f9e4312510",
      name: "Paper Bag Icon Website",
      description: "Paper Bag Icon Website - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Clothing", "Sci-Fi", "Paper", "Shopping", "Paperbox", "Sell"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 20,
      votes: 2693,
      image: "https://media.sketchfab.com/models/e42d749ba8af4e98a54a82f9e4312510/thumbnails/3fa97c5f2e89412caa45ab22cb86fa59/479a631d998d4dd09fb5ece81f2f4663.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-e42d749ba8af4e98a54a82f9e4312510", primary: true }],
      addedAt: "2022-03-20",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-f9520bb093fa41dcb0d9fd6bf540a076",
      slug: "sf-lookup-or-loop-icon-for-website-f9520bb0",
      sketchfabUid: "f9520bb093fa41dcb0d9fd6bf540a076",
      name: "Lookup or loop icon for website",
      description: "Lookup or loop icon for website - 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Props", "Electronics", "Symbol", "Icon", "Loop", "Lookup"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 2,
      votes: 47,
      image: "https://media.sketchfab.com/models/f9520bb093fa41dcb0d9fd6bf540a076/thumbnails/523947ae08ad44bd83bc1d3e51cc91b6/2f9e51eb1b084d91b2993aedb25f7d9b.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-f9520bb093fa41dcb0d9fd6bf540a076", primary: true }],
      addedAt: "2022-03-20",
      license: "Open-Source License (CC Attribution-NonCommercial)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-20fe9358bc6e491fa4e5b67defabefb8",
      slug: "sf-traditional-musical-instrument-papua-indonesia-20fe9358",
      sketchfabUid: "20fe9358bc6e491fa4e5b67defabefb8",
      name: "Traditional Papuan Musical Instrument",
      description: "Traditional Papuan musical instrument (tifa) from Indonesia — 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Music", "Indonesia", "Tifa", "Papua"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 2,
      votes: 552,
      image: "https://media.sketchfab.com/models/20fe9358bc6e491fa4e5b67defabefb8/thumbnails/cb4d022f945f43569bb429d30a428b58/6edc4e3c6b7e4f7382ec5bcb8d05139b.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-20fe9358bc6e491fa4e5b67defabefb8", primary: true }],
      addedAt: "2022-03-15",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
    withSketchfab({
      id: "sf-b2bcdd8e684b49c59cdf82150b945979",
      slug: "sf-drum-ramadhan-kareem-b2bcdd8e",
      sketchfabUid: "b2bcdd8e684b49c59cdf82150b945979",
      name: "Ramadan Kareem Drum",
      description: "Ramadan Kareem drum — 3D model on Sketchfab by Rogue Development.",
      category: "3D",
      tags: ["Drum", "Ramadan", "Kareem"],
      badge: "3D",
      price: 0,
      rating: 0,
      ratingCount: 2,
      votes: 329,
      image: "https://media.sketchfab.com/models/b2bcdd8e684b49c59cdf82150b945979/thumbnails/bd3a1050375840e0927e0f3ce65416b9/0fb317dd6d4a465da2b2fdbb38e50e07.jpeg",
      stores: [{ id: "sketchfab", url: "https://sketchfab.com/3d-models/none-b2bcdd8e684b49c59cdf82150b945979", primary: true }],
      addedAt: "2022-03-15",
      license: "Open-Source License (CC Attribution)",
      source: "sketchfab"
    }),
  ];

  var shutterstockSnapshot = [];
  var turbosquidSnapshot = [];
  var cgtraderSnapshot = [];
  var itchSnapshot = [];

  catalog.products = gumroadProducts
    .concat(sketchfabSnapshot)
    .concat(shutterstockSnapshot)
    .concat(turbosquidSnapshot)
    .concat(cgtraderSnapshot)
    .concat(itchSnapshot);

  var PLATFORM_LABEL = {
    shutterstock: "Shutterstock",
    turbosquid: "TurboSquid",
    cgtrader: "CGTrader",
    itch: "itch.io",
    sketchfab: "Sketchfab",
    gumroad: "Gumroad"
  };

  function uniqueTagList(list) {
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

  function resolvePlatformSource(p) {
    if (!p) return "";
    if (p.source) return String(p.source);
    if (p.sketchfabUid) return "sketchfab";
    if (p.gumroadUrl) return "gumroad";
    if (p.stores && p.stores[0] && p.stores[0].id) return String(p.stores[0].id);
    return "";
  }

  catalog.products.forEach(function (p) {
    if (!p) return;
    var source = resolvePlatformSource(p);
    var platform = PLATFORM_LABEL[source];
    if (platform) {
      p.category = "Platforms";
      p.source = source;
      p.tags = uniqueTagList([platform].concat(p.tags || []));
      if (!p.contentCategory) {
        p.contentCategory =
          (catalog.platformContentCategory &&
            (catalog.platformContentCategory[platform] ||
              catalog.platformContentCategory[source])) ||
          (source === "sketchfab" ||
          source === "turbosquid" ||
          source === "cgtrader" ||
          source === "unity" ||
          source === "fab"
            ? "3D"
            : "2D");
      }
    }
    if (!(p.source === "sketchfab" || p.sketchfabUid)) return;
    if (typeof p.likes !== "number") {
      p.likes = typeof p.ratingCount === "number" ? p.ratingCount : 0;
    }
    if (!(typeof p.rating === "number" && p.rating > 0) && window.RogueCards && RogueCards.ratingFromLikes) {
      p.rating = RogueCards.ratingFromLikes(p.likes);
    } else if (!(typeof p.rating === "number" && p.rating > 0) && p.likes > 0) {
      p.rating = Math.min(5, Math.round((1 + Math.log10(p.likes + 1) * 2.2) * 10) / 10);
    }
  });
  catalog.productsLoaded = true;
  if (catalog.mergeProductDiscoveryTags) {
    catalog.mergeProductDiscoveryTags(catalog.products || []);
  }
  try {
    document.dispatchEvent(new CustomEvent("rogue-catalog:products-loaded"));
  } catch (err) {}
})();
