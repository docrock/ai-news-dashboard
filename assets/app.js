/* ===========================================================
   Doc Rock's AI Pulse — app.js
   Vanilla JS, no build step. Fetches data/digest.json (current
   edition) and data/archive/index.json (history), renders cards,
   and wires up filtering / search / archive switching.
   =========================================================== */

(function () {
  "use strict";

  // Fixed category order/labels, used as a fallback if the digest
  // is missing a category or fields are incomplete.
  var DEFAULT_CATEGORIES = [
    { id: "claude-anthropic", title: "Claude & Anthropic" },
    { id: "ai-industry", title: "Wider AI World" },
    { id: "creator-tools", title: "Tools & Tips for Creators and Small Biz" },
    { id: "content-social", title: "Content & Social Media Pulse" }
  ];

  var state = {
    digest: null,
    archiveIndex: [],
    activeCategory: "all",
    searchTerm: ""
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheEls();
    setupTheme();
    setupSearch();
    setupArchiveSelect();
    loadCurrentDigest();
    loadArchiveIndex();
  }

  function cacheEls() {
    els.statusText = document.getElementById("status-text");
    els.searchInput = document.getElementById("search-input");
    els.categoryFilters = document.getElementById("category-filters");
    els.archiveSelect = document.getElementById("archive-select");
    els.loadingState = document.getElementById("loading-state");
    els.emptyState = document.getElementById("empty-state");
    els.errorState = document.getElementById("error-state");
    els.noResultsState = document.getElementById("no-results-state");
    els.categoriesContainer = document.getElementById("categories-container");
    els.themeToggle = document.getElementById("theme-toggle");
  }

  /* ---------------- Theme toggle ---------------- */

  function setupTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem("ai-pulse-theme");
    } catch (e) {
      /* localStorage unavailable, ignore */
    }
    if (saved === "dark") {
      applyTheme("dark");
    }
    els.themeToggle.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      applyTheme(isDark ? "light" : "dark");
    });
  }

  function applyTheme(mode) {
    if (mode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      els.themeToggle.querySelector("span").textContent = "☀️";
      els.themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
      document.documentElement.removeAttribute("data-theme");
      els.themeToggle.querySelector("span").textContent = "🌙";
      els.themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
    try {
      localStorage.setItem("ai-pulse-theme", mode);
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------------- Search ---------------- */

  function setupSearch() {
    els.searchInput.addEventListener("input", function (e) {
      state.searchTerm = (e.target.value || "").trim().toLowerCase();
      render();
    });
  }

  /* ---------------- Archive ---------------- */

  function setupArchiveSelect() {
    els.archiveSelect.addEventListener("change", function (e) {
      var file = e.target.value;
      if (!file) {
        // "Latest" selected — reload the current digest.
        loadCurrentDigest();
        return;
      }
      loadArchiveEdition(file);
    });
  }

  function loadArchiveIndex() {
    fetch("data/archive/index.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("archive index fetch failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.archiveIndex = Array.isArray(data) ? data : [];
        renderArchiveOptions();
      })
      .catch(function () {
        // No archive yet, or fetch failed — not fatal, just show "Latest".
        state.archiveIndex = [];
        renderArchiveOptions();
      });
  }

  function renderArchiveOptions() {
    var select = els.archiveSelect;
    select.innerHTML = "";

    var latestOpt = document.createElement("option");
    latestOpt.value = "";
    latestOpt.textContent = "Latest edition";
    select.appendChild(latestOpt);

    if (!state.archiveIndex.length) {
      var noneOpt = document.createElement("option");
      noneOpt.value = "";
      noneOpt.textContent = "No previous editions yet";
      noneOpt.disabled = true;
      select.appendChild(noneOpt);
      return;
    }

    state.archiveIndex.forEach(function (entry) {
      if (!entry || !entry.file) return;
      var opt = document.createElement("option");
      opt.value = entry.file;
      opt.textContent = entry.label || entry.file;
      select.appendChild(opt);
    });
  }

  function loadArchiveEdition(file) {
    showLoading();
    // Archive file paths are stored relative to repo root per schema
    // (e.g. "data/archive/2026-06-30-0600.json").
    fetch(file, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("archive file fetch failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.digest = normalizeDigest(data);
        afterDigestLoaded();
      })
      .catch(function () {
        showError();
      });
  }

  /* ---------------- Current digest ---------------- */

  function loadCurrentDigest() {
    showLoading();
    fetch("data/digest.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("digest fetch failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.digest = normalizeDigest(data);
        afterDigestLoaded();
      })
      .catch(function () {
        showError();
      });
  }

  function afterDigestLoaded() {
    state.activeCategory = "all";
    state.searchTerm = "";
    els.searchInput.value = "";
    renderStatusBanner();
    renderCategoryFilters();
    render();
  }

  // Defensive normalization: fill in any missing categories/fields so
  // rendering never breaks on partial or malformed data.
  function normalizeDigest(raw) {
    raw = raw || {};
    var categoriesById = {};
    (Array.isArray(raw.categories) ? raw.categories : []).forEach(function (cat) {
      if (cat && cat.id) categoriesById[cat.id] = cat;
    });

    var categories = DEFAULT_CATEGORIES.map(function (def) {
      var src = categoriesById[def.id] || {};
      var items = Array.isArray(src.items) ? src.items : [];
      var cleanItems = items
        .filter(function (item) {
          return item && item.headline && item.link;
        })
        .map(function (item) {
          return {
            headline: String(item.headline || ""),
            summary: String(item.summary || ""),
            why_it_matters: String(item.why_it_matters || ""),
            link: String(item.link || "#"),
            source: String(item.source || ""),
            tag: String(item.tag || "")
          };
        });
      return {
        id: def.id,
        title: src.title || def.title,
        items: cleanItems
      };
    });

    return {
      generated_at_iso: raw.generated_at_iso || "",
      generated_label: raw.generated_label || "Unknown date",
      edition: raw.edition || "",
      categories: categories
    };
  }

  /* ---------------- Status banner ---------------- */

  function renderStatusBanner() {
    var d = state.digest;
    if (!d) return;
    var editionLabel = "";
    if (d.edition === "morning") editionLabel = "Morning edition";
    else if (d.edition === "midday") editionLabel = "Midday edition";
    else if (d.edition) editionLabel = d.edition;

    var html = "Updated " + escapeHtml(d.generated_label);
    if (editionLabel) {
      html += '<span class="edition-badge">' + escapeHtml(editionLabel) + "</span>";
    }
    els.statusText.innerHTML = html;
  }

  /* ---------------- Category filter pills ---------------- */

  function renderCategoryFilters() {
    var container = els.categoryFilters;
    container.innerHTML = "";

    var allBtn = makePill("all", "All");
    container.appendChild(allBtn);

    state.digest.categories.forEach(function (cat) {
      container.appendChild(makePill(cat.id, cat.title));
    });

    updateActivePillUI();
  }

  function makePill(categoryId, label) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    btn.dataset.category = categoryId;
    btn.setAttribute("role", "tab");
    btn.textContent = label;
    btn.addEventListener("click", function () {
      state.activeCategory = categoryId;
      updateActivePillUI();
      render();
    });
    return btn;
  }

  function updateActivePillUI() {
    var pills = els.categoryFilters.querySelectorAll(".pill");
    pills.forEach(function (pill) {
      var isActive = pill.dataset.category === state.activeCategory;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  /* ---------------- Rendering ---------------- */

  function showLoading() {
    setStateVisibility("loading");
  }

  function showError() {
    setStateVisibility("error");
  }

  function setStateVisibility(which) {
    els.loadingState.hidden = which !== "loading";
    els.errorState.hidden = which !== "error";
    els.emptyState.hidden = which !== "empty";
    els.noResultsState.hidden = which !== "no-results";
    els.categoriesContainer.hidden = which !== "content";
  }

  function render() {
    if (!state.digest) return;

    var totalItemsInDigest = state.digest.categories.reduce(function (sum, c) {
      return sum + c.items.length;
    }, 0);

    if (totalItemsInDigest === 0) {
      setStateVisibility("empty");
      els.categoriesContainer.innerHTML = "";
      return;
    }

    var visibleCategories = state.digest.categories.filter(function (cat) {
      return state.activeCategory === "all" || state.activeCategory === cat.id;
    });

    var totalVisibleItems = 0;
    var container = document.createDocumentFragment();
    var wrapperDiv = document.createElement("div");

    visibleCategories.forEach(function (cat) {
      var filteredItems = filterItems(cat.items, state.searchTerm);
      if (filteredItems.length === 0) return;

      totalVisibleItems += filteredItems.length;
      wrapperDiv.appendChild(renderCategorySection(cat, filteredItems));
    });

    if (totalVisibleItems === 0) {
      setStateVisibility("no-results");
      els.categoriesContainer.innerHTML = "";
      return;
    }

    setStateVisibility("content");
    els.categoriesContainer.innerHTML = "";
    els.categoriesContainer.appendChild(wrapperDiv);
  }

  function filterItems(items, term) {
    if (!term) return items;
    return items.filter(function (item) {
      var haystack = (item.headline + " " + item.summary).toLowerCase();
      return haystack.indexOf(term) !== -1;
    });
  }

  function renderCategorySection(cat, items) {
    var section = document.createElement("section");
    section.className = "category-section";
    section.id = "category-" + cat.id;

    var heading = document.createElement("h2");
    heading.className = "category-heading";
    heading.innerHTML =
      escapeHtml(cat.title) +
      ' <span class="category-count">(' + items.length + ")</span>";
    section.appendChild(heading);

    var list = document.createElement("div");
    list.className = "card-list";

    items.forEach(function (item) {
      list.appendChild(renderCard(item));
    });

    section.appendChild(list);
    return section;
  }

  function renderCard(item) {
    var card = document.createElement("article");
    card.className = "card";

    var top = document.createElement("div");
    top.className = "card-top";
    if (item.tag) {
      var tag = document.createElement("span");
      tag.className = "card-tag";
      tag.textContent = item.tag;
      top.appendChild(tag);
    }
    if (item.source) {
      var source = document.createElement("span");
      source.className = "card-source";
      source.textContent = item.source;
      top.appendChild(source);
    }
    card.appendChild(top);

    var heading = document.createElement("h3");
    var link = document.createElement("a");
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item.headline;
    heading.appendChild(link);
    card.appendChild(heading);

    if (item.summary) {
      var summary = document.createElement("p");
      summary.className = "card-summary";
      summary.textContent = item.summary;
      card.appendChild(summary);
    }

    if (item.why_it_matters) {
      var why = document.createElement("p");
      why.className = "card-why";
      why.innerHTML = "<strong>Why it matters:</strong> " + escapeHtml(item.why_it_matters);
      card.appendChild(why);
    }

    var readLink = document.createElement("a");
    readLink.className = "card-link";
    readLink.href = item.link;
    readLink.target = "_blank";
    readLink.rel = "noopener";
    readLink.textContent = "Read more →";
    card.appendChild(readLink);

    return card;
  }

  /* ---------------- Utilities ---------------- */

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }
})();
