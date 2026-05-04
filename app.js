let activeCats = [];
let searchQuery = '';

function renderNav() {
  const isAllActive = activeCats.length === 0;

  const navAll = document.getElementById('nav-all');
  navAll.innerHTML = `<button class="cat-btn all ${isAllActive ? 'active' : ''}" data-cat="all">
    ◆ All <span class="count">${SPOTS.length}</span>
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
  navRest.innerHTML = REST_CATS.map(c => {
    const count = SPOTS.filter(s => s.cat === c.id).length;
    const isActive = activeCats.includes(c.id);
    return `<button class="cat-btn ${isActive ? 'active' : ''}" data-cat="${c.id}">
      ${c.icon} ${c.label} <span class="count">${count}</span>
    </button>`;
  }).join('');

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cat;
      if (id === 'all') {
        activeCats = [];
      } else {
        const idx = activeCats.indexOf(id);
        if (idx >= 0) activeCats.splice(idx, 1);
        else activeCats.push(id);
      }
      renderNav();
      renderMain();
    });
  });
}

function priceTag(level) { return '$'.repeat(level); }

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  return `<section class="section">
    <div class="section-header">
      <span class="section-num">№ ${cat.num}</span>
      <span class="section-title">${cat.label}</span>
      <span class="section-desc">${cat.desc} — ${spots.length} spot${spots.length === 1 ? '' : 's'}</span>
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

  if (catsToShow.length === 0) {
    main.innerHTML = `<div class="empty">No categories selected.</div>`;
    return;
  }

  if (visibleSpots.length === 0) {
    main.innerHTML = `<div class="empty">No spots match "${q}". Try a different search.</div>`;
    return;
  }

  const sectionsHtml = catsToShow.map(cat => {
    const spotsInCat = visibleSpots.filter(s => s.cat === cat.id);
    if (spotsInCat.length === 0) return '';
    return renderSectionWithSpots(cat, spotsInCat);
  }).filter(Boolean).join('');

  main.innerHTML = sectionsHtml;
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

function initApp() {
  renderNav();
  renderMain();
  bindSearch();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
