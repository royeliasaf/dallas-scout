const cities = [
  { id: 'dallas',      name: 'Dallas',      state: 'TX', lon: -96.7970,  lat: 32.7767, status: 'live', href: '/dallas/' },
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

function render() {
  svg.selectAll('*').remove();
  const width = svg.node().getBoundingClientRect().width;
  const height = Math.round(width * 0.62);
  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

  const projection = d3.geoAlbersUsa()
    .scale(width * 1.3)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(us => {
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

    cities.forEach(city => {
      const projected = projection([city.lon, city.lat]);
      if (!projected) return;
      const [x, y] = projected;

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

      node.style('cursor', city.status === 'live' ? 'pointer' : 'default');

      node.on('mousemove', (event) => {
        if (city.status === 'soon') {
          const rect = svg.node().getBoundingClientRect();
          const containerRect = svg.node().parentElement.getBoundingClientRect();
          tooltip
            .style('left', (event.clientX - containerRect.left) + 'px')
            .style('top', (event.clientY - containerRect.top) + 'px')
            .text(`${city.name} — Coming soon`)
            .attr('hidden', null);
        }
      });
      node.on('mouseleave', () => tooltip.attr('hidden', true));

      if (city.status === 'live') {
        node.on('click', () => { window.location.href = city.href; });
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
const MAX_TILT = 6;
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

if (wrap && stageEl && !window.matchMedia('(hover: none)').matches) {
  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = px * MAX_TILT * 2;
    targetY = -py * MAX_TILT * 2;
    if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltLoop);
  });
  wrap.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltLoop);
  });
}
