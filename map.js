const cities = [
  { id: 'dallas',      name: 'Dallas',      state: 'TX', lon: -96.7970,  lat: 32.7767, status: 'live', href: '/dallas/', volume: 14 },
  { id: 'austin',      name: 'Austin',      state: 'TX', lon: -97.7431,  lat: 30.2672, status: 'soon' },
  { id: 'houston',     name: 'Houston',     state: 'TX', lon: -95.3698,  lat: 29.7604, status: 'soon' },
  { id: 'san-antonio', name: 'San Antonio', state: 'TX', lon: -98.4936,  lat: 29.4241, status: 'soon' },
  { id: 'nyc',         name: 'New York',    state: 'NY', lon: -74.0060,  lat: 40.7128, status: 'soon' },
  { id: 'la',          name: 'Los Angeles', state: 'CA', lon: -118.2437, lat: 34.0522, status: 'soon' },
  { id: 'chicago',     name: 'Chicago',     state: 'IL', lon: -87.6298,  lat: 41.8781, status: 'soon' }
];

const svg = d3.select('#us-map');
const tooltip = d3.select('#tooltip');
const stage = d3.select('.map-stage');

const NOTIFY_EMAIL = 'roybuilds.co@gmail.com';
function notifyHref(cityName) {
  const subject = encodeURIComponent(`Notify me when ${cityName} Scout launches`);
  const body = encodeURIComponent(`Hi Roy, let me know when ${cityName} Scout is live.`);
  return `mailto:${NOTIFY_EMAIL}?subject=${subject}&body=${body}`;
}

function renderCityCards() {
  const row = document.getElementById('city-row');
  if (!row) return;
  const spotCount = (typeof SPOTS !== 'undefined' && SPOTS.length) || 0;

  row.innerHTML = cities.map(city => {
    if (city.status === 'live') {
      const meta = `${city.state} · <span id="${city.id}-count">${spotCount || '…'}</span> spots · Vol. ${city.volume}`;
      return `<a href="${city.href}" class="city-card live" id="${city.id}-card" aria-label="Enter ${city.name} Scout, ${spotCount} spots curated">
        <span class="live-badge">Live now</span>
        <div class="city-name">${city.name}</div>
        <div class="city-meta">${meta}</div>
        <div class="city-cta">Enter ${city.name} <span class="city-arrow">→</span></div>
      </a>`;
    }
    return `<a class="city-card soon" href="${notifyHref(city.name)}" aria-label="Notify me when ${city.name} Scout launches">
      <div class="city-name">${city.name}</div>
      <div class="city-meta">
        <span class="meta-soon">${city.state} · Coming soon</span>
        <span class="meta-cta">Want this? Tell Roy →</span>
      </div>
    </a>`;
  }).join('');
}

renderCityCards();

const liveCountEl = document.getElementById('live-count');
if (liveCountEl) liveCountEl.textContent = cities.filter(c => c.status === 'live').length;

let topoCache = null;
const TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json';
function loadTopo() {
  if (topoCache) return Promise.resolve(topoCache);
  return d3.json(TOPO_URL).then(data => { topoCache = data; return data; });
}

const liveDots = [];

function render() {
  svg.selectAll('*').remove();
  const width = svg.node().getBoundingClientRect().width;
  const height = Math.round(width * 0.62);
  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

  const projection = d3.geoAlbersUsa()
    .scale(width * 1.3)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  loadTopo().then(us => {
    const states = topojson.feature(us, us.objects.states).features;
    svg.append('g')
      .attr('class', 'states')
      .selectAll('path')
      .data(states)
      .enter()
      .append('path')
      .attr('class', d => `state ${d.id === '48' ? 'state-tx' : ''}`)
      .attr('d', path)
      .style('animation-delay', (d, i) => `${Math.min(i * 8, 400)}ms`);

    svg.append('path')
      .attr('class', 'state-borders')
      .attr('d', path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

    const cityG = svg.append('g').attr('class', 'cities');

    liveDots.length = 0;
    cities.forEach(city => {
      const projected = projection([city.lon, city.lat]);
      if (!projected) return;
      const [x, y] = projected;
      if (city.status === 'live') liveDots.push({ x, y });

      const node = cityG.append('g')
        .attr('class', `city ${city.status}`)
        .attr('transform', `translate(${x}, ${y})`);

      if (city.status === 'live') {
        node.append('circle').attr('class', 'pulse').attr('r', 7);
        node.append('circle').attr('class', 'pulse pulse-2').attr('r', 7);
        node.append('circle').attr('class', 'pulse pulse-3').attr('r', 7);
        node.append('circle').attr('class', 'dot core').attr('r', 6);
      } else {
        node.append('circle').attr('class', 'dot').attr('r', 4);
      }

      const label = node.append('text')
        .attr('class', 'label')
        .attr('x', 12)
        .attr('y', 4)
        .text(city.name);

      node.style('cursor', 'pointer');

      node.on('mousemove', (event) => {
        if (city.status === 'soon') {
          const containerRect = svg.node().parentElement.getBoundingClientRect();
          tooltip
            .style('left', (event.clientX - containerRect.left) + 'px')
            .style('top', (event.clientY - containerRect.top) + 'px')
            .text(`${city.name} · Tell Roy →`)
            .attr('hidden', null);
        }
      });
      node.on('mouseleave', () => tooltip.attr('hidden', true));

      if (city.status === 'live') {
        node.on('click', () => { window.location.href = city.href; });
      } else {
        node.on('click', () => { window.location.href = notifyHref(city.name); });
      }
    });
  }).catch(err => {
    console.error('Failed to load US map data', err);
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Fraunces, serif')
      .style('font-style', 'italic')
      .style('fill', '#4a463e')
      .text('Map unavailable. The cities are below ↓');
  });
}

render();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 150);
});

const wrap = document.querySelector('.map-wrap');
const stageEl = document.querySelector('.map-stage');
const MAX_TILT = 3;
const DEAD_ZONE_PX = 80;
let tiltRaf = null;
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

function tiltLoop() {
  currentX += (targetX - currentX) * 0.12;
  currentY += (targetY - currentY) * 0.12;
  stageEl.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg)`;
  if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
    tiltRaf = requestAnimationFrame(tiltLoop);
  } else {
    tiltRaf = null;
  }
}

function nearLiveDot(svgX, svgY) {
  for (const d of liveDots) {
    const dx = svgX - d.x, dy = svgY - d.y;
    if (Math.sqrt(dx * dx + dy * dy) < DEAD_ZONE_PX) return true;
  }
  return false;
}

const tiltAllowed = wrap && stageEl
  && !window.matchMedia('(hover: none)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (tiltAllowed) {
  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const svgRect = svg.node().getBoundingClientRect();
    const svgX = e.clientX - svgRect.left;
    const svgY = e.clientY - svgRect.top;
    if (nearLiveDot(svgX, svgY)) {
      targetX = 0;
      targetY = 0;
    } else {
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = px * MAX_TILT * 2;
      targetY = -py * MAX_TILT * 2;
    }
    if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltLoop);
  });
  wrap.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltLoop);
  });
}
