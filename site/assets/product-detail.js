/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-22 12:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-22 12:30:00
 */
(function () {
  function priceLabel(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    if (isNaN(n) || n <= 0) return "$0+";
    if (Number.isInteger(n)) return "$" + n;
    return "$" + n.toFixed(2);
  }

  function findProduct(id) {
    var list = (window.RogueCatalog && RogueCatalog.products) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id || list[i].slug === id) return list[i];
    }
    return null;
  }

  function render() {
    var params = new URLSearchParams(window.location.search);
    var id = (params.get("id") || params.get("slug") || "").trim();
    var item = findProduct(id);
    if (!item) {
      var nameEl = document.querySelector("[data-product-name]");
      if (nameEl) nameEl.textContent = id ? "Product not found" : "Missing product id";
      return;
    }

    function setText(sel, text) {
      var el = document.querySelector(sel);
      if (el) el.textContent = text;
    }

    setText("[data-product-name]", item.name);
    setText("[data-product-crumb]", item.name);
    setText("[data-product-desc]", item.description || "");
    setText("[data-product-category]", item.category || "Product");
    setText("[data-product-price]", priceLabel(item));
    document.title = item.name + " - Rogue Market Agent";

    var buy = document.querySelector("[data-product-buy]");
    if (buy) {
      buy.href = item.gumroadUrl || "#";
      buy.textContent =
        itemPriceIsFree(item) ? "Get on Gumroad · " + priceLabel(item) : "Buy on Gumroad · " + priceLabel(item);
    }

    var tags = document.querySelector("[data-product-tags]");
    if (tags) {
      var list = Array.isArray(item.tags) ? item.tags : [];
      tags.innerHTML = list.length
        ? list.map(function (t) {
            return '<span class="tag-pill">' + t + "</span>";
          }).join("")
        : "—";
    }

    var includes = document.querySelector("[data-product-includes]");
    if (includes && Array.isArray(item.includes) && item.includes.length) {
      includes.innerHTML = item.includes
        .map(function (row) {
          return "<li>" + row + "</li>";
        })
        .join("");
    }
  }

  function itemPriceIsFree(item) {
    var n = typeof item.price === "number" ? item.price : parseFloat(item.price);
    return isNaN(n) || n <= 0;
  }

  document.addEventListener("rogue-catalog:products-loaded", render);
  render();
})();
