let activeCats = [];
let searchQuery = '';
let favOnly = false;
let restExpanded = false;

const FAV_COUNT = SPOTS.filter(s => s.fav).length;
const VALID_CAT_IDS = new Set([...FOOD_CATS, ...REST_CATS].map(c => c.id));

function readUrlState() {
  const params = new URLSearchParams(location.search);
  const catParam = params.get('cat');
  activeCats = catParam
    ? catParam.split(',').filter(id => VALID_CAT_IDS.has(id))
    : [];
  searchQuery = params.get('q') || '';
  favOnly = params.get('fav') === '1';
  if (REST_CATS.some(c => activeCats.includes(c.id))) restExpanded = true;
}

function writeUrlState() {
  const params = new URLSearchParams();
  if (activeCats.length > 0) params.set('cat', activeCats.join(','));
  const q = searchQuery.trim();
  if (q) params.set('q', q);
  if (favOnly) params.set('fav', '1');
  const qs = params.toString();
  const newUrl = qs ? `${location.pathname}?${qs}` : location.pathname;
  if (location.search !== (qs ? `?${qs}` : '')) {
    history.replaceState(null, '', newUrl);
  }
}

function isAnyFilterActive() {
  return activeCats.length > 0 || favOnly;
}

function renderNav() {
  const isAllActive = activeCats.length === 0 && !favOnly;

  const navAll = document.getElementById('nav-all');
  navAll.innerHTML = `<button class="cat-btn all ${isAllActive ? 'active' : ''}" data-cat="all">
    ◆ All <span class="count">${SPOTS.length}</span>
  </button>
  <button class="cat-btn fav-toggle ${favOnly ? 'active' : ''}" data-fav-toggle>
    ★ Roy's Picks <span class="count">${FAV_COUNT}</span>
  </button>`;

  const navFood = document.getElementById('nav-food');
  navFood.innerHTML = FOOD_CATS.map(c => {
    const count = SPOTS.filter(s => s.cat === c.id).length;
    const isActive = activeCats.includes(c.id);
    return `<button class="cat-btn ${isActive ? 'active' : ''}" data-cat="${c.id}">
      ${c.icon} ${c.label} <span class="count">${count}</span>
    </button>`;
  }).join('');

  const navRest = document.getElementById('nav-rest');
  const restActive = REST_CATS.some(c => activeCats.includes(c.id));
  const showRest = restExpanded || restActive;

  if (showRest) {
    const pills = REST_CATS.map(c => {
      const count = SPOTS.filter(s => s.cat === c.id).length;
      const isActive = activeCats.includes(c.id);
      return `<button class="cat-btn ${isActive ? 'active' : ''}" data-cat="${c.id}">
        ${c.icon} ${c.label} <span class="count">${count}</span>
      </button>`;
    }).join('');
    const hideBtn = !restActive
      ? `<button class="cat-btn cat-toggle" data-toggle-rest="hide">× Hide</button>`
      : '';
    navRest.innerHTML = pills + hideBtn;
  } else {
    const total = SPOTS.filter(s => REST_CATS.some(c => c.id === s.cat)).length;
    navRest.innerHTML = `<button class="cat-btn cat-toggle" data-toggle-rest="show">
      + Show ${REST_CATS.length} more <span class="count">${total}</span>
    </button>`;
  }

  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    if (isAnyFilterActive()) {
      clearBtn.removeAttribute('hidden');
      const n = activeCats.length + (favOnly ? 1 : 0);
      clearBtn.textContent = `× Clear filters (${n})`;
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  document.querySelectorAll('.cat-btn[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cat;
      if (id === 'all') {
        activeCats = [];
        favOnly = false;
      } else {
        const idx = activeCats.indexOf(id);
        if (idx >= 0) activeCats.splice(idx, 1);
        else activeCats.push(id);
      }
      renderNav();
      renderMain();
    });
  });

  document.querySelectorAll('.cat-btn[data-fav-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      favOnly = !favOnly;
      renderNav();
      renderMain();
    });
  });

  document.querySelectorAll('[data-toggle-rest]').forEach(btn => {
    btn.addEventListener('click', () => {
      restExpanded = btn.dataset.toggleRest === 'show';
      renderNav();
    });
  });
}

function priceTag(level) { return '$'.repeat(level); }

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp('(' + escapeRegex(query) + ')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function spotMatchesSearch(spot, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (spot.name.toLowerCase().includes(q)) return true;
  if (spot.address.toLowerCase().includes(q)) return true;
  if (spot.note.toLowerCase().includes(q)) return true;
  if (spot.tags.some(t => t.toLowerCase().includes(q))) return true;
  if (spot.specialty && spot.specialty.toLowerCase().includes(q)) return true;
  return false;
}

function renderCard(spot) {
  let favLabel = '';
  if (spot.fav) {
    if (spot.tags.includes('YOUR SPOT')) favLabel = 'Your Spot';
    else if (spot.tags.includes('YOUR PICK')) favLabel = 'Your Pick';
    else favLabel = 'Favorite';
  }
  const q = searchQuery ? searchQuery.trim() : '';
  const favTag = spot.fav ? `<span class="tag fav">★ ${favLabel}</span>` : '';
  const star = spot.fav ? `<span class="star">★</span>` : '';
  const specialtyBody = spot.specialty ? highlight(spot.specialty, q) : '';
  const specialty = spot.specialty ? `
    <div class="specialty-block">
      <div class="label">Store specialty</div>
      <div class="body">${specialtyBody}</div>
    </div>` : '';
  const menuLink = spot.menu ? `<a href="${spot.menu}" target="_blank" rel="noopener" class="link menu">Menu</a>` : '';

  return `<div class="card">
    <div class="card-header">
      <div class="card-name">${highlight(spot.name, q)}${star}</div>
      <div class="rating"><span class="num">${spot.rating}</span><br>${spot.count.toLocaleString()} reviews</div>
    </div>
    <div class="tags">
      ${favTag}
      <span class="tag price">${priceTag(spot.price)}</span>
      ${spot.tags.filter(t => t !== 'FAVORITE' && t !== 'YOUR SPOT' && t !== 'YOUR PICK').map(t => `<span class="tag">${highlight(t, q)}</span>`).join('')}
    </div>
    <div class="note">${highlight(spot.note, q)}</div>
    ${specialty}
    <div class="card-footer">
      <div class="address">${highlight(spot.address, q)}</div>
      <div class="links">
        ${menuLink}
        <a href="${spot.maps}" target="_blank" rel="noopener" class="link">Maps →</a>
      </div>
    </div>
  </div>`;
}

function renderSectionWithSpots(cat, spots) {
  const plural = spots.length === 1 ? '' : 's';
  return `<section class="section">
    <div class="section-header">
      <span class="section-num">№ ${cat.num}</span>
      <span class="section-title">${cat.label}</span>
      <span class="section-meta">
        <span class="section-desc">${cat.desc}</span>
        <span class="section-count">${spots.length} spot${plural}</span>
      </span>
    </div>
    <div class="grid">
      ${spots.map(renderCard).join('')}
    </div>
  </section>`;
}

function renderMain() {
  const main = document.getElementById('main');
  const total = document.getElementById('total-count');
  const searchMeta = document.getElementById('search-meta');

  const catsToShow = activeCats.length === 0
    ? ALL_CATS
    : ALL_CATS.filter(c => activeCats.includes(c.id));

  const q = searchQuery.trim();
  let visibleSpots = SPOTS.filter(s => catsToShow.some(c => c.id === s.cat));
  if (favOnly) {
    visibleSpots = visibleSpots.filter(s => s.fav);
  }
  if (q) {
    visibleSpots = visibleSpots.filter(s => spotMatchesSearch(s, q));
  }

  total.textContent = visibleSpots.length;

  if (q) {
    searchMeta.textContent = visibleSpots.length === 0
      ? `No matches for "${q}"`
      : `${visibleSpots.length} match${visibleSpots.length === 1 ? '' : 'es'} for "${q}"`;
  } else {
    searchMeta.textContent = '';
  }

  if (visibleSpots.length === 0) {
    if (q) {
      main.innerHTML = `<div class="empty">No spots match "${escapeHtml(q)}". Try a different search.</div>`;
    } else {
      main.innerHTML = `<div class="empty">
        <p>No spots match these filters.</p>
        <button type="button" class="clear-filters" data-empty-clear>× Clear all filters</button>
      </div>`;
      const btn = main.querySelector('[data-empty-clear]');
      if (btn) {
        btn.addEventListener('click', () => {
          activeCats = [];
          favOnly = false;
          restExpanded = false;
          renderNav();
          renderMain();
        });
      }
    }
    return;
  }

  const sectionsHtml = catsToShow.map(cat => {
    const spotsInCat = visibleSpots.filter(s => s.cat === cat.id);
    if (spotsInCat.length === 0) return '';
    return renderSectionWithSpots(cat, spotsInCat);
  }).filter(Boolean).join('');

  main.innerHTML = sectionsHtml;
  writeUrlState();
}

function renderSearchHints() {
  const wrap = document.getElementById('search-hints');
  if (!wrap || typeof SEARCH_HINTS === 'undefined') return;
  const label = wrap.querySelector('.search-hints-label');
  const pills = SEARCH_HINTS.map(h =>
    `<button class="hint" data-q="${h.q}" aria-label="${h.aria}">${h.label}</button>`
  ).join('');
  wrap.innerHTML = (label ? label.outerHTML : '<span class="search-hints-label">Try:</span>') + pills;
}

function bindSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  if (!input) return;

  document.querySelectorAll('.search-hints .hint').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      input.value = q;
      searchQuery = q;
      clearBtn.classList.add('show');
      renderMain();
      input.focus();
    });
  });

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = input.value;
      clearBtn.classList.toggle('show', searchQuery.length > 0);
      renderMain();
    }, 120);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.classList.remove('show');
    renderMain();
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      searchQuery = '';
      clearBtn.classList.remove('show');
      renderMain();
    }
  });
}

function bindClearFilters() {
  const btn = document.getElementById('clear-filters');
  if (!btn) return;
  btn.addEventListener('click', () => {
    activeCats = [];
    favOnly = false;
    restExpanded = false;
    renderNav();
    renderMain();
  });
}

function syncSearchInputFromState() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  if (!input) return;
  input.value = searchQuery;
  if (clearBtn) clearBtn.classList.toggle('show', searchQuery.length > 0);
}

function initApp() {
  readUrlState();
  syncSearchInputFromState();
  renderSearchHints();
  renderNav();
  renderMain();
  bindSearch();
  bindClearFilters();

  window.addEventListener('popstate', () => {
    readUrlState();
    syncSearchInputFromState();
    renderNav();
    renderMain();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
