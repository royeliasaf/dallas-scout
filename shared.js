function formatLastUpdated(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const d = new Date(document.lastModified);
  el.textContent = isNaN(d)
    ? ''
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
