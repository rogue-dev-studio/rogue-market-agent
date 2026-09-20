/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-20 11:36:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-20 12:00:00
 */
import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

const ACCENT = 0xe47909;
const ACCENT_2 = 0xc45f08;

const PLANET_COLORS = [
  0xe47909,
  0xff8f1f,
  0xd4956a,
  0xc4a574,
  0xb88a6d,
  0xe8a04a,
  0xa67c52,
  0xf0a55a,
  0x8f6a45,
  0xdb8b3a
];

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveBase() {
  var base = document.body.getAttribute("data-base") || "./";
  if (base.slice(-1) !== "/") base += "/";
  return base;
}

function pickEntries() {
  var catalog = window.RogueCatalog || {};
  var categories = (catalog.categories || []).slice(0, 7);
  var tags = (catalog.tags || []).slice(0, 7);
  var entries = [];
  categories.forEach(function (name) {
    entries.push({ kind: "category", name: name, body: "planet" });
  });
  tags.forEach(function (name, i) {
    entries.push({
      kind: "tag",
      name: name,
      body: i % 3 === 0 ? "moon" : "star-world"
    });
  });
  if (!entries.length) {
    entries = [
      { kind: "category", name: "Developer Tools", body: "planet" },
      { kind: "tag", name: "MCP", body: "moon" },
      { kind: "tag", name: "Skill", body: "star-world" }
    ];
  }
  return entries;
}

function entryHref(base, entry) {
  if (entry.kind === "category") {
    return base + "servers/search/?category=" + encodeURIComponent(entry.name);
  }
  var skillTags = {
    Skill: 1,
    Cursor: 1,
    "Claude Code": 1,
    OpenCode: 1,
    Codebase: 1,
    Exploration: 1
  };
  if (skillTags[entry.name]) {
    return base + "skills/search/?tag=" + encodeURIComponent(entry.name);
  }
  return base + "servers/search/?tag=" + encodeURIComponent(entry.name);
}

function createLabel(entry, href) {
  var el = document.createElement("a");
  el.className = "scene-label scene-label--" + entry.kind;
  el.href = href;
  el.textContent = entry.name;
  el.setAttribute("data-kind", entry.kind);
  el.title = (entry.kind === "category" ? "Category: " : "Tag: ") + entry.name;
  return el;
}

function makeStarfield(count, options) {
  options = options || {};
  var size = options.size != null ? options.size : 0.045;
  var opacity = options.opacity != null ? options.opacity : 0.85;
  var positions = new Float32Array(count * 3);
  var colors = new Float32Array(count * 3);
  var color = new THREE.Color();
  for (var i = 0; i < count; i++) {
    var r = 8 + Math.random() * 42;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(phi);
    var roll = Math.random();
    if (roll > 0.92) {
      color.setHSL(0.55 + Math.random() * 0.08, 0.55, 0.85 + Math.random() * 0.15);
    } else if (roll > 0.8) {
      color.setHSL(0.12 + Math.random() * 0.08, 0.35, 0.8 + Math.random() * 0.2);
    } else {
      color.setHSL(0.58, 0.05, 0.72 + Math.random() * 0.28);
    }
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  var mat = new THREE.PointsMaterial({
    size: size,
    vertexColors: true,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
    sizeAttenuation: true
  });
  return { points: new THREE.Points(geo, mat), geo: geo, mat: mat };
}

function makeSun() {
  var group = new THREE.Group();
  var core = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffcc66,
      emissive: 0xffaa33,
      emissiveIntensity: 1.2,
      roughness: 0.45,
      metalness: 0.1
    })
  );
  var corona = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffc14d,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    })
  );
  var haze = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffe0a0,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    })
  );
  group.add(core, corona, haze);
  return { group: group, core: core, corona: corona, haze: haze };
}

function makePlanet(color, radius, withRing) {
  var group = new THREE.Group();
  var body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 24),
    new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.55,
      metalness: 0.18,
      emissive: color,
      emissiveIntensity: 0.08
    })
  );
  group.add(body);
  if (withRing) {
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.35, radius * 1.85, 48),
      new THREE.MeshBasicMaterial({
        color: 0xd9c8a0,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);
  }
  return { group: group, body: body };
}

function makeMoon(radius) {
  var group = new THREE.Group();
  var body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20),
    new THREE.MeshStandardMaterial({
      color: 0xcfd6de,
      roughness: 0.85,
      metalness: 0.05,
      emissive: 0x8899aa,
      emissiveIntensity: 0.05
    })
  );
  group.add(body);
  return { group: group, body: body };
}

function makeStarWorld(color, radius) {
  var group = new THREE.Group();
  var body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.25
    })
  );
  var glow = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.55, 16, 16),
    new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    })
  );
  group.add(body, glow);
  return { group: group, body: body, glow: glow };
}

function createHeroScene(mount) {
  const reduced = prefersReducedMotion();
  const base = resolveBase();
  const entries = pickEntries();
  const mode = mount.getAttribute("data-scene-mode") || "hero";
  const isHero = mode === "hero";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(isHero ? 42 : 40, 1, 0.1, 100);
  camera.position.set(0, 0.9, isHero ? 11 : 10.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x333333, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = "three-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "three-label-layer";
  mount.appendChild(labelRenderer.domElement);

  const root = new THREE.Group();
  const rootBase = { x: 0, y: 0 };
  if (isHero) {
    root.scale.setScalar(0.92);
  }
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xb8c4d8, 0.45);
  const sunLight = new THREE.PointLight(0xffd28a, 55, 30, 2);
  sunLight.position.set(0, 0, 0);
  const cool = new THREE.DirectionalLight(ACCENT_2, 0.35);
  cool.position.set(-4, 2, 5);
  scene.add(ambient, sunLight, cool);

  const starNear = makeStarfield(isHero ? 380 : 420, {
    size: isHero ? 0.05 : 0.045,
    opacity: 0.7
  });
  const starFar = null;
  root.add(starNear.points);

  const sun = makeSun();
  root.add(sun.group);

  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.012, 12, 120),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
  );
  belt.rotation.x = Math.PI / 2.2;
  root.add(belt);

  const belt2 = new THREE.Mesh(
    new THREE.TorusGeometry(5.1, 0.01, 12, 140),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.16 })
  );
  belt2.rotation.x = Math.PI / 2.55;
  belt2.rotation.z = 0.25;
  root.add(belt2);

  const bodies = [];
  const hitMeshes = [];
  const count = entries.length;

  entries.forEach(function (entry, i) {
    const color = PLANET_COLORS[i % PLANET_COLORS.length];
    const isCategory = entry.kind === "category";
    let visual;
    let radius;

    if (entry.body === "moon") {
      radius = 0.16;
      visual = makeMoon(radius);
    } else if (entry.body === "star-world") {
      radius = 0.14;
      visual = makeStarWorld(color, radius);
    } else {
      radius = isCategory ? 0.28 + (i % 3) * 0.04 : 0.2;
      visual = makePlanet(color, radius, i % 4 === 0);
    }

    const orbit = new THREE.Group();
    const pivot = new THREE.Group();
    const theta = (i / count) * Math.PI * 2;
    const orbitRadius = 2.2 + (i % 5) * 0.55 + (isCategory ? 0.15 : 0);
    const tilt = ((i % 5) - 2) * 0.08;
    pivot.rotation.z = tilt;
    pivot.rotation.x = ((i % 3) - 1) * 0.05;
    visual.group.position.set(orbitRadius, Math.sin(theta * 2) * 0.15, 0);
    pivot.rotation.y = theta;
    pivot.add(visual.group);
    orbit.add(pivot);
    root.add(orbit);

    const href = entryHref(base, entry);
    const labelEl = createLabel(entry, href);
    const label = new CSS2DObject(labelEl);
    label.position.set(0, radius + 0.22, 0);
    visual.group.add(label);

    hitMeshes.push(visual.body);
    bodies.push({
      orbit: orbit,
      pivot: pivot,
      visual: visual,
      spin: 0.35 + (i % 5) * 0.12,
      orbitSpeed: 0.08 + (i % 7) * 0.02,
      phase: theta,
      href: href,
      body: visual.body
    });
  });

  const loneMoon = makeMoon(0.2);
  const moonOrbit = new THREE.Group();
  loneMoon.group.position.set(1.35, 0.1, 0);
  moonOrbit.add(loneMoon.group);
  root.add(moonOrbit);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  function onPointerMove(event) {
    const rect = mount.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    pointer.tx = ((event.clientX - rect.left) / w) * 2 - 1;
    pointer.ty = -(((event.clientY - rect.top) / h) * 2 - 1);
  }

  function onPointerLeave() {
    pointer.tx = 0;
    pointer.ty = 0;
  }

  function onClick(event) {
    if (event.target && event.target.closest && event.target.closest("a.scene-label")) return;
    const rect = mount.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    pointerNdc.x = ((event.clientX - rect.left) / w) * 2 - 1;
    pointerNdc.y = -(((event.clientY - rect.top) / h) * 2 - 1);
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(hitMeshes, false);
    if (!hits.length) return;
    const mesh = hits[0].object;
    const found = bodies.find(function (b) {
      return b.body === mesh;
    });
    if (found) window.location.href = found.href;
  }

  mount.addEventListener("pointermove", onPointerMove);
  mount.addEventListener("pointerleave", onPointerLeave);
  mount.addEventListener("click", onClick);

  function resize() {
    const w = Math.max(1, mount.clientWidth);
    const h = Math.max(1, mount.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
  }

  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(mount);
  else window.addEventListener("resize", resize);

  let raf = 0;
  let running = true;
  let frame = 0;

  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const t = now * 0.001;
    frame += 1;

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    if (!reduced) {
      sun.core.rotation.y = t * 0.15;
      sun.corona.scale.setScalar(1 + Math.sin(t * 1.8) * 0.03);
      sun.haze.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05);
      starNear.points.rotation.y = t * 0.012;
      starNear.points.rotation.x = t * 0.003;
      belt.rotation.z = t * 0.04;
      belt2.rotation.z = -t * 0.03;
      moonOrbit.rotation.y = t * 0.55;
      loneMoon.group.rotation.y = t * 0.8;

      bodies.forEach(function (item) {
        item.orbit.rotation.y = t * item.orbitSpeed + item.phase * 0.15;
        item.visual.group.rotation.y = t * item.spin;
        if (item.visual.glow) {
          item.visual.glow.material.opacity = 0.12 + Math.sin(t * 2.2 + item.phase) * 0.06;
        }
      });

      root.rotation.y = pointer.x * 0.28;
      root.rotation.x = 0.16 + pointer.y * 0.12;
      root.position.x = rootBase.x + pointer.x * 0.12;
      root.position.y = rootBase.y + pointer.y * 0.08;
    } else if (frame === 1) {
      root.rotation.y = -0.2;
      root.rotation.x = 0.2;
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  if (reduced) {
    resize();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(tick);
  }

  return function destroy() {
    running = false;
    cancelAnimationFrame(raf);
    mount.removeEventListener("pointermove", onPointerMove);
    mount.removeEventListener("pointerleave", onPointerLeave);
    mount.removeEventListener("click", onClick);
    if (ro) ro.disconnect();
    else window.removeEventListener("resize", resize);
    starNear.geo.dispose();
    starNear.mat.dispose();
    if (starFar) {
      starFar.geo.dispose();
      starFar.mat.dispose();
    }
    sun.core.geometry.dispose();
    sun.core.material.dispose();
    sun.corona.geometry.dispose();
    sun.corona.material.dispose();
    sun.haze.geometry.dispose();
    sun.haze.material.dispose();
    belt.geometry.dispose();
    belt.material.dispose();
    belt2.geometry.dispose();
    belt2.material.dispose();
    loneMoon.body.geometry.dispose();
    loneMoon.body.material.dispose();
    bodies.forEach(function (item) {
      item.visual.group.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    if (labelRenderer.domElement.parentNode === mount) mount.removeChild(labelRenderer.domElement);
  };
}

function boot() {
  const mounts = document.querySelectorAll("[data-three-scene]");
  if (!mounts.length) return;
  const cleanups = [];
  mounts.forEach(function (mount) {
    try {
      cleanups.push(createHeroScene(mount));
    } catch (err) {
      mount.classList.add("three-fallback");
    }
  });
  window.addEventListener("pagehide", function () {
    cleanups.forEach(function (fn) {
      if (typeof fn === "function") fn();
    });
  }, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
