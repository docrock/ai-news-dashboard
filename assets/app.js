/* ===========================================================
   Doc Rock's AI Pulse — app.js
   Vanilla JS, no build step. Fetches data/digest.json (current
   edition) and data/archive/index.json (history), renders cards,
   and wires up filtering / search / archive switching.

   Restyle notes (UI-README.md): category headings carry icons,
   items may carry an optional `opportunity` block that renders
   quiet badge chips (scores >= 7) and the loud act-now variant.
   Old editions without `opportunity` render exactly as before.
   =========================================================== */

(function () {
  "use strict";

  // Fixed category order/labels/icons, used as a fallback if the
  // digest is missing a category or fields are incomplete.
  var DEFAULT_CATEGORIES = [
    {
      id: "claude-anthropic",
      title: "Claude & Anthropic",
      icon: "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"
    },
    {
      id: "ai-industry",
      title: "Wider AI World",
      icon: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3a15.3 15.3 0 0 1 0 18a15.3 15.3 0 0 1 0-18"
    },
    {
      id: "creator-tools",
      title: "Tools & Tips for Creators and Small Biz",
      icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
    },
    {
      id: "content-social",
      title: "Content & Social Media Pulse",
      icon: "M3 11l18-5v12L3 13v-2zM11.6 16.8a3 3 0 1 1-5.8-1.6"
    }
  ];

  // Opportunity badges (spec Track A): render only at score >= 7,
  // never show raw numbers.
  var BADGE_THRESHOLD = 7;
  var BADGE_DEFS = [
    { key: "video", emoji: "🎬", label: "Video idea" },
    { key: "social", emoji: "📣", label: "Post it" },
    { key: "community", emoji: "🏖️", label: "Sandbox share" }
  ];

  var state = {
    digest: null,
    archiveIndex: [],
    activeCategory: "all",
    searchTerm: "",
    currentFile: null // null = latest edition, else archive file path
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheEls();
    setupTheme();
    setupSearch();
    setupArchiveSelect();
    setupStateButtons();
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
    els.errorRetry = document.getElementById("error-retry");
    els.clearFilters = document.getElementById("clear-filters");
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

  /* ---------------- State panel buttons ---------------- */

  function setupStateButtons() {
    els.errorRetry.addEventListener("click", function () {
      if (state.currentFile) {
        loadArchiveEdition(state.currentFile);
      } else {
        loadCurrentDigest();
      }
    });
    els.clearFilters.addEventListener("click", function () {
      state.searchTerm = "";
      els.searchInput.value = "";
      state.activeCategory = "all";
      updateActivePillUI();
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
        state.currentFile = file;
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
        state.currentFile = null;
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
  // rendering never breaks on partial or malformed data. `opportunity`
  // is optional (spec Track A) — absent means no badges, no act strip.
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
            tag: String(item.tag || ""),
            opportunity: normalizeOpportunity(item.opportunity)
          };
        });
      return {
        id: def.id,
        title: src.title || def.title,
        icon: def.icon,
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

  function normalizeOpportunity(raw) {
    if (!raw || typeof raw !== "object") return null;
    return {
      video: Number(raw.video) || 0,
      social: Number(raw.social) || 0,
      community: Number(raw.community) || 0,
      act_now: raw.act_now === true,
      action_note: String(raw.action_note || ""),
      angle: String(raw.angle || "")
    };
  }

  function badgesFor(opportunity) {
    if (!opportunity) return [];
    return BADGE_DEFS.filter(function (def) {
      return opportunity[def.key] >= BADGE_THRESHOLD;
    });
  }

  function isActItem(item) {
    return !!(item.opportunity && item.opportunity.act_now);
  }

  function countActItems(digest) {
    return digest.categories.reduce(function (sum, cat) {
      return sum + cat.items.filter(isActItem).length;
    }, 0);
  }

  /* ---------------- Status banner (dateline bar) ---------------- */

  // Show the edition's timestamp in the VIEWER's own timezone
  // (generated_at_iso is authoritative). The stored generated_label
  // is only the fallback for a missing or unparseable ISO stamp.
  function formatLocalLabel(iso, fallback) {
    if (iso) {
      var dt = new Date(iso);
      if (!isNaN(dt.getTime())) {
        try {
          return dt
            .toLocaleString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short"
            })
            .replace(" at ", " · ");
        } catch (e) {
          /* fall through to the stored label */
        }
      }
    }
    return fallback;
  }

  function renderStatusBanner() {
    var d = state.digest;
    if (!d) return;
    var editionLabel = "";
    var editionClass = "";
    if (d.edition === "morning") {
      editionLabel = "Morning edition";
      editionClass = "edition-badge--morning";
    } else if (d.edition === "midday") {
      editionLabel = "Midday edition";
      editionClass = "edition-badge--midday";
    } else if (d.edition) {
      // Tolerate editions beyond morning/midday (spec A3), e.g. a
      // late manual run marked "evening" or "special".
      editionLabel = d.edition.charAt(0).toUpperCase() + d.edition.slice(1) + " edition";
      editionClass = "edition-badge--special";
    }

    var html = "Updated " + escapeHtml(formatLocalLabel(d.generated_at_iso, d.generated_label));
    if (editionLabel) {
      html +=
        '<span class="edition-badge ' + editionClass + '">' +
        escapeHtml(editionLabel) +
        "</span>";
    }
    els.statusText.innerHTML = html;
  }

  /* ---------------- Category filter pills ---------------- */

  function renderCategoryFilters() {
    var container = els.categoryFilters;
    container.innerHTML = "";

    container.appendChild(makePill("all", "All"));

    state.digest.categories.forEach(function (cat) {
      container.appendChild(makePill(cat.id, cat.title));
    });

    // "⚡ Action needed" — item-level filter across all categories.
    var actBtn = makePill("act", "⚡ Action needed");
    actBtn.classList.add("pill--act");
    var actCount = countActItems(state.digest);
    if (actCount > 0) {
      var chip = document.createElement("span");
      chip.className = "pill-count";
      chip.textContent = actCount;
      actBtn.appendChild(chip);
    }
    container.appendChild(actBtn);

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

    var actOnly = state.activeCategory === "act";
    var visibleCategories = state.digest.categories.filter(function (cat) {
      return (
        actOnly ||
        state.activeCategory === "all" ||
        state.activeCategory === cat.id
      );
    });

    var totalVisibleItems = 0;
    var wrapperDiv = document.createElement("div");

    visibleCategories.forEach(function (cat) {
      var filteredItems = filterItems(cat.items, state.searchTerm, actOnly);
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

  function filterItems(items, term, actOnly) {
    return items.filter(function (item) {
      if (actOnly && !isActItem(item)) return false;
      if (!term) return true;
      var haystack = (item.headline + " " + item.summary).toLowerCase();
      return haystack.indexOf(term) !== -1;
    });
  }

  function renderCategorySection(cat, items) {
    var section = document.createElement("section");
    section.className = "category-section";
    section.id = "category-" + cat.id;

    var heading = document.createElement("div");
    heading.className = "category-heading";
    heading.innerHTML =
      '<svg class="category-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' +
      cat.icon +
      '"/></svg>' +
      "<h2>" + escapeHtml(cat.title) + "</h2>" +
      '<span class="category-count">' +
      items.length + (items.length === 1 ? " story" : " stories") +
      "</span>";
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
    var isAct = isActItem(item);

    var card = document.createElement("article");
    card.className = "card" + (isAct ? " card--act" : "");

    // Act-now strip is always the first child so it owns the top edge.
    if (isAct) {
      var strip = document.createElement("div");
      strip.className = "act-strip";

      var bolt = document.createElement("span");
      bolt.className = "act-bolt";
      bolt.setAttribute("aria-hidden", "true");
      bolt.textContent = "⚡";
      strip.appendChild(bolt);

      var copy = document.createElement("div");
      copy.className = "act-copy";

      var label = document.createElement("span");
      label.className = "act-label";
      label.textContent = "Action needed";
      copy.appendChild(label);

      var note = document.createElement("span");
      note.className = "act-note";
      note.textContent = item.opportunity.action_note;
      copy.appendChild(note);

      strip.appendChild(copy);
      card.appendChild(strip);
    }

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
      var why = document.createElement("div");
      why.className = "card-why";
      why.innerHTML =
        '<span class="card-why-label">Why it matters</span>' +
        '<span class="card-why-text">' + escapeHtml(item.why_it_matters) + "</span>";
      card.appendChild(why);
    }

    var footerRow = document.createElement("div");
    footerRow.className = "card-footer";

    var readLink = document.createElement("a");
    readLink.className = "card-link";
    readLink.href = item.link;
    readLink.target = "_blank";
    readLink.rel = "noopener";
    readLink.innerHTML = 'Read more <span class="arrow" aria-hidden="true">→</span>';
    footerRow.appendChild(readLink);

    var badges = badgesFor(item.opportunity);
    if (badges.length) {
      var badgeRow = document.createElement("div");
      badgeRow.className = "card-badges";
      badges.forEach(function (b) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.innerHTML =
          '<span aria-hidden="true">' + b.emoji + "</span>" + escapeHtml(b.label);
        badgeRow.appendChild(badge);
      });
      footerRow.appendChild(badgeRow);
    }

    card.appendChild(footerRow);
    return card;
  }

  /* ---------------- Utilities ---------------- */

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }
})();
